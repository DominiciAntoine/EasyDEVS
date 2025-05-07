import Editor from "@monaco-editor/react";

type ModelCodeEditorTempProps = {
	code: string;
	onChangeCode: (newCode: string) => void;
};

const ModelCodeEditorTemp = ({ code, onChangeCode }: ModelCodeEditorTempProps) => {
	return (
		<Editor
			defaultLanguage="python"
			value={code}
			onChange={(value) => onChangeCode(value || "")}
			theme="vs-dark"
			options={{
				minimap: { enabled: false },
				fontSize: 14,
				automaticLayout: true,
			}}
		/>
	);
};

export default ModelCodeEditorTemp;
