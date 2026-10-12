import { redirect } from "next/navigation";
import { getIsAuthenticated } from "@/lib/adminAuth";
import { getFaqListForAdmin } from "@/lib/faq";
import { getBroadcastLogsForAdmin } from "@/lib/broadcast";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  logoutAction,
  sendBroadcastAction,
} from "./actions";

const inputStyle: React.CSSProperties = { padding: 10, fontSize: 16, width: "100%" };
const buttonStyle: React.CSSProperties = { padding: 10, fontSize: 16 };
const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

const broadcastMessages: Record<string, { text: string; color: string }> = {
  sent: { text: "お知らせを送信しました", color: "green" },
  error: { text: "送信に失敗しました。時間をおいて再度お試しください", color: "red" },
  empty: { text: "メッセージを入力してください", color: "red" },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ broadcast?: string }>;
}) {
  if (!(await getIsAuthenticated())) {
    redirect("/admin/login");
  }

  const { broadcast } = await searchParams;
  const faqList = await getFaqListForAdmin();
  const broadcastLogs = await getBroadcastLogsForAdmin();
  const broadcastFeedback = broadcast ? broadcastMessages[broadcast] : undefined;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20 }}>FAQ管理</h1>
        <form action={logoutAction}>
          <button type="submit" style={{ padding: 8 }}>
            ログアウト
          </button>
        </form>
      </div>

      {faqList.map((faq) => (
        <form key={faq.id} action={updateFaqAction} style={cardStyle}>
          <input type="hidden" name="id" value={faq.id} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label>
              質問
              <input type="text" name="question" defaultValue={faq.question} style={inputStyle} required />
            </label>
            <label>
              回答
              <textarea name="answer" defaultValue={faq.answer} rows={3} style={inputStyle} required />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={buttonStyle}>
                保存
              </button>
              <button type="submit" formAction={deleteFaqAction} style={buttonStyle}>
                削除
              </button>
            </div>
          </div>
        </form>
      ))}

      <h2 style={{ fontSize: 16 }}>新しいFAQを追加</h2>
      <form action={createFaqAction} style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            質問
            <input type="text" name="question" style={inputStyle} required />
          </label>
          <label>
            回答
            <textarea name="answer" rows={3} style={inputStyle} required />
          </label>
          <button type="submit" style={buttonStyle}>
            追加
          </button>
        </div>
      </form>

      <h1 style={{ fontSize: 20, marginTop: 32 }}>一斉配信</h1>
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
    </main>
  );
}
