import { Sidebar } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

    const clients = (clientsData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar user={user} clients={clients} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
