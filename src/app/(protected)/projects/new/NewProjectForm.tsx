"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projects";
import { createClientInline } from "@/app/actions/clients";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
];

const COLOR_OPTIONS = [
    "#E52E7D", "#7C3AED", "#0EA5E9", "#10B981",
    "#F59E0B", "#EF4444", "#EC4899", "#6366F1",
];

interface Client {
    id: string;
    name: string;
    accent_color: string;
}

export default function NewProjectForm({
    initialClients,
}: {
    initialClients: Client[];
}) {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [selectedClientId, setSelectedClientId] = useState("");

    // Inline new-client panel state
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newClientColor, setNewClientColor] = useState(COLOR_OPTIONS[0]);
    const [clientError, setClientError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleClientSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        if (e.target.value === "__new__") {
            setShowNewClient(true);
            setSelectedClientId("");
        } else {
            setSelectedClientId(e.target.value);
            setShowNewClient(false);
        }
    }

    async function handleCreateClient() {
        if (!newClientName.trim()) {
            setClientError("Client name is required.");
            return;
        }
        setClientError(null);
        startTransition(async () => {
            const result = await createClientInline(newClientName.trim(), newClientColor);
            if ("error" in result) {
                setClientError(result.error);
                return;
            }
            setClients((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedClientId(result.id);
            setShowNewClient(false);
            setNewClientName("");
            setNewClientColor(COLOR_OPTIONS[0]);
        });
    }

    return (
        <form action={createProject} className="space-y-6">
            {/* Project Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                    Project Name <span className="text-fuchsia">*</span>
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Second Horizon Capital – Spring 2026"
                    className="input w-full"
                />
            </div>

            {/* Client */}
            <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-text-primary mb-1.5">
                    Client <span className="text-fuchsia">*</span>
                </label>

                {/* Hidden input carries the real value when inline form is used */}
                <input type="hidden" name="client_id" value={selectedClientId} />

                <select
                    id="client_id"
                    value={showNewClient ? "__new__" : selectedClientId}
                    onChange={handleClientSelectChange}
                    required={!showNewClient}
                    className="input w-full"
                >
                    <option value="">Select a client…</option>
                    {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                    <option value="__new__">＋ Add new client…</option>
                </select>

                {/* Inline new-client panel */}
                {showNewClient && (
                    <div className="mt-3 p-4 rounded-lg border border-fuchsia/30 bg-surface space-y-3">
                        <p className="text-xs font-semibold text-fuchsia uppercase tracking-wider">
                            New Client
                        </p>

                        {clientError && (
                            <p className="text-xs text-poppy-red">{clientError}</p>
                        )}

                        <input
                            type="text"
                            placeholder="Client name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="input w-full"
                            autoFocus
                        />

                        {/* Color swatches */}
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map((hex) => (
                                <button
                                    key={hex}
                                    type="button"
                                    onClick={() => setNewClientColor(hex)}
                                    className="w-7 h-7 rounded-full transition-all"
                                    style={{
                                        backgroundColor: hex,
                                        outline: newClientColor === hex ? `2px solid white` : "none",
                                        outlineOffset: "2px",
                                    }}
                                    title={hex}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleCreateClient}
                                disabled={isPending}
                                className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
                            >
                                {isPending ? "Creating…" : "Create Client"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowNewClient(false); setSelectedClientId(""); }}
                                className="btn-secondary text-sm py-1.5 px-4"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-text-primary mb-1.5">
                        Start Date <span className="text-fuchsia">*</span>
                    </label>
                    <input id="start_date" name="start_date" type="date" required className="input w-full" />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-text-primary mb-1.5">
                        End Date <span className="text-fuchsia">*</span>
                    </label>
                    <input id="end_date" name="end_date" type="date" required className="input w-full" />
                </div>
            </div>

            {/* Status */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1.5">
                    Status
                </label>
                <select id="status" name="status" defaultValue="draft" className="input w-full">
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={showNewClient && !selectedClientId}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Create Project
                </button>
            </div>
        </form>
    );
}
