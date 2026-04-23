import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, genreName } = await req.json();
    if (!text) return NextResponse.json({ prompt: null });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたはTRPGのゲームマスターアシスタントです。${genreName}のTRPGセッション中の発言を受け取り、背景画像として描写すべき場面が含まれているか判断してください。

画像化すべき例（場所・状況・雰囲気の描写はすべて対象）:
- 場所・空間: 「知らない部屋だった」「古い洋館に入った」「目を醒めると知らないベッドの上だった」
- 発見・出来事: 「宝箱があった」「凶器が見つかった」「ドラゴンが現れた」「死体を発見した」
- 状況・雰囲気: 「辺りは霧に包まれていた」「炎が上がっている」「廃墟のような場所だ」

画像化不要の例（場面描写を含まない短い応答・操作のみ）:
「どうしますか」「はい」「わかりました」「移動します」「ダイスを振ります」

判断基準: 場所・空間・状況・雰囲気のいずれかが読み取れれば画像化する。

以下のJSON形式のみで返してください:
画像化すべき場合: {"prompt": "英語のDALL-E 3用プロンプト（TRPG背景向け、シネマティック、雰囲気重視）", "label": "日本語の短いシーン名（8文字以内）"}
画像化不要の場合: {"prompt": null}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Scene detection failed:", err);
    return NextResponse.json({ prompt: null });
  }
}
