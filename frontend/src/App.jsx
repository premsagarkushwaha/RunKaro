import React, { useState, useEffect } from "react";
import axios from "axios";
import LanguageSelector from "./components/LanguageSelector";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";

const TEMPLATES = {
  python: `# Python Hello World\nname = input()\nprint("Hello,", name)`,
  java: `// Java Hello World\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner s = new Scanner(System.in);\n    String name = s.nextLine();\n    System.out.println("Hello, " + name);\n  }\n}`,
  cpp: `// C++ Hello World\n#include <iostream>\nusing namespace std;\nint main() {\n    string name;\n    cin >> name;\n    cout << "Hello, " << name << endl;\n    return 0;\n}`
};

export default function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(TEMPLATES.python);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState({
    stdout: "",
    stderr: "",
    timed_out: false,
    exit_code: null
  });
  const [loading, setLoading] = useState(false);

  // Update editor template when language changes
  useEffect(() => {
    setCode(TEMPLATES[language]);
    setOutput({ stdout: "", stderr: "", timed_out: false, exit_code: null });
  }, [language]);

  const runCode = async () => {
    setLoading(true);
    setOutput({ stdout: "", stderr: "", timed_out: false, exit_code: null });
    try {
      const res = await axios.post(
        "/run",
        {
          language,
          code,
          stdin,
          timeout_seconds: 10
        },
        { timeout: 20000 }
      );

      setOutput({
        stdout: res.data.stdout || "",
        stderr: res.data.stderr || "",
        timed_out: res.data.timed_out || false,
        exit_code: res.data.exit_code ?? null
      });
    } catch (err) {
      setOutput({
        stdout: "",
        stderr: err.message || "Error",
        timed_out: false,
        exit_code: null
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCode = () => {
    const extMap = { python: "py", java: "java", cpp: "cpp" };
    const filenameMap = { python: "code.py", java: "Main.java", cpp: "main.cpp" };

    const ext = extMap[language] || "txt";
    const filename = filenameMap[language] || `code.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left" />
        <div className="header-right">Online Compiler</div>
      </header>

      <main className="app-main">
        <section className="left-column">
          <div className="top-controls">
            <LanguageSelector language={language} onChange={setLanguage} />
            <div className="action-buttons">
              <button className="btn btn-run" onClick={runCode} disabled={loading}>
                {loading ? "Running..." : "Run"}
              </button>
              <button className="btn btn-save" onClick={saveCode}>
                Save
              </button>
            </div>
          </div>

          <div className="editor-wrap">
            <CodeEditor language={language} code={code} setCode={setCode} />
          </div>

          <InputBox stdin={stdin} setStdin={setStdin} />
        </section>

        <aside className="right-column">
          <OutputBox output={output} />
        </aside>
      </main>
    </div>
  );
}
