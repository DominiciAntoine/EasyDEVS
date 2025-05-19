import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";

import ModelCodeEditorTemp from "@/components/custom/ModelCodeEditorTemp";
import { ModelViewEditor } from "@/components/custom/ModelViewEditor";
import NavDragModel from "@/components/nav/NavDragModel";
import NavHeader from "@/components/nav/nav-header";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { modelToReactflow } from "@/lib/Parser/modelToReactflow";
import { reactflowToModel } from "@/lib/Parser/reactflowToModel";
import { useGetModelByIdRecursive } from "@/queries/model/useGetModelByIdRecursive";
import type { ReactFlowInput } from "@/types";

import { client } from "@/api/client.ts";
import { useToast } from "@/hooks/use-toast";

export function EditModel() {
	const { modelId } = useParams<{ modelId: string }>();

	const { data, error, isLoading, mutate } = useGetModelByIdRecursive({
		params: { path: { id: modelId ?? "" } },
	});
	const { toast } = useToast();
	const [code, setCode] = useState("");
	const [structure, setStructure] = useState<ReactFlowInput | undefined>(undefined);

	
	useEffect(() => {
		if (data && modelId) {
			const root = data.find((model) => model.id === modelId);
			console.log( "transformation du modèle en RF : " , data)
			const tmp = modelToReactflow(data)
			console.log( "react flow " , tmp) 
			setStructure(tmp);
			
			if (root?.code) setCode(root.code);
		}
	}, [data, modelId]);


	const handleStructureChange = useCallback((newStructure: ReactFlowInput) => {
		setStructure(newStructure);
	}, []);

	const saveModelChange = async (): Promise<void> => {

		
		
		if (!structure || !modelId) return;
		
		try {
			console.log("Structure à sauvegarder en RF :", structure);
			const modelToSave = reactflowToModel(structure).find((model) => model.id === modelId);
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen w-full">
				<Loader className="animate-spin w-10 h-10 text-foreground" />
			</div>
		);
	}

	if (error) return <div>Erreur lors du chargement.</div>;
	if (!data || !structure) return null;

	const rootModel = data.find((model) => model.id === modelId);

	return (
		<div className="flex flex-col h-screen w-full">
			<NavHeader
				breadcrumbs={[
					{ label: "Libraries", href: "/library" },
					{ label: "putlibraryname", href: "#" },
					{ label: "Edit Model" },
				]}
				showNavActions
				showModeToggle
				saveFunction={saveModelChange}
			/>

			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel defaultSize={50} minSize={20}>
					<ModelCodeEditorTemp code={code} onChangeCode={setCode} />
				</ResizablePanel>

				<ResizableHandle withHandle />

				{rootModel?.type === "atomic" ? (
					<ResizablePanel defaultSize={50} minSize={20}>
						<ModelViewEditor 
							models={structure} 
							onChange={handleStructureChange} 
						/>
					</ResizablePanel>
				) : (
					<ResizablePanel defaultSize={50}>
						<ResizablePanelGroup direction="vertical">
							<ResizablePanel defaultSize={70} minSize={20}>
								<ModelViewEditor 
									models={structure} 
									onChange={handleStructureChange} 
								/>
							</ResizablePanel>
							<ResizableHandle withHandle />
							<ResizablePanel defaultSize={30} minSize={20} >
								<NavDragModel />
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>
				)}
			</ResizablePanelGroup>
		</div>
	);
}