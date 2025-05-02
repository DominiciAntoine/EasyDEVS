import type { ReactFlowModelData } from "@/types";
import {
	Handle,
	NodeResizer,
	Position,
	useUpdateNodeInternals,
} from "@xyflow/react";
import { memo } from "react";
import ModelExtraInfo from "./ModelExtraInfo";
import ModelHeader from "./ModelHeader";

type ModelNodeProps = {
	id: string;
	data: ReactFlowModelData;
	selected: boolean;
};

function ModelNode({ id, data, selected }: ModelNodeProps) {
	return (
		<>
			<NodeResizer
				isVisible={selected}
				minWidth={100}
				minHeight={30}
				handleClassName="h-2 w-2 z-50 before:content-[''] before:absolute before:inset-[-10px] before:bg-transparent"
			/>

			{(data.alwaysShowExtraInfo === true ||
				data.alwaysShowExtraInfo === undefined) && (
				<ModelExtraInfo id={id} data={data} selected={selected} />
			)}

			{/* Conteneur principal avec une bordure */}
			<div className="h-full w-full border-border border rounded-lg border-solid ">
				{/* En-tête avec le label */}
				<ModelHeader selected={selected} data={data} id={id} />

				{/* Conteneur principal pour les ports */}
				<div className="flex relative h-[calc(100%-2.5rem)] bg-card">
					{/* Ports d'entrée (aligné à gauche) */}

					<div className="flex flex-col justify-evenly relative -left-2 text-primary ">
						{Array.isArray(data.inputPorts) &&
							data.inputPorts.map((port: { id: string }) => (
								<div
									key={`in-group-${port.id}`}
									className="flex flex-row justify-start"
								>
									<Handle
										className="relative h-5 w-2 secondary-foreground transform-none top-0"
										type="target"
										id={`in-${port.id}`}
										position={Position.Left}
									/>
									{data.modelType === "coupled" && (
										<Handle
											className="relative h-5 w-2 secondary-foreground transform-none top-0"
											type="source"
											id={`in-internal-${port.id}`}
											position={Position.Right}
										/>
									)}
								</div>
							))}
					</div>

					{/* Contenu central */}
					<div className="flex-grow text-center">&nbsp;</div>

					{/* Ports de sortie (aligné à droite) */}
					<div className="flex flex-col justify-evenly  relative text-primary -right-2">
						{Array.isArray(data.outputPorts) &&
							data.outputPorts.map((port: { id: string }) => (
								<div
									key={`out-group-${port.id}`}
									className="flex flex-row justify-start"
								>
									{data.modelType === "coupled" && (
										<Handle
											className="relative h-5 w-2 secondary-foreground transform-none top-0"
											type="target"
											id={`out-internal-${port.id}`}
											position={Position.Left}
										/>
									)}
									<Handle
										className="relative h-5 w-2 secondary-foreground transform-none top-0"
										type="source"
										id={`out-${port.id}`}
										position={Position.Right}
									/>
								</div>
							))}
					</div>
				</div>
			</div>
		</>
	);
}

export default memo(ModelNode);
