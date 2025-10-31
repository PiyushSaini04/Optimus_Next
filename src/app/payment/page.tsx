"use client";

import React, { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
    const Amount = 1; // Amount in INR
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const handlePayment = async () => {
        setIsPaymentProcessing(true);

        try {
            const response = await fetch("/api/create-order", {
                method: "POST",
            });
            const data = await response.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: Amount * 100, // Amount in paise
                currency: "INR",
                name: "Optimus",
                description: "Test Transaction",
                order_id: data.orderId,
                handler: function (response: any) {
                    console.log("Payment successful:", response);
                },
                prefill: {
                    name: "John Doe",
                    email: "joedoe@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error in payment:", error);
        } finally {
            setIsPaymentProcessing(false);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js" />
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4">Razorpay Payment Integration</h1>
                    <p className="mb-6">Amount to be paid: ₹{Amount} INR</p>
                    <button
                        onClick={handlePayment}
                        disabled={isPaymentProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                        {isPaymentProcessing ? "Processing..." : "Pay Now"}
                    </button>
                </div>
        </div>
    );
}

export default PaymentPage;
                