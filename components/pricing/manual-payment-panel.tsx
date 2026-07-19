import {
  getManualPaymentConfig,
  isManualPaymentConfigured,
  PAID_MONTHLY_PRICE,
} from "@/lib/pricing-config";
import { PAID_DAILY_LIMIT } from "@/lib/constants";

export function ManualPaymentPanel() {
  const config = getManualPaymentConfig();
  const configured = isManualPaymentConfigured();

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-amber-900">人工收款（月付）</h2>
      <p className="mt-1 text-sm text-zinc-600">
        NT${PAID_MONTHLY_PRICE}/月 · 每天 {PAID_DAILY_LIMIT} 題 · 匯款後 24
        小時內開通
      </p>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
        <li>轉帳 NT${PAID_MONTHLY_PRICE} 到下方帳戶</li>
        <li>備註或轉帳說明填：{config.transferNote}</li>
        <li>
          {config.formUrl ? (
            <>
              填寫{" "}
              <a
                href={config.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                付款通知表單
              </a>
              （填暱稱、Email、轉帳後五碼）
            </>
          ) : (
            <>聯絡管理員，提供暱稱、Email、轉帳後五碼</>
          )}
        </li>
        <li>確認後會在後台開通，重新整理練功頁即可</li>
      </ol>

      {configured ? (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {config.bankName && (
            <p>
              <span className="text-zinc-600">銀行：</span>
              {config.bankCode ? `(${config.bankCode}) ` : ""}
              {config.bankName}
            </p>
          )}
          <p className="mt-1">
            <span className="text-zinc-600">帳號：</span>
            <span className="font-mono font-semibold">{config.accountNumber}</span>
          </p>
          <p className="mt-1">
            <span className="text-zinc-600">戶名：</span>
            {config.accountName}
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          收款帳戶設定中。若你是管理員，請在{" "}
          <code className="rounded bg-zinc-100 px-1">.env.local</code> 設定{" "}
          <code className="rounded bg-zinc-100 px-1">MANUAL_PAYMENT_*</code>。
          {config.contact && (
            <>
              {" "}
              聯絡：<span className="font-medium">{config.contact}</span>
            </>
          )}
        </p>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        目前為人工對帳，不提供自動扣款。信用卡 / LINE Pay 串接之後再上線。
      </p>
    </div>
  );
}
