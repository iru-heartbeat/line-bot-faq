import { NextResponse, after } from "next/server";
import { validateSignature, webhook } from "@line/bot-sdk";
import { getFaqList } from "@/lib/faq";
import { answerFromFaq } from "@/lib/claude";
import { getLineClient } from "@/lib/line";
import { escalateInquiry } from "@/lib/escalation";

// LINEはWebhook到達確認のため空のevents配列でも送ってくる。常に200を返す必要がある。
export async function POST(request: Request) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.error("LINE_CHANNEL_SECRET が未設定です");
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-line-signature");
  const rawBody = await request.text();

  if (!signature || !validateSignature(rawBody, channelSecret, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body: webhook.CallbackRequest = JSON.parse(rawBody);

  // LINEはWebhookへの応答を一定時間内に求めるため、イベント処理の完了を待たずに200を返す。
  // after()を使うことで、レスポンス送信後もVercelが処理の完了まで関数を生かしてくれる
  // (単純なfire-and-forgetだとレスポンス後に処理が途中で止められる場合がある)
  after(() =>
    Promise.all(body.events.map(handleEvent)).catch((error) => {
      console.error("Webhookイベント処理で予期しないエラーが発生しました", error);
    })
  );

  return NextResponse.json({ status: "ok" });
}

async function handleEvent(event: webhook.Event): Promise<void> {
  if (event.type !== "message" || !event.replyToken) {
    return;
  }

  const message = event.message;
  if (message.type !== "text") {
    return;
  }

  const replyToken = event.replyToken;
  const lineUserId = event.source?.type === "user" ? event.source.userId : undefined;

  let replyText: string;
  try {
    const faqList = await getFaqList();
    const result = await answerFromFaq(message.text, faqList);

    if (result.answerable) {
      replyText = result.answer;
    } else {
      replyText = "申し訳ございません。担当者が確認のうえ、改めてご連絡いたします。";
      await escalateInquiry(message.text, lineUserId);
    }
  } catch (error) {
    console.error("FAQ応答処理でエラーが発生しました", error);
    // Supabase/Claude側の障害時もユーザーを無反応のままにしない
    replyText = "申し訳ございません。只今混み合っております。しばらくしてから再度お試しください。";
    // インフラ障害で正しい回答を返せていない旨も、FAQ未回答時と同様にオーナー様へ共有する
    await escalateInquiry(message.text, lineUserId, "error");
  }

  try {
    await getLineClient().replyMessage({
      replyToken,
      messages: [{ type: "text", text: replyText }],
    });
  } catch (error) {
    console.error("LINE返信の送信に失敗しました", error);
  }
}
