/**
 * 語音朗讀（瀏覽器內建，免費）。給還看不懂中文的小朋友。
 * 優先用台灣中文語音，沒有就用其他中文語音；完全沒有中文語音時回傳 false。
 * 注意：iOS 只允許在使用者點擊的當下開始發聲。
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // 語音清單還沒載入，下次再找
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  cachedVoice =
    voices.find((v) => norm(v) === "zh-tw") ??
    voices.find((v) => norm(v).startsWith("zh-hant")) ??
    voices.find((v) => norm(v) === "zh-hk") ??
    voices.find((v) => norm(v).startsWith("zh")) ??
    null;
  return cachedVoice;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): boolean {
  if (!canSpeak()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[①②③④⑤]/g, ""));
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "zh-TW";
    u.rate = 0.9; // 念慢一點，給小朋友聽
    u.pitch = 1.1;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
  });
}
