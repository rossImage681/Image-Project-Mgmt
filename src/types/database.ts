// Database Types for IMC Project Scheduler
// These types mirror the Supabase database schema

// ============================================
// ENUMS
// ============================================

export type UserRole = 'admin' | 'internal' | 'client_viewer';

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived';

export type DeliverableStatus = 'planned' | 'in_progress' | 'blocked' | 'complete';

export type MilestoneType = 'delivery' | 'feedback_due' | 'review' | 'final';

export type DeliverableType = 'brochure' | 'microsite' | 'video' | 'photography' | 'design' | 'other';

// ============================================
// JSON FIELD TYPES
// ============================================

export interface BusinessDayRules {
    workdays: number[]; // 1 = Monday, 5 = Friday
    holidays: string[]; // ISO date strings
}

export interface ClientTheme {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
}

export interface MilestonePatternItem {
    name: string;
    offset_days: number;
    type: MilestoneType;
    is_feedback_due: boolean;
}

export interface SpacingRules {
    round_spacing: number;
    feedback_spacing: number;
}

export interface DeliverableDependency {
    deliverable_id: string;
    milestone_type: MilestoneType;
}

export interface ShareLinkPermissions {
    view_deliverables: boolean;
    view_milestones: boolean;
}

// ============================================
// TABLE TYPES
// ============================================

export interface Client {
    id: string;
    name: string;
    accent_color: string;
    logo_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    client_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: ProjectStatus;
    business_day_rules: BusinessDayRules;
    client_theme: ClientTheme | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Property {
    id: string;
    project_id: string;
    name: string;
    sort_order: number;
    group_name: string | null;
    accent_color: string | null;
    created_at: string;
}

export interface Template {
    id: string;
    name: string;
    deliverable_type: DeliverableType;
    is_duration_based: boolean;
    duration_days: number | null;
    revision_rounds: number;
    milestones_pattern: MilestonePatternItem[];
    spacing_rules: SpacingRules;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface Deliverable {
    id: string;
    property_id: string;
    name: string;
    type: DeliverableType;
    template_id: string | null;
    duration_days: number | null;
    phase1_days: number;
    start_date: string | null;
    end_date: string | null;
    status: DeliverableStatus;
    dependencies: DeliverableDependency[];
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Milestone {
    id: string;
    deliverable_id: string;
    name: string;
    type: MilestoneType;
    scheduled_date: string;
    reviewers: string[];
    is_feedback_due: boolean;
    completed_at: string | null;
    notes: string | null;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    initials: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface ShareLink {
    id: string;
    project_id: string;
    token: string;
    permissions: ShareLinkPermissions;
    password_hash: string | null;
    expires_at: string | null;
    last_accessed_at: string | null;
    created_at: string;
}

// ============================================
// JOINED / EXTENDED TYPES
// ============================================

export interface ProjectWithClient extends Project {
    client: Client;
}

export interface PropertyWithDeliverables extends Property {
    deliverables: DeliverableWithMilestones[];
}

export interface DeliverableWithMilestones extends Deliverable {
    milestones: Milestone[];
}

export interface ProjectFull extends Project {
    client: Client;
    properties: PropertyWithDeliverables[];
}

// ============================================
// INPUT TYPES (for creating/updating)
// ============================================

export interface CreateClientInput {
    name: string;
    accent_color?: string;
    logo_url?: string;
    notes?: string;
}

export interface CreateProjectInput {
    client_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status?: ProjectStatus;
    business_day_rules?: BusinessDayRules;
    client_theme?: ClientTheme;
    internal_notes?: string;
}

export interface CreatePropertyInput {
    project_id: string;
    name: string;
    sort_order?: number;
    group_name?: string;
    accent_color?: string;
}

export interface CreateDeliverableInput {
    property_id: string;
    name: string;
    type: DeliverableType;
    template_id?: string;
    duration_days?: number;
    phase1_days?: number;
    start_date?: string;
    end_date?: string;
    dependencies?: DeliverableDependency[];
    internal_notes?: string;
}

export interface CreateMilestoneInput {
    deliverable_id: string;
    name: string;
    type: MilestoneType;
    scheduled_date: string;
    reviewers?: string[];
    is_feedback_due?: boolean;
    notes?: string;
}

export interface CreateShareLinkInput {
    project_id: string;
    permissions?: ShareLinkPermissions;
    password?: string;
    expires_at?: string;
}

// ============================================
// PROPERTY ACCENT COLORS (default palette)
// ============================================

export const PROPERTY_ACCENT_COLORS = [
    '#E52E7D', // Fuchsia
    '#FF4A29', // Orange  
    '#3B82F6', // Blue
    '#22C55E', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#EF4444', // Red
    '#6366F1', // Indigo
] as const;
