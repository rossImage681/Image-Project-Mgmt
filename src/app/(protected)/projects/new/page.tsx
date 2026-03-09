import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import NewProjectForm from "./NewProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
    const supabase = createAdminClient();

    const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, accent_color")
        .order("name");

    const clients = clientsData || [];

    return (
        <div>
            <Header
                title="New Project"
                subtitle="Create a new client project"
                actions={
                    <Link href="/projects" className="btn-secondary">
                        Cancel
                    </Link>
                }
            />

            <div className="p-8 max-w-2xl">
                <NewProjectForm initialClients={clients} />
            </div>
        </div>
    );
}
