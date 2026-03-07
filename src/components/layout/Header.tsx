"use client";

import Link from "next/link";

interface HeaderProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header className="bg-surface border-b border-border-light px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Breadcrumb / Title */}
                    <div>
                        {title && (
                            <h1 className="text-2xl font-heading font-bold text-deep-purple">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {actions}

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 pl-10 pr-4 py-2 bg-background border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia focus:border-fuchsia"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    {/* Notifications */}
                    <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-pale-pink/20 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
