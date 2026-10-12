import { getLineClient } from "./line";
import { getSupabaseClient } from "./supabase";

export type BroadcastStatus = "success" | "error";

export type BroadcastLogItem = {
  id: string;
  message: string;
  status: BroadcastStatus;
  createdAt: string;
};

// 友だち全員への配信にはLINEのbroadcast APIを使う。配信先は常にLINE側の「友だち全員」であり、
// こちら側で友だちリストを持って1件ずつ送る(multicast)必要はない。
export async function sendBroadcast(message: string): Promise<void> {
  try {
    await getLineClient().broadcast({
      messages: [{ type: "text", text: message }],
    });
  } catch (error) {
    await logBroadcast(message, "error");
    throw new Error(
      `一斉配信の送信に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  await logBroadcast(message, "success");
}

async function logBroadcast(message: string, status: BroadcastStatus): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase未設定のため、配信履歴を記録できませんでした");
    return;
  }

  const { error } = await supabase.from("broadcast_logs").insert({ message, status });
  if (error) {
    console.error("配信履歴の記録に失敗しました", error);
  }
}

export async function getBroadcastLogsForAdmin(): Promise<BroadcastLogItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("broadcast_logs")
    .select("id, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`配信履歴の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}
