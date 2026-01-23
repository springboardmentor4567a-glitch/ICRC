import React, { useEffect, useState } from "react";
import { subscribe, getLogs, clearLogs } from "./logger";

export default function DebugPanel({ onClose }) {
  const [logs, setLogs] = useState(getLogs());

  useEffect(() => {
    const unsub = subscribe((next) => {
      console.log('DebugPanel received logs update:', next.length);
      setLogs(next);
    });
    return unsub;
  }, []);

  return (
    <div className="debug-panel" role="region" aria-label="Debug Output">
      <div className="debug-header">
        <strong>Output</strong>
        <div>
          <button onClick={() => clearLogs()}>Clear</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
        </div>
      </div>
      <div className="debug-body">
        {logs.length === 0 && <div className="debug-empty">No logs yet</div>}
        {logs.map((l, i) => (
          <div key={i} className={`debug-row debug-${l.level || "info"}`}>
            <span className="debug-ts">{new Date(l.ts).toLocaleTimeString()}</span>
            <span className="debug-msg">{l.message}</span>
            {l.meta && <pre className="debug-meta">{JSON.stringify(l.meta)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
