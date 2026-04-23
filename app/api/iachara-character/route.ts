import { NextRequest, NextResponse } from "next/server";

const IACHARA_API = "https://apiv3.iachara.com";
const FIREBASE_API_KEY = "AIzaSyBRP4ntIWd48qx6Liqk-1DnigSMM_xNLgs";

async function getGuestIdToken(): Promise<string> {
  const customTokenRes = await fetch(`${IACHARA_API}/v3/auth/guestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!customTokenRes.ok) throw new Error("Failed to get guest token");
  const { token: customToken } = await customTokenRes.json();

  const idTokenRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  if (!idTokenRes.ok) throw new Error("Failed to exchange token");
  const { idToken } = await idTokenRes.json();
  return idToken;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const idToken = await getGuestIdToken();
    const res = await fetch(`${IACHARA_API}/v3/charasheet/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Character not found or not public" },
        { status: res.status }
      );
    }

    const body = await res.json();
    // レスポンス構造: { success: true, data: { name, data: { profile: { icons, name } } } }
    const profile = body.data?.data?.profile;
    const icons: { url: string; name: string }[] = (profile?.icons ?? [])
      .filter((icon: { url: string }) => icon.url)
      .map((icon: { url: string; name: string }) => ({
        url: icon.url,
        name: icon.name ?? "",
      }));

    return NextResponse.json({
      name: body.data?.name ?? profile?.name ?? "",
      icons,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}
