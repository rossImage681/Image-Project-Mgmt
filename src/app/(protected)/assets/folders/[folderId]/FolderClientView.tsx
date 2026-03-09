"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadModal from "../../UploadModal";
import { deleteAsset, getAssetUrl } from "@/app/actions/assets";

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
    client_review:     { label: "Client Review",     className: "bg-sky-500/10 text-sky-400" },
    internal:          { label: "Internal",           className: "bg-border-light text-text-secondary" },
    final_deliverable: { label: "Final Deliverable", className: "bg-status-complete/10 text-status-complete" },
    shared:            { label: "Shared",             className: "bg-fuchsia/10 text-fuchsia" },
};

interface Asset {
    id: string;
    name: string;
    description: string | null;
    category: string;
    tags: string[];
    hashtags: string[];
    mime_type: string | null;
    file_size: number | null;
    storage_path: string;
    metadata: Record<string, string>;
    created_at: string;
}

interface FolderClientViewProps {
    folderId: string;
    folderName: string;
    initialAssets: Asset[];
}

export default function FolderClientView({ folderId, folderName, initialAssets }: FolderClientViewProps) {
    const router = useRouter();
    const [showUpload, setShowUpload] = useState(false);
    const [openAssetId, setOpenAssetId] = useState<string | null>(null);
    const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

    const handleUploadSuccess = useCallback(() => {
        router.refresh();
    }, [router]);

    async function handleDownload(asset: Asset) {
        setLoadingUrl(asset.id);
        const url = await getAssetUrl(asset.storage_path);
        setLoadingUrl(null);
        if (url) window.open(url, "_blank");
    }

    async function handleDelete(assetId: string) {
        if (!confirm("Delete this file? This cannot be undone.")) return;
        await deleteAsset(assetId);
        router.refresh();
    }

    const isImage = (mime: string | null) => mime?.startsWith("image/");
    const fileIcon = (mime: string | null) =>
        mime?.includes("pdf") ? "📕" : mime?.includes("video") ? "🎬" : mime?.includes("audio") ? "🎵" : "📄";

    return (
        <>
            {/* Upload button */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-text-secondary text-sm">{initialAssets.length} file{initialAssets.length !== 1 ? "s" : ""}</p>
                <button onClick={() => setShowUpload(true)} className="btn-primary">
                    ↑ Upload File
                </button>
            </div>

            {/* Asset grid */}
            {initialAssets.length === 0 ? (
                <div className="text-center py-20 text-text-secondary">
                    <div className="text-5xl mb-4">📂</div>
                    <p>This folder is empty.</p>
                    <button onClick={() => setShowUpload(true)} className="mt-4 btn-primary">Upload your first file</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {initialAssets.map((asset) => {
                        const cat = CATEGORY_LABELS[asset.category] || CATEGORY_LABELS.internal;
                        const isOpen = openAssetId === asset.id;
                        return (
                            <div key={asset.id} id={`asset-${asset.id}`} className="card flex flex-col gap-3">
                                {/* Preview */}
                                <div className="h-28 rounded-lg bg-background flex items-center justify-center text-5xl">
                                    {isImage(asset.mime_type) ? "🖼️" : fileIcon(asset.mime_type)}
                                </div>

                                {/* Name + category */}
                                <div>
                                    <p className="text-sm font-medium text-text-primary truncate" title={asset.name}>{asset.name}</p>
                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${cat.className}`}>{cat.label}</span>
                                </div>

                                {/* Tags */}
                                {(asset.tags?.length > 0 || asset.hashtags?.length > 0) && (
                                    <div className="flex flex-wrap gap-1">
                                        {asset.tags?.slice(0, 3).map((t) => (
                                            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-fuchsia/10 text-fuchsia">{t}</span>
                                        ))}
                                        {asset.hashtags?.slice(0, 2).map((h) => (
                                            <span key={h} className="text-xs px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{h}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Description (expandable) */}
                                {asset.description && (
                                    <p className="text-xs text-text-secondary line-clamp-2">{asset.description}</p>
                                )}

                                {/* Metadata */}
                                {isOpen && asset.metadata && Object.keys(asset.metadata).length > 0 && (
                                    <div className="text-xs space-y-1 border-t border-border-light pt-2">
                                        {Object.entries(asset.metadata).map(([k, v]) => (
                                            <div key={k} className="flex gap-2">
                                                <span className="text-text-secondary font-medium min-w-20">{k}</span>
                                                <span className="text-text-primary">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border-light">
                                    <button
                                        onClick={() => handleDownload(asset)}
                                        disabled={loadingUrl === asset.id}
                                        className="flex-1 text-xs py-1.5 rounded-lg bg-fuchsia/10 text-fuchsia hover:bg-fuchsia/20 transition-colors disabled:opacity-50"
                                    >
                                        {loadingUrl === asset.id ? "…" : "View / Download"}
                                    </button>
                                    <button
                                        onClick={() => setOpenAssetId(isOpen ? null : asset.id)}
                                        className="text-xs py-1.5 px-2 rounded-lg bg-border-light text-text-secondary hover:text-text-primary transition-colors"
                                        title="Toggle metadata"
                                    >
                                        {isOpen ? "▲" : "▼"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="text-xs py-1.5 px-2 rounded-lg hover:bg-poppy-red/10 hover:text-poppy-red text-text-secondary transition-colors"
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </div>

                                <p className="text-xs text-text-secondary">
                                    {asset.file_size ? `${(asset.file_size / 1024).toFixed(0)} KB` : ""}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {showUpload && (
                <UploadModal
                    folderId={folderId}
                    folderName={folderName}
                    onClose={() => setShowUpload(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </>
    );
}
