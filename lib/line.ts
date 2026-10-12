import { messagingApi } from "@line/bot-sdk";

const { MessagingApiClient } = messagingApi;

let client: InstanceType<typeof MessagingApiClient> | null = null;

export function getLineClient() {
  if (!client) {
    client = new MessagingApiClient({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
    });
  }
  return client;
}
