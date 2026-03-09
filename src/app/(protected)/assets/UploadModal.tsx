"use client";

import { useState, useRef, useTransition } from "react";
import { uploadAsset } from "@/app/actions/assets";

const CATEGORIES = [
    { value: "client_review", label: "Client Review", color: "text-sky-400" },
    { value: "internal", label: "Internal Working Files", color: "text-text-secondary" },
    { value: "final_deliverable", label: "Final Deliverable", color: "text-status-complete" },
    { value: "shared", label: "Shared Assets", color: "text-fuchsia" },
];

interface UploadModalProps {
    folderId: string;
    folderName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadModal({ folderId, folderName, onClose, onSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [category, setCategory] = useState("internal");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [hashtagInput, setHashtagInput] = useState("");
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [metaRows, setMetaRows] = useState<{ key: string; value: string }[]>([
        { key: "", value: "" },
    ]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Chip helpers ──────────────────────────────────────────────────────────
    function addTag(raw: string) {
        const t = raw.trim().toLowerCase();
        if (t && !tags.includes(t)) setTags([...tags, t]);
        setTagInput("");
    }
    function addHashtag(raw: string) {
        const h = raw.trim().toLowerCase().replace(/^#*/, "");
        if (h && !hashtags.includes(`#${h}`)) setHashtags([...hashtags, `#${h}`]);
        setHashtagInput("");
    }

    // ── Drag & drop ───────────────────────────────────────────────────────────
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) { setError("Please select a file."); return; }
        setError(null);

        const metadata: Record<string, string> = {};
        metaRows.forEach(({ key, value }) => {
            if (key.trim()) metadata[key.trim()] = value.trim();
        });

        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder_id", folderId);
        fd.append("description", description);
        fd.append("category", category);
        fd.append("tags", tags.join(","));
        fd.append("hashtags", hashtags.join(","));
        fd.append("metadata", JSON.stringify(metadata));

        startTransition(async () => {
            const result = await uploadAsset(fd);
            if ("error" in result) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border-light shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-light">
                    <div>
                        <h2 className="text-lg font-heading font-bold text-text-primary">Upload File</h2>
                        <p className="text-sm text-text-secondary mt-0.5">→ {folderName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-pale-pink/20 text-text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="px-4 py-3 rounded-lg bg-poppy-red/10 text-poppy-red text-sm">{error}</div>
                    )}

                    {/* Drop zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            dragging ? "border-fuchsia bg-fuchsia/5" : file ? "border-status-complete bg-status-complete/5" : "border-border-light hover:border-fuchsia/50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                    >
                        <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                        {file ? (
                            <div>
                                <div className="text-2xl mb-2">📄</div>
                                <p className="font-medium text-text-primary">{file.name}</p>
                                <p className="text-sm text-text-secondary mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-3xl mb-3">☁️</div>
                                <p className="text-text-secondary text-sm">Drag & drop a file here, or <span className="text-fuchsia">browse</span></p>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((c) => (
                                <label
                                    key={c.value}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                                        category === c.value
                                            ? "border-fuchsia bg-fuchsia/10"
                                            : "border-border-light hover:border-fuchsia/40"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={c.value}
                                        checked={category === c.value}
                                        onChange={() => setCategory(c.value)}
                                        className="sr-only"
                                    />
                                    <span className={`w-2 h-2 rounded-full bg-current ${c.color}`} />
                                    <span className="text-sm text-text-primary">{c.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this file? Add context for AI search..."
                            className="input w-full h-20 resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Tags</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-fuchsia/10 text-fuchsia text-xs">
                                    {t}
                                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-400">×</button>
                                </span>
                            ))}
                        </div>
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                            placeholder="Type a tag and press Enter (spring2026, photography, ...)"
                            className="input w-full"
                        />
                    </div>

                    {/* Hashtags */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Hashtags <span className="text-text-secondary font-normal">(for AI / campaign search)</span></label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {hashtags.map((h) => (
                                <span key={h} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs">
                                    {h}
                                    <button type="button" onClick={() => setHashtags(hashtags.filter((x) => x !== h))} className="hover:text-red-400">×</button>
                                </span>
                            ))}
                        </div>
                        <input
                            value={hashtagInput}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addHashtag(hashtagInput); } }}
                            placeholder="#launch, #campaign, #finalcut..."
                            className="input w-full"
                        />
                    </div>

                    {/* Metadata key/value pairs */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Additional Metadata <span className="text-text-secondary font-normal">(AI context fields)</span>
                        </label>
                        <div className="space-y-2">
                            {metaRows.map((row, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={row.key}
                                        onChange={(e) => setMetaRows(metaRows.map((r, j) => j === i ? { ...r, key: e.target.value } : r))}
                                        placeholder="Field (e.g. photographer)"
                                        className="input flex-1"
                                    />
                                    <input
                                        value={row.value}
                                        onChange={(e) => setMetaRows(metaRows.map((r, j) => j === i ? { ...r, value: e.target.value } : r))}
                                        placeholder="Value"
                                        className="input flex-1"
                                    />
                                    {metaRows.length > 1 && (
                                        <button type="button" onClick={() => setMetaRows(metaRows.filter((_, j) => j !== i))} className="text-text-secondary hover:text-poppy-red text-lg px-1">×</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={() => setMetaRows([...metaRows, { key: "", value: "" }])} className="text-sm text-fuchsia hover:text-bubblegum transition-colors">
                                + Add field
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2 border-t border-border-light">
                        <button type="submit" disabled={isPending || !file} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                            {isPending ? "Uploading…" : "Upload File"}
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
