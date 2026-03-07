"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Supabase implicit flow sends tokens as URL hash fragments.
        // Hash fragments are never sent to the server so we handle them client-side.
        const hash = window.location.hash;
        if (!hash) return;

        const params = new URLSearchParams(hash.substring(1)); // strip leading #
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken && refreshToken) {
            const supabase = createClient();
            supabase.auth
                .setSession({ access_token: accessToken, refresh_token: refreshToken })
                .then(({ error }) => {
                    if (error) {
                        console.error("Error setting session:", error);
                        router.push("/login?error=invalid_link");
                        return;
                    }
                    // Password recovery → go to update password page
                    if (type === "recovery") {
                        router.push("/update-password");
                    } else {
                        // Magic link sign-in → go to dashboard
                        router.push("/dashboard");
                    }
                });
        }
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-2xl">
                {/* IMC Logo */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full gradient-fuchsia flex items-center justify-center">
                        <span className="text-white font-heading text-2xl font-bold">IMC</span>
                    </div>
                </div>

                <h1 className="text-fuchsia">
                    Project Scheduler
                </h1>

                <p className="text-text-secondary text-lg">
                    Multi-client project scheduling for Image Marketing Consultants.
                    Create, track, and share project timelines with your clients.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                        Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
