CREATE TABLE public.workspace_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  pitch text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'IDEA',
  tags text[] NOT NULL DEFAULT '{}',
  cover_image text,
  url text,
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_token text,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text NOT NULL DEFAULT '',
  link_type text NOT NULL DEFAULT 'other',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  body text NOT NULL,
  image_url text,
  kind text NOT NULL DEFAULT 'post',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  claimed_by text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  kind text NOT NULL,
  visitor_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, kind, visitor_token)
);

CREATE TABLE public.workspace_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  visitor_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, visitor_token)
);

CREATE TABLE public.workspace_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  actor_name text NOT NULL DEFAULT 'Anonymous',
  action text NOT NULL,
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ws_media_project ON public.workspace_media(project_id);
CREATE INDEX idx_ws_links_project ON public.workspace_links(project_id);
CREATE INDEX idx_ws_updates_project ON public.workspace_updates(project_id);
CREATE INDEX idx_ws_tasks_project ON public.workspace_tasks(project_id);
CREATE INDEX idx_ws_reactions_project ON public.workspace_reactions(project_id);
CREATE INDEX idx_ws_follows_project ON public.workspace_follows(project_id);

GRANT SELECT, INSERT, UPDATE ON public.workspace_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_media TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_links TO anon, authenticated;
GRANT SELECT, INSERT ON public.workspace_updates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_tasks TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.workspace_reactions TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.workspace_follows TO anon, authenticated;
GRANT SELECT, INSERT ON public.workspace_revisions TO anon, authenticated;
GRANT ALL ON public.workspace_projects TO service_role;
GRANT ALL ON public.workspace_media TO service_role;
GRANT ALL ON public.workspace_links TO service_role;
GRANT ALL ON public.workspace_updates TO service_role;
GRANT ALL ON public.workspace_tasks TO service_role;
GRANT ALL ON public.workspace_reactions TO service_role;
GRANT ALL ON public.workspace_follows TO service_role;
GRANT ALL ON public.workspace_revisions TO service_role;

ALTER TABLE public.workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read projects" ON public.workspace_projects FOR SELECT USING (is_hidden = false);
CREATE POLICY "public create projects" ON public.workspace_projects FOR INSERT WITH CHECK (char_length(title) BETWEEN 1 AND 120 AND char_length(pitch) <= 300 AND char_length(description) <= 8000);
CREATE POLICY "public edit projects" ON public.workspace_projects FOR UPDATE USING (is_hidden = false) WITH CHECK (char_length(title) BETWEEN 1 AND 120 AND char_length(pitch) <= 300 AND char_length(description) <= 8000);

CREATE POLICY "public read media" ON public.workspace_media FOR SELECT USING (true);
CREATE POLICY "public write media" ON public.workspace_media FOR INSERT WITH CHECK (char_length(url) <= 2000);
CREATE POLICY "public update media" ON public.workspace_media FOR UPDATE USING (true) WITH CHECK (char_length(url) <= 2000);
CREATE POLICY "public delete media" ON public.workspace_media FOR DELETE USING (true);

CREATE POLICY "public read links" ON public.workspace_links FOR SELECT USING (true);
CREATE POLICY "public write links" ON public.workspace_links FOR INSERT WITH CHECK (char_length(url) <= 2000 AND char_length(label) <= 120);
CREATE POLICY "public update links" ON public.workspace_links FOR UPDATE USING (true) WITH CHECK (char_length(url) <= 2000 AND char_length(label) <= 120);
CREATE POLICY "public delete links" ON public.workspace_links FOR DELETE USING (true);

CREATE POLICY "public read updates" ON public.workspace_updates FOR SELECT USING (true);
CREATE POLICY "public write updates" ON public.workspace_updates FOR INSERT WITH CHECK (char_length(body) BETWEEN 1 AND 4000 AND char_length(author_name) <= 60);

CREATE POLICY "public read tasks" ON public.workspace_tasks FOR SELECT USING (true);
CREATE POLICY "public write tasks" ON public.workspace_tasks FOR INSERT WITH CHECK (char_length(title) BETWEEN 1 AND 200);
CREATE POLICY "public update tasks" ON public.workspace_tasks FOR UPDATE USING (true) WITH CHECK (char_length(title) BETWEEN 1 AND 200);
CREATE POLICY "public delete tasks" ON public.workspace_tasks FOR DELETE USING (true);

CREATE POLICY "public read reactions" ON public.workspace_reactions FOR SELECT USING (true);
CREATE POLICY "public write reactions" ON public.workspace_reactions FOR INSERT WITH CHECK (char_length(kind) <= 20 AND char_length(visitor_token) <= 80);
CREATE POLICY "public delete reactions" ON public.workspace_reactions FOR DELETE USING (true);

CREATE POLICY "public read follows" ON public.workspace_follows FOR SELECT USING (true);
CREATE POLICY "public write follows" ON public.workspace_follows FOR INSERT WITH CHECK (char_length(visitor_token) <= 80);
CREATE POLICY "public delete follows" ON public.workspace_follows FOR DELETE USING (true);

CREATE POLICY "public read revisions" ON public.workspace_revisions FOR SELECT USING (true);
CREATE POLICY "public write revisions" ON public.workspace_revisions FOR INSERT WITH CHECK (char_length(action) <= 60);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_ws_projects_updated BEFORE UPDATE ON public.workspace_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ws_tasks_updated BEFORE UPDATE ON public.workspace_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();