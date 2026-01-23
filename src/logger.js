const subscribers = new Set();
let logs = [];

function notify() {
  const snapshot = [...logs];
  subscribers.forEach((cb) => {
    try { cb(snapshot); } catch (e) { console.error('subscriber error:', e); }
  });
}

export function log(level, message, meta) {
  const entry = { level, message, meta, ts: Date.now() };
  logs.push(entry);
  if (logs.length > 2000) logs = logs.slice(-1000);
  notify();
  // also log to console for debugging
  console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
}

export function clearLogs() {
  logs = [];
  notify();
}

export function getLogs() {
  return [...logs];
}

export function subscribe(cb) {
  subscribers.add(cb);
  try { cb(getLogs()); } catch (e) { console.error('subscribe initial call error:', e); }
  return () => subscribers.delete(cb);
}
