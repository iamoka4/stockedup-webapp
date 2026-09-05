import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (!body) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const { firstName, lastName, email, message } = JSON.parse(body);

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "StockedUp Contact Form <contact@stockedup.africa>",
      to: "hello@stockedup.africa",
      replyTo: email,
      subject: `New contact form message from ${firstName} ${lastName}`,
      text: `From: ${firstName} ${lastName} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}