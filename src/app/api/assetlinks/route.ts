import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json([
        {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.africa.stockedup",
                sha256_cert_fingerprints: [
                    "02:62:7D:22:71:4D:D3:B4:09:39:C5:B8:D8:28:D1:D3:80:9F:F5:4E:BE:18:88:26:FA:0C:62:92:4F:A9:BB:87",
                ],
            },
        },
    ]);
}