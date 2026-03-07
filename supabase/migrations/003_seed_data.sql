-- IMC Project Scheduler - Seed Data
-- Sample project: Second Horizon Capital
-- Run this AFTER applying 001 and 002 migrations

-- ============================================
-- SEED CLIENT
-- ============================================

INSERT INTO clients (id, name, accent_color, notes)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Second Horizon Capital',
  '#3B82F6', -- Blue accent
  'Real estate investment firm - Q1 2026 property marketing campaign'
);

-- ============================================
-- SEED PROJECT
-- ============================================

INSERT INTO projects (id, client_id, name, start_date, end_date, status, business_day_rules, internal_notes)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Q1 2026 Property Campaign',
  '2026-02-01',
  '2026-03-27',
  'active',
  '{"workdays": [1, 2, 3, 4, 5], "holidays": []}',
  'Four properties, staggered brochure and microsite delivery'
);

-- ============================================
-- SEED PROPERTIES (in order)
-- ============================================

INSERT INTO properties (id, project_id, name, sort_order, accent_color)
VALUES 
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 'Chicago Ridge', 1, '#E52E7D'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222222', 'Orange Park Mall', 2, '#FF4A29'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222222', 'Layton Hills Mall', 3, '#22C55E'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222222', 'Park Plaza', 4, '#8B5CF6');

-- ============================================
-- GET TEMPLATE IDs
-- ============================================

-- Note: In production, you'd query for these. Using placeholders here.
-- Microsite standard template: 7 business days
-- Microsite short template: 5 business days

-- ============================================
-- SEED DELIVERABLES
-- ============================================

-- Chicago Ridge Brochure (finishes 2026-02-02, so starts earlier)
INSERT INTO deliverables (id, property_id, name, type, start_date, end_date, status, internal_notes)
VALUES (
  '44444444-4444-4444-4444-444444444401',
  '33333333-3333-3333-3333-333333333301',
  'Chicago Ridge Brochure',
  'brochure',
  '2026-01-27', -- Started before project for early delivery
  '2026-02-02',
  'complete',
  'Early delivery - client had existing content'
);

-- Chicago Ridge Microsite (7 business days)
INSERT INTO deliverables (id, property_id, name, type, duration_days, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444402',
  '33333333-3333-3333-3333-333333333301',
  'Chicago Ridge Microsite',
  'microsite',
  7,
  '2026-02-03',
  '2026-02-11',
  'in_progress'
);

-- Orange Park Mall Brochure
INSERT INTO deliverables (id, property_id, name, type, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444403',
  '33333333-3333-3333-3333-333333333302',
  'Orange Park Mall Brochure',
  'brochure',
  '2026-02-03',
  '2026-02-10',
  'planned'
);

-- Orange Park Mall Microsite (5 business days)
INSERT INTO deliverables (id, property_id, name, type, duration_days, start_date, end_date, status, dependencies)
VALUES (
  '44444444-4444-4444-4444-444444444404',
  '33333333-3333-3333-3333-333333333302',
  'Orange Park Mall Microsite',
  'microsite',
  5,
  '2026-02-12',
  '2026-02-18',
  'planned',
  '[{"deliverable_id": "44444444-4444-4444-4444-444444444402", "milestone_type": "final"}]'
);

-- Layton Hills Mall Brochure
INSERT INTO deliverables (id, property_id, name, type, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444405',
  '33333333-3333-3333-3333-333333333303',
  'Layton Hills Mall Brochure',
  'brochure',
  '2026-02-11',
  '2026-02-18',
  'planned'
);

-- Layton Hills Mall Microsite (5 business days)
INSERT INTO deliverables (id, property_id, name, type, duration_days, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444406',
  '33333333-3333-3333-3333-333333333303',
  'Layton Hills Mall Microsite',
  'microsite',
  5,
  '2026-02-19',
  '2026-02-25',
  'planned'
);

-- Park Plaza Brochure
INSERT INTO deliverables (id, property_id, name, type, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444407',
  '33333333-3333-3333-3333-333333333304',
  'Park Plaza Brochure',
  'brochure',
  '2026-02-19',
  '2026-02-26',
  'planned'
);

-- Park Plaza Microsite (5 business days)
INSERT INTO deliverables (id, property_id, name, type, duration_days, start_date, end_date, status)
VALUES (
  '44444444-4444-4444-4444-444444444408',
  '33333333-3333-3333-3333-333333333304',
  'Park Plaza Microsite',
  'microsite',
  5,
  '2026-02-26',
  '2026-03-04',
  'planned'
);

-- ============================================
-- SEED MILESTONES
-- ============================================

-- Chicago Ridge Brochure milestones
INSERT INTO milestones (deliverable_id, name, type, scheduled_date, reviewers, is_feedback_due)
VALUES 
  ('44444444-4444-4444-4444-444444444401', 'Round 1 Delivered', 'delivery', '2026-01-28', '["JD"]', false),
  ('44444444-4444-4444-4444-444444444401', 'Round 1 Feedback Due', 'feedback_due', '2026-01-29', '["SH"]', true),
  ('44444444-4444-4444-4444-444444444401', 'Round 2 Delivered', 'delivery', '2026-01-31', '["JD"]', false),
  ('44444444-4444-4444-4444-444444444401', 'Final Delivered', 'final', '2026-02-02', '["JD", "SH"]', false);

-- Chicago Ridge Microsite milestones
INSERT INTO milestones (deliverable_id, name, type, scheduled_date, reviewers, is_feedback_due)
VALUES 
  ('44444444-4444-4444-4444-444444444402', 'Development Start', 'delivery', '2026-02-03', '["TM"]', false),
  ('44444444-4444-4444-4444-444444444402', 'Review Ready', 'review', '2026-02-07', '["TM", "SH"]', false),
  ('44444444-4444-4444-4444-444444444402', 'Launch', 'final', '2026-02-11', '["TM", "SH"]', false);

-- Orange Park Mall Brochure milestones
INSERT INTO milestones (deliverable_id, name, type, scheduled_date, reviewers, is_feedback_due)
VALUES 
  ('44444444-4444-4444-4444-444444444403', 'Round 1 Delivered', 'delivery', '2026-02-03', '["JD"]', false),
  ('44444444-4444-4444-4444-444444444403', 'Round 1 Feedback Due', 'feedback_due', '2026-02-04', '["SH"]', true),
  ('44444444-4444-4444-4444-444444444403', 'Round 2 Delivered', 'delivery', '2026-02-06', '["JD"]', false),
  ('44444444-4444-4444-4444-444444444403', 'Round 2 Feedback Due', 'feedback_due', '2026-02-07', '["SH"]', true),
  ('44444444-4444-4444-4444-444444444403', 'Final Delivered', 'final', '2026-02-10', '["JD", "SH"]', false);

-- Orange Park Mall Microsite milestones
INSERT INTO milestones (deliverable_id, name, type, scheduled_date, reviewers, is_feedback_due)
VALUES 
  ('44444444-4444-4444-4444-444444444404', 'Development Start', 'delivery', '2026-02-12', '["TM"]', false),
  ('44444444-4444-4444-4444-444444444404', 'Review Ready', 'review', '2026-02-16', '["TM", "SH"]', false),
  ('44444444-4444-4444-4444-444444444404', 'Launch', 'final', '2026-02-18', '["TM"]', false);

-- ============================================
-- SEED SHARE LINK
-- ============================================

INSERT INTO share_links (id, project_id, token, permissions)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'shc-q1-2026-abc123xyz',
  '{"view_deliverables": true, "view_milestones": true}'
);
