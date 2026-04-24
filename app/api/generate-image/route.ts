import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. Wide landscape for TRPG tabletop RPG scene background. Cinematic, high quality, no text, no UI elements.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Image generation failed:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
