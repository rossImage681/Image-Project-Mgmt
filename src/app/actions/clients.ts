"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureClientFolder } from "./assets";

const DEFAULT_COLORS = [
    "#E52E7D", "#7C3AED", "#0EA5E9", "#10B981",
    "#F59E0B", "#EF4444", "#EC4899", "#6366F1",
];

function randomColor() {
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

export async function createClient(formData: FormData) {
    const supabase = createAdminClient();

    const name = (formData.get("name") as string)?.trim();
    const accent_color = (formData.get("accent_color") as string) || randomColor();

    if (!name) redirect("/clients/new?error=name_required");

    const { data, error } = await supabase
        .from("clients")
        .insert({ name, accent_color })
        .select("id")
        .single();

    if (error || !data) {
        console.error("Error creating client:", error);
        redirect("/clients/new?error=create_failed");
    }

    // Auto-create DAM folder
    await ensureClientFolder(data.id, name);

    redirect(`/clients/${data.id}`);
}

/** Inline version used from inside the New Project form.
 *  Creates the client and returns its id (used via fetch, not redirect). */
export async function createClientInline(
    name: string,
    accent_color?: string,
): Promise<{ id: string; name: string; accent_color: string } | { error: string }> {
    const supabase = createAdminClient();
    const color = accent_color || randomColor();

    const { data, error } = await supabase
        .from("clients")
        .insert({ name: name.trim(), accent_color: color })
        .select("id, name, accent_color")
        .single();

    if (error || !data) return { error: error?.message || "Failed to create client" };

    // Auto-create DAM folder
    await ensureClientFolder(data.id, data.name);

    return data;
}
