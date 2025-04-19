import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { type Node, NodeToolbar, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { memo, useState } from "react";

type ModelNodeData = Node["data"] & {
	toolbarVisible: boolean;
	toolbarPosition: Position;
};

type ModelNodeProps = {
	data: ModelNodeData;
	selected :boolean;
	id: string;
};

function ModelExtraInfo({ data, selected, id }: ModelNodeProps) {
	const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

	const toggleExpand = (key: string) => {
		setExpandedKeys((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<NodeToolbar
			className="h-auto bg-muted/80 text-foreground p-6 border border-border rounded-2xl shadow-xl flex flex-col gap-3 w-80 animate-fadeIn"
			isVisible={selected}
			position={Position.Right}
		>
			<h3 className="text-lg font-semibold text-primary mb-2 border-b pb-2">
				Model Information
			</h3>
			<div
							key={id}
							className="flex flex-col gap-1 border-t pt-4 first:border-none"
						>
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-muted-foreground" />
								<Label className="text-sm font-medium">{"Instance ID"}</Label>
							</div>
							<Input
								value={id}
								disabled
								className="w-full opacity-70 text-muted-foreground"
							/>
						</div>
			{Object.entries(data).map(([key, value]) => {
				if (["toolbarVisible", "toolbarPosition"].includes(key)) return null;

				const formattedKey = key
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l) => l.toUpperCase());

				if (
					value === null ||
					value === undefined ||
					(Array.isArray(value) && value.length === 0)
				) {
					return (
						<div
							key={key}
							className="flex flex-col gap-1 border-t pt-4 first:border-none"
						>
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-muted-foreground" />
								<Label className="text-sm font-medium">{formattedKey}</Label>
							</div>
							<Input
								value="N/A"
								disabled
								className="w-full opacity-70 text-muted-foreground"
							/>
						</div>
					);
				}

				if (
					Array.isArray(value) &&
					value.every((val) => typeof val === "object")
				) {
					return (
						<div
							key={key}
							className="flex flex-col gap-2 border-t pt-4 first:border-none"
						>
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-muted-foreground" />
								<Label className="text-sm font-medium">{formattedKey}</Label>
							</div>
							<div className="flex flex-wrap gap-2">
								{value.map((obj, index) => (
									<Badge
										key={obj.name + obj.id}
										variant="secondary"
										className="text-xs shadow-sm hover:scale-105 transition-transform cursor-default"
									>
										{obj.name || obj.id || `Item ${index + 1}`}
									</Badge>
								))}
							</div>
						</div>
					);
				}

				if (typeof value === "object") {
					const expanded = expandedKeys[key] || false;

					return (
						<div
							key={key}
							className="flex flex-col gap-2 border-t pt-4 first:border-none"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Info className="w-4 h-4 text-muted-foreground" />
									<Label className="text-sm font-medium">{formattedKey}</Label>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => toggleExpand(key)}
								>
									{expanded ? (
										<ChevronUp className="w-4 h-4" />
									) : (
										<ChevronDown className="w-4 h-4" />
									)}
								</Button>
							</div>
							{expanded && (
								<pre className="bg-muted p-3 rounded text-xs overflow-x-auto transition-all max-h-96 animate-slideDown">
									{JSON.stringify(value, null, 2)}
								</pre>
							)}
						</div>
					);
				}

				return (
					<div
						key={key}
						className="flex flex-col gap-1 border-t pt-4 first:border-none"
					>
						<div className="flex items-center gap-2">
							<Info className="w-4 h-4 text-muted-foreground" />
							<Label className="text-sm font-medium">{formattedKey}</Label>
						</div>
						<Input
							value={String(value)}
							disabled
							className="w-full text-right opacity-90"
						/>
					</div>
				);
			})}
		</NodeToolbar>
	);
}

export default memo(ModelExtraInfo);
