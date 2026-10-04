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
      <button class="primary-button" data-action="save">保存结果卡片 <span>↗</span></button>
      <button class="secondary-button" data-action="copy">复制结果 <span>⧉</span></button>
      <button class="secondary-button" data-action="restart">重新开始 <span>↻</span></button>
    </div>
    <p class="save-hint" id="share-status" role="status" aria-live="polite"></p>
  </section>`, "result-shell");
}

async function saveResultCard() {
  const hint = app.querySelector("#share-status");
  try {
    const canvas = createShareCardCanvas(currentShareData);
    const blob = await canvasToPngBlob(canvas);
    const filename = createResultFilename(currentShareData.endingTitle);
    const file = typeof File === "function"
      ? new File([blob], filename, { type: "image/png" })
      : null;

    if (file && navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: currentShareData.endingTitle });
        if (hint) hint.textContent = "结果卡片已分享";
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          if (hint) hint.textContent = "已取消分享";
          return;
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (hint) hint.textContent = "结果卡片 PNG 已生成，正在下载";
  } catch (error) {
    console.error("Could not generate or save the result card.", error);
    if (hint) hint.textContent = "卡片生成失败，请稍后重试";
  }
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
