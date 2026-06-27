import { ApifyClient } from "@apify/mcpc";

let client: ApifyClient | null = null;

export function getApifyMcpClient(): ApifyClient {
  if (!client) {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN is not set");
    client = new ApifyClient({ token });
  }
  return client;
}
