import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY CONFIGURATION ERROR: Keys are undefined.");
            // Returns a JSON error instead of crashing to HTML
            return NextResponse.json({ error: "Server Configuration Issue: Missing Razorpay Keys" }, { status: 500 });
        }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
        const order = await razorpay.orders.create({
            amount: 1*100, // amount in the smallest currency unit (e.g., paise for INR)
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        });

        return NextResponse.json({ orderId: order.id } , { status: 200 });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}