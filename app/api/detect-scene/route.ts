import { NextRequest, NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://192.168.100.33:11434";

export async function POST(req: NextRequest) {
  try {
    const { text, genreName } = await req.json();
    if (!text) return NextResponse.json({ prompt: null });

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        stream: false,
        format: "json",
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
画像化すべき場合: {"prompt": "英語のStable Diffusion用プロンプト（TRPG背景向け、シネマティック、雰囲気重視）", "label": "日本語の短いシーン名（8文字以内）"}
画像化不要の場合: {"prompt": null}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json();
    const parsed = JSON.parse(data.message?.content ?? "{}");
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Scene detection failed:", err);
    return NextResponse.json({ prompt: null });
  }
}
