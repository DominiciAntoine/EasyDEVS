import { Node } from "@xyflow/react";
import { NodeData } from "../types";

const position = { x: 0, y: 0 };

export const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'resizer',
    data: {
      modelType: "atomic",
      label: 'Model',
      inputPorts: [],
      outputPorts: [],
    },
    style: { width: 300, height: 300 },
    position: position,
  },


];
