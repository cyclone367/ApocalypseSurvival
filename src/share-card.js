const WIDTH = 1080;
const HEIGHT = 1920;
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

export function createShareCardCanvas(data, documentRef = globalThis.document) {
  if (!data?.gameTitle || !data?.endingNumber || !data?.endingTitle || !data?.endingCategory
    || !Number.isInteger(data?.survivalDays) || !data?.attributes || !data?.evaluation) {
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
  context.arc(112, 126, 8, 0, Math.PI * 2);
  context.fill();
  setFont(context, 24, 600);
  context.fillStyle = COLORS.text;
  context.fillText("末日生存档案", 140, 134);
  setFont(context, 15, 400, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.faint;
  context.fillText("SURVIVAL RECORD  /  FINAL REPORT", 140, 166);
  drawRule(context, 210);

  setFont(context, 27, 600);
  context.fillStyle = COLORS.muted;
  context.fillText(data.gameTitle, 96, 290);
  setFont(context, 22, 500, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.gold;
  context.fillText(data.endingNumber, 96, 390);
  setFont(context, 72, 700);
  context.fillStyle = COLORS.text;
  const titleLines = drawWrappedText(context, data.endingTitle, 96, 492, WIDTH - 192, 94, 2);
  let y = 492 + titleLines * 94;
  setFont(context, 28, 400);
  context.fillStyle = COLORS.muted;
  drawWrappedText(context, data.endingCategory, 96, y + 4, WIDTH - 192, 42, 2);
  y += 105;

  context.fillStyle = COLORS.panel;
  context.fillRect(88, y + 8, WIDTH - 176, 150);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(90, y + 8);
  context.lineTo(90, y + 158);
  context.stroke();
  setFont(context, 23, 400);
  context.fillStyle = COLORS.faint;
  context.fillText("生存天数", 126, y + 61);
  setFont(context, 45, 700);
  context.fillStyle = COLORS.text;
  context.fillText(`${data.survivalDays} / ${data.totalDays}`, 126, y + 122);
  y += 225;

  setFont(context, 19, 500, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.fillStyle = COLORS.faint;
  context.fillText("SURVIVAL PROFILE", 96, y);
  setFont(context, 31, 600);
  context.fillStyle = COLORS.text;
  context.fillText("四维属性", 96, y + 58);
  y += 128;

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
    context.fillRect(96, y + 22, WIDTH - 192, 10);
    context.fillStyle = ATTRIBUTE_COLORS[key];
    context.fillRect(96, y + 22, (WIDTH - 192) * Math.min(1, Math.max(0, attribute.value / 45)), 10);
    y += 88;
  }

  y += 40;
  drawRule(context, y);
  y += 62;
  setFont(context, 25, 600);
  context.fillStyle = COLORS.gold;
  context.fillText("系统评价", 96, y);
  y += 48;
  setFont(context, 29, 400);
  context.fillStyle = COLORS.text;
  drawWrappedText(context, data.evaluation, 96, y, WIDTH - 192, 46, 3);

  drawRule(context, 1740);
  setFont(context, 24, 500);
  context.fillStyle = COLORS.muted;
  context.fillText("15 天 · 15 个选择", 96, 1800);
  setFont(context, 20, 400);
  context.fillStyle = COLORS.faint;
  context.fillText("测测你能活到第几天", 96, 1848);
  setFont(context, 16, 400, 'ui-monospace, "Cascadia Mono", "Consolas", monospace');
  context.textAlign = "right";
  context.fillText("END OF RECORD", WIDTH - 96, 1848);
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

export function createResultFilename(title) {
  const safeTitle = String(title).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").trim() || "result";
  return `apocalypse-result-${safeTitle}.png`;
}
