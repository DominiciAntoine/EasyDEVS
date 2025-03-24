import ModelCodeEditorTemp from "@/components/custom/ModelCodeEditorTemp";
import { ModelViewEditor } from "@/components/custom/ModelViewEditor";
import NavHeader from "@/components/nav/nav-header";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { modelToReactflow } from "@/lib/Parser/modelToReactflow";
import { useGetModelById } from "@/queries/model/useGetModelById";
import { Loader } from "lucide-react";
import { useParams } from "react-router-dom";

export function EditModel() {
	const { modelId } = useParams<{
		modelId: string;
	}>();
	const { data, error, isLoading } = useGetModelById({
		params: { path: { id: modelId ?? "" } },
	});

	if (!data) return null;

	const reactFlowData = modelToReactflow([data]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen w-full">
				<Loader className="animate-spin w-10 h-10 text-foreground" />
			</div>
		);
	}
	if (error) return <div>Erreur lors du chargement.</div>;

	return (
		<div className="flex flex-col h-screen w-full">
			<NavHeader
				breadcrumbs={[
					{ label: "Libraries", href: "/library" },
					{ label: "putlibraryname", href: "#putlibrarypath" },
					{ label: "Edit Model" },
				]}
				showNavActions={true}
				showModeToggle={true}
			></NavHeader>
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel defaultSize={60} minSize={20}>
					<ModelCodeEditorTemp />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={40} minSize={20}>
					<ModelViewEditor models={reactFlowData} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
