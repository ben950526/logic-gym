import { redirect } from "next/navigation";

/** V3：首頁直接進互動謎題本。舊的星系首頁保留在 /old-home。 */
export default function HomePage() {
  redirect("/play");
}
