import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReferralRedirect({ params, searchParams }: Props) {
    const { code } = await params;
    const resolvedSearchParams = await searchParams;

    const qs = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => qs.append(key, v));
        } else if (value !== undefined) {
            qs.set(key, value);
        }
    });

    const queryString = qs.toString();
    const target = `https://stockedup.africa/r.php?code=${encodeURIComponent(code)}${queryString ? `&${queryString}` : ""}`;

    redirect(target);
}