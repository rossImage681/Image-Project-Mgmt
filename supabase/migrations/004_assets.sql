-- IMAGE MGMT - Digital Asset Management Schema
-- Run this in your Supabase SQL Editor after 003_seed_data.sql

-- ============================================
-- CUSTOM TYPES
-- ============================================

CREATE TYPE asset_category AS ENUM (
  'client_review',
  'internal',
  'final_deliverable',
  'shared'
);

-- ============================================
-- FOLDERS TABLE
-- Virtual folder hierarchy: client > project
-- ============================================

CREATE TABLE folders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,  -- NULL = client-level folder
  parent_id     UUID REFERENCES folders(id) ON DELETE CASCADE,   -- NULL = root folder
  storage_prefix TEXT NOT NULL,  -- e.g. "clients/{client_id}" or "clients/{client_id}/projects/{project_id}"
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_folders_client_id    ON folders(client_id);
CREATE INDEX idx_folders_project_id   ON folders(project_id);
CREATE INDEX idx_folders_parent_id    ON folders(parent_id);

-- ============================================
-- ASSETS TABLE
-- One row per uploaded file
-- ============================================

CREATE TABLE assets (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id            UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  name                 VARCHAR(500) NOT NULL,          -- Display name
  description          TEXT,                           -- Free-form description
  storage_path         TEXT NOT NULL,                  -- Full path in Supabase Storage bucket
  mime_type            VARCHAR(255),
  file_size            BIGINT,                         -- Bytes
  category             asset_category NOT NULL DEFAULT 'internal',
  tags                 TEXT[] DEFAULT '{}',            -- e.g. {"spring2026","campaign"}
  hashtags             TEXT[] DEFAULT '{}',            -- e.g. {"#launch","#photography"}
  metadata             JSONB DEFAULT '{}',             -- AI context: {"shoot_date":"2026-03","talent":"Jane"}
  uploaded_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search vector auto-generated from all searchable fields
  search_vector        TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '') || ' ' ||
      coalesce(array_to_string(hashtags, ' '), '') || ' ' ||
      coalesce(metadata::text, '')
    )
  ) STORED
);

CREATE INDEX idx_assets_folder_id    ON assets(folder_id);
CREATE INDEX idx_assets_category     ON assets(category);
CREATE INDEX idx_assets_tags         ON assets USING GIN(tags);
CREATE INDEX idx_assets_hashtags     ON assets USING GIN(hashtags);
CREATE INDEX idx_assets_metadata     ON assets USING GIN(metadata);
CREATE INDEX idx_assets_search       ON assets USING GIN(search_vector);
CREATE INDEX idx_assets_created_at   ON assets(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets  ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do everything (same pattern as existing tables)
CREATE POLICY "Authenticated users can manage folders"
  ON folders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage assets"
  ON assets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
