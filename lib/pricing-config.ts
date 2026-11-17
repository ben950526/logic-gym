import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";

export const PAID_MONTHLY_PRICE = 99;

/** v1: manual bank transfer; Stripe kept for later */
export const PAYMENT_MODE = "manual" as const;

export interface ManualPaymentConfig {
  bankCode: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  transferNote: string;
  formUrl: string | null;
  contact: string | null;
}

export function getManualPaymentConfig(): ManualPaymentConfig {
  return {
    bankCode: process.env.MANUAL_PAYMENT_BANK_CODE?.trim() || null,
    bankName: process.env.MANUAL_PAYMENT_BANK_NAME?.trim() || null,
    accountNumber: process.env.MANUAL_PAYMENT_ACCOUNT?.trim() || null,
    accountName: process.env.MANUAL_PAYMENT_ACCOUNT_NAME?.trim() || null,
    transferNote:
      process.env.MANUAL_PAYMENT_NOTE?.trim() || "Logic Gym 付費會員",
    formUrl: process.env.MANUAL_PAYMENT_FORM_URL?.trim() || null,
    contact: process.env.MANUAL_PAYMENT_CONTACT?.trim() || null,
  };
}

export function isManualPaymentConfigured(): boolean {
  const config = getManualPaymentConfig();
  return Boolean(config.accountNumber && config.accountName);
}

export function formatPlanSummary() {
  return {
    free: `乳牛星球前 ${FREE_MATH_STAGE_LIMIT} 關免費`,
    paid: `目前已上線付費關卡 · 隨更新擴充 · NT$${PAID_MONTHLY_PRICE}/月`,
  };
}
