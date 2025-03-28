import { librairiesToFront } from "@/lib/Parser/librairiesToFront";
import { useDnD } from "@/providers/DnDContext";
import { useGetLibraries } from "@/queries/library/useGetLibraries";
import { useGetModels } from "@/queries/model/useGetModels";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";

export default function NavDragModelSimple() {
	const [, setDragId] = useDnD();

	const libraries = useGetLibraries();
	const models = useGetModels();

	const navLibraries = librairiesToFront(
		libraries.data ?? [],
		models.data ?? [],
	);

	const onDragStart = (event: React.DragEvent, nodeId: string) => {
		setDragId(nodeId);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="p-4">
			<h2 className="text-lg font-semibold mb-2">Libraries</h2>
			<div className="space-y-2">
				{navLibraries.map((lib) => (
					<Collapsible
						key={lib.title}
						defaultOpen={lib.isActive}
						className="border rounded"
					>
						<CollapsibleTrigger className="w-full h-full flex items-center justify-between px-3 py-2 rounded-t cursor-pointer group">
							<span>{lib.title}</span>
							<ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
						</CollapsibleTrigger>

						<CollapsibleContent className="flex  justify-center flex-wrap ">
							{lib.items?.map((model) =>
								model.id ? (
									<div
										key={model.id}
										draggable
										onDragStart={(e) => onDragStart(e, model.id)}
										className="h-32 w-32 rounded cursor-move  overflow-hidden border-border border rounded-lg border-solid m-2"
									>
										<div className="w-full bg-primary text-background flex justify-center">
											{model.title}
										</div>
									</div>
								) : null,
							)}
						</CollapsibleContent>
					</Collapsible>
				))}
			</div>
		</div>
	);
}

/*
<aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div>
    </aside>*/
