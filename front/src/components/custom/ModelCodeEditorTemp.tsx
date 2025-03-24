import { examplePythonCode } from "@/staticModel/examplePythonCode";
import Editor from "@monaco-editor/react";
import { useState } from "react";

const ModelCodeEditorTemp = () => {
	const [code, setCode] = useState(examplePythonCode);

	return (
		<Editor
			defaultLanguage="python"
			value={code}
			onChange={(value) => setCode(value || "")}
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
