import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@radix-ui/react-switch";
import { Plus, Minus } from "lucide-react";

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
	return (
		<div className="space-y-1 w-full">
			<Label className="font-semibold">{name}</Label>

			{type === "int" || type === "float" ? (
				<div className="flex rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
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
						variant="default"
						className="px-4 h-10 w-10 rounded-l-none rounded-r-2"
					>
						{type}
					</Button>
				</div>
			) : type === "string" ? (
				<div className="flex rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
					<Input
						type="text"
						value={value as string}
						className="rounded-r-none focus-within:ring-0 focus-within:none focus-within:ring-offset-0 ring-offset-background"
						onChange={(e) => updateParameter(index, e.target.value)}
					/>
					<Button
						size="icon"
						variant="default"
						className="px-4 h-10 rounded-l-none rounded-r-2"
					>
						{type}
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
