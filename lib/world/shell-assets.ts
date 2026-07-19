/** Shell UI 素材路徑（對照 public/assets/README.md） */



import layout from "./shell-art-layout.generated.json";



const SHELL_BASE = "/assets/shell";

const BUTTONS_BASE = "/assets/ui/buttons";

const NODES_BASE = "/assets/ui/nodes";



export const SHELL_ASSETS = {

  galaxyBg: `${SHELL_BASE}/galaxy-bg.png`,

  planetMath: `${SHELL_BASE}/planet-math.png`,

  portraitXiaoguang: `${SHELL_BASE}/portrait-xiaoguang.png`,

  panelDialogue: `${SHELL_BASE}/ui-panel-dialogue.png`,

  chapterBanner: `${SHELL_BASE}/ui-chapter-banner.png`,

  panelPuzzle: `${SHELL_BASE}/ui-panel-puzzle.png`,

  panelMission: `${SHELL_BASE}/ui-panel-mission.png`,

  panelExpedition: `${SHELL_BASE}/ui-panel-expedition.png`,

  hudBar: `${SHELL_BASE}/ui-hud-bar.png`,

} as const;



export const BUTTON_ASSETS = {

  gold: `${BUTTONS_BASE}/ui-btn-gold.png`,

  ghost: `${BUTTONS_BASE}/ui-btn-ghost.png`,

} as const;



export const NODE_ASSETS = {

  available: `${NODES_BASE}/stage-node-available.png`,

  cleared: `${NODES_BASE}/stage-node-cleared.png`,

  locked: `${NODES_BASE}/stage-node-locked.png`,

  boss: `${NODES_BASE}/stage-node-boss.png`,

} as const;



/** 星球選關 MJ 圖（slug → 路徑） */

const PLANET_SHELL_ART: Partial<Record<string, string>> = {

  math: SHELL_ASSETS.planetMath,

};



export function getPlanetShellArt(slug: string): string | null {

  return PLANET_SHELL_ART[slug] ?? null;

}



export type ShellLayoutEntry = {
  aspectRatio: string;
  inset: string;
  fluidMinHeight?: string;
};



/** MJ 框圖文字安全區 — 由 npm run analyze:shell-insets 寫入 generated JSON */

export const SHELL_ART_LAYOUT = {

  panelDialogue: layout.panelDialogue,

  chapterBanner: layout.chapterBanner,

  panelPuzzle: layout.panelPuzzle,

  panelMission: layout.panelMission,

  panelExpedition: layout.panelExpedition,

} as const satisfies Record<string, ShellLayoutEntry>;

