"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Upload Asset ─────────────────────────────────────────────────────────────

export async function uploadAsset(formData: FormData): Promise<{ success: true; assetId: string } | { error: string }> {
    const supabase = createAdminClient();

    const file = formData.get("file") as File;
    const folderId = formData.get("folder_id") as string;
    const name = (formData.get("name") as string) || file.name;
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "internal";
    const tagsRaw = (formData.get("tags") as string) || "";
    const hashtagsRaw = (formData.get("hashtags") as string) || "";
    const metadataRaw = (formData.get("metadata") as string) || "{}";

    const tags = tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

    const hashtags = hashtagsRaw
        .split(",")
        .map((h) => {
            const clean = h.trim().toLowerCase();
            return clean.startsWith("#") ? clean : `#${clean}`;
        })
        .filter(Boolean);

    let metadata: Record<string, string> = {};
    try {
        metadata = JSON.parse(metadataRaw);
    } catch {
        metadata = {};
    }

    // Get folder to determine storage path
    const { data: folder } = await supabase
        .from("folders")
        .select("storage_prefix")
        .eq("id", folderId)
        .single();

    if (!folder) {
        return { error: "Folder not found" };
    }

    // Build a unique storage path
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${folder.storage_prefix}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
        .from("assets")
        .upload(storagePath, arrayBuffer, {
            contentType: file.type,
            upsert: false,
        });

    if (storageError) {
        return { error: storageError.message };
    }

    // Insert metadata row
    const { data: asset, error: dbError } = await supabase
        .from("assets")
        .insert({
            folder_id: folderId,
            name,
            description,
            storage_path: storagePath,
            mime_type: file.type,
            file_size: file.size,
            category,
            tags,
            hashtags,
            metadata,
        })
        .select("id")
        .single();

    if (dbError || !asset) {
        // Clean up orphaned storage file
        await supabase.storage.from("assets").remove([storagePath]);
        return { error: dbError?.message || "Failed to save asset metadata" };
    }

    revalidatePath(`/assets/folders/${folderId}`);
    revalidatePath("/assets");
    return { success: true, assetId: asset.id };
}

// ─── Delete Asset ─────────────────────────────────────────────────────────────

export async function deleteAsset(assetId: string) {
    const supabase = createAdminClient();

    const { data: asset } = await supabase
        .from("assets")
        .select("storage_path, folder_id")
        .eq("id", assetId)
        .single();

    if (!asset) return { error: "Asset not found" };

    await supabase.storage.from("assets").remove([asset.storage_path]);
    await supabase.from("assets").delete().eq("id", assetId);

    revalidatePath(`/assets/folders/${asset.folder_id}`);
    revalidatePath("/assets");
    return { success: true };
}

// ─── Get Signed URL (for downloading/viewing private files) ──────────────────

export async function getAssetUrl(storagePath: string): Promise<string | null> {
    const supabase = createAdminClient();
    const { data } = await supabase.storage
        .from("assets")
        .createSignedUrl(storagePath, 3600); // 1 hour
    return data?.signedUrl ?? null;
}

// ─── Search Assets ────────────────────────────────────────────────────────────

export async function searchAssets(query: string, folderId?: string) {
    const supabase = createAdminClient();

    let q = supabase
        .from("assets")
        .select("*, folders(name, client_id, project_id)")
        .order("created_at", { ascending: false });

    if (folderId) {
        q = q.eq("folder_id", folderId);
    }

    if (query.trim()) {
        q = q.textSearch("search_vector", query.trim().split(/\s+/).join(" & "), {
            type: "websearch",
        });
    }

    const { data, error } = await q.limit(100);
    if (error) return [];
    return data || [];
}

// ─── Create folder (internal helper used by client/project actions) ───────────

export async function ensureClientFolder(
    clientId: string,
    clientName: string,
): Promise<string | null> {
    const supabase = createAdminClient();

    // Check if folder already exists
    const { data: existing } = await supabase
        .from("folders")
        .select("id")
        .eq("client_id", clientId)
        .is("project_id", null)
        .single();

    if (existing) return existing.id;

    const storagePrefix = `clients/${clientId}`;
    const { data, error } = await supabase
        .from("folders")
        .insert({ name: clientName, client_id: clientId, storage_prefix: storagePrefix })
        .select("id")
        .single();

    if (error || !data) return null;
    return data.id;
}

export async function ensureProjectFolder(
    clientId: string,
    projectId: string,
    projectName: string,
    parentFolderId: string,
): Promise<string | null> {
    const supabase = createAdminClient();

    const { data: existing } = await supabase
        .from("folders")
        .select("id")
        .eq("project_id", projectId)
        .single();

    if (existing) return existing.id;

    const storagePrefix = `clients/${clientId}/projects/${projectId}`;
    const { data, error } = await supabase
        .from("folders")
        .insert({
            name: projectName,
            client_id: clientId,
            project_id: projectId,
            parent_id: parentFolderId,
            storage_prefix: storagePrefix,
        })
        .select("id")
        .single();

    if (error || !data) return null;
    return data.id;
}
