import { createServer } from "node:http";
import { readFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "presentation/assets");
const frameDir = path.join(outDir, "founder-kit-reveal-frames");
const videoPath = path.join(outDir, "roadvault-founder-kit-item-reveal.mp4");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 4188;
const width = 1280;
const height = 720;
const fps = 30;
const duration = 12;
const frameCount = fps * duration;

const mimeTypes = new Map([
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".css", "text/css"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".mp4", "video/mp4"],
]);

function contentType(filePath) {
  return mimeTypes.get(path.extname(filePath)) || "application/octet-stream";
}

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
      const requested = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
      const filePath = path.join(root, requested === "/" ? "index.html" : requested);
      const bytes = await readFile(filePath);
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      response.end(bytes);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function closeBrowser(browser) {
  await Promise.race([
    browser.close().catch(() => {}),
    new Promise((resolve) => {
      setTimeout(resolve, 5000);
    }),
  ]);
}

async function main() {
  if (!existsSync(chromePath)) {
    throw new Error(`Google Chrome not found at ${chromePath}`);
  }

  await mkdir(outDir, { recursive: true });
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch({ executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/presentation/animation/founder-kit-item-reveal.html?capture=1`, {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(() => window.__roadVaultReady === true);

  const stills = [
    { name: "founder-kit-reveal-usb.png", seconds: 1.1 },
    { name: "founder-kit-reveal-qr.png", seconds: 2.9 },
    { name: "founder-kit-reveal-final-layout.png", seconds: 10.6 },
  ];

  for (const still of stills) {
    await page.evaluate((seconds) => window.renderFrame(seconds), still.seconds);
    await page.screenshot({ path: path.join(outDir, still.name), clip: { x: 0, y: 0, width, height } });
  }

  for (let frame = 0; frame < frameCount; frame += 1) {
    const seconds = frame / fps;
    await page.evaluate((value) => window.renderFrame(value), seconds);
    const filename = `frame-${String(frame).padStart(4, "0")}.png`;
    await page.screenshot({ path: path.join(frameDir, filename), clip: { x: 0, y: 0, width, height } });
  }

  await page.close({ runBeforeUnload: false }).catch(() => {});
  await closeBrowser(browser);
  server.close();

  const ffmpeg = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      path.join(frameDir, "frame-%04d.png"),
      "-vf",
      "format=yuv420p",
      "-movflags",
      "+faststart",
      "-c:v",
      "libx264",
      "-crf",
      "19",
      videoPath,
    ],
    { encoding: "utf8" },
  );

  if (ffmpeg.status !== 0) {
    throw new Error(`ffmpeg failed\n${ffmpeg.stderr}`);
  }

  await rm(frameDir, { recursive: true, force: true });

  console.log(
    JSON.stringify(
      {
        videoPath,
        stills: stills.map((still) => path.join(outDir, still.name)),
        frameCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
