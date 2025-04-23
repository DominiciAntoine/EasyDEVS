import type { ReactFlowModelData, ReactFlowPort } from "@/types";
import { useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { CodeXml, Minus, Plus } from "lucide-react";
import { memo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";


type ModelNodeProps = {
	selected: boolean;
	data: ReactFlowModelData;
	id: string;
};

function ModelHeaderToolbar({ selected, data, id }: ModelNodeProps) {
	const { setNodes } = useReactFlow();
	const updateNodeInternals = useUpdateNodeInternals();

	const handlePort = 
		(
			action: "add" | "remove",
			portType: "input" | "output",
			portId?: string,
		) => {
			setNodes((nodes) => {
				return nodes.map((node) => {
					if (node.id === id) {
						const nodeData = node.data as ReactFlowModelData;
						const portsKey =
							portType === "input" ? "inputPorts" : "outputPorts";
						const existingPorts = nodeData[portsKey] || [];

						let updatedPorts: ReactFlowPort[];

						if (action === "add") {
							const newId = portId || `${uuidv4()}`;
							const newPort: ReactFlowPort = { id: newId };
							updatedPorts = [...existingPorts, newPort];
						} else {
							if (portId) {
								updatedPorts = existingPorts.filter(
									(port) => port.id !== portId,
								);
							} else {
								if (existingPorts.length > 0) {
									updatedPorts = existingPorts.slice(0, -1);
								} else {
									return node;
								}
							}
						}

						return {
							...node,
							data: {
								...node.data,
								[portsKey]: updatedPorts,
							},
						};
					}
					updateNodeInternals(id);
					return node;
				});
			});
		};

	if (!selected) return null;

	return (
		<div className="w-full h-full flex justify-between px-2 py-1 bg-background rounded-t-2xl shadow-md text-foreground">
			<div className="flex h-full items-center">
				<ToolbarButton
					icon={<Plus className="h-4 w-4" />}
					label="Add input port"
					onClick={() => handlePort("add", "input")}
				/>
				<ToolbarButton
					icon={<Minus className="h-4 w-4" />}
					label="Remove input port"
					onClick={() => handlePort("remove", "input")}
				/>
			</div>
			<div className="flex items-center">
				<ToolbarButton
					icon={<CodeXml className="h-4 w-4" />}
					label="Accéder au code"
					onClick={() => console.log("Accès au code pour", data.id)}
				/>
			</div>
			<div className="flex h-full items-center">
				<ToolbarButton
					icon={<Plus className="h-4 w-4" />}
					label="Add output port"
					onClick={() => handlePort("add", "output")}
				/>
				<ToolbarButton
					icon={<Minus className="h-4 w-4" />}
					label="Remove output port"
					onClick={() => handlePort("remove", "output")}
				/>
			</div>
		</div>
	);
}

type ToolbarButtonProps = {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
};

const ToolbarButton = ({ icon, label, onClick }: ToolbarButtonProps) => (
	<button
		type="button"
		className="rounded hover:bg-primary/50 active:ring-2 active:ring-ring transition-all duration-150"
		title={label}
		onClick={onClick}
	>
		{icon}
	</button>
);

export default memo(ModelHeaderToolbar);
