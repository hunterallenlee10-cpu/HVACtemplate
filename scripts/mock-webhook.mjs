// Tiny mock of the n8n booking webhook for local QA: node scripts/mock-webhook.mjs [port]
// Logs every JSON body it receives to qa/webhook-received.json.
import http from "node:http";
import fs from "node:fs";
const port = Number(process.argv[2] || 3999);
const received = [];
http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try { received.push(JSON.parse(body)); } catch { received.push({ raw: body }); }
      fs.mkdirSync("qa", { recursive: true });
      fs.writeFileSync("qa/webhook-received.json", JSON.stringify(received, null, 2));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end('{"ok":true}');
    });
  })
  .listen(port, () => console.log(`mock webhook on :${port}`));
