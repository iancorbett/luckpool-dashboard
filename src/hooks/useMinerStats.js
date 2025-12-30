import { useEffect, useState } from "react";
import { fetchLuckpoolJson } from "../lib/api";

export function useMinerStats(wallet) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!wallet) return;
    setLoading(true);
    setErr("");
    try {
      // NOTE: endpoint path may differ — we’ll adjust once we confirm the LuckPool response
      const json = await fetchLuckpoolJson(`verus/miner/${wallet}`);
      setData(json);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!wallet) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  return { data, err, loading, reload: load };
}
