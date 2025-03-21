import { LucideIcon, Square, LayoutDashboard } from "lucide-react";
import { components } from "@/api/v1";

type Library = {
  items: {
    title: string;
    url: string;
    id?: string;
    isActive?: boolean;
    items?: {
      icon?: LucideIcon;
      title: string;
      url: string;
    }[];
  }[];
};

export function librairiesToFront(
  libraryData: components["schemas"]["model.Library"][],
  modelData: components["schemas"]["model.Model"][]
): Library["items"] {
  return libraryData.map((lib) => ({
    title: lib.title ?? "Sans titre",
    url: `/library/${lib.id}`,
    id: lib.id,
    isActive: false,
    items: modelData
      .filter((model) => model.libId === lib.id)
      .map((model) => ({
        icon: model.type === "atomic" ? Square : LayoutDashboard,
        title: model.name ?? "Modèle sans titre",
        url: `/model/${model.id}`,
      })),
  }));
}

