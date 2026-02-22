"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { ProtectedRoute } from "@/services/protected-route";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret, amount, orderId }: { clientSecret: string, amount: number, orderId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payments`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An error occurred");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
                {isLoading ? "Processing..." : `Pay $${amount}`}
            </button>
            {message && <div className="text-red-500 text-sm font-medium mt-4">{message}</div>}
        </form>
    );
}

export default function StripeTestPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [orderId, setOrderId] = useState("");
    const [amount, setAmount] = useState(10);
    const [loading, setLoading] = useState(false);

    const initiatePayment = async () => {
        if (!orderId) {
            toast.error("Please enter a valid Order ID from your database");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post("/payments/stripe/create-intent", {
                orderId,
                amount,
            });
            if (res.data.success) {
                setClientSecret(res.data.data.clientSecret);
            }
        } catch (error) {
            toast.error("Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute module="dashboard:payments">
            <div className="max-w-md mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6">Stripe Payment Test</h1>

                {!clientSecret ? (
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Paste an Order ID from DB"
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <button
                            onClick={initiatePayment}
                            disabled={loading}
                            className="w-full bg-black text-white py-2 rounded-lg font-bold hover:opacity-90"
                        >
                            {loading ? "Generating Intent..." : "Test Checkout"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm clientSecret={clientSecret} amount={amount} orderId={orderId} />
                        </Elements>
                        <button
                            onClick={() => setClientSecret("")}
                            className="w-full mt-4 text-gray-500 text-sm hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
