import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { imageUrl, keyword } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  await pusher.trigger("trpg-scene", "background-change", {
    imageUrl,
    keyword: keyword ?? "",
    triggeredAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
