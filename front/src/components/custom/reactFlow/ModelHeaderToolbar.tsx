import { memo } from "react";
import { CodeXml, Minus, Plus } from "lucide-react";

type ModelNodeProps = {
  selected: boolean;
};

function ModelHeaderToolbar({ selected }: ModelNodeProps) {
  if (!selected) return null;

  return (
    <div className="w-full h-full flex justify-between px-2 py-1 bg-background rounded-t-2xl shadow-md text-foreground">
      <div className="flex h-full items-center">
        <ToolbarButton icon={<Plus className="h-4 w-4" />} label="Add input port" />
        <ToolbarButton icon={<Minus className="h-4 w-4" />} label="Remove input port" />
      </div>
      <div className="flex items-center">
        <ToolbarButton icon={<CodeXml className="h-4 w-4" />} label="Accéder au code" />
      </div>
      <div className="flex h-full items-center">
        <ToolbarButton icon={<Plus className="h-4 w-4" />} label="Add output port" />
        <ToolbarButton icon={<Minus className="h-4 w-4" />} label="Remove output port" />
      </div>
    </div>
  );
}

const ToolbarButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button
    className=" rounded hover:bg-primary/50 active:ring-2 active:ring-ring transition-all duration-150"
    title={label}
  >
    {icon}
  </button>
);

export default memo(ModelHeaderToolbar);
