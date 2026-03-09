import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
    const supabase = createAdminClient();

    const { data: clientsData } = await supabase
        .from("clients")
        .select(`
            id,
            name,
            accent_color,
            projects (id, status)
        `)
        .order("name");

    const clients = (clientsData || []).map((client: any) => {
        const projects = client.projects || [];
        const activeCount = projects.filter((p: any) => p.status === "active").length;
        const totalCount = projects.length;
        return {
            id: client.id,
            name: client.name,
            accent_color: client.accent_color || "#E52E7D",
            activeCount,
            totalCount,
            initials: client.name
                .split(" ")
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase(),
        };
    });

    return (
        <div>
            <Header
                title="Clients"
                subtitle="All clients and their project summaries"
                actions={
                    <Link href="/clients/new" className="btn-primary">
                        + New Client
                    </Link>
                }
            />


            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <Link
                            key={client.id}
                            href={`/clients/${client.id}`}
                            className="card hover:shadow-md hover:border-fuchsia/30 transition-all group relative overflow-hidden flex flex-col"
                        >
                            {/* Accent bar */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1"
                                style={{ backgroundColor: client.accent_color }}
                            />

                            <div className="flex items-center gap-4 mt-2 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg"
                                    style={{ backgroundColor: client.accent_color }}
                                >
                                    {client.initials}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-heading font-semibold text-text-primary group-hover:text-fuchsia transition-colors truncate">
                                        {client.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-4 border-t border-border-light text-sm text-text-secondary">
                                <div>
                                    <span className="text-2xl font-heading font-bold text-text-primary">{client.activeCount}</span>
                                    <span className="ml-1.5">active</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-heading font-bold text-text-primary">{client.totalCount}</span>
                                    <span className="ml-1.5">total</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {clients.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-text-secondary">
                            No clients found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
