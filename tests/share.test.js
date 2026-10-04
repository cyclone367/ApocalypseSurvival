import test from "node:test";
import assert from "node:assert/strict";
import { results } from "../src/results.js";
import { resetRun } from "../src/game-flow.js";
import { buildShareData, copyText, formatShareText } from "../src/share.js";
import { createResultFilename, createShareCardCanvas } from "../src/share-card.js";

function makeCanvasDocument() {
  const drawnText = [];
  const context = {
    font: "",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    textAlign: "left",
    fillRect() {},
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
    getContext: () => context
  };
  return {
    drawnText,
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

test("renders a high-resolution card with title, days, and all four attributes", () => {
  const data = buildShareData(results.groupAdmin, sampleScores(), 15);
  const { canvas, documentRef, drawnText } = makeCanvasDocument();
  const generated = createShareCardCanvas(data, documentRef);
  assert.equal(generated, canvas);
  assert.equal(canvas.width, 1080);
  assert.equal(canvas.height, 1920);
  for (const requiredText of ["末日群主", "15 / 15", "生存", "社交", "理智", "混乱", "社区协调者"]) {
    assert.ok(drawnText.some(({ text }) => text.includes(requiredText)), `expected card text: ${requiredText}`);
  }
});

test("formats copied text from the current result attributes and evaluation", () => {
  const data = buildShareData(results.groupAdmin, sampleScores(), 15);
  assert.equal(formatShareText(data), `《末日来了，你能活过第几天？》

我的结局：末日群主
生存天数：15 / 15

生存 21
社交 30
理智 21
混乱 0

系统评价：
请问群主，救援到了能不能发个全员通知？

你也来试试。`);
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
