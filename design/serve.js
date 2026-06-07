// Minimal static file server (no dependencies) for design preview.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 4321;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/khidr-prototype.html";
    const filePath = path.join(root, urlPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Khidr design preview on http://localhost:${port}`));
