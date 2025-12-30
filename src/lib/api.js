export async function fetchLuckpoolJson(path) {
    const url = `http://localhost:5050/api/luckpool?path=${encodeURIComponent(path)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  