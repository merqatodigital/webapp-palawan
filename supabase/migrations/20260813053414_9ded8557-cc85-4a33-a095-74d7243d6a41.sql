CREATE OR REPLACE FUNCTION public.hide_workspace_project(_project_id uuid, _actor text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.workspace_projects SET is_hidden = true WHERE id = _project_id;
  INSERT INTO public.workspace_revisions (project_id, actor_name, action, snapshot)
  VALUES (_project_id, COALESCE(NULLIF(left(_actor, 60), ''), 'Anonymous'), 'delete', NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.hide_workspace_project(uuid, text) TO anon, authenticated, service_role;