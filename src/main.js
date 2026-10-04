import "./style.css";
import { questions } from "./questions.js";
import { ATTRIBUTES, calculateScores, getEnding, getProgress, getSurvivalDays } from "./scoring.js";
import { recordChoice, resetRun } from "./game-flow.js";
import { buildShareData, copyText, formatShareText } from "./share.js";
import { canvasToPngBlob, createResultFilename, createShareCardCanvas } from "./share-card.js";

const attributeLabels = {
  survival: "生存",
  social: "社交",
  sanity: "理智",
  chaos: "混乱"
};
const app = document.querySelector("#app");
const state = { screen: "home", current: 0, answers: Array(questions.length).fill(null), feedback: "" };
let currentShareData;

function shell(content, extraClass = "") {
  app.innerHTML = `<main class="phone ${extraClass}">${content}</main>`;
  requestAnimationFrame(() => app.querySelector(".screen")?.classList.add("is-visible"));
}

function topbar() {
  const progress = getProgress(state.answers, questions.length);
  const day = String(state.current + 1).padStart(2, "0");
  return `<header class="game-topbar">
    <button class="icon-button" data-action="back" aria-label="返回上一题" ${state.current === 0 ? "disabled" : ""}>←</button>
    <div class="progress-copy"><span class="day-progress-label">第 ${day} 天 <small>DAY ${day}</small><i>/ 15</i></span><span>${progress.percent}%</span></div>
    <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
  </header>`;
}

function feedbackPanel() {
  const feedback = state.feedback || "暂无上一选择";
  return `<div class="feedback ${state.feedback ? "" : "is-empty"}" role="status"><span class="feedback-label">上一选择 <small>LAST ACTION</small></span><span class="feedback-text">${feedback}</span></div>`;
}

function renderHome() {
  state.screen = "home";
  shell(`<section class="screen home-screen">
    <div class="brand-row"><span class="status-dot"></span><span>末日生存终端 <small>SURVIVAL TERMINAL</small></span><span class="build-tag">v.01</span></div>
    <div class="home-hero">
      <p class="eyebrow">紧急记录 <small>/ EMERGENCY LOG · 06:17</small></p>
      <div class="alert-mark"><span class="alert-indicator"></span><span>信号中断</span><small>SIGNAL LOST</small></div>
      <div class="home-title" aria-label="如果末日今晚开始，你能活过第几天？">
        <p class="home-title-kicker">如果末日今晚开始 <small>EMERGENCY SCENARIO</small></p>
        <h1>你能活过</h1>
        <p class="home-title-anchor">第几天<span>?</span></p>
      </div>
      <p class="intro-copy">15 天，15 个选择。没有标准答案，只有你的生存方式。</p>
    </div>
    <section class="home-brief" aria-label="生存简报">
      <div class="home-brief-heading">生存简报 <small>SYSTEM BRIEF</small></div>
      <dl>
        <div><dt>通讯</dt><dd>中断</dd></div>
        <div><dt>物资</dt><dd>有限</dd></div>
        <div><dt>目标</dt><dd>撑过 15 天</dd></div>
      </dl>
    </section>
    <div class="home-meta"><span><b>15</b> 天</span><span><b>08</b> 结局</span><span><b>02</b> 彩蛋</span></div>
    <button class="primary-button" data-action="start">开始生存 <span>↗</span></button>
    <p class="home-footnote">离线体验 · 结果只保存在此页面</p>
  </section>`);
}

function renderIntro() {
  state.screen = "intro";
  shell(`<section class="screen intro-screen">
    <div class="brand-row"><span class="status-dot"></span><span>现场简报 <small>FIELD REPORT</small></span><span class="build-tag">00:00</span></div>
    <div class="intro-content">
      <p class="eyebrow">开场记录 / DAY 00</p>
      <h2>信号中断。<br /><em>请保持冷静。</em></h2>
      <div class="log-card"><span class="log-index">LOG_0001</span><p>城市网络在凌晨 06:17 全面中断。你暂时安全，手边有一些物资，窗外的情况仍不明。</p><p>接下来的十五天，每个决定都会留下痕迹。谨慎、信任、判断，或者一点点混乱——都会成为你的生存日志。</p></div>
      <div class="brief-note"><span>▸</span> 选择后会显示即时反馈；可返回上一天修改决定。</div>
    </div>
    <button class="primary-button" data-action="begin">进入第 1 天 <span>↗</span></button>
  </section>`);
}

function renderQuestion() {
  state.screen = "game";
  const question = questions[state.current];
  const selected = state.answers[state.current];
  shell(`${topbar()}${feedbackPanel()}<section class="screen question-screen">
    <div class="day-heading"><p class="eyebrow">生存日志 <small>/ DAY ${String(question.day).padStart(2, "0")}</small></p><h1>第 ${question.day} 天</h1></div>
    <div class="story-card"><span class="card-label">现场记录 <span>● LIVE</span></span><p>${question.scene}</p><h2>${question.prompt}</h2></div>
    <div class="option-list">${question.options.map((option, index) => `<button class="option-button ${selected === index ? "is-selected" : ""}" data-option="${index}"><span class="option-index">0${index + 1}</span><span>${option.text}</span><span class="option-arrow">↗</span></button>`).join("")}</div>
    <div class="question-footer"><span>选择你的行动</span><button data-action="prev" ${state.current === 0 ? "disabled" : ""}>← 上一天</button></div>
  </section>`, "game-shell");
  app.querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => choose(Number(button.dataset.option))));
}

function choose(optionIndex) {
  const choice = recordChoice(state.answers, state.current, optionIndex, questions);
  state.answers = choice.answers;
  state.feedback = choice.feedback;
  if (choice.isComplete) {
    renderResult();
  } else {
    state.current = choice.nextIndex;
    renderQuestion();
  }
}

function renderResult() {
  state.screen = "result";
  const scores = calculateScores(state.answers, questions);
  const ending = getEnding(scores);
  const days = getSurvivalDays(state.answers);
  const [endingType, endingCategory] = ending.subtitle.split(" · ");
  currentShareData = buildShareData(ending, scores, days);
  shell(`<section class="screen result-screen">
    <div class="brand-row"><span class="status-dot"></span><span>最终报告 <small>FINAL REPORT</small></span><span class="build-tag">第 ${String(days).padStart(2, "0")} 天</span></div>
    <div class="result-heading"><p class="ending-type">${endingType}</p><h1>${ending.title}</h1><p class="ending-category">${endingCategory}</p><p class="days-survived">生存天数：<strong>${days}</strong><span> / 15</span></p></div>
    <div class="result-copy">${ending.copy}</div>
    <div class="attribute-panel"><div class="panel-title"><span class="panel-title-primary">四维记录</span><span class="panel-title-en">SURVIVAL PROFILE</span></div>
      ${ATTRIBUTES.map((key) => `<div class="attribute-row"><div><span>${attributeLabels[key]}</span><b>${scores[key]}</b></div><div class="attribute-track"><span class="attr-${key}" style="width:${Math.min(100, Math.max(4, (scores[key] / 45) * 100))}%"></span></div></div>`).join("")}
    </div>
    <div class="system-note"><span class="note-icon">⌁</span><p><b>系统评价</b>${ending.evaluation}</p></div>
    <div class="result-actions">
      <button class="primary-button" data-action="save">生成分享卡片 <span>↗</span></button>
      <button class="secondary-button" data-action="copy">复制结果 <span>⧉</span></button>
      <button class="secondary-button" data-action="restart">重新开始 <span>↻</span></button>
    </div>
    <p class="save-hint" id="share-status" role="status" aria-live="polite"></p>
  </section>`, "result-shell");
}

