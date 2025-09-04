import React from "react";

export default function InputBox({ stdin, setStdin }) {
  return (
    <div className="input-box">
      <label>Standard Input:</label>
      <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="Type input here, separate lines with newline..." />
    </div>
  );
}
