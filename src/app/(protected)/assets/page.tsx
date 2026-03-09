import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
    client_review:     { label: "Client Review",          className: "bg-sky-500/10 text-sky-400" },
    internal:          { label: "Internal",                className: "bg-border-light text-text-secondary" },
    final_deliverable: { label: "Final Deliverable",      className: "bg-status-complete/10 text-status-complete" },
    shared:            { label: "Shared",                  className: "bg-fuchsia/10 text-fuchsia" },
};

export default async function AssetsPage({
    searchParams,
}: {
    searchParams: { q?: string; category?: string };
}) {
    const supabase = createAdminClient();

    // ── Folder tree ──────────────────────────────────────────────────────────
    const { data: foldersData } = await supabase
        .from("folders")
        .select("id, name, client_id, project_id, parent_id")
        .order("name");

    const folders = foldersData || [];
    const clientFolders = folders.filter((f) => !f.project_id);
    const projectFolders = folders.filter((f) => f.project_id);

    // ── Asset search / list ──────────────────────────────────────────────────
    const query = searchParams.q?.trim() || "";
    const categoryFilter = searchParams.category || "";

    let assetsQuery = supabase
        .from("assets")
        .select("id, name, description, category, tags, hashtags, mime_type, file_size, created_at, folder_id")
        .order("created_at", { ascending: false })
        .limit(60);

    if (query) {
        assetsQuery = assetsQuery.textSearch("search_vector", query, { type: "websearch" });
    }
    if (categoryFilter) {
        assetsQuery = assetsQuery.eq("category", categoryFilter);
    }

    const { data: assets } = await assetsQuery;

    return (
        <div className="flex h-full min-h-screen">
            {/* ── Folder Sidebar ────────────────────────────────────────────── */}
            <aside className="w-64 shrink-0 bg-surface border-r border-border-light p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Folders</h2>
                </div>

                {clientFolders.length === 0 ? (
                    <p className="text-xs text-text-secondary">No folders yet. Create a client to get started.</p>
                ) : (
                    <ul className="space-y-1">
                        {clientFolders.map((cf) => {
                            const children = projectFolders.filter((pf) => pf.parent_id === cf.id);
                            return (
                                <li key={cf.id}>
                                    <Link
                                        href={`/assets/folders/${cf.id}`}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-pale-pink/20 transition-colors"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                        </svg>
                                        <span className="truncate font-medium">{cf.name}</span>
                                    </Link>
                                    {children.length > 0 && (
                                        <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border-light pl-2">
                                            {children.map((pf) => (
                                                <li key={pf.id}>
                                                    <Link
                                                        href={`/assets/folders/${pf.id}`}
                                                        className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-pale-pink/20 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                                        </svg>
                                                        <span className="truncate">{pf.name}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    title="Assets"
                    subtitle="Search and browse all project files"
                />

                <div className="p-6 flex-1">
                    {/* Search + Filters */}
                    <form method="GET" className="flex flex-wrap gap-3 mb-6">
                        <div className="relative flex-1 min-w-60">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                name="q"
                                defaultValue={query}
                                placeholder="Search files, tags, hashtags, metadata..."
                                className="input w-full pl-9"
                            />
                        </div>
                        <select name="category" defaultValue={categoryFilter} className="input">
                            <option value="">All categories</option>
                            <option value="client_review">Client Review</option>
                            <option value="internal">Internal</option>
                            <option value="final_deliverable">Final Deliverable</option>
                            <option value="shared">Shared</option>
                        </select>
                        <button type="submit" className="btn-primary">Search</button>
                        {(query || categoryFilter) && (
                            <Link href="/assets" className="btn-secondary">Clear</Link>
                        )}
                    </form>

                    {/* Asset grid */}
                    {!assets || assets.length === 0 ? (
                        <div className="text-center py-20 text-text-secondary">
                            {query || categoryFilter ? "No assets match your search." : "No assets uploaded yet. Open a folder to upload files."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {assets.map((asset: any) => {
                                const cat = CATEGORY_LABELS[asset.category] || CATEGORY_LABELS.internal;
                                const isImage = asset.mime_type?.startsWith("image/");
                                return (
                                    <Link
                                        key={asset.id}
                                        href={`/assets/folders/${asset.folder_id}#asset-${asset.id}`}
                                        className="card hover:border-fuchsia/30 transition-all group flex flex-col gap-3"
                                    >
                                        {/* Preview */}
                                        <div className="h-32 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                                            <span className="text-5xl">
                                                {isImage ? "🖼️" : asset.mime_type?.includes("pdf") ? "📕" : asset.mime_type?.includes("video") ? "🎬" : "📄"}
                                            </span>
                                        </div>

                                        {/* Name + category */}
                                        <div>
                                            <p className="text-sm font-medium text-text-primary truncate group-hover:text-fuchsia transition-colors">{asset.name}</p>
                                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${cat.className}`}>{cat.label}</span>
                                        </div>

                                        {/* Tags */}
                                        {(asset.tags?.length > 0 || asset.hashtags?.length > 0) && (
                                            <div className="flex flex-wrap gap-1">
                                                {asset.tags?.slice(0, 3).map((t: string) => (
                                                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-fuchsia/10 text-fuchsia">{t}</span>
                                                ))}
                                                {asset.hashtags?.slice(0, 2).map((h: string) => (
                                                    <span key={h} className="text-xs px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{h}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Size */}
                                        <p className="text-xs text-text-secondary mt-auto">
                                            {asset.file_size ? `${(asset.file_size / 1024).toFixed(0)} KB` : "—"}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
