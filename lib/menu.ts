import { getSupabaseClient } from "./supabase";

export type MenuItem = {
  name: string;
  price: number;
};

// Supabase未設定時のローカル動作確認用サンプルメニュー。
// 実データ確定後はSupabaseのmenuテーブルで管理する(このサンプルは使われなくなる)。
const SAMPLE_MENU: MenuItem[] = [
  { name: "カット", price: 4000 },
  { name: "パーマ", price: 7000 },
  { name: "カラー", price: 6500 },
  { name: "縮毛矯正", price: 12000 },
  { name: "トリートメント", price: 3500 },
  { name: "ヘッドスパ", price: 3000 },
  { name: "眉カット", price: 1000 },
  { name: "カット+トリートメント", price: 7000 },
  { name: "カット+パーマ", price: 10500 },
  { name: "カット+カラー", price: 10000 },
  { name: "パーマ+トリートメント", price: 10000 },
  { name: "カラー+トリートメント", price: 9500 },
  { name: "カット+パーマ+トリートメント", price: 13500 },
  { name: "カット+カラー+トリートメント", price: 13000 },
  { name: "縮毛矯正+トリートメント", price: 15000 },
];

export async function getMenuList(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return SAMPLE_MENU;
  }

  const { data, error } = await supabase
    .from("menu")
    .select("name, price")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`メニュー取得に失敗しました: ${error.message}`);
  }

  return data ?? [];
}

export type AdminMenuItem = MenuItem & {
  id: string;
  updatedAt: string;
};

// 以下は管理画面専用。Supabase未設定では使えない(フォールバックしない)。
function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabaseが未設定のため、管理画面からメニューを編集できません");
  }
  return supabase;
}

export async function getMenuListForAdmin(): Promise<AdminMenuItem[]> {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from("menu")
    .select("id, name, price, updated_at")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`メニュー取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    updatedAt: row.updated_at,
  }));
}

export async function createMenuItem(name: string, price: number): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from("menu").insert({ name, price });
  if (error) {
    throw new Error(`メニューの追加に失敗しました: ${error.message}`);
  }
}

export async function updateMenuItem(id: string, name: string, price: number): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from("menu")
    .update({ name, price, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    throw new Error(`メニューの更新に失敗しました: ${error.message}`);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from("menu").delete().eq("id", id);
  if (error) {
    throw new Error(`メニューの削除に失敗しました: ${error.message}`);
  }
}
