import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ language, code, setCode }) {
  let monacoLang = "plaintext"; // fallback

  if (language === "python") {
    monacoLang = "python";
  } else if (language === "java") {
    monacoLang = "java";
  } else if (language === "cpp" || language === "c++") {
    monacoLang = "cpp";
  }

  return (
    <Editor
      height="100%"
      defaultLanguage={monacoLang}
      language={monacoLang}
      value={code}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
      }}
      onChange={(value) => setCode(value)}
    />
  );
}
