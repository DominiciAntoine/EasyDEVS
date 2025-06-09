import { Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ModelViewEditor } from "@/components/custom/ModelViewEditor";
import NavHeader from "@/components/nav/nav-header";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { modelToReactflow } from "@/lib/Parser/modelToReactflow";
import { reactflowToModel } from "@/lib/Parser/reactflowToModel";
import { useGetModelByIdRecursive } from "@/queries/model/useGetModelByIdRecursive";
import type { ReactFlowInput, ReactFlowModelData } from "@/types";

import { client } from "@/api/client.ts";
import { ModelCodeEditor } from "@/components/custom/ModelCodeEditor";
import ModelCodeEditorTemp from "@/components/custom/ModelCodeEditorTemp";
import { ModelPropertyEditor } from "@/components/custom/ModelPropertyEditor";
import { useToast } from "@/hooks/use-toast";
import { useGetLibraryById } from "@/queries/library/useGetLibraryById";
import { type Node, useReactFlow } from "@xyflow/react";import { useHotkeys } from 'react-hotkeys-hook';
import useUndo from "use-undo";

export function EditModel() {
	const { libraryId, modelId } = useParams<{
		libraryId: string;
		modelId: string;
	}>();

	const { data, error, isLoading, mutate } = useGetModelByIdRecursive({
		params: { path: { id: modelId ?? "" } },
	});
	const { data: dataLib, isLoading: isLoadingLib } = useGetLibraryById({
		params: { path: { id: libraryId ?? "" } },
	});
	const { toast } = useToast();
	const [
  structureState,
  {
    set: setStructure,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  }
] = useUndo<ReactFlowInput | undefined>(undefined);
const structure = structureState.present;

    useHotkeys('ctrl+s, meta+s', (e) => {
    e.preventDefault();
     e.stopPropagation();
     console.log('Ctrl+S ou Cmd+S capté !');
    saveModelChange();
  }, ); 

  
useHotkeys("ctrl+z, meta+z", (e) => { e.preventDefault(); undo(); });
useHotkeys("ctrl+y, meta+y", (e) => { e.preventDefault(); redo(); });




	useEffect(() => {
		if (data && modelId) {
			const root = data.find((model) => model.id === modelId);
			const tmp = modelToReactflow(data, modelId);
			tmp.nodes.sort((a, b) => a.id.length - b.id.length);
			setStructure(tmp);
		}
	}, [data, modelId, setStructure]);

    

	const handleStructureChange = useCallback((newStructure: ReactFlowInput) => {
		setStructure(newStructure);
	}, [setStructure]);

	const saveModelChange = async (): Promise<void> => {
		if (!structure || !modelId) return;

		try {
			console.log("Structure à sauvegarder en RF :", structure);
			const modelToSave = reactflowToModel(structure).find(
				(model) => model.id === modelId,
			);
			console.log("Structure pret a save", modelToSave);
			if (!modelToSave) {
				toast({
					title: "Erreur",
					description: "Modèle non trouvé dans la structure",
					variant: "destructive",
				});
				return;
			}

			const response = await client.PATCH("/model/{id}", {
				params: {
					path: {
						id: modelId,
					},
				},
				body: {
					code: modelToSave.code,
					description: modelToSave.description,
					name: modelToSave.name,
					type: modelToSave.type,
					components: modelToSave.components,
					connections: modelToSave.connections,
					ports: modelToSave.ports,
					metadata: modelToSave.metadata,
				},
			});

			if (!response.data) {
				throw new Error("No data received from API");
			}

			toast({
				title: "Modèle sauvegardé avec succès",
			});

			await mutate();
		} catch (error) {
			toast({
				title: "Erreur lors de la sauvegarde",
				description: (error as Error).message,
				variant: "destructive",
			});
		}
	};

    

	const simulateModel = async (): Promise<void> => {
		if (!structure || !modelId) return;

		try {
			const response = await client.GET("/model/{id}/simulate", {
				params: { path: { id: modelId } },
			});

			if (!response.data) {
				throw new Error("No data received from API");
			}

			console.log(response.data);
		} catch (error) {
			toast({
				title: "Erreur lors de la simulation",
				description: (error as Error).message,
				variant: "destructive",
			});
		}
	};
const onChangeProperty = (updatedNode: Node<ReactFlowModelData>) => {
    // Structure actuel : structureState.present ou structure (comme dans la réponse précédente)
    if (!structure) return;

    const newStructure = {
        ...structure,
        nodes: structure.nodes.map((node) =>
            node.id === updatedNode.id ? updatedNode : node
        ),
    };

    setStructure(newStructure); // Pas de callback !
};

    const onChangeCode = (newCode: string, codeID: string) => {
    if (!structure) return;

    const newStructure = {
        ...structure,
        nodes: structure.nodes.map((node) =>
            node.id === codeID
                ? {
                    ...node,
                    data: {
                        ...node.data,
                        code: newCode
                    }
                }
                : node
        ),
    };

    setStructure(newStructure); 
};


	if (isLoading || isLoadingLib) {
		return (
			<div className="flex items-center justify-center h-screen w-full">
				<Loader className="animate-spin w-10 h-10 text-foreground" />
			</div>
		);
	}

	if (error) return <div>Erreur lors du chargement.</div>;
	if (!data || !structure) return null;

	const mainModel = structure.nodes.find((m) => m.id === modelId);

	return (
		<div className="flex flex-col h-screen w-full">
			<NavHeader
				breadcrumbs={[
					{ label: "Libraries", href: "/library" },
					{
						label: dataLib?.title ?? "Unknown library",
						href: `/library/${dataLib?.id}`,
					},
					{ label: mainModel?.data.label ?? "Edit Model" },
				]}
				showNavActions
				showModeToggle
				saveFunction={saveModelChange}
				simulateFunction={simulateModel}
			/>

			{mainModel?.data.modelType === "atomic" ? (
				<ResizablePanelGroup direction="horizontal">
					<ResizablePanel defaultSize={50} minSize={20}>
						<ModelCodeEditor code={mainModel.data.code} onCodeChange={onChangeCode} modelId={mainModel.id} saveModelChange={saveModelChange}/>
					</ResizablePanel>

					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={30} minSize={20}>
						<ModelViewEditor
							models={structure}
							onChange={handleStructureChange}
						/>
					</ResizablePanel>
					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={20} minSize={20}>
						<ModelPropertyEditor
							model={mainModel}
							onChange={onChangeProperty}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			) : null}

			{mainModel?.data.modelType === "coupled" ? (
				<ResizablePanelGroup direction="horizontal">
					<ResizablePanel defaultSize={70} minSize={20}>
						<ModelViewEditor
							models={structure}
							onChange={handleStructureChange}
						/>
					</ResizablePanel>
					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={30} minSize={20}>
						<ModelPropertyEditor
							model={mainModel}
							onChange={onChangeProperty}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			) : null}
		</div>
	);
}
