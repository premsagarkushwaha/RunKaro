import React from "react";

export default function LanguageSelector({ language, onChange }) {
  return (
    <div className="language-selector">
      <label style={{ color: "#cbd7e6", marginRight: 8 }}>Language:</label>
      <select value={language} onChange={(e) => onChange(e.target.value)}>
        <option value="python">Python</option>
        <option value="java">Java</option>
      </select>
    </div>
  );
}
