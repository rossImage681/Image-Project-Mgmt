"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
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
                        Welcome back
                    </h1>
                    <p className="text-text-secondary mt-1.5 text-sm">Sign in to IMAGE MGMT</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-poppy-red/10 text-poppy-red text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form — minimal, no card/border */}
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

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded accent-fuchsia"
                            />
                            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-sm text-fuchsia hover:text-bubblegum transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-text-secondary mt-8">
                    Need access?{" "}
                    <Link href="/signup" className="text-fuchsia hover:text-bubblegum transition-colors">
                        Request an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
