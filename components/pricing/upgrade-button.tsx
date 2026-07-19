"use client";

import { useTransition } from "react";
import { startCheckout } from "@/app/pricing/actions";

interface UpgradeButtonProps {
  disabled?: boolean;
  label?: string;
}

export function UpgradeButton({
  disabled,
  label = "升級付費會員",
}: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await startCheckout();
      if (result?.error) {
        alert(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
    >
      {isPending ? "前往付款中…" : label}
    </button>
  );
}
