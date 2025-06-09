import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Delete, Minus, Plus, Trash } from "lucide-react";
import { useState } from "react";

type PortCountEditorProps = {
	name: string;
	type: string;
	value: unknown;
	index: number;
	updateParameter(index: number, value: unknown): void;
};

export function ParameterInput({
	index,
	name,
	type,
	value,
	updateParameter,
}: PortCountEditorProps) {


	const titleCaseWord= (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}
	const [hovered , setHovered] = useState<boolean>(false);
	return (
		<div className="space-y-1 w-full">
			<Label className="font-semibold">{name}</Label>

			{type === "int" || type === "float" ? (
				<div className="flex rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background "  onMouseEnter={(e)=>setHovered(true)} onMouseLeave={(e)=>setHovered(false)}>
					<Input
						type="number"
						value={value as number}
						className="rounded-r-none focus-within:ring-0 focus-within:none focus-within:ring-offset-0 ring-offset-background" 
						onChange={(e) =>
							updateParameter(index, Number.parseFloat(e.target.value))
						}
						step={type === "int" ? 1 : 0.1}
					/>
					<Button
						size="icon"
						variant={hovered?"destructive":"default"}
						className="px-6 h-10 rounded-l-none rounded-r-2 font-semibold transition duration-300"
					>
						{hovered?<Trash/>:titleCaseWord(type)}
					</Button>
				</div>
			) : type === "string" ? (
				<div className="flex rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background " onMouseEnter={(e)=>setHovered(true)} onMouseLeave={(e)=>setHovered(false)}>
					<Input
						type="text"
						value={value as string}
						className="focus-visible:ring-0 focus-visible:outline-none rounded-r-none "
						onChange={(e) => updateParameter(index, e.target.value)}
						
					/>
					<Button
						size="icon"
						variant={hovered?"destructive":"default"}
						className="px-6 h-10 rounded-l-none rounded-r-2 font-semibold transition duration-300"
					>
						{hovered?<Trash/>:titleCaseWord(type)}
					</Button>
				</div>
			) : type === "bool" ? (
				<div>
					<Switch
						checked={value as boolean}
						onCheckedChange={(checked) => updateParameter(index, checked)}
					/>
				</div>
			) : type === "object" ? (
				<Textarea
					className="font-mono"
					value={JSON.stringify(value, null, 2)}
					onChange={(e) => {
						try {
							const val = JSON.parse(e.target.value);
							updateParameter(index, val);
						} catch {}
					}}
				/>
			) : null}
		</div>
	);
}
