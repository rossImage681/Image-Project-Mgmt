"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureClientFolder, ensureProjectFolder } from "./assets";

export async function createProject(formData: FormData) {
    const supabase = createAdminClient();

    const name = formData.get("name") as string;
    const client_id = formData.get("client_id") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const status = formData.get("status") as string;

    const { data, error } = await supabase
        .from("projects")
        .insert({ name, client_id, start_date, end_date, status })
        .select("id")
        .single();

    if (error || !data) {
        console.error("Error creating project:", error);
        redirect("/projects?error=create_failed");
    }

    // Auto-create DAM folder hierarchy
    const { data: client } = await supabase
        .from("clients")
        .select("name")
        .eq("id", client_id)
        .single();
    if (client) {
        const clientFolderId = await ensureClientFolder(client_id, client.name);
        if (clientFolderId) {
            await ensureProjectFolder(client_id, data.id, name, clientFolderId);
        }
    }

    redirect(`/projects/${data.id}`);
}

export async function updateProject(id: string, formData: FormData) {
    const supabase = createAdminClient();

    const name = formData.get("name") as string;
    const client_id = formData.get("client_id") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase
        .from("projects")
        .update({ name, client_id, start_date, end_date, status })
        .eq("id", id);

    if (error) {
        console.error("Error updating project:", error);
        redirect(`/projects/${id}/edit?error=update_failed`);
    }

    redirect(`/projects/${id}`);
}
