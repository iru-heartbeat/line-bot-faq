import { getBroadcastLogsForAdmin } from "@/lib/broadcast";
import { sendBroadcastAction } from "@/app/admin/actions";
import { inputStyle, buttonStyle, cardStyle } from "@/app/admin/styles";

const broadcastMessages: Record<string, { text: string; color: string }> = {
  sent: { text: "お知らせを送信しました", color: "green" },
  error: { text: "送信に失敗しました。時間をおいて再度お試しください", color: "red" },
  empty: { text: "メッセージを入力してください", color: "red" },
};

export default async function AdminBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ broadcast?: string }>;
}) {
  const { broadcast } = await searchParams;
  const broadcastLogs = await getBroadcastLogsForAdmin();
  const broadcastFeedback = broadcast ? broadcastMessages[broadcast] : undefined;

  return (
    <>
      <h1 style={{ fontSize: 20 }}>一斉配信</h1>
      <form action={sendBroadcastAction} style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            友だち全員に送るメッセージ
            <textarea name="message" rows={4} style={inputStyle} required />
          </label>
          {broadcastFeedback && (
            <p style={{ color: broadcastFeedback.color, margin: 0 }}>{broadcastFeedback.text}</p>
          )}
          <button type="submit" style={buttonStyle}>
            送信
          </button>
        </div>
      </form>

      {broadcastLogs.length > 0 && (
        <>
          <h2 style={{ fontSize: 16 }}>配信履歴</h2>
          {broadcastLogs.map((log) => (
            <div key={log.id} style={cardStyle}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{log.message}</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: log.status === "error" ? "red" : "#666" }}>
                {new Date(log.createdAt).toLocaleString("ja-JP")}
                {log.status === "error" ? "（送信失敗）" : ""}
              </p>
            </div>
          ))}
        </>
      )}
    </>
  );
}
