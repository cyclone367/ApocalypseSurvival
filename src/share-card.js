import QRCode from "qrcode";
import { GAME_URL } from "./share-config.js";

const WIDTH = 1080;
const HEIGHT = 1440;
const QR_SIZE = 228;
const COLORS = {
  background: "#111412",
  panel: "#1b201b",
  line: "#394137",
  text: "#e3e1d8",
  muted: "#b0b2a5",
  faint: "#858a7d",
  gold: "#c3aa76",
  teal: "#83aaa0",
  red: "#c66f5c",
  track: "#343a32"
};
const ATTRIBUTE_COLORS = {
  survival: COLORS.gold,
  social: COLORS.teal,
  sanity: "#9eaa91",
  chaos: COLORS.red
};

function setFont(context, size, weight = 400, family = '"Microsoft YaHei", "PingFang SC", sans-serif') {
  context.font = `${weight} ${size}px ${family}`;
}

function wrapText(context, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const character of Array.from(String(text))) {
    if (line && context.measureText(line + character).width > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const lines = wrapText(context, text, maxWidth);
  if (lines.length > maxLines) {
    throw new RangeError("Share card text exceeds its reserved layout.");
  }
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

function drawRule(context, y, left = 88, right = WIDTH - 88) {
  context.strokeStyle = COLORS.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(left, y);
  context.lineTo(right, y);
  context.stroke();
}

export function createQrCodeData(url = GAME_URL) {
  if (typeof url !== "string" || !url) throw new TypeError("A game URL is required to create a QR code.");
  return QRCode.create(url, { errorCorrectionLevel: "H" });
}

function drawQrCode(context, url, x, y) {
  const qr = createQrCodeData(url);
  const quietModules = 4;
  const moduleSize = Math.floor(QR_SIZE / (qr.modules.size + quietModules * 2));
  const totalSize = moduleSize * (qr.modules.size + quietModules * 2);
  const originX = x + Math.floor((QR_SIZE - totalSize) / 2);
  const originY = y + Math.floor((QR_SIZE - totalSize) / 2);

  context.fillStyle = "#ffffff";
  context.fillRect(x, y, QR_SIZE, QR_SIZE);
  context.fillStyle = "#000000";
  for (let row = 0; row < qr.modules.size; row += 1) {
    for (let column = 0; column < qr.modules.size; column += 1) {
      if (qr.modules.get(row, column)) {
        context.fillRect(
          originX + (column + quietModules) * moduleSize,
          originY + (row + quietModules) * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }
  return qr.modules.size;
}

export function createShareCardCanvas(data, documentRef = globalThis.document) {
  if (!data?.gameTitle || !data?.endingNumber || !data?.endingTitle || !data?.endingCategory
    || !Number.isInteger(data?.survivalDays) || !data?.attributes || !data?.evaluation
    || !data?.gameUrl) {
    throw new TypeError("Share card data is incomplete.");
  }
  for (const key of ["survival", "social", "sanity", "chaos"]) {
    if (!Number.isFinite(data.attributes[key]?.value)) {
      throw new TypeError(`Share card is missing the ${key} attribute.`);
    }
  }
  if (!documentRef?.createElement) throw new Error("Canvas is unavailable in this browser.");

  const canvas = documentRef.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a Canvas 2D context.");

  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.strokeStyle = COLORS.line;
  context.lineWidth = 2;
  context.strokeRect(36, 36, WIDTH - 72, HEIGHT - 72);

  context.fillStyle = COLORS.teal;
  context.beginPath();
  context.arc(112, 92, 8, 0, Math.PI * 2);
  context.fill();
  setFont(context, 24, 600);
  context.fillStyle = COLORS.text;
  context.fillText("末日生存档案", 140, 100);
  setFont(context, 15, 400, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.faint;
  context.fillText("SURVIVAL RECORD  /  FINAL REPORT", 140, 132);
  drawRule(context, 168);

  setFont(context, 25, 600);
  context.fillStyle = COLORS.muted;
  context.fillText(data.gameTitle, 96, 218);
  setFont(context, 22, 500, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.gold;
  context.fillText(data.endingNumber, 96, 276);
  setFont(context, 68, 700);
  context.fillStyle = COLORS.text;
  const titleLines = drawWrappedText(context, data.endingTitle, 96, 356, WIDTH - 192, 72, 2);
  let y = 356 + titleLines * 72;
  setFont(context, 24, 400);
  context.fillStyle = COLORS.muted;
  const categoryLines = drawWrappedText(context, data.endingCategory, 96, y + 6, WIDTH - 192, 30, 2);
  y += categoryLines * 30 + 20;

  context.fillStyle = COLORS.panel;
  context.fillRect(88, y, WIDTH - 176, 112);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(90, y + 8);
  context.lineTo(90, y + 104);
  context.stroke();
  setFont(context, 23, 400);
  context.fillStyle = COLORS.faint;
  context.fillText("生存天数", 126, y + 42);
  setFont(context, 45, 700);
  context.fillStyle = COLORS.text;
  context.fillText(`${data.survivalDays} / ${data.totalDays}`, 126, y + 92);
  y += 140;

  setFont(context, 19, 500, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.faint;
  context.fillText("SURVIVAL PROFILE", 96, y + 18);
  setFont(context, 31, 600);
  context.fillStyle = COLORS.text;
  context.fillText("四维属性", 96, y + 50);
  y += 72;

  const attributeKeys = ["survival", "social", "sanity", "chaos"];
  for (const key of attributeKeys) {
    const attribute = data.attributes[key];
    setFont(context, 26, 500);
    context.fillStyle = COLORS.muted;
    context.fillText(attribute.label, 96, y);
    setFont(context, 24, 600, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
    context.fillStyle = COLORS.text;
    context.textAlign = "right";
    context.fillText(String(attribute.value), WIDTH - 96, y);
    context.textAlign = "left";
    context.fillStyle = COLORS.track;
    context.fillRect(96, y + 12, WIDTH - 192, 8);
    context.fillStyle = ATTRIBUTE_COLORS[key];
    context.fillRect(96, y + 12, (WIDTH - 192) * Math.min(1, Math.max(0, attribute.value / 45)), 8);
    y += 50;
  }

  y += 16;
  drawRule(context, y);
  y += 34;
  setFont(context, 22, 600);
  context.fillStyle = COLORS.gold;
  context.fillText("系统评价", 96, y);
  y += 36;
  setFont(context, 24, 400);
  context.fillStyle = COLORS.text;
  const evaluationLines = drawWrappedText(context, data.evaluation, 96, y, 600, 34, 3);

  const qrY = 1112;
  drawQrCode(context, data.gameUrl, 780, qrY);
  setFont(context, 29, 600);
  context.fillStyle = COLORS.text;
  context.fillText("你能活过第几天？", 96, qrY + 82);
  setFont(context, 24, 500);
  context.fillStyle = COLORS.muted;
  context.fillText("扫码来试试", 96, qrY + 125);
  setFont(context, 16, 400, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.faint;
  context.fillText("SCAN TO PLAY", 96, qrY + 158);
  if (y + evaluationLines * 34 >= qrY - 24) {
    throw new RangeError("Share card evaluation overlaps its QR code area.");
  }

  drawRule(context, 1360);
  setFont(context, 21, 500);
  context.fillStyle = COLORS.muted;
  context.fillText(`${data.totalDays} 天 · ${data.totalDays} 个选择`, 96, 1400);
  setFont(context, 20, 400);
  context.fillStyle = COLORS.faint;
  context.textAlign = "right";
  context.fillText("末日来了，你能活过第几天？", WIDTH - 96, 1400);
  context.textAlign = "left";

  return canvas;
}

export function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas?.toBlob) {
      reject(new Error("PNG export is unavailable in this browser."));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The result card could not be encoded as PNG."));
    }, "image/png");
  });
}

export function canvasToPngDataUrl(canvas) {
  if (typeof canvas?.toDataURL !== "function") {
    throw new Error("PNG image preview is unavailable in this browser.");
  }
  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl.startsWith("data:image/png")) {
    throw new Error("The result card could not be encoded as a PNG image.");
  }
  return dataUrl;
}

export function createResultFilename(title) {
  const safeTitle = String(title).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").trim() || "result";
  return `apocalypse-result-${safeTitle}.png`;
}
