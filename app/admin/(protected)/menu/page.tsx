import { getMenuListForAdmin } from "@/lib/menu";
import { createMenuAction, updateMenuAction, deleteMenuAction } from "@/app/admin/actions";
import { inputStyle, buttonStyle, cardStyle } from "@/app/admin/styles";

export default async function AdminMenuPage() {
  const menuList = await getMenuListForAdmin();

  return (
    <>
      <h1 style={{ fontSize: 20 }}>メニュー管理</h1>
      {menuList.map((menu) => (
        <form key={menu.id} action={updateMenuAction} style={cardStyle}>
          <input type="hidden" name="id" value={menu.id} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label>
              メニュー名
              <input type="text" name="name" defaultValue={menu.name} style={inputStyle} required />
            </label>
            <label>
              金額(円)
              <input
                type="number"
                name="price"
                defaultValue={menu.price}
                min={0}
                step={1}
                style={inputStyle}
                required
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={buttonStyle}>
                保存
              </button>
              <button type="submit" formAction={deleteMenuAction} style={buttonStyle}>
                削除
              </button>
            </div>
          </div>
        </form>
      ))}

      <h2 style={{ fontSize: 16 }}>新しいメニューを追加</h2>
      <form action={createMenuAction} style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            メニュー名
            <input type="text" name="name" style={inputStyle} required />
          </label>
          <label>
            金額(円)
            <input type="number" name="price" min={0} step={1} style={inputStyle} required />
          </label>
          <button type="submit" style={buttonStyle}>
            追加
          </button>
        </div>
      </form>
    </>
  );
}
