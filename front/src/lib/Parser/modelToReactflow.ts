import { components } from "@/api/v1";
import { Edge, Node } from "@xyflow/react";


export type DiagramDataType =
{
    nodes: Node<NodeData>[]
    edges: Edge[]
}


export type NodeData = {
  modelType: "atomic" | "coupled"
  label: string
  inputPorts?: { id: string }[]
  outputPorts?: { id: string }[]
  isSelected?: boolean
}


export type Port = { id: string }[]





export function modelToReactflow( models: components["schemas"]["model.Model"][] ): DiagramDataType {
  return { 
    nodes: models.map((model) => {
      const inputPorts = JSON.parse(model.portInJson?? "[]") as Port;
      const outputPorts = JSON.parse(model.portOutJson?? "[]") as Port;
      return {
        id: model.id??"Unamed model",
        type:  "resizer",
        style: {
          height: 200,
          width: 200,
        },
        data: { 
          modelType: model.type?? "atomic",
          label: model.name?? "Unamed model",
          inputPorts: inputPorts,
          outputPorts: outputPorts,
        },
        position: {
          x: 0,
          y: 0,
        },
      }
    }),
    edges: models.map((model) => {
      const connections = JSON.parse(model.connectionsJson?? "[]"); ;
      return connections.map((connection : Edge ) => {
        return {
          id: connection.id??"Unamed connection",
          source: connection.source?? "Unamed source",
          target: connection.target?? "Unamed target",
          sourceHandle: connection.sourceHandle?? "Unamed source handle",
          targetHandle: connection.targetHandle?? "Unamed target handle",
          type: "step",
          animated: true,
          style: { zIndex: 1000 },
        }
      })
    }),
}
}


