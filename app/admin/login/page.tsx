import { loginAction } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: 360, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 20 }}>管理画面ログイン</h1>
      <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          パスワード
          <input
            type="password"
            name="password"
            required
            autoFocus
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>
        {error && <p style={{ color: "red", margin: 0 }}>パスワードが正しくありません</p>}
        <button type="submit" style={{ padding: 12, fontSize: 16 }}>
          ログイン
        </button>
      </form>
    </main>
  );
}
