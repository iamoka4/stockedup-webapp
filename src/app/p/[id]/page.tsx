import { redirect } from "next/navigation";
import { PromoRedirect } from "./PromoRedirect";

// Promotion emails link here: /p/<productId>?pc=<promotionId>&u=<userId>&s=<signature>
// The click is recorded from the customer's browser (see PromoRedirect), then
// they are sent to the product page.

type Params = Promise<{ id: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

export default async function PromotionLinkPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const sp = await searchParams;

  if (!/^\d+$/.test(id)) {
    redirect("/");
  }

  const pc = first(sp.pc);
  const u = first(sp.u);
  const s = first(sp.s);
  const trackable = /^\d+$/.test(pc) && /^\d+$/.test(u) && s !== "";

  return (
    <PromoRedirect
      productId={id}
      pc={trackable ? pc : ""}
      u={trackable ? u : ""}
      s={trackable ? s : ""}
    />
  );
}
