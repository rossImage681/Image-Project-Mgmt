import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import FolderClientView from "./FolderClientView";

export const dynamic = "force-dynamic";

export default async function FolderPage({ params }: { params: { folderId: string } }) {
    const supabase = createAdminClient();
    const { folderId } = params;

    // Get folder info
    const { data: folder } = await supabase
        .from("folders")
        .select("id, name, client_id, project_id, parent_id")
        .eq("id", folderId)
        .single();

    if (!folder) notFound();

    // Get breadcrumb
    let parentFolder = null;
    if (folder.parent_id) {
        const { data } = await supabase
            .from("folders")
            .select("id, name")
            .eq("id", folder.parent_id)
            .single();
        parentFolder = data;
    }

    // Get assets in this folder
    const { data: assets } = await supabase
        .from("assets")
        .select("id, name, description, category, tags, hashtags, mime_type, file_size, storage_path, metadata, created_at")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });

    return (
        <div>
            <Header
                title={folder.name}
                subtitle={
                    parentFolder
                        ? `${parentFolder.name} › ${folder.name}`
                        : "Client folder"
                }
                actions={
                    <Link href="/assets" className="btn-secondary">
                        ← All Assets
                    </Link>
                }
            />

            <div className="p-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
                    <Link href="/assets" className="hover:text-fuchsia transition-colors">Assets</Link>
                    {parentFolder && (
                        <>
                            <span>›</span>
                            <Link href={`/assets/folders/${parentFolder.id}`} className="hover:text-fuchsia transition-colors">
                                {parentFolder.name}
                            </Link>
                        </>
                    )}
                    <span>›</span>
                    <span className="text-text-primary font-medium">{folder.name}</span>
                </nav>

                <FolderClientView
                    folderId={folderId}
                    folderName={folder.name}
                    initialAssets={assets || []}
                />
            </div>
        </div>
    );
}
