import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/luckpool", async (req, res) => {
  try {
    const { path } = req.query;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Missing path" });
    }

    // Example: path=verus/miner/<WALLET>
    const url = `https://luckpool.net/${path}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "KorbskiLabs-Dashboard/1.0",
        Accept: "application/json,text/plain,*/*",
      },
    });

    const text = await r.text();

    // LuckPool sometimes returns JSON or plain text depending on endpoint
    try {
      res.json(JSON.parse(text));
    } catch {
      res.type("text/plain").send(text);
    }
  } catch (e) {
    res.status(500).json({ error: "Proxy failed", detail: String(e) });
  }
});

app.listen(5050, () => console.log("Proxy running on http://localhost:5050"));
