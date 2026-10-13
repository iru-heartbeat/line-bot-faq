import { getSupabaseClient } from "./supabase";
import { getLineClient } from "./line";

// "unanswerable": ClaudeがFAQで回答不可と判定した / "error": Supabase・Claude呼び出し自体が失敗した
export type EscalationReason = "unanswerable" | "error";

export type InquiryLogItem = {
  id: string;
  question: string;
  lineUserId: string | null;
  reason: EscalationReason;
  createdAt: string;
};

// 質問を (1) Supabaseにログ記録 (2) オーナー様へLINE通知 する。
// どちらかが失敗しても、ユーザーへの返信処理自体は止めたくないため、ここでは例外を投げずログのみ残す。
export async function escalateInquiry(
  question: string,
  lineUserId: string | undefined,
  reason: EscalationReason = "unanswerable"
): Promise<void> {
  await Promise.all([logInquiry(question, lineUserId, reason), notifyOwner(question, reason)]);
}

async function logInquiry(
  question: string,
  lineUserId: string | undefined,
  reason: EscalationReason
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase未設定のため、問い合わせログを記録できませんでした");
    return;
  }

  const { error } = await supabase
    .from("inquiry_logs")
    .insert({ question, line_user_id: lineUserId ?? null, reason });

  if (error) {
    console.error("問い合わせログの記録に失敗しました", error);
  }
}

async function notifyOwner(question: string, reason: EscalationReason): Promise<void> {
  const ownerUserId = process.env.LINE_OWNER_USER_ID;
  if (!ownerUserId) {
    console.warn("LINE_OWNER_USER_ID未設定のため、オーナー様への通知を送信できませんでした");
    return;
  }

  const text =
    reason === "error"
      ? `【システムエラーが発生しました】\n質問内容: ${question}\n\nbotが処理できず、お客様へ正しい返信ができていません。内容をご確認のうえ、直接ご連絡ください。`
      : `【FAQ未回答の質問があります】\n${question}\n\n内容をご確認のうえ、お客様に直接ご返信ください。`;

  try {
    await getLineClient().pushMessage({
      to: ownerUserId,
      messages: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("オーナー様への通知送信に失敗しました", error);
  }
}

export async function getInquiryLogsForAdmin(): Promise<InquiryLogItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("inquiry_logs")
    .select("id, question, line_user_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`問い合わせ履歴の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    lineUserId: row.line_user_id,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}
