import { useMemo, useState } from "react";
import { loadWallet, saveWallet } from "./lib/storage";
import { useMinerStats } from "./hooks/useMinerStats";
import { Link } from "react-router-dom";


function Card({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value ?? "—"}</div>
    </div>
  );
}

export default function App() {
  const [wallet, setWallet] = useState(loadWallet());
  const [draft, setDraft] = useState(wallet);

  const { data, err, loading, reload } = useMinerStats(wallet);

  const kpis = useMemo(() => {
    // We’ll map these once we see the exact LuckPool JSON keys
    if (!data) return {};
    return {
      status: data?.status ?? data?.online ?? "—",
      hashrate: data?.hashrate ?? data?.hashrateString ?? "—",
      workers: data?.workers ?? data?.workerCount ?? "—",
      balance: data?.balance ?? data?.balanceString ?? "—",
      paid: data?.paid ?? "—",
      shares: data?.shares ?? "—",
    };
  }, [data]);

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white">
      <div className="w-full px-4 py-10 space-y-6">
        <div className="w-full">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">LuckPool Dashboard</h1>
          <p className="text-white/60 text-sm">Verus miner stats · auto-refresh 15s</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="text-xs text-white/60 mb-1">Wallet address</div>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="Paste your VRSC wallet…"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const w = draft.trim();
                setWallet(w);
                saveWallet(w);
              }}
              className="rounded-xl bg-white text-black px-4 py-2 font-semibold hover:bg-white/90"
            >
              Load
            </button>

            <button
              onClick={reload}
              className="rounded-xl border border-white/15 px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
            Error: {err}
          </div>
        ) : null}

<div className="grid gap-6 lg:grid-cols-[420px_1fr]">
  {/* Left column */}
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <Card label="Status" value={String(kpis.status)} />
      <Card label="Hashrate" value={String(kpis.hashrate)} />
      <Card label="Workers" value={String(kpis.workers)} />
      <Card label="Balance" value={String(kpis.balance)} />
      <Card label="Paid" value={String(kpis.paid)} />
      <Card label="Shares" value={String(kpis.shares)} />
      <Link
  to="/rig"
  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
>
  🖥️ Graph Mode
</Link>
    </div>
  </div>

  

  {/* Right column */}
  <div className="space-y-4">
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Raw data</div>
      <pre className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs overflow-auto text-white/70 h-[420px]">
        {data ? JSON.stringify(data, null, 2) : "No data yet."}
      </pre>
    </div>
  </div>
</div>
</div>
</div>
</div>


  );
}
