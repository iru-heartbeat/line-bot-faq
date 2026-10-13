"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getIsAuthenticated,
} from "@/lib/adminAuth";
import { createFaq, updateFaq, deleteFaq } from "@/lib/faq";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/menu";
import { sendBroadcast } from "@/lib/broadcast";

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");

  if (!verifyPassword(password)) {
    redirect("/admin/login?error=1");
  }

  await setSessionCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

// 各FAQ操作アクションは、ログイン画面以外からも直接呼び出される可能性があるため、
// ページでのリダイレクト表示に頼らず、ここでも必ずセッションを確認する。
async function requireAuthenticated(): Promise<void> {
  if (!(await getIsAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function createFaqAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) {
    throw new Error("質問と回答の両方を入力してください");
  }

  await createFaq(question, answer);
  revalidatePath("/admin/faq");
}

export async function updateFaqAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!id || !question || !answer) {
    throw new Error("質問と回答の両方を入力してください");
  }

  await updateFaq(id, question, answer);
  revalidatePath("/admin/faq");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("削除対象のIDが指定されていません");
  }

  await deleteFaq(id);
  revalidatePath("/admin/faq");
}

function parsePrice(raw: FormDataEntryValue | null): number {
  const price = Number(raw);
  if (!Number.isInteger(price) || price < 0) {
    throw new Error("金額には0以上の整数を入力してください");
  }
  return price;
}

export async function createMenuAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const name = String(formData.get("name") ?? "").trim();
  const price = parsePrice(formData.get("price"));
  if (!name) {
    throw new Error("メニュー名を入力してください");
  }

  await createMenuItem(name, price);
  revalidatePath("/admin/menu");
}

export async function updateMenuAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = parsePrice(formData.get("price"));
  if (!id || !name) {
    throw new Error("メニュー名を入力してください");
  }

  await updateMenuItem(id, name, price);
  revalidatePath("/admin/menu");
}

export async function deleteMenuAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("削除対象のIDが指定されていません");
  }

  await deleteMenuItem(id);
  revalidatePath("/admin/menu");
}

export async function sendBroadcastAction(formData: FormData): Promise<void> {
  await requireAuthenticated();

  const message = String(formData.get("message") ?? "").trim();
  if (!message) {
    redirect("/admin/broadcast?broadcast=empty");
  }

  try {
    await sendBroadcast(message);
  } catch (error) {
    console.error("一斉配信の送信に失敗しました", error);
    redirect("/admin/broadcast?broadcast=error");
  }

  revalidatePath("/admin/broadcast");
  redirect("/admin/broadcast?broadcast=sent");
}
