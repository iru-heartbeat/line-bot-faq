import { redirect } from "next/navigation";
import { getIsAuthenticated } from "@/lib/adminAuth";
import { logoutAction } from "@/app/admin/actions";

const navItems = [
  { href: "/admin/faq", label: "FAQ管理" },
  { href: "/admin/menu", label: "メニュー管理" },
  { href: "/admin/inquiries", label: "問い合わせ履歴" },
  { href: "/admin/broadcast", label: "一斉配信" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getIsAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20 }}>管理画面</h1>
        <form action={logoutAction}>
          <button type="submit" style={{ padding: 8 }}>
            ログアウト
          </button>
        </form>
      </div>

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} style={{ fontSize: 14 }}>
            {item.label}
          </a>
        ))}
      </nav>

      {children}
    </main>
  );
}
