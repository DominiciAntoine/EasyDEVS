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