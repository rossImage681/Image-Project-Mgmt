"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/confirm?next=/update-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm">
                {/* Logo mark */}
                <div className="mb-10 flex flex-col items-center">
                    <Image
                        src="/image-mgmt-logo.png"
                        alt="IMAGE MGMT"
                        width={160}
                        height={160}
                        className="mb-6"
                        priority
                    />
                    <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
                        Reset password
                    </h1>
                    <p className="text-text-secondary mt-1.5 text-sm">
                        We&apos;ll send a reset link to your email
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-4">
                        <div className="px-4 py-3 rounded-lg bg-status-complete/10 text-status-complete text-sm">
                            ✓ Reset link sent! Check your inbox for an email from Supabase.
                        </div>
                        <p className="text-sm text-text-secondary">
                            Click the link in the email to set your new password. You can close this tab.
                        </p>
                        <Link href="/login" className="block text-center text-sm text-fuchsia hover:text-bubblegum transition-colors mt-4">
                            ← Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-poppy-red/10 text-poppy-red text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    placeholder="you@imagemarketing.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Sending…" : "Send Reset Link"}
                            </button>
                        </form>

                        <Link href="/login" className="block text-center text-sm text-text-secondary hover:text-text-primary transition-colors mt-6">
                            ← Back to sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
