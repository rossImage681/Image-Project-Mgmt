"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
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
                        Set new password
                    </h1>
                    <p className="text-text-secondary mt-1.5 text-sm">Choose a strong password for your account</p>
                </div>

                {success ? (
                    <div className="px-4 py-3 rounded-lg bg-status-complete/10 text-status-complete text-sm">
                        ✓ Password updated! Redirecting you to the dashboard…
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
                                <label htmlFor="password" className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="confirm" className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm"
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Saving…" : "Save New Password"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