async function saveResultCard() {
  const hint = app.querySelector("#share-status");
  let imageUrl;
  try {
    const canvas = createShareCardCanvas(currentShareData);
    const blob = await canvasToPngBlob(canvas);
    const filename = createResultFilename(currentShareData.endingTitle);
    const file = typeof File === "function"
      ? new File([blob], filename, { type: "image/png" })
      : null;
    imageUrl = URL.createObjectURL(blob);
    showSharePreview({ imageUrl, filename, file });
    if (hint) hint.textContent = "分享卡片已生成";
  } catch (error) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    console.error("Could not generate or save the result card.", error);
    if (hint) hint.textContent = "卡片生成失败，请稍后重试";
  }
}

function showSharePreview({ imageUrl, filename, file }) {
  closeSharePreview();
  const supportsShare = Boolean(file && navigator.share);
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent || "");
  const instructions = isWeChat
    ? `<p class="share-preview-main-instruction">长按下方图片保存到手机</p><p class="share-preview-secondary-instruction">也可使用右上角 ··· 分享给朋友</p>`
    : `<p class="share-preview-main-instruction">长按图片保存到相册</p>`;
  const modal = document.createElement("div");
  modal.className = "share-preview";
  modal.dataset.sharePreview = "true";
  modal.innerHTML = `<section class="share-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="share-preview-title">
    <header class="share-preview-header">
      <div><h2 id="share-preview-title">结果卡片</h2>${instructions}<small>LONG PRESS TO SAVE</small></div>
      <button class="share-preview-close" type="button" aria-label="关闭预览">×</button>
    </header>
    <div class="share-preview-content"><img src="${imageUrl}" alt="${currentShareData.endingTitle} · 生存结果分享卡片" /></div>
    <footer class="share-preview-actions">
      ${supportsShare ? `<button class="primary-button" type="button" data-preview-action="share">分享 <span>↗</span></button>` : ""}
      ${isWeChat ? "" : `<a class="secondary-button" href="${imageUrl}" download="${filename}" data-preview-action="download">下载图片 <span>↓</span></a>`}
    </footer>
  </section>`;
  document.body.appendChild(modal);
  document.body.classList.add("share-preview-open");

  const close = () => closeSharePreview();
  modal.querySelector(".share-preview-close").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.querySelector('[data-preview-action="share"]')?.addEventListener("click", async () => {
    const status = app.querySelector("#share-status");
    try {
      await navigator.share({ files: [file], title: currentShareData.endingTitle });
      if (status) status.textContent = "结果卡片已分享";
    } catch (error) {
      if (error.name === "AbortError") {
        if (status) status.textContent = "已取消分享";
      } else {
        console.error("Could not share the result card.", error);
        if (status) status.textContent = "暂时无法分享，请长按图片保存";
      }
    }
  });
  modal.querySelector('[data-preview-action="download"]')?.addEventListener("click", () => {
    const status = app.querySelector("#share-status");
    if (status) status.textContent = "正在下载结果卡片";
  });
  document.addEventListener("keydown", handleSharePreviewKeydown);
}

function handleSharePreviewKeydown(event) {
  if (event.key === "Escape") closeSharePreview();
}

function closeSharePreview() {
  const modal = document.querySelector("[data-share-preview]");
  if (!modal) return;
  const imageUrl = modal.querySelector("img")?.src;
  modal.remove();
  document.body.classList.remove("share-preview-open");
  document.removeEventListener("keydown", handleSharePreviewKeydown);
  if (imageUrl) URL.revokeObjectURL(imageUrl);
}

async function copyResult() {
  const hint = app.querySelector("#share-status");
  try {
    await copyText(formatShareText(currentShareData));
    if (hint) hint.textContent = "结果已复制";
  } catch (error) {
    console.error("Could not copy the result text.", error);
    if (hint) hint.textContent = "复制失败，请检查浏览器权限";
  }
}

app.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "start") renderIntro();
  if (action === "begin") {
    resetRun(state, questions.length);
    renderQuestion();
  }
  if (action === "back" || action === "prev") {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  }
  if (action === "restart") {
    resetRun(state, questions.length);
    currentShareData = undefined;
    renderHome();
  }
  if (action === "save") void saveResultCard();
  if (action === "copy") void copyResult();
});

renderHome();
