import express from "express";
import path from "path";
import { JSDOM } from "jsdom";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const app = express();
const HOST_PORT = 8080;
const MICROSERVICE_PORT = 8080;
const FETCH_TIMEOUT_MS = 2000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    return null;
  }
};

app.get("/api/microservices", async (req, res) => {
  exec('docker ps --format "{{.Names}} {{.Ports}}"', async (err, stdout) => {
    if (err) {
      console.error("Error fetching containers:", err);
      return res.status(500).json({ error: "Docker command failed" });
    }

    const services = [];
    const lines = stdout.trim().split("\n");

    for (const line of lines) {
      const [name, ...portParts] = line.split(" ");
      const portInfo = portParts.join(" ");

      const isHostIt = name.startsWith("host-it");
      const exposesTargetPort = portInfo.includes(`:${MICROSERVICE_PORT}->`);

      if (!isHostIt && exposesTargetPort) {
        const url = `http://localhost:${MICROSERVICE_PORT}`;
        const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

        if (
          response &&
          response.ok &&
          response.headers.get("content-type")?.includes("text/html")
        ) {
          try {
            const html = await response.text();
            const dom = new JSDOM(html);
            const title = dom.window.document.title;

            if (title) {
              services.push({ name, port: MICROSERVICE_PORT, title });
            }
          } catch {
            // Ignore services that returned bad HTML
          }
        }
      }
    }

    res.json(services);
  });
});

app.listen(HOST_PORT, () => {
  console.log(`Host-it is running at http://localhost:${HOST_PORT}`);
});
