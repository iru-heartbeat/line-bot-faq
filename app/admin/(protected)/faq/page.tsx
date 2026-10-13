import { getFaqListForAdmin } from "@/lib/faq";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "@/app/admin/actions";
import { inputStyle, buttonStyle, cardStyle } from "@/app/admin/styles";

export default async function AdminFaqPage() {
  const faqList = await getFaqListForAdmin();

  return (
    <>
      <h1 style={{ fontSize: 20 }}>FAQ管理</h1>
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
    </>
  );
}
