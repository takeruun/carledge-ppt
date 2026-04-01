const fs = require("fs/promises");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const pageDir = path.join(rootDir, "page");
const jsonOutputFile = path.join(rootDir, "slides.json");
const scriptOutputFile = path.join(rootDir, "slides.js");

async function main() {
  const entries = await fs.readdir(pageDir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });

  const slides = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" }))
    .map((name) => ({
      name,
      path: `./page/${encodeURIComponent(name)}`,
    }));

  await Promise.all([
    fs.writeFile(jsonOutputFile, `${JSON.stringify(slides, null, 2)}\n`, "utf8"),
    fs.writeFile(
      scriptOutputFile,
      `window.__SLIDES__ = ${JSON.stringify(slides, null, 2)};\nwindow.__SLIDES_ERROR__ = false;\n`,
      "utf8"
    ),
  ]);

  console.log(`Generated ${slides.length} slide entries in slides.json and slides.js`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
