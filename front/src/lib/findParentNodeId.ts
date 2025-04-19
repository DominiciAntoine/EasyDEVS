import type { ReactFlowModelData } from "@/types";
import type { Node, XYPosition } from "@xyflow/react";

export const FindParentNodeId = (
	nodes: Node<ReactFlowModelData>[],
	dropPosition: XYPosition,
) => {
	console.log(`x : ${String(dropPosition.x)} -  y : ${String(dropPosition.y)}`);
	console.log(`parsing through ${nodes.length} nodes`);

	for (let i = nodes.length - 1; i >= 0; i--) {
		const node = nodes[i];

		if (node.data?.modelType === "atomic") continue;

		const width = Number(node.measured?.width) || 200;
		const height = Number(node.measured?.height) || 200;

		const left = node.position.x;
		const top = node.position.y;
		const right = left + width;
		const bottom = top + height;

		console.log(`node check : ${node.data.label}`);
		console.log(
			`left : ${left} - right : ${right} - top : ${top} - bottom : ${bottom}`,
		);

		if (
			dropPosition.x >= left &&
			dropPosition.x <= right &&
			dropPosition.y >= top &&
			dropPosition.y <= bottom
		) {
			return node.id;
		}
	}

	return null;
};
