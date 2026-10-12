import { getSupabaseClient } from "./supabase";

export type FaqItem = {
  question: string;
  answer: string;
};

// Supabase未設定時のローカル動作確認用サンプルFAQ。
// 実データ確定後はSupabaseのfaqテーブルで管理する(このサンプルは使われなくなる)。
const SAMPLE_FAQS: FaqItem[] = [
  { question: "営業時間", answer: "営業時間は平日10:00〜19:00、土日祝10:00〜18:00です。" },
  { question: "料金", answer: "基本メニューは3,000円〜です。詳細はメニュー表をご確認ください。" },
  { question: "アクセス", answer: "最寄り駅から徒歩5分です。駐車場は店舗裏に2台分ございます。" },
  { question: "定休日", answer: "定休日は毎週水曜日です。祝日の場合は営業いたします。" },
  { question: "予約の可否", answer: "ご予約可能です。LINEで希望日時をお知らせください。" },
];

export async function getFaqList(): Promise<FaqItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return SAMPLE_FAQS;
  }

  const { data, error } = await supabase
    .from("faq")
    .select("question, answer")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`FAQ取得に失敗しました: ${error.message}`);
  }

  return data ?? [];
}

export type AdminFaqItem = FaqItem & {
  id: string;
  updatedAt: string;
};

// 以下は管理画面専用。Supabase未設定では使えない(フォールバックしない)。
function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabaseが未設定のため、管理画面からFAQを編集できません");
  }
  return supabase;
}

export async function getFaqListForAdmin(): Promise<AdminFaqItem[]> {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, updated_at")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`FAQ取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    updatedAt: row.updated_at,
  }));
}

export async function createFaq(question: string, answer: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from("faq").insert({ question, answer });
  if (error) {
    throw new Error(`FAQの追加に失敗しました: ${error.message}`);
  }
}

export async function updateFaq(id: string, question: string, answer: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from("faq")
    .update({ question, answer, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    throw new Error(`FAQの更新に失敗しました: ${error.message}`);
  }
}

export async function deleteFaq(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from("faq").delete().eq("id", id);
  if (error) {
    throw new Error(`FAQの削除に失敗しました: ${error.message}`);
  }
}
