# Workspace: Open Community Project Folders

Turn `/workspace` from an admin-only gallery into a live, open project hub where anyone
can create a project, edit it, attach Drive links and images, post updates, tick tasks,
react and follow — no login required.

## What visitors get

**Project list**
- Search box, status filter (Live / Building / Ready / Idea), and tag chips.
- Cards show cover image, title, short pitch, status, tags, contributor avatars/initials,
  and counters: media, updates, tasks done, reactions, comments.
- "New project" button opens a form: title, pitch, description, status, tags, cover image,
  links, media.

**Project detail (full folder)**
Opens as a full page at `/workspace/<id>` with tabs:
- **Overview** — description, status, tags, contributor list, follow button, reactions bar
  (fire / rocket / heart / idea), existing star comments.
- **Media** — up to 10 images/videos/YouTube in the existing zoomable carousel; drag to
  reorder, upload from device.
- **Links** — paste any number of URLs (Google Drive, Docs, Sheets, Figma, GitHub, live
  site). Each is auto-labelled with the right icon and type badge; Drive folder/file IDs
  are detected so links open correctly. Add / edit / delete inline.
- **Updates** — activity feed: anyone posts a progress note (name + text + optional image);
  newest first, with timestamps. System entries logged for project created / edited.
- **Tasks** — checklist with add / tick / delete, "claimed by" name, and a progress bar
  rolled up to the card.

**Contributors** — anyone who creates a project, posts an update, adds a task or a comment
is recorded by display name and shown on the project. Name is remembered in the browser so
it is typed once.

## Guardrails (open editing, no accounts)

Since anyone can edit or delete, the plan adds lightweight safety instead of auth:
- Every create/edit/delete/update is written with an author name and a browser-generated
  visitor id.
- Edit and delete of a project ask for confirmation; delete is a soft delete (hidden,
  restorable by admin) so nothing is truly lost to vandalism.
- Full change history table so the admin can see who changed what and restore.
- Basic input limits (length caps, URL validation, image size cap) and honeypot on forms.
- Admin panel keeps a moderation view: restore deleted projects, hard delete spam,
  remove updates/comments.

## Technical notes

Data moves out of the single `site_content` JSON blob into real tables so many people can
write concurrently:

- `workspace_projects` — title, pitch, description, status, tags[], cover_image, author_name,
  author_token, is_deleted, timestamps.
- `workspace_media` — project_id, kind (image/video/youtube), url, sort_order.
- `workspace_links` — project_id, url, label, type (drive/doc/sheet/figma/github/site/other),
  sort_order.
- `workspace_updates` — project_id, author_name, body, image_url, kind (post/system).
- `workspace_tasks` — project_id, title, done, claimed_by, sort_order.
- `workspace_reactions` — project_id, kind, visitor_token (one per kind per visitor).
- `workspace_follows` — project_id, visitor_token.
- `workspace_revisions` — project_id, actor_name, action, snapshot jsonb.

RLS: public read on non-deleted rows, public insert/update with length + shape checks,
no hard delete from the client (soft-delete flag only); service_role full access for admin
moderation. GRANTs to `anon`, `authenticated`, `service_role` per the policies.

Uploads reuse the existing `media` bucket via a public upload server function (size/type
capped) instead of the admin-passkey path.

Frontend:
- `src/routes/workspace.tsx` — list, filters, create dialog.
- `src/routes/workspace.$projectId.tsx` — detail page with tabs.
- New components: `ProjectFormDialog`, `ProjectLinks`, `ProjectUpdates`, `ProjectTasks`,
  `ProjectReactions`, `ContributorChips`; reuse `WorkspaceMediaGallery` and `ProjectComments`.
- TanStack Query for reads/mutations so counters refresh without reloads.
- Existing `workProjects` entries in the content store are migrated into the new tables once,
  then the store field is retired.
- Mobile-first layout consistent with the current dark/light theming.

## Out of scope (next phase)
Member profiles and the wider Palawan digital-nomad community layer.
