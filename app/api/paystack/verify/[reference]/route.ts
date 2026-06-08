import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Payment is not configured." }, { status: 500 });
  }

  const { reference } = await params;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.status) {
    return NextResponse.json(
      { error: data?.message || "Paystack verification failed." },
      { status: response.status || 500 }
    );
  }

  return NextResponse.json({ transaction: data.data });
}
