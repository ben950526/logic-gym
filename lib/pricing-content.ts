import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";

import { PAID_MONTHLY_PRICE } from "@/lib/pricing-config";

import { MATH_PLANET_NAME, PATTERN_PLANET_NAME } from "@/lib/world/planet-names";



/** 行銷用：避免過度承諾，各頁可引用 */

export const PAID_ONGOING_DISCLAIMER =

  "尚未上線的星球、星系或功能，開放時間與範圍以站上更新公告為準。";



export const MEMBERSHIP_PLANS = {

  free: {

    id: "free" as const,

    name: "免費遠征",

    price: 0,

    priceLabel: "NT$ 0",

    period: "",

    tagline: `前 ${FREE_MATH_STAGE_LIMIT} 關完整體驗`,

  },

  paid: {

    id: "paid" as const,

    name: "全星球會員",

    price: PAID_MONTHLY_PRICE,

    priceLabel: `NT$ ${PAID_MONTHLY_PRICE}`,

    period: "/月",

    tagline: "解鎖目前已上線關卡，隨更新享有新內容",

  },

};



export const PAID_MEMBER_ACTIVE_SUMMARY =

  "目前已解鎖全部付費關卡。Logic Gym 持續擴充新星球、主題星系與功能，正式上線後會員即可體驗。";



export const PAID_PROMO_HEADLINE = `NT$${PAID_MONTHLY_PRICE}/月 · 持續擴充的星際遠征`;



export const PAID_PLAN_DETAIL =

  "目前已上線付費關卡 · 新星球／星系／功能陸續推出（依上線為準）";



export const MEMBERSHIP_BENEFITS = [

  {

    icon: "🐄",

    title: "現已開放關卡",

    desc: `${MATH_PLANET_NAME} math-21～100；通關後可進入${PATTERN_PLANET_NAME}（付費限定）`,

  },

  {

    icon: "🌌",

    title: "星系持續擴充",

    desc: "邏輯星系外，文學、自然、時空等主題星系與新星球陸續規劃中，會員可玩已開放部分",

  },

  {

    icon: "✨",

    title: "版本持續更新",

    desc: "關卡、劇情與互動功能隨開發進度上線，會員優先使用已推出項目",

  },

  {

    icon: "📜",

    title: "完整主線劇情",

    desc: "已上線關卡的遠征故事、區域 BOSS 與任務文字完整體驗",

  },

  {

    icon: "🗺️",

    title: "關卡路徑全開",

    desc: "已開放星球地圖可探索，進度雲端保存、換裝置接續",

  },

  {

    icon: "🔄",

    title: "無自動扣款",

    desc: "月付人工匯款，想續訂再付，安心透明",

  },

];



export const PLAN_COMPARISON_ROWS = [

  { feature: `${MATH_PLANET_NAME} 前 ${FREE_MATH_STAGE_LIMIT} 關`, free: true, paid: true },

  { feature: `${MATH_PLANET_NAME} 第 ${FREE_MATH_STAGE_LIMIT + 1}～100 關`, free: false, paid: true },

  { feature: `${PATTERN_PLANET_NAME}（通關後，付費限定）`, free: false, paid: true },

  { feature: "新星球／主題星系（已開放部分）", free: false, paid: true },

  { feature: "後續上線關卡與功能（依公告為準）", free: false, paid: true },

  { feature: "關卡進度雲端保存", free: true, paid: true },

  { feature: "重玩已通關關卡", free: true, paid: true },

];



export const PAYMENT_FLOW_STEPS = [

  {

    step: 1,

    title: "確認方案",

    desc: `全星球會員 NT$${PAID_MONTHLY_PRICE}/月，解鎖目前已上線付費關卡，並隨更新體驗新內容。`,

  },

  {

    step: 2,

    title: "銀行匯款",

    desc: "轉帳至下方帳戶，備註填寫指定文字以便對帳。",

  },

  {

    step: 3,

    title: "填寫通知",

    desc: "填付款表單或聯絡管理員，提供暱稱、Email、轉帳後五碼。",

  },

  {

    step: 4,

    title: "開始遠征",

    desc: "24 小時內人工開通，重新整理頁面即可繼續冒險。",

  },

];



