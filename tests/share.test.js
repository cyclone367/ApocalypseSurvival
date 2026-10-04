import test from "node:test";
import assert from "node:assert/strict";
import { results } from "../src/results.js";
import { resetRun } from "../src/game-flow.js";
import { GAME_URL } from "../src/share-config.js";
import { buildShareData, copyText, formatShareText } from "../src/share.js";
import { canvasToPngDataUrl, createQrCodeData, createResultFilename, createShareCardCanvas } from "../src/share-card.js";

function makeCanvasDocument() {
  const drawnText = [];
  const drawnRectangles = [];
  const context = {
    font: "",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    textAlign: "left",
    fillRect(x, y, width, height) { drawnRectangles.push({ x, y, width, height, fillStyle: this.fillStyle }); },
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillText(text, x, y) { drawnText.push({ text, x, y }); },
    measureText(text) {
      const size = Number.parseInt(this.font.match(/(\d+)px/)?.[1] ?? "16", 10);
      return { width: Array.from(text).length * size * 0.55 };
    }
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
    toDataURL: (type) => `data:${type};base64,share-card`
  };
  return {
    drawnText,
    drawnRectangles,
    documentRef: { createElement: () => canvas },
    canvas
  };
}

function sampleScores(overrides = {}) {
  return { survival: 21, social: 30, sanity: 21, chaos: 0, ...overrides };
}

test("builds share data for different endings with their actual titles and categories", () => {
  const groupAdmin = buildShareData(results.groupAdmin, sampleScores(), 15);
  const solo = buildShareData(results.soloPlayer, sampleScores({ social: 5 }), 12);
  assert.equal(groupAdmin.endingNumber, "结局 02");
  assert.equal(groupAdmin.endingTitle, "末日群主");
  assert.equal(groupAdmin.endingCategory, "社区协调者");
  assert.equal(solo.endingNumber, "结局 07");
  assert.equal(solo.endingTitle, "单排玩家");
  assert.equal(solo.survivalDays, 12);
});

test("renders a compact high-resolution card with title, days, and all four attributes", () => {
  const data = buildShareData(results.groupAdmin, sampleScores(), 15);
  const { canvas, documentRef, drawnText, drawnRectangles } = makeCanvasDocument();
  const generated = createShareCardCanvas(data, documentRef);
  assert.equal(generated, canvas);
  assert.equal(canvas.width, 1080);
  assert.equal(canvas.height, 1440);
  assert.equal(canvas.width / canvas.height, 0.75);
  for (const requiredText of ["末日群主", "15 / 15", "生存", "社交", "理智", "混乱", "社区协调者"]) {
    assert.ok(drawnText.some(({ text }) => text.includes(requiredText)), `expected card text: ${requiredText}`);
  }
  assert.ok(drawnRectangles.some(({ x, y, width, height, fillStyle }) =>
    x === 780 && y === 1112 && width === 228 && height === 228 && fillStyle === "#ffffff"
  ), "expected a white QR code area with a quiet zone");
  assert.ok(drawnRectangles.some(({ x, y, fillStyle }) =>
    x >= 780 && x < 1008 && y >= 1112 && y < 1340 && fillStyle === "#000000"
  ), "expected QR modules to be drawn into the PNG canvas");
});

test("formats a short text report from the current result attributes", () => {
  const data = buildShareData(results.groupAdmin, sampleScores(), 15);
  assert.equal(formatShareText(data), `我在《末日来了，你能活过第几天？》活到了第15天，
解锁结局「末日群主」。

生存 21｜社交 30｜理智 21｜混乱 0

你能活几天？
${GAME_URL}`);
  assert.equal(data.gameUrl, GAME_URL);
});

test("exports the PNG card as a data URL for image previews", () => {
  const { canvas } = makeCanvasDocument();
  assert.equal(canvasToPngDataUrl(canvas), "data:image/png;base64,share-card");
});

test("encodes the configured game URL into the share card QR code", () => {
  const qr = createQrCodeData();
  const decoder = new TextDecoder();
  const qrUrl = qr.segments.map(({ data }) =>
    typeof data === "string" ? data : decoder.decode(data)
  ).join("");
  assert.equal(qrUrl, GAME_URL);
  assert.ok(qr.modules.size > 0);
  assert.ok(qr.modules.size + 8 <= 57, "expected room for a four-module quiet zone in the card QR area");
});

test("supports both hidden easter egg endings in share cards", () => {
  for (const ending of [results.chaosProtocol, results.homeOffice]) {
    const data = buildShareData(ending, sampleScores({ chaos: 24 }), 15);
    const { documentRef, drawnText } = makeCanvasDocument();
    createShareCardCanvas(data, documentRef);
    assert.equal(data.endingNumber, "隐藏彩蛋");
    assert.ok(drawnText.some(({ text }) => text.includes(ending.title)));
    assert.ok(drawnText.some(({ text }) => text.includes("15 / 15")));
  }
  assert.equal(createResultFilename("末日群主"), "apocalypse-result-末日群主.png");
});

test("fits every ending, including the longest title and evaluation, into the share card", () => {
  for (const ending of Object.values(results)) {
    const data = buildShareData(ending, sampleScores(), 15);
    const { documentRef, drawnText } = makeCanvasDocument();
    const canvas = createShareCardCanvas(data, documentRef);
    assert.equal(canvas.height, 1440);
    assert.ok(drawnText.some(({ text }) => text.includes(ending.title)));
    assert.ok(drawnText.some(({ text }) => text.includes(data.evaluation)));
    const evaluationText = drawnText.filter(({ text }) => data.evaluation.includes(text));
    assert.ok(Math.max(...evaluationText.map(({ y }) => y)) < 1088, "expected evaluation to finish above QR area");
  }
});

test("uses Clipboard API when available and falls back to document copy", async () => {
  const copied = [];
  assert.equal(await copyText("share result", {
    navigatorRef: { clipboard: { writeText: async (text) => copied.push(text) } },
    documentRef: {}
  }), "clipboard");
  assert.deepEqual(copied, ["share result"]);

  let fallbackText = "";
  const textarea = {
    value: "",
    style: {},
    setAttribute() {},
    select() {},
    remove() {}
  };
  const documentRef = {
    body: { appendChild(element) { fallbackText = element.value; } },
    createElement: () => textarea,
    execCommand: () => true
  };
  assert.equal(await copyText("fallback result", { navigatorRef: {}, documentRef }), "fallback");
  assert.equal(fallbackText, "fallback result");
});

test("restarting clears the run independently of generated share data", () => {
  const state = { current: 14, answers: Array(15).fill(0), feedback: "Final choice." };
  const shareData = buildShareData(results.homeOffice, sampleScores(), 15);
  assert.equal(shareData.endingTitle, results.homeOffice.title);
  resetRun(state, 15);
  assert.equal(state.current, 0);
  assert.ok(state.answers.every((answer) => answer === null));
  assert.equal(state.feedback, "");
});
