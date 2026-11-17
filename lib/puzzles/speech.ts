/**
 * 語音朗讀（瀏覽器內建，免費）。給還看不懂中文的小朋友。
 * 優先挑「自然」的台灣中文語音（名稱有 Natural / Online / Neural 的通常是新版擬真語音），
 * 沒有就用其他中文語音；完全沒有中文語音時回傳 false。
 * 注意：iOS 只允許在使用者點擊的當下開始發聲。
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function score(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace("_", "-").toLowerCase();
  const name = v.name.toLowerCase();
  let s = 0;
  if (lang === "zh-tw" || lang.startsWith("zh-hant")) s += 100;
  else if (lang === "zh-hk") s += 40;
  else if (lang.startsWith("zh")) s += 20;
  else return -1;
  if (/natural|neural|online|enhanced|premium/.test(name)) s += 50; // 擬真語音
  if (/google/.test(name)) s += 20; // Chrome 的 Google 語音比系統舊語音自然
  if (/hsiaochen|hsiaoyu|yunjhe|mei-jia|meijia/.test(name)) s += 10;
  return s;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // 語音清單還沒載入，下次再找
  const ranked = voices.map((v) => [score(v), v] as const).filter(([s]) => s >= 0).sort((a, b) => b[0] - a[0]);
  cachedVoice = ranked[0]?.[1] ?? null;
  return cachedVoice;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * 念一句話。onEnd 會在念完（或失敗）時呼叫一次。
 * 有些瀏覽器不會觸發結束事件，所以另外用字數估一個最長等待時間當保險。
 */
export function speak(text: string, onEnd?: () => void): boolean {
  if (!canSpeak()) {
    onEnd?.();
    return false;
  }
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    clearTimeout(guard);
    onEnd?.();
  };
  const guard = setTimeout(finish, 1500 + text.length * 320);
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[①②③④⑤]/g, ""));
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "zh-TW";
    u.rate = 0.95; // 稍微慢一點，但不要太慢，太慢反而像機器人
    u.pitch = 1; // 不調音高，調了會更不自然
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
    return true;
  } catch {
    finish();
    return false;
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function voiceName(): string | null {
  if (!canSpeak()) return null;
  return pickVoice()?.name ?? null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
  });
}
