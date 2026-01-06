import http from "http";
import { readFile } from "fs/promises";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const getContentType = (filePath) =>
  CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

const resolvePath = (urlPath) => {
  const cleanPath = urlPath.split("?")[0];
  const safePath = path
    .normalize(cleanPath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\\\]+/, "");
  let filePath = path.join(rootDir, safePath);

  if (cleanPath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  return filePath;
};

const serveFile = async (filePath, res) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
};

export const startServer = ({ port = 4173 } = {}) =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = resolvePath(req.url || "/");

      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const stream = createReadStream(filePath);
        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        stream.pipe(res);
        return;
      }

      const fallbackPath = path.join(rootDir, "index.html");
      if (existsSync(fallbackPath)) {
        serveFile(fallbackPath, res);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    });

    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 4173;
  startServer({ port }).then(() => {
    // eslint-disable-next-line no-console
    console.log(`Static server running at http://127.0.0.1:${port}`);
  });
}
