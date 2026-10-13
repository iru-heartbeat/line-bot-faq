import { getInquiryLogsForAdmin } from "@/lib/escalation";
import { cardStyle } from "@/app/admin/styles";

export default async function AdminInquiriesPage() {
  const inquiryLogs = await getInquiryLogsForAdmin();

  return (
    <>
      <h1 style={{ fontSize: 20 }}>問い合わせ履歴</h1>
      {inquiryLogs.length === 0 ? (
        <p style={{ color: "#666" }}>まだ問い合わせはありません。</p>
      ) : (
        inquiryLogs.map((log) => (
          <div key={log.id} style={cardStyle}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{log.question}</p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: log.reason === "error" ? "red" : "#666" }}>
              {new Date(log.createdAt).toLocaleString("ja-JP")}
              {log.reason === "error" ? "（システムエラー）" : "（FAQ未回答）"}
              {log.lineUserId ? ` / LINEユーザーID: ${log.lineUserId}` : ""}
            </p>
          </div>
        ))
      )}
    </>
  );
}