export const MEMBERSHIP_FAQ = [

  {

    q: "免費可以玩多少？",

    a: `註冊即可玩 ${MATH_PLANET_NAME} 前 ${FREE_MATH_STAGE_LIMIT} 關，足夠體驗玩法、難度與劇情風格。`,

  },

  {

    q: "付費會員包含未來所有內容嗎？",

    a: `Logic Gym 持續開發中。會員可解鎖目前已上線的付費關卡，並在星球、星系或功能正式開放後使用；${PAID_ONGOING_DISCLAIMER}`,

  },

  {

    q: "付費後多久開通？",

    a: "匯款並通知後，通常 24 小時內由管理員在後台開通。開通後重新整理頁面即可。",

  },

  {

    q: "會自動扣款嗎？",

    a: "不會。目前為人工匯款月付，沒有綁定信用卡或自動續扣。",

  },

  {

    q: "付費後可以玩規律星球嗎？",

    a: `可以。需先通關 ${MATH_PLANET_NAME} 100 關才解鎖${PATTERN_PLANET_NAME}，付費會員才能進入。`,

  },

  {

    q: "已通關的關卡會消失嗎？",

    a: "不會。付費前已通關的進度會保留，訂閱後從下一關繼續。",

  },

];



export function getSubscriptionHomeHint(

  atPaywall: boolean,

  mathCleared: number

): string {

  if (atPaywall) {

    return `免費 ${FREE_MATH_STAGE_LIMIT} 關已體驗完。訂閱解鎖目前已上線付費關卡，並隨更新體驗新星球與功能。`;

  }

  const remaining = Math.max(0, FREE_MATH_STAGE_LIMIT - mathCleared);

  return `目前免費可玩前 ${FREE_MATH_STAGE_LIMIT} 關 · 還剩 ${remaining} 關。會員可解鎖現有付費內容，並享有後續更新。`;

}



export function getPaywallHeadline(mathCleared: number): string {

  if (mathCleared >= FREE_MATH_STAGE_LIMIT) {

    return "免費體驗已完成，星際遠征才剛開始";

  }

  return "升級全星球會員，跟上持續更新的冒險";

}



export function getPaywallBody(mathCleared: number): string {

  const remaining = Math.max(0, FREE_MATH_STAGE_LIMIT - mathCleared);

  if (mathCleared >= FREE_MATH_STAGE_LIMIT) {

    return `你已通關前 ${FREE_MATH_STAGE_LIMIT} 關。訂閱後解鎖目前已上線付費關卡；Logic Gym 還會陸續推出新星球、主題星系與功能，會員可體驗已開放內容。${PAID_ONGOING_DISCLAIMER}`;

  }

  if (remaining <= 5) {

    return `還剩 ${remaining} 關免費體驗。現在訂閱可無縫接續第 ${FREE_MATH_STAGE_LIMIT + 1} 關，並隨版本更新享有新內容。`;

  }

  return `前 ${FREE_MATH_STAGE_LIMIT} 關免費試玩。訂閱解鎖目前已上線付費關卡，並在 Logic Gym 持續擴充時體驗新星球與功能。`;

}



export const LANDING_SUB_TEASER_LINES = [

  `🐄 ${MATH_PLANET_NAME}：前 ${FREE_MATH_STAGE_LIMIT} 關免費，付費解鎖目前已上線關卡`,

  `🌌 邏輯、文學、自然等主題星系陸續規劃，會員可玩已開放部分`,

  `✨ 關卡、劇情與功能持續更新 · 雲端存檔接續進度`,

] as const;

