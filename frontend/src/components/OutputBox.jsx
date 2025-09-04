import React from "react";

export default function OutputBox({ output }) {
  return (
    <div>
      <div className="output-title">Output</div>
      <div className="output-panel">
        {output.stdout && <pre>{output.stdout}</pre>}
        {output.stderr && <pre className="output-stderr">{output.stderr}</pre>}
        {!output.stdout && !output.stderr && <div style={{ color: "#7f98b3" }}>No output yet — run your code.</div>}
        <div className="meta">
          {output.timed_out ? "⚠️ Execution timed out" : ""}
          {output.exit_code !== null ? `  Exit code: ${output.exit_code}` : ""}
        </div>
      </div>
    </div>
  );
}
