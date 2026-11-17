import {
  getManualPaymentConfig,
  isManualPaymentConfigured,
  PAID_MONTHLY_PRICE,
} from "@/lib/pricing-config";
import { PAID_PLAN_DETAIL } from "@/lib/pricing-content";

export function ManualPaymentPanel() {
  const config = getManualPaymentConfig();
  const configured = isManualPaymentConfigured();

  return (
    <div className="subscription-manual-panel">
      <h2 className="subscription-manual-title">人工收款（月付）</h2>
      <p className="subscription-manual-sub">
        NT${PAID_MONTHLY_PRICE}/月 · {PAID_PLAN_DETAIL} ·
        匯款後 24 小時內開通
      </p>

      <ol className="subscription-manual-steps">
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
                className="subscription-manual-link"
              >
                付款通知表單
              </a>
              （填暱稱、Email、轉帳後五碼）
            </>
          ) : (
            <>聯絡管理員，提供暱稱、Email、轉帳後五碼</>
          )}
        </li>
        <li>確認後會在後台開通，重新整理即可繼續冒險</li>
      </ol>

      {configured ? (
        <div className="subscription-manual-bank">
          {config.bankName && (
            <p>
              <span className="subscription-manual-muted">銀行：</span>
              {config.bankCode ? `(${config.bankCode}) ` : ""}
              {config.bankName}
            </p>
          )}
          <p className="mt-1">
            <span className="subscription-manual-muted">帳號：</span>
            <span className="subscription-manual-account">{config.accountNumber}</span>
          </p>
          <p className="mt-1">
            <span className="subscription-manual-muted">戶名：</span>
            {config.accountName}
          </p>
        </div>
      ) : (
        <p className="subscription-manual-pending">
          收款帳戶設定中。若你是管理員，請在{" "}
          <code>.env.local</code> 設定 <code>MANUAL_PAYMENT_*</code>。
          {config.contact && (
            <>
              {" "}
              聯絡：<span className="font-medium">{config.contact}</span>
            </>
          )}
        </p>
      )}

      <p className="subscription-manual-footnote">
        目前為人工對帳，不提供自動扣款。信用卡 / LINE Pay 串接之後再上線。
      </p>
    </div>
  );
}
