import { examplePythonCode } from "@/staticModel/examplePythonCode";
import type { WorkerResponse } from "@/types";
import { Editor, useMonaco } from "@monaco-editor/react";
import { SaveIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../form/Form";
import { Submit } from "../form/Submit";

type ModelCodeEditorProps = {
	code: string;
	onSave: (newCode: string) => Promise<void> | void;
};

type ModelCodeEditorFormValues = {
	code: string;
};

export const ModelCodeEditor = ({
	code = examplePythonCode,
	onSave,
}: ModelCodeEditorProps) => {
	const monaco = useMonaco();
	const containerRef = useRef<HTMLDivElement>(null);
	const [output, setOutput] = useState<string>("");

	const initialValues = useMemo(
		() => ({
			code,
		}),
		[code],
	);
	const methods = useForm<ModelCodeEditorFormValues>({
		mode: "onChange",
		values: initialValues,
	});
	const [height, setHeight] = useState<string>("100vsh");

	useEffect(() => {
		if (containerRef.current) {
			const { top } = containerRef.current.getBoundingClientRect();
			setHeight(`calc(100vh - ${top}px`);
		}
	}, []);

	const onSubmit = async (values: ModelCodeEditorFormValues) => {
		try {
			console.log(values);
			await onSave(values.code);
		} catch (error) {
			console.error(error);
		}
	};

	const currentCode = methods.watch("code");

	useEffect(() => {
		if (monaco) {
			const worker = new Worker(
				new URL("../../lib/python/worker.ts", import.meta.url),
			);

			worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				const { diagnostics, error } = event.data;
				console.log("toto", diagnostics, error);
				const model = monaco.editor.getModels()[0];
				if (model) {
					monaco.editor.setModelMarkers(model, "pyright", diagnostics);
				}
			};

			const editor = monaco.editor.getEditors()[0];
			editor.onDidChangeModelContent(() => {
				const code = editor.getValue();
				worker.postMessage({ code });
			});
		}
	}, [monaco]);

	const { formState } = methods;

	return (
		<Form onSubmit={onSubmit} methods={methods} className="grid">
			<div
				ref={containerRef}
				className="overflow-hidden flex flex-col relative max-h-full"
			>
				{formState.isDirty ? (
					<div className="z-10 absolute right-6 bottom-2">
						<Submit variant="default">
							<SaveIcon />
							Save
						</Submit>
					</div>
				) : null}
				<Editor
					height={height}
					theme="vs-dark"
					language="python"
					value={currentCode}
					onChange={(newCode) => {
						if (newCode) {
							methods.setValue("code", code ?? "", {
								shouldDirty: true,
								shouldValidate: true,
								shouldTouch: true,
							});
						}
					}}
				/>
			</div>
		</Form>
	);
};
