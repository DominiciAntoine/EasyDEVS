import { Dispatch, SetStateAction, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Code, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import type { components } from "@/api/v1";
import { POSSIBLE_PARAMETER_TYPE } from "@/constants";
import { Form } from "../form/Form";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useForm } from "react-hook-form";
import { InputField } from "../form/InputField";
import { Submit } from "../form/Submit";
import { SelectField } from "../form/SelectField";
import { ParameterInput } from "./reactFlow/ParameterInput";

const ParameterSchema = z.array(
	z.object({
		name: z.string(),
		type: z.enum(["int", "float", "bool", "string", "object"]),
		value: z.unknown().refine((x) => x !== undefined, "Required"),
		description: z.string().optional(),
	}),
);

export function ModelParameterEditor({
	parameters,
	onParametersChange,
}: {
	parameters: NonNullable<
		components["schemas"]["response.ModelResponse"]["metadata"]["parameters"]
	>;
	onParametersChange: (
		params: NonNullable<
			components["schemas"]["response.ModelResponse"]["metadata"]["parameters"]
		>,
	) => void;
}) {
	const [editAsJSON, setEditAsJSON] = useState(false);
	const [jsonInput, setJsonInput] = useState(
		JSON.stringify(parameters, null, 2),
	);
	const methods = useForm<(typeof parameters)[number]>({
		defaultValues: {
			name: "",
			type: "string",
			value: "",
		},
		mode: "onChange",
	});
	const updateParameter = (index: number, newValue: unknown) => {
		const updated = [...parameters];
		updated[index] = { ...updated[index], value: newValue };
		onParametersChange(updated);
	};

	const onSubmitAddParameter = (newParam: (typeof parameters)[number]) => {
		if (!newParam.name || !newParam.type) return;
		onParametersChange([...parameters, newParam]);
		methods.reset({ name: "", type: "string", value: "" });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<Label>
					{editAsJSON ? "Edit Parameters as JSON" : "Edit Parameters with UI"}
				</Label>
				<Button
					variant="secondary"
					size="icon"
					className="size-8"
					onClick={() => setEditAsJSON((prev) => !prev)}
				>
					{editAsJSON ? <Code size={18} /> : <Edit size={18} />}
				</Button>
			</div>


			{editAsJSON ? (
				<Textarea
					value={jsonInput}
					className="font-mono h-64"
					onChange={(e) => setJsonInput(e.target.value)}
					onBlur={() => {
						try {
							const parsed = ParameterSchema.parse(JSON.parse(jsonInput));
							onParametersChange(parsed);
						} catch (e) {
							alert("Invalid JSON or schema mismatch");
						}
					}}
				/>
			) : (
				parameters.map((param, index) => (
					<div key={`${param.name}-${index}`} className="space-y-2">
						<ParameterInput index={index} name={param.name} type={param.type} updateParameter={updateParameter}value={param.value}/>

						{param.description ? (
							<p className="text-xs text-muted-foreground">
								{param.description}
							</p>
						) : null}
					</div>
				))
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="default" className="w-full">
						<Plus />
						Add a parameter
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 ">
					<Form
						methods={methods}
						onSubmit={onSubmitAddParameter}
						className="space-y-2 border p-3 rounded-md bg-background "
					>
						<Label className="font-semibold">Add Parameter</Label>

						<InputField
							placeholder="Name"
							label="Name"
							control={methods.control}
							name="name"
							required
						/>

						<SelectField
							label="Type"
							name="type"
							control={methods.control}
							placeholder="Select type"
						>
							{POSSIBLE_PARAMETER_TYPE.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectField>

						<InputField
							control={methods.control}
							name="description"
							label="Description"
							placeholder="Description (optional)"
						/>

						<Submit className="mt-2">Add Parameter</Submit>
					</Form>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
