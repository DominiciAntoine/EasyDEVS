import { useState } from "react";
import Editor from "@monaco-editor/react";
import { examplePythonCode } from "@/staticModel/examplePythonCode";

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
