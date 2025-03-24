import { components } from "@/api/v1";
import { DatabaseModelMetadata, ReactFlowInput, ReactFlowPort } from "@/types/modelType";
import { Edge, Position } from "@xyflow/react";



export function modelToReactflow(models: components["schemas"]["model.Model"][]): ReactFlowInput {

  function safeJsonParse<T>(value: unknown, fallback: T): T {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    } else if (Array.isArray(value)) {
      return value as T;
    }
    else if (typeof value === "object" && value !== null) {
      return value as T;
    }
    return fallback;
  }

  return { 
    nodes: models.map((model) => {
      const inputPorts = safeJsonParse<ReactFlowPort[]>(model.portInJson, []);
      const outputPorts = safeJsonParse<ReactFlowPort[]>(model.portOutJson, []);
      const metadata = safeJsonParse<DatabaseModelMetadata>(model.metadataJson, {});
      
      return {
        id: model.id ?? "Unnamed model",
        type: "resizer",
        style: {
          height: metadata.style?.height ?? 200,
          width: metadata.style?.width ?? 200,
          backgroundColor: metadata.backgroundColor ?? undefined,
        },
        data: { 
          id: model.id ?? "Unnamed model",
          modelType: model.type ?? "atomic",
          label: model.name ?? "Unnamed model",
          inputPorts,
          outputPorts,
          toolbarVisible: metadata.toolbarVisible ?? false,
          toolbarPosition: metadata.toolbarPosition ?? Position.Top, 
          alwaysShowToolbar: metadata.alwaysShowToolbar,
          alwaysShowExtraInfo: metadata.alwaysShowExtraInfo,
        },
        position: metadata.position ?? { x: 0, y: 0 },
      };
    }),
    edges: models.flatMap((model) => {
      const connections = safeJsonParse<Edge[]>(model.connectionsJson, []);
      return connections.map((connection: Edge) => ({
        id: connection.id ?? "Unnamed connection",
        source: connection.source ?? "Unnamed source",
        target: connection.target ?? "Unnamed target",
        sourceHandle: connection.sourceHandle ?? "Unnamed source handle",
        targetHandle: connection.targetHandle ?? "Unnamed target handle",
        type: "step",
        animated: true,
        style: { zIndex: 1000 },
      }));
    }),
  };
}


