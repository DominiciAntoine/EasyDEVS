import { Edge, Node } from '@xyflow/react';

export type NodeData = {
    modelType: "atomic" | "coupled"
    label: string
    inputPorts?: { id: string }[]
    outputPorts?: { id: string }[]
    isSelected?: Boolean
}

export type ModelData = 
{
    id: string
    name: string
    code: string
    dependencies?: string[]

}

export type DiagramDataType =
{
    diagramId : number | null
    name: string,
    nodes: Node<NodeData>[]
    edges: Edge[]
    currentModel : number
    models: ModelData[]
}