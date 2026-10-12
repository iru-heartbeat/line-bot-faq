import Anthropic from "@anthropic-ai/sdk";
import type { FaqItem } from "./faq";

export type FaqConfidence = "高" | "中" | "低";

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export type FaqAnswerResult =
  | { answerable: true; answer: string; confidence: "高" | "中" }
  | { answerable: false; confidence: "低" };

// FAQリストと照合し、回答可能ならその場で回答文を生成する。
// 確信度(1行目)と回答本文(2行目以降)を1回のAPI呼び出しで同時に返させている
// (Vercelの処理時間制約への対応、かつ判定根拠を毎回明示させることで過信した回答を防ぐ)。
export async function answerFromFaq(
  userMessage: string,
  faqList: FaqItem[]
): Promise<FaqAnswerResult> {
  const faqText = faqList
    .map((item, i) => `${i + 1}. Q: ${item.question}\n   A: ${item.answer}`)
    .join("\n");

  const systemPrompt = `あなたは店舗のLINE公式アカウントのFAQ自動応答botです。
以下のFAQリストの内容「のみ」を根拠にユーザーの質問に答えてください。

# FAQリスト
${faqText}

# 出力形式
1行目に確信度ラベル「高」「中」「低」のいずれか1語のみ、2行目以降に回答本文を書いてください。
前置きや「はい、」などの余計な文言は付けないでください。

# 挨拶・雑談について
「こんにちは」「ありがとう」「お疲れ様です」のような、情報を求めていない挨拶・雑談には、
FAQの内容を使わず、親切で自然な一言で返信してください(確信度は「高」としてください)。

# 確信度の基準
- 高: FAQリストの記載内容そのもので直接答えられる、または上記の挨拶・雑談にあたる。
- 中: FAQリストの内容の言い換えや組み合わせで答えられるが、FAQに一字一句そのままの記載はない。
- 低: FAQリストに直接の記載がない情報が必要、個人情報の確認、クレーム対応など、FAQの範囲を超える質問。
  この場合は1行目に「低」とだけ書き、2行目以降は何も書かないでください(回答文を書かない)。
- 高・中の場合も、FAQリストにない情報を推測で補わないでください。`;

  const response = await getClient().messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  const newlineIndex = text.indexOf("\n");
  const firstLine = (newlineIndex === -1 ? text : text.slice(0, newlineIndex)).trim();
  const rest = (newlineIndex === -1 ? "" : text.slice(newlineIndex + 1)).trim();

  // 想定外のラベル(フォーマット崩れ等)はエスカレーション側に倒す(安全側のフォールバック)。
  const confidence: FaqConfidence = firstLine.includes("高")
    ? "高"
    : firstLine.includes("中")
      ? "中"
      : "低";

  if (confidence === "低" || !rest) {
    return { answerable: false, confidence: "低" };
  }

  return { answerable: true, answer: rest, confidence };
}
