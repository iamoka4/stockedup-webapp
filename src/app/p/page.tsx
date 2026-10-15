// app/p/[id]/page.tsx  (Next.js, App Router)
//
// Short product link used in promotion emails: https://stockedup.africa/p/<id>
// With the StockedUp app installed, the phone opens the app on this link
// (see the .well-known files). Everyone else lands here and is sent straight to
// that product's page.
import { notFound, redirect } from "next/navigation";

export default async function ProductShortLink({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  redirect(`/products/${id}`);
}