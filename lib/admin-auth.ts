import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "logic_gym_admin";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === secret;
}

export function verifyAdminSecret(input: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  return input === secret;
}
