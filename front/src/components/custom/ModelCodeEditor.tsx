import Editor from "@codingame/monaco-editor-react";
import { initialize } from "@codingame/monaco-editor-wrapper";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Form, useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";

type ModelCodeEditorProps = {
	code: string;
	onSave: (newCode: string) => Promise<void> | void;
};

type ModelCodeEditorFormValues = {
	code: string;
};

export const ModelCodeEditor = ({ code, onSave }: ModelCodeEditorProps) => {
	const [isReady, setIsReady] = useState(false);
	const methods = useForm<ModelCodeEditorFormValues>({
		mode: "onChange",
		defaultValues: {
			code,
		},
	});
	const containerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState("100vh");
	const debounceOnChange = useDebounceCallback(
		(newValue: string) => methods.setValue("code", newValue),
		500,
	);

	useEffect(() => {
		if (containerRef.current) {
			const { height: containerHeight } =
				containerRef.current.getBoundingClientRect();
			setHeight(`${containerHeight}px`);
		}
	}, []);

	const onSubmit: ComponentProps<
		typeof Form<ModelCodeEditorFormValues>
	>["onSubmit"] = async ({ data, event }) => {
		try {
			event?.preventDefault();
			await onSave(code);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		initialize().then(() => setIsReady(true));
	}, []);

	const currentCode = methods.watch("code");

	return isReady ? (
		<Form onSubmit={onSubmit} {...methods} className="grid">
			<div ref={containerRef} className="grid">
				<Editor
					options={{ theme: "vscode-dark" }}
					height="auto"
					programmingLanguage="python"
					value={currentCode}
					onChange={(newCode) => {
						debounceOnChange(newCode ?? "");
					}}
				/>
			</div>
		</Form>
	) : null;
};
