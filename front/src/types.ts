export type NodeData = {
    modelType: "atomic" | "coupled"
    label: string
    inputPorts?: { id: string }[]
    outputPorts?: { id: string }[]
}