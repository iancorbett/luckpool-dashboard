import { useEffect, useMemo, useRef, useState } from "react";
import { loadWallet } from "./lib/storage";
import { useMinerStats } from "./hooks/useMinerStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



function Pill({ ok, children }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border",
        ok
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
          : "bg-red-500/15 border-red-500/30 text-red-200",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function BigStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-2 text-3xl sm:text-4xl font-bold text-white">
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function Rig() {
  const wallet = loadWallet();
  const { data, err, loading } = useMinerStats(wallet);

  const [series, setSeries] = useState([]);

  const chartWrapRef = useRef(null);
const [chartW, setChartW] = useState(0);

useEffect(() => {
  const el = chartWrapRef.current;
  if (!el) return;

  const ro = new ResizeObserver(() => {
    setChartW(el.getBoundingClientRect().width);
  });

  ro.observe(el);
  setChartW(el.getBoundingClientRect().width);

  return () => ro.disconnect();
}, []);


  // Keep a rolling chart in memory (client-side)
  useEffect(() => {
    // Prefer numeric fields if they exist
    const raw =
      data?.hashrateSolS ?? data?.hashrateSol ?? null;
  
    let kh = NaN;
  
    if (typeof raw === "number" && Number.isFinite(raw)) {
      // If this is actually Sol/s, we can't assume KH. Skip conversion.
      // We'll fall back to parsing the string below.
      kh = NaN;
    }
  
    // Parse hashrateString like: "938.25 KH" or "1.09 MH"
    if (!Number.isFinite(kh)) {
      const s = typeof data?.hashrateString === "string" ? data.hashrateString : "";
      const m = s.match(/([\d.]+)\s*(H|KH|MH|GH)/i);
      if (!m) return;
  
      const val = Number(m[1]);
      const unit = m[2].toUpperCase();
  
      if (!Number.isFinite(val)) return;
  
      const mult =
        unit === "H" ? 1 / 1000 :
        unit === "KH" ? 1 :
        unit === "MH" ? 1000 :
        unit === "GH" ? 1000 * 1000 :
        1;
  
      kh = val * mult; // normalize to KH
    }
  
    const now = Date.now();
  
    setSeries((prev) => {
      const last = prev[prev.length - 1];
      if (last && now - last.t < 1000) return prev;
  
      const next = [...prev, { t: now, hr: kh }];
      return next.slice(-120);
    });
  }, [data]);
  

  useEffect(() => {
    if (!data) return;
    console.log("tick", new Date().toLocaleTimeString(), {
      hashrateSolS: data.hashrateSolS,
      hashrateSol: data.hashrateSol,
      hashrateString: data.hashrateString,
      timestamp: data.timestamp,
    });
  }, [data]);
  
  

  const derived = useMemo(() => {
    const workers = Array.isArray(data?.workers) ? data.workers : [];
    const workerCount = workers.length;
    const isOnline = workers.some((w) => String(w).includes(":on:"));

    return {
      workerCount,
      isOnline,
      hashrate: data?.hashrateString ?? "—",
      balance:
        typeof data?.balance === "number"
          ? data.balance.toFixed(8)
          : data?.balance ?? "—",
      paid:
        typeof data?.paid === "number" ? data.paid.toFixed(8) : data?.paid ?? "—",
      shares: data?.shares ?? "—",
      last: data?.timestamp
        ? new Date(data.timestamp * 1000).toLocaleTimeString()
        : null,
    };
  }, [data]);

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white">
      <div className="w-full p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold">Rig Mode</div>
              <div className="text-sm text-white/60">
                LuckPool · Verus · auto-refresh 15s
                {derived.last ? ` · updated ${derived.last}` : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Pill ok={derived.isOnline}>
                {derived.isOnline ? "🟢 Online" : "🔴 Offline"}
              </Pill>
              <div className="text-xs text-white/50">{loading ? "Updating…" : ""}</div>
            </div>
          </div>

          {/* No wallet saved */}
          {!wallet ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-lg font-semibold">No wallet saved</div>
              <div className="text-white/60 text-sm mt-1">
                Go to the main dashboard, paste your wallet, hit Load once — then
                come back to <code>/rig</code>.
              </div>
            </div>
          ) : null}

          {/* Error */}
          {err ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm">
              Error: {err}
            </div>
          ) : null}

          {/* Main grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <BigStat label="Hashrate" value={derived.hashrate} />
            <BigStat label="Workers" value={String(derived.workerCount)} />
            <BigStat label="Balance" value={String(derived.balance)} />
            <BigStat label="Paid" value={String(derived.paid)} />
            <BigStat label="Shares" value={String(derived.shares)} />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-wide text-white/60">
                Wallet
              </div>
              <div className="mt-2 font-mono text-sm text-white/80 break-all">
                {wallet}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
  <div className="flex items-center justify-between">
    <div className="text-xs uppercase tracking-wide text-white/60">
      Hashrate (last ~30 min)
    </div>
    <div className="text-xs text-white/50">points: {series.length}</div>
  </div>

  <div ref={chartWrapRef} className="mt-4 w-full">
    {series.length < 2 ? (
      <div className="text-sm text-white/50">Collecting data…</div>
    ) : chartW < 10 ? (
      <div className="text-sm text-white/50">Sizing chart…</div>
    ) : (
      <LineChart width={Math.floor(chartW)} height={220} data={series}>
        <XAxis
          dataKey="t"
          tickFormatter={(v) =>
            new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(v) =>
            new Date(v).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          }
          formatter={(value) => [`${Number(value).toFixed(2)} KH`, "Hashrate"]}
          contentStyle={{
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            color: "white",
          }}
        />
        <Line
            type="monotone"
            dataKey="hr"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            filter="drop-shadow(0 0 6px rgba(56,189,248,0.6))"
            />

      </LineChart>
    )}
  </div>
</div>

        </div>
      </div>
    </div>
  );
}
