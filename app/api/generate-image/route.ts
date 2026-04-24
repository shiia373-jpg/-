import { NextRequest, NextResponse } from "next/server";

const SD_BASE_URL = process.env.SD_BASE_URL ?? "http://192.168.100.33:8000";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const response = await fetch(`${SD_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${prompt}, wide landscape, TRPG tabletop RPG scene background, cinematic, high quality, no text, no UI elements`,
        negative_prompt: "text, watermark, logo, blurry, ugly, bad anatomy, UI, interface",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        width: 768,
        height: 512,
      }),
    });

    if (!response.ok) throw new Error(`SD API error: ${response.status}`);

    const data = await response.json();
    // base64画像をそのまま返す（data:image/png;base64,...）
    return NextResponse.json({ imageUrl: data.image });
  } catch (err) {
    console.error("Image generation failed:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
