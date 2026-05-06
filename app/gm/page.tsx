"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GENRES, findScene, type Genre } from "@/lib/genres";

// Speech API types are declared in types/speech.d.ts

const SWITCH_COOLDOWN_MS = 8000;
const AUTO_DETECT_COOLDOWN_MS = 8000;

export default function GmPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>(GENRES[0]);
  const [log, setLog] = useState<string[]>([]);
  const [manualKeyword, setManualKeyword] = useState("");
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Treasure chest state
  const [chestInput, setChestInput] = useState("");
  const [chestVisible, setChestVisible] = useState(false);
  const [chestLidOpen, setChestLidOpen] = useState(false);
  const [chestItemsVisible, setChestItemsVisible] = useState(false);
  const [chestItems, setChestItems] = useState<string[]>([]);

  // Item-get state
  const [acquiredItem, setAcquiredItem] = useState<string | null>(null);
  const [itemGetPhase, setItemGetPhase] = useState<"in" | "out">("in");
  const itemGetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Iachara character state
  const [charaUrlInput, setCharaUrlInput] = useState("");
  const [charaLoading, setCharaLoading] = useState(false);
  const [charas, setCharas] = useState<{
    id: string;
    name: string;
    icons: { url: string; name: string }[];
    selectedUrl: string | null;
    x: number;
    y: number;
    heightVh: number;
  }[]>([]);
  const draggingRef = useRef<{
    charaId: string;
    type: "move" | "resize";
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startSize: number;
  } | null>(null);

  // Cocofolia integration state
  const [cocofoliaMode, setCocofoliaMode] = useState(false);
  const [gmName, setGmName] = useState("GM");
  const cocofoliaModeRef = useRef(false);
  const gmNameRef = useRef("GM");

  // Custom genres state
  const [customGenres, setCustomGenres] = useState<Genre[]>([]);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [showSceneForm, setShowSceneForm] = useState<string | null>(null);
  const [newSceneLabel, setNewSceneLabel] = useState("");
  const [newSceneKeywords, setNewSceneKeywords] = useState("");
  const [newScenePrompt, setNewScenePrompt] = useState("");

  // Background crossfade state
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [fogVisible, setFogVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const lastSwitchedAtRef = useRef<number>(0);
  const lastSentLabelRef = useRef<string>("");
  const lastAutoDetectedAtRef = useRef<number>(0);
  const imageCacheRef = useRef<Map<string, string>>(new Map());
  const selectedGenreRef = useRef<Genre>(GENRES[0]);

  useEffect(() => {
    selectedGenreRef.current = selectedGenre;
    lastSentLabelRef.current = "";
  }, [selectedGenre]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  useEffect(() => {
    cocofoliaModeRef.current = cocofoliaMode;
  }, [cocofoliaMode]);

  useEffect(() => {
    gmNameRef.current = gmName;
  }, [gmName]);

  // Load custom genres from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("customGenres");
      if (saved) setCustomGenres(JSON.parse(saved));
      const savedGmName = localStorage.getItem("cocofoliaGmName");
      if (savedGmName) { setGmName(savedGmName); gmNameRef.current = savedGmName; }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("customGenres", JSON.stringify(customGenres));
  }, [customGenres]);

  useEffect(() => {
    localStorage.setItem("cocofoliaGmName", gmName);
  }, [gmName]);

  // Drag/resize mouse events
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const { charaId, type, startMouseX, startMouseY, startX, startY, startSize } = draggingRef.current;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      if (type === "move") {
        setCharas((prev) => prev.map((c) => c.id === charaId ? { ...c, x: startX + dx, y: startY + dy } : c));
      } else {
        const newH = Math.max(10, Math.min(90, startSize + dy / window.innerHeight * 100));
        setCharas((prev) => prev.map((c) => c.id === charaId ? { ...c, heightVh: newH } : c));
      }
    };
    const onMouseUp = () => { draggingRef.current = null; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const switchScene = useCallback(async (label: string, prompt: string) => {
    setLog((prev) => [...prev, `[切替] 「${label}」`]);

    let imageUrl = imageCacheRef.current.get(label);

    // 霧を立ち上らせる
    if (fogTimerRef.current) clearTimeout(fogTimerRef.current);
    setFogVisible(true);

    if (!imageUrl) {
      setGenerating(true);
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        imageUrl = data.imageUrl as string;
        imageCacheRef.current.set(label, imageUrl);
      } catch {
        setLog((prev) => [...prev, `[エラー] 画像生成に失敗しました`]);
        setGenerating(false);
        setFogVisible(false);
        return;
      }
      setGenerating(false);
    }

    setNextUrl(imageUrl);
    setFading(true);

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setCurrentUrl(imageUrl!);
      setNextUrl(null);
      setFading(false);
      // 霧を晴らす（クロスフェード完了後に霧を消す）
      fogTimerRef.current = setTimeout(() => setFogVisible(false), 800);
    }, 3200);
  }, []);

  const detectAndSwitchScene = useCallback(async (text: string, genre: Genre) => {
    try {
      const res = await fetch("/api/detect-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, genreName: genre.name }),
      });
      const data = await res.json();
      if (!data?.prompt || !data?.label) return;

      setLog((prev) => [...prev, `[自動検出] 「${data.label}」`]);
      lastSentLabelRef.current = data.label;
      lastSwitchedAtRef.current = Date.now();
      switchScene(data.label, data.prompt);
    } catch {
      // 自動検出失敗は無視
    }
  }, [switchScene]);

  // Cocofolia postMessage listener
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!cocofoliaModeRef.current) return;
      const msg = event.data;
      if (!msg || msg.type !== "message") return;
      const payload = msg.payload ?? msg.data ?? msg;
      const name: string = payload?.name ?? "";
      const text: string = payload?.text ?? payload?.message ?? "";
      if (!text || name !== gmNameRef.current) return;

      setLog((prev) => [...prev, `[ここフォリア] ${name}: ${text}`]);

      const genre = selectedGenreRef.current;
      const matched = findScene(genre, text);
      if (matched) {
        const now = Date.now();
        const sameScene = matched.label === lastSentLabelRef.current;
        const coolingDown = now - lastSwitchedAtRef.current < SWITCH_COOLDOWN_MS;
        if (!sameScene || !coolingDown) {
          lastSentLabelRef.current = matched.label;
          lastSwitchedAtRef.current = now;
          switchScene(matched.label, matched.prompt);
        }
      } else {
        const now = Date.now();
        if (now - lastAutoDetectedAtRef.current >= AUTO_DETECT_COOLDOWN_MS) {
          lastAutoDetectedAtRef.current = now;
          detectAndSwitchScene(text, genre);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [switchScene, detectAndSwitchScene]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      alert("このブラウザは音声認識に対応していません。Chrome を使用してください。");
      return;
    }

    const recognition = new SR();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const resultList = event.results;
      let interimTranscript = "";

      for (let i = event.resultIndex; i < resultList.length; i++) {
        const result = resultList[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) continue;
          setInterimText("");
          setLog((prev) => [...prev, text]);

          const genre = selectedGenreRef.current;
          const matched = findScene(genre, text);

          if (matched) {
            const now = Date.now();
            const sameScene = matched.label === lastSentLabelRef.current;
            const coolingDown = now - lastSwitchedAtRef.current < SWITCH_COOLDOWN_MS;
            if (!sameScene || !coolingDown) {
              lastSentLabelRef.current = matched.label;
              lastSwitchedAtRef.current = now;
              switchScene(matched.label, matched.prompt);
            }
          } else {
            const now = Date.now();
            if (now - lastAutoDetectedAtRef.current >= AUTO_DETECT_COOLDOWN_MS) {
              lastAutoDetectedAtRef.current = now;
              detectAndSwitchScene(text, genre);
            }
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (interimTranscript) setInterimText(interimTranscript);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch { /* 再起動失敗は無視 */ }
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "audio-capture" || e.error === "service-not-allowed") {
        setLog((prev) => [...prev, `[エラー] マイクへのアクセスが拒否されました (${e.error})`]);
        recognitionRef.current = null;
        setListening(false);
        setInterimText("");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setLog((prev) => [...prev, `[エラー] ${e.error}`]);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
      setLog((prev) => [...prev, "[音声認識] 開始しました"]);
    } catch (err) {
      setLog((prev) => [...prev, `[エラー] 音声認識の開始に失敗しました: ${err}`]);
    }
  }, [switchScene, detectAndSwitchScene]);

  const acquireItem = useCallback((item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemGetTimerRef.current) clearTimeout(itemGetTimerRef.current);
    setAcquiredItem(item);
    setItemGetPhase("in");
    itemGetTimerRef.current = setTimeout(() => {
      setItemGetPhase("out");
      itemGetTimerRef.current = setTimeout(() => setAcquiredItem(null), 500);
    }, 2400);
  }, []);

  const openChest = useCallback(() => {
    const items = chestInput.split(/[,、，]/).map((s) => s.trim()).filter(Boolean);
    setChestItems(items);
    setChestLidOpen(false);
    setChestItemsVisible(false);
    setChestVisible(true);
    setTimeout(() => setChestLidOpen(true), 350);
    setTimeout(() => setChestItemsVisible(true), 950);
  }, [chestInput]);

  const closeChest = useCallback(() => {
    setChestVisible(false);
    setChestLidOpen(false);
    setChestItemsVisible(false);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText("");
  }, []);

  const loadCharacter = useCallback(async () => {
    const match = charaUrlInput.match(/iachara\.com\/view\/(\d+)/);
    if (!match) {
      setLog((prev) => [...prev, "[エラー] 有効ないあきゃらURLを入力してください"]);
      return;
    }
    const id = match[1];
    if (charas.some((c) => c.id === id)) {
      setLog((prev) => [...prev, "[立ち絵] すでに読み込み済みです"]);
      return;
    }
    setCharaLoading(true);
    try {
      const res = await fetch(`/api/iachara-character?id=${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCharas((prev) => [
        ...prev,
        {
          id,
          name: data.name,
          icons: data.icons ?? [],
          selectedUrl: data.icons?.[0]?.url ?? null,
          x: window.innerWidth - 220 - prev.length * 20,
          y: Math.floor(window.innerHeight * 0.35),
          heightVh: 35,
        },
      ]);
      setCharaUrlInput("");
      setLog((prev) => [...prev, `[立ち絵] 「${data.name}」を読み込みました`]);
    } catch {
      setLog((prev) => [...prev, "[エラー] キャラ読み込みに失敗しました"]);
    }
    setCharaLoading(false);
  }, [charaUrlInput, charas]);

  const handleCharaDragStart = useCallback((e: React.MouseEvent, charaId: string, type: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    const chara = charas.find((c) => c.id === charaId);
    if (!chara) return;
    draggingRef.current = {
      charaId, type,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startX: chara.x, startY: chara.y, startSize: chara.heightVh,
    };
  }, [charas]);

  // Custom genre helpers
  const addCustomGenre = useCallback(() => {
    const name = newGenreName.trim();
    if (!name) return;
    const id = `custom_${Date.now()}`;
    const colors = [
      { accent: "text-teal-400", border: "border-teal-800" },
      { accent: "text-rose-400", border: "border-rose-800" },
      { accent: "text-amber-400", border: "border-amber-800" },
      { accent: "text-violet-400", border: "border-violet-800" },
    ];
    const c = colors[customGenres.length % colors.length];
    setCustomGenres((prev) => [...prev, {
      id, name, nameEn: name, accentColor: c.accent, borderColor: c.border,
      defaultPrompt: `${name} scene, cinematic, atmospheric`,
      scenes: [],
    }]);
    setNewGenreName("");
    setShowGenreForm(false);
  }, [newGenreName, customGenres]);

  const addCustomScene = useCallback(() => {
    const label = newSceneLabel.trim();
    const prompt = newScenePrompt.trim();
    if (!label || !prompt || !showSceneForm) return;
    const keywords = newSceneKeywords.split(/[,、，\s]+/).map((k) => k.trim()).filter(Boolean);
    setCustomGenres((prev) => prev.map((g) =>
      g.id === showSceneForm
        ? { ...g, scenes: [...g.scenes, { label, keywords, prompt }] }
        : g
    ));
    setNewSceneLabel(""); setNewSceneKeywords(""); setNewScenePrompt("");
    setShowSceneForm(null);
  }, [newSceneLabel, newSceneKeywords, newScenePrompt, showSceneForm]);

  const handleManualSend = () => {
    const kw = manualKeyword.trim() || (selectedGenre.scenes[0]?.label ?? "");
    if (!kw) return;

    const matched = findScene(selectedGenre, kw) ??
      selectedGenre.scenes.find((s) => s.label === kw);
    const label = matched?.label ?? kw;
    const prompt = matched?.prompt ??
      `${selectedGenre.nameEn} TRPG scene: ${kw}, cinematic, atmospheric, landscape`;

    lastSentLabelRef.current = label;
    lastSwitchedAtRef.current = Date.now();
    switchScene(label, prompt);
    setManualKeyword("");
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* ── Background layers ── */}
      {currentUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentUrl})`,
            opacity: fading ? 0 : 1,
            transition: "opacity 3s ease-in-out",
          }}
        />
      )}
      {nextUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${nextUrl})`,
            opacity: fading ? 1 : 0,
            transition: "opacity 3s ease-in-out",
          }}
        />
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ── Character standing images (立ち絵) ── */}
      {charas.filter((c) => c.selectedUrl).map((c) => (
        <div
          key={c.id}
          className="absolute z-10 select-none"
          style={{ left: c.x, top: c.y }}
          onMouseDown={(e) => handleCharaDragStart(e, c.id, "move")}
        >
          <img
            src={c.selectedUrl!}
            alt={c.name}
            draggable={false}
            style={{ height: `${c.heightVh}vh`, maxWidth: "20vw", objectFit: "contain", display: "block", cursor: "move" }}
          />
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            style={{ background: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.4)" }}
            onMouseDown={(e) => handleCharaDragStart(e, c.id, "resize")}
          />
        </div>
      ))}

      {/* Fog overlay — シーン切替時に霧を演出 */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          opacity: fogVisible ? 1 : 0,
          transition: "opacity 1.8s ease-in-out",
        }}
      >
        {/* 霧の多層レイヤー */}
        <div
          className="fog-layer-1 absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 20% 50%, rgba(210,220,230,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="fog-layer-2 absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 90% at 80% 40%, rgba(195,210,225,0.18) 0%, transparent 65%)",
          }}
        />
        <div
          className="fog-layer-3 absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 140% 60% at 50% 70%, rgba(180,200,220,0.15) 0%, transparent 60%)",
          }}
        />
        {/* 全体を薄くぼかすブラーオーバーレイ */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(14px) brightness(0.88)",
            backgroundColor: "rgba(160,175,195,0.08)",
          }}
        />
        {/* Generating インジケーター（霧の中に表示） */}
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border border-gray-400/60 border-t-gray-200/80 rounded-full animate-spin" />
              <p className="text-gray-300/70 text-[10px] tracking-widest uppercase">Generating...</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Treasure Chest Overlay ── */}
      {chestVisible && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-10 cursor-pointer select-none"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={closeChest}
        >
          {/* Chest */}
          <div className="relative flex flex-col items-center" style={{ perspective: "500px" }}>
            {/* Gold burst */}
            {chestLidOpen && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: "320px",
                  height: "320px",
                  top: "-130px",
                  left: "-96px",
                  background: "radial-gradient(circle, rgba(255,210,60,0.55) 0%, rgba(255,150,0,0.2) 45%, transparent 70%)",
                  animation: "gold-burst 1.8s ease-out forwards",
                }}
              />
            )}
            {/* Sparkle particles */}
            {chestLidOpen && [
              { tx: "translateX(-70px) translateY(-90px)", delay: "0.1s" },
              { tx: "translateX(80px) translateY(-100px)", delay: "0.2s" },
              { tx: "translateX(-50px) translateY(-130px)", delay: "0.05s" },
              { tx: "translateX(100px) translateY(-70px)", delay: "0.15s" },
              { tx: "translateX(20px) translateY(-140px)", delay: "0.25s" },
              { tx: "translateX(-90px) translateY(-60px)", delay: "0.3s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "rgba(255,220,80,0.9)",
                  top: "20px",
                  left: "60px",
                  ["--sx" as string]: p.tx.split(" ")[0],
                  ["--sy" as string]: p.tx.split(" ")[1],
                  animation: `sparkle-out 1s ease-out ${p.delay} forwards`,
                }}
              />
            ))}

            {/* Lid */}
            <div
              style={{
                width: "128px",
                height: "36px",
                transformOrigin: "bottom center",
                transform: chestLidOpen ? "rotateX(-118deg)" : "rotateX(0deg)",
                transition: "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                background: "linear-gradient(to bottom, #92400e, #78350f)",
                border: "2px solid #b45309",
                borderBottom: "none",
                position: "relative",
                zIndex: 2,
                animation: chestLidOpen ? "chest-glow-pulse 1.5s ease-in-out 0.4s 2" : "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "22px",
                  height: "14px",
                  border: "1.5px solid #d97706",
                  borderRadius: "2px",
                  background: "rgba(217,119,6,0.15)",
                }}
              />
            </div>

            {/* Body */}
            <div
              style={{
                width: "128px",
                height: "80px",
                background: "linear-gradient(to bottom, #78350f, #451a03)",
                border: "2px solid #b45309",
                borderTop: "none",
                position: "relative",
              }}
            >
              {/* Lock shackle */}
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "18px",
                  height: "14px",
                  border: "2px solid #d97706",
                  borderBottom: "none",
                  borderRadius: "9px 9px 0 0",
                }}
              />
              {/* Lock body */}
              <div
                style={{
                  position: "absolute",
                  top: "28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "28px",
                  height: "22px",
                  border: "1.5px solid #d97706",
                  background: "rgba(217,119,6,0.2)",
                  borderRadius: "2px",
                }}
              />
              {/* Horizontal band */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "#b45309",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>

          {/* Items */}
          {chestItemsVisible && (
            <div className="flex flex-wrap gap-3 justify-center max-w-lg px-6">
              {chestItems.length > 0 ? (
                chestItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={(e) => acquireItem(item, e)}
                    className="px-4 py-2 text-sm tracking-wider transition-colors hover:border-yellow-500 hover:text-yellow-200 active:scale-95"
                    style={{
                      border: "1px solid rgba(180,83,9,0.7)",
                      color: "rgba(253,224,71,0.9)",
                      background: "rgba(0,0,0,0.7)",
                      animation: `item-settle 0.4s ease-out ${i * 0.13}s both`,
                    }}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p
                  className="text-gray-600 text-sm tracking-widest italic"
                  style={{ animation: "item-settle 0.4s ease-out both" }}
                >
                  空の宝箱だった…
                </p>
              )}
            </div>
          )}

          <p className="text-gray-700 text-[10px] tracking-widest uppercase">クリックで閉じる</p>
        </div>
      )}

      {/* ── Item Get Overlay ── */}
      {acquiredItem && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          {/* White flash */}
          <div
            className="absolute inset-0"
            style={{
              background: "white",
              animation: "item-get-flash 0.6s ease-out forwards",
            }}
          />

          {/* Card */}
          <div
            className="relative flex flex-col items-center gap-5"
            style={{
              animation: itemGetPhase === "in"
                ? "item-get-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
                : "item-get-out 0.45s ease-in forwards",
            }}
          >
            {/* "入手！" label */}
            <p
              className="text-yellow-400 text-xs uppercase"
              style={{ animation: "item-get-label 0.4s ease-out 0.2s both" }}
            >
              入手！
            </p>

            {/* Item card */}
            <div
              className="relative overflow-hidden px-12 py-6"
              style={{
                border: "1px solid rgba(217,119,6,0.8)",
                background: "rgba(0,0,0,0.88)",
                boxShadow: "0 0 40px rgba(255,180,30,0.35), 0 0 80px rgba(255,150,0,0.15)",
                minWidth: "240px",
              }}
            >
              {/* Shimmer */}
              <div
                className="absolute top-0 bottom-0 w-16 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,220,80,0.25), transparent)",
                  animation: "item-get-shimmer 1.2s ease-in-out 0.3s forwards",
                }}
              />
              <p className="text-center text-yellow-200 text-xl tracking-[0.2em] font-light">
                {acquiredItem}
              </p>
            </div>

            {/* Burst particles */}
            {[
              { bx: "translateX(-90px)", by: "translateY(-70px)", d: "0s" },
              { bx: "translateX(90px)",  by: "translateY(-70px)", d: "0.05s" },
              { bx: "translateX(-70px)", by: "translateY(80px)",  d: "0.1s" },
              { bx: "translateX(70px)",  by: "translateY(80px)",  d: "0.05s" },
              { bx: "translateX(0px)",   by: "translateY(-110px)", d: "0.08s" },
              { bx: "translateX(-110px)", by: "translateY(0px)",  d: "0.12s" },
              { bx: "translateX(110px)",  by: "translateY(0px)",  d: "0.03s" },
              { bx: "translateX(50px)",   by: "translateY(-100px)", d: "0.15s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "rgba(255,210,60,0.9)" : "rgba(255,255,180,0.8)",
                  top: "50%",
                  left: "50%",
                  ["--bx" as string]: p.bx,
                  ["--by" as string]: p.by,
                  animation: `item-burst-particle 0.8s ease-out ${p.d} forwards`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Waiting state */}
      {!currentUrl && !nextUrl && !generating && (
        <div className="absolute inset-0 flex items-center justify-center select-none">
          <p className="text-gray-800 tracking-[0.5em] text-sm uppercase">Standby</p>
        </div>
      )}

      {/* ── Toggle button (always visible) ── */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 text-[10px] tracking-widest uppercase border border-gray-700 bg-black/60 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors backdrop-blur-sm"
      >
        {panelOpen ? "パネルを隠す" : "GM パネル"}
      </button>

      {/* ── GM control panel ── */}
      {panelOpen && (
        <div className="absolute top-0 left-0 h-full w-80 bg-black/80 backdrop-blur-sm border-r border-gray-800 flex flex-col gap-4 p-5 overflow-y-auto z-40">
          <h1 className="text-sm tracking-[0.3em] uppercase font-light text-gray-500 pt-1">
            GM Console
          </h1>

          {/* Genre */}
          <section className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">ジャンル</p>
            <div className="flex flex-wrap gap-1.5">
              {[...GENRES, ...customGenres].map((g: Genre) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 text-[10px] tracking-wider border transition-all ${
                    g.id === selectedGenre.id
                      ? `${g.borderColor} ${g.accentColor} bg-gray-900`
                      : "border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400"
                  }`}
                >
                  {g.name}
                </button>
              ))}
              <button
                onClick={() => setShowGenreForm((v) => !v)}
                className="px-3 py-1 text-[10px] border border-dashed border-gray-700 text-gray-700 hover:text-gray-400 hover:border-gray-500 transition-all"
              >
                ＋
              </button>
            </div>
            {showGenreForm && (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomGenre()}
                  placeholder="ジャンル名"
                  className="flex-1 bg-black/60 border border-gray-800 px-2 py-1 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600 min-w-0"
                />
                <button onClick={addCustomGenre} className="px-2 py-1 border border-gray-700 text-xs text-gray-500 hover:text-gray-200 transition-colors">追加</button>
              </div>
            )}
            {/* Custom genre scene management */}
            {customGenres.filter((g) => g.id === selectedGenre.id).map((g) => (
              <div key={g.id} className="flex flex-col gap-1 border-t border-gray-900 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-700">カスタムシーン</p>
                  <div className="flex gap-1">
                    <button onClick={() => setShowSceneForm(g.id)} className="text-[9px] text-gray-700 hover:text-gray-400 transition-colors">＋シーン</button>
                    <button onClick={() => { setCustomGenres((prev) => prev.filter((c) => c.id !== g.id)); setSelectedGenre(GENRES[0]); }} className="text-[9px] text-gray-800 hover:text-red-700 transition-colors">✕削除</button>
                  </div>
                </div>
                {showSceneForm === g.id && (
                  <div className="flex flex-col gap-1">
                    <input type="text" value={newSceneLabel} onChange={(e) => setNewSceneLabel(e.target.value)} placeholder="シーン名" className="bg-black/60 border border-gray-800 px-2 py-1 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600" />
                    <input type="text" value={newSceneKeywords} onChange={(e) => setNewSceneKeywords(e.target.value)} placeholder="キーワード（カンマ区切り）" className="bg-black/60 border border-gray-800 px-2 py-1 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600" />
                    <input type="text" value={newScenePrompt} onChange={(e) => setNewScenePrompt(e.target.value)} placeholder="DALL-E プロンプト（英語）" className="bg-black/60 border border-gray-800 px-2 py-1 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600" />
                    <div className="flex gap-1">
                      <button onClick={addCustomScene} className="flex-1 px-2 py-1 border border-gray-700 text-xs text-gray-500 hover:text-gray-200 transition-colors">追加</button>
                      <button onClick={() => setShowSceneForm(null)} className="px-2 py-1 border border-gray-800 text-xs text-gray-700 hover:text-gray-400 transition-colors">キャンセル</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Quick scenes */}
          <section className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">シーン — {selectedGenre.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedGenre.scenes.map((scene) => (
                <button
                  key={scene.label}
                  onClick={() => {
                    lastSentLabelRef.current = scene.label;
                    lastSwitchedAtRef.current = Date.now();
                    switchScene(scene.label, scene.prompt);
                  }}
                  disabled={generating}
                  className={`px-3 py-1 text-[10px] border transition-colors ${selectedGenre.borderColor} text-gray-500 hover:text-gray-200 bg-black/40 disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {scene.label}
                </button>
              ))}
            </div>
          </section>

          {/* Cocofolia */}
          <section className="flex flex-col gap-1.5">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">ここフォリア連携</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCocofoliaMode((v) => !v)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                  cocofoliaMode
                    ? "border-green-700 text-green-400"
                    : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                {cocofoliaMode ? "● 連携中" : "○ 連携OFF"}
              </button>
              {cocofoliaMode && <span className="text-[10px] text-green-600 animate-pulse">LIVE</span>}
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-[10px] text-gray-600">GM名</span>
              <input
                type="text"
                value={gmName}
                onChange={(e) => setGmName(e.target.value)}
                placeholder="GM"
                className="flex-1 bg-black/60 border border-gray-800 px-2 py-1 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>
            <p className="text-[10px] text-gray-700">GMの発言を自動検出して背景切替</p>
          </section>

          {/* Voice */}
          <section className="flex flex-col gap-1.5">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">音声認識</p>
            <div className="flex items-center gap-2">
              <button
                onClick={listening ? stopListening : startListening}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                  listening
                    ? "border-red-800 text-red-400"
                    : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                {listening ? "■ 停止" : "● 開始"}
              </button>
              {listening && <span className="text-[10px] text-red-600 animate-pulse">REC</span>}
            </div>
            {interimText && (
              <p className="text-[10px] text-gray-500 italic truncate max-w-[200px]">
                {interimText}
              </p>
            )}
            <p className="text-[10px] text-gray-700">キーワード一致 or AI自動検出で切替</p>
          </section>

          {/* Manual */}
          <section className="flex flex-col gap-1.5">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">手動入力</p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualKeyword}
                onChange={(e) => setManualKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSend()}
                placeholder={selectedGenre.scenes[0]?.label}
                className="flex-1 bg-black/60 border border-gray-800 px-2 py-1.5 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600"
              />
              <button
                onClick={handleManualSend}
                disabled={generating}
                className="px-3 py-1.5 border border-gray-700 text-xs text-gray-500 hover:text-gray-200 hover:border-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                切替
              </button>
            </div>
          </section>

          {/* Character / 立ち絵 */}
          <section className="flex flex-col gap-1.5">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">立ち絵</p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={charaUrlInput}
                onChange={(e) => setCharaUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCharacter()}
                placeholder="https://iachara.com/view/..."
                className="flex-1 bg-black/60 border border-gray-800 px-2 py-1.5 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600 min-w-0"
              />
              <button
                onClick={loadCharacter}
                disabled={charaLoading}
                className="px-3 py-1.5 border border-gray-700 text-xs text-gray-500 hover:text-gray-200 hover:border-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {charaLoading ? "..." : "追加"}
              </button>
            </div>
            {charas.map((chara) => (
              <div key={chara.id} className="flex flex-col gap-1 border-t border-gray-900 pt-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-600">{chara.name}</p>
                  <button
                    onClick={() => setCharas((prev) => prev.filter((c) => c.id !== chara.id))}
                    className="text-[9px] text-gray-800 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {chara.icons.map((icon, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setCharas((prev) =>
                          prev.map((c) =>
                            c.id === chara.id
                              ? { ...c, selectedUrl: c.selectedUrl === icon.url ? null : icon.url }
                              : c
                          )
                        )
                      }
                      className="relative w-10 h-10 overflow-hidden border transition-colors"
                      style={{
                        borderColor: chara.selectedUrl === icon.url ? "rgba(156,163,175,0.8)" : "rgba(55,65,81,0.8)",
                      }}
                      title={icon.name || `画像${i + 1}`}
                    >
                      <img src={icon.url} alt={icon.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Treasure Chest */}
          <section className="flex flex-col gap-1.5">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase">宝箱</p>
            <input
              type="text"
              value={chestInput}
              onChange={(e) => setChestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openChest()}
              placeholder="剣, 盾, 金貨10枚"
              className="bg-black/60 border border-gray-800 px-2 py-1.5 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gray-600"
            />
            <button
              onClick={openChest}
              className="px-3 py-1.5 border border-yellow-900/50 text-xs text-yellow-700 hover:text-yellow-400 hover:border-yellow-700 transition-colors tracking-widest uppercase"
            >
              宝箱を開ける
            </button>
          </section>

          {/* Log */}
          <section className="flex-1 flex flex-col min-h-0">
            <p className="text-[10px] text-gray-700 tracking-widest uppercase mb-1">ログ</p>
            <div className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[10px] max-h-48">
              {log.length === 0
                ? <p className="text-gray-800 italic">音声認識を開始してください</p>
                : log.map((line, i) => (
                  <p key={i} className={
                    line.startsWith("[切替]") ? "text-green-900"
                    : line.startsWith("[自動検出]") ? "text-purple-900"
                    : line.startsWith("[エラー]") ? "text-red-900"
                    : "text-gray-600"
                  }>{line}</p>
                ))
              }
              <div ref={logEndRef} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
