import { LucideIcon, Square, LayoutDashboard } from "lucide-react";
import { components } from "@/api/v1";

type Diagrams = {
  name: string;
  url: string;
  icon: LucideIcon;
}[];

export function diagramsToFront(
  diagramData: components["schemas"]["model.Diagram"][] =[],
  modelData: components["schemas"]["model.Model"][] = []
): Diagrams {
  return diagramData.flatMap((diagram) => {
    const matchingModel = modelData.find((model) => model.id === diagram.modelId);
    if (!matchingModel) {
      return [];
    }
    return {
      name: diagram.name ?? "Diagramme sans nom",
      url: `/diagram/${diagram.id}`,
      icon: matchingModel.type === "atomic" ? Square : LayoutDashboard,
    };
  });
}