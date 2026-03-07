"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "../theme-toggle";
import { logout } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

interface ClientItem {
    id: string;
    name: string;
}

interface SidebarProps {
    user?: User | null;
    clients?: ClientItem[];
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    children?: { label: string; href: string }[];
}

function buildNavItems(clients: ClientItem[]): NavItem[] {
    return [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            label: "Clients",
            href: "/clients",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            children: clients.map((c) => ({ label: c.name, href: `/clients/${c.id}` })),
        },
        {
            label: "Projects",
            href: "/projects",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            label: "Portfolio",
            href: "/portfolio",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
        },
        {
            label: "Templates",
            href: "/templates",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];
}

export function Sidebar({ user, clients = [] }: SidebarProps) {
    const pathname = usePathname();
    const [clientsOpen, setClientsOpen] = useState(true);

    const navItems = buildNavItems(clients);

    const userEmail = user?.email || "";
    const displayName = userEmail.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <aside className="w-64 bg-surface border-r border-border-light min-h-screen flex flex-col transition-colors duration-200">
            {/* Logo */}
            <div className="p-6 border-b border-border-light">
                <Link href="/dashboard" className="flex flex-col gap-4">
                    <div className="relative w-48 h-16">
                        <Image
                            src="/imc-logo.png"
                            alt="Image Marketing"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    <div className="font-heading font-bold text-deep-purple dark:text-white text-lg">Project Scheduler</div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "#" &&
                                item.href !== "/clients" &&
                                pathname.startsWith(item.href + "/"));
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = item.label === "Clients" ? clientsOpen : false;

                        return (
                            <li key={item.label}>
                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() =>
                                                item.label === "Clients" && setClientsOpen(!clientsOpen)
                                            }
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                                                pathname.startsWith("/clients")
                                                    ? "bg-fuchsia/10 text-fuchsia"
                                                    : "text-text-secondary dark:text-text-secondary hover:bg-pale-pink/20 hover:text-text-primary dark:hover:text-white"
                                            } group`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-200 ${
                                                    isExpanded ? "transform rotate-90" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>

                                        {isExpanded && (
                                            <ul className="mt-1 ml-4 space-y-1 border-l-2 border-border-light pl-3">
                                                {item.children!.map((child) => {
                                                    const isChildActive = pathname.startsWith(child.href);
                                                    return (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                                                                    isChildActive
                                                                        ? "text-fuchsia font-medium bg-fuchsia/5"
                                                                        : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                                                                }`}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                                            isActive
                                                ? "bg-fuchsia/10 text-fuchsia"
                                                : "text-text-secondary dark:text-text-secondary hover:bg-pale-pink/20 hover:text-text-primary dark:hover:text-white"
                                        }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border-light">
                <div className="flex items-center gap-2 mb-3 justify-between">
                    <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">Theme</div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-bubblegum/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-bubblegum">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary dark:text-white truncate">{displayName}</div>
                        <div className="text-xs text-text-secondary truncate">{userEmail}</div>
                    </div>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-pale-pink/20 hover:text-fuchsia transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
}
