import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7日間

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

// 入力されたパスワードが正しいかを、タイミング攻撃に強い方法(長さや内容で処理時間が変わらない比較)で確認する
export function verifyPassword(input: string): boolean {
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) {
    console.error("ADMIN_PASSWORD が未設定です");
    return false;
  }

  const inputHash = crypto.createHash("sha256").update(input).digest();
  const correctHash = crypto.createHash("sha256").update(correct).digest();
  return crypto.timingSafeEqual(inputHash, correctHash);
}

// ログイン成功時に発行する、有効期限付きの署名済みセッション値を作る
// (サーバー側にセッション情報を保存せず、Cookieの値だけで有効性を検証できる簡易な仕組み)
export function createSessionValue(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidSession(value: string | undefined): boolean {
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const secret = process.env.ADMIN_PASSWORD ?? "";
  const expected = sign(payload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

export async function getIsAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
