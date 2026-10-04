import { GAME_URL } from "./share-config.js";

const ATTRIBUTE_LABELS = {
  survival: "生存",
  social: "社交",
  sanity: "理智",
  chaos: "混乱"
};

export function buildShareData(ending, scores, days) {
  if (!ending?.title || !ending?.subtitle || !ending?.evaluation) {
    throw new TypeError("A complete ending is required to create a share result.");
  }
  if (!scores || !Object.keys(ATTRIBUTE_LABELS).every((key) => Number.isFinite(scores[key]))) {
    throw new TypeError("All four numeric attribute scores are required.");
  }
  if (!Number.isInteger(days) || days < 0 || days > 15) {
    throw new RangeError("Survival days must be an integer between 0 and 15.");
  }

  const [endingType, ...categoryParts] = ending.subtitle.split(" · ");
  const category = categoryParts.join(" · ");
  const endingNumber = endingType.startsWith("结局 ") ? endingType : "隐藏彩蛋";
  const evaluation = ending.evaluation.replace(/^系统评价[：:]\s*/, "");
  const attributes = Object.fromEntries(
    Object.keys(ATTRIBUTE_LABELS).map((key) => [key, {
      key,
      label: ATTRIBUTE_LABELS[key],
      value: scores[key]
    }])
  );

  return {
    gameTitle: "末日来了，你能活过第几天？",
    endingNumber,
    endingTitle: ending.title,
    endingCategory: category,
    survivalDays: days,
    totalDays: 15,
    gameUrl: GAME_URL,
    attributes,
    evaluation
  };
}

export function formatShareText(data) {
  const { attributes } = data;
  return `我在《${data.gameTitle}》活到了第${data.survivalDays}天，
解锁结局「${data.endingTitle}」。

生存 ${attributes.survival.value}｜社交 ${attributes.social.value}｜理智 ${attributes.sanity.value}｜混乱 ${attributes.chaos.value}

你能活几天？
${data.gameUrl}`;
}

export async function copyText(text, {
  navigatorRef = globalThis.navigator,
  documentRef = globalThis.document
} = {}) {
  if (navigatorRef?.clipboard?.writeText) {
    try {
      await navigatorRef.clipboard.writeText(text);
      return "clipboard";
    } catch {
      // Clipboard API can reject outside a secure context or without user permission.
    }
  }

  if (!documentRef?.body || typeof documentRef.execCommand !== "function") {
    throw new Error("Clipboard access is unavailable in this browser.");
  }

  const textarea = documentRef.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  documentRef.body.appendChild(textarea);
  let copied = false;
  try {
    textarea.select();
    copied = documentRef.execCommand("copy");
  } finally {
    textarea.remove();
  }
  if (!copied) throw new Error("The browser could not copy the result text.");
  return "fallback";
}
