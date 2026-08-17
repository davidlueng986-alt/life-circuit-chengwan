import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire("C:/Users/daive/AppData/Local/Temp/lc-play-node/package.json");
const puppeteer = require("puppeteer-core");

const out = path.resolve("docs/qa");
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--window-size=1440,900"],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.setDefaultTimeout(25000);

async function shot(name) {
  const dest = path.join(out, name);
  await page.screenshot({ path: dest, type: "png" });
  console.log("saved", dest);
}

await page.goto("http://127.0.0.1:4173/?debug=1", { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector("#btn-new");
await page.click("#btn-new");
const yes = await page.$("#confirm-yes");
if (yes) await yes.click().catch(() => undefined);
await page.waitForSelector("#briefing:not([hidden])", { timeout: 8000 });
await new Promise((r) => setTimeout(r, 400));
await shot("brief-1.png");
await page.click("#briefing-next");
await new Promise((r) => setTimeout(r, 350));
await shot("brief-2.png");
await page.click("#briefing-next");
await new Promise((r) => setTimeout(r, 350));
await shot("brief-3.png");
await page.click("#briefing-next");
await page.waitForFunction(() => document.querySelector("#title-screen")?.hidden === true, { timeout: 8000 });
await new Promise((r) => setTimeout(r, 2200));
await shot("map-ps00-gate.png");

await page.mouse.move(720, 420);
await page.mouse.down({ button: "left" });
await page.mouse.move(200, 420, { steps: 18 });
await page.mouse.up({ button: "left" });
await new Promise((r) => setTimeout(r, 400));
await shot("map-ps00-back.png");

const jump = async (id) => {
  await page.evaluate((scene) => {
    const btn = [...document.querySelectorAll("#debug-select button")].find((el) => el.textContent?.includes(scene));
    if (btn) btn.click();
  }, id);
  await new Promise((r) => setTimeout(r, 1800));
};

await jump("P-S03");
await shot("map-ps03.png");
await jump("P-S01");
await shot("map-ps01.png");
await jump("C1-S01");
await shot("map-c1.png");

await browser.close();
console.log("done");
