import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { V2_GALAXY_MODE } from "@/lib/feature-flags";

interface SiteHeaderProps {
  nickname?: string;
  showGalaxyLink?: boolean;
  /** @deprecated v2 已隱藏 */
  level?: number;
  title?: string | null;
  showPracticeLink?: boolean;
  showCompetitionLink?: boolean;
}

export function SiteHeader({
  nickname,
  showGalaxyLink = true,
}: SiteHeaderProps) {
  const homeHref = nickname && V2_GALAXY_MODE ? "/galaxy" : "/";

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href={homeHref} className="text-sm font-semibold text-blue-600">
          Logic Gym
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {showGalaxyLink && (
            <Link href="/galaxy" className="text-zinc-600 hover:text-zinc-900">
              邏輯星系
            </Link>
          )}
          {nickname ? (
            <>
              <span className="text-zinc-500">{nickname}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs hover:bg-zinc-50"
                >
                  登出
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login?next=/galaxy"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}