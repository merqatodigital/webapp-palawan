import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_UPLOAD = /^(image\/(png|jpe?g|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;

export const loadSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { json: data?.content ? JSON.stringify(data.content) : null };
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string; json: string }) => {
    if (!input || typeof input.passkey !== "string" || typeof input.json !== "string") {
      throw new Error("Invalid input");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const adminPasskey = process.env.ADMIN_PASSKEY ?? "5309";
    if (data.passkey !== adminPasskey) throw new Error("Unauthorized");
    const parsed = JSON.parse(data.json) as Json;
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ id: 1, content: parsed, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { passkey: string; fileName: string; dataUrl: string }) => {
      if (!input || typeof input.passkey !== "string") throw new Error("Invalid input");
      if (!input.dataUrl?.startsWith("data:")) throw new Error("Invalid file");
      return input;
    },
  )
  .handler(async ({ data }) => {
    const adminPasskey = process.env.ADMIN_PASSKEY ?? "5309";
    if (data.passkey !== adminPasskey) throw new Error("Unauthorized");
    const match = data.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL");
    const [, contentType, b64] = match;
    if (!ALLOWED_UPLOAD.test(contentType)) throw new Error("Unsupported file type");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error("File too large (max 25MB)");
    const ext = (contentType.split("/")[1] ?? "bin").replace(/[^a-z0-9]/gi, "");
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string; url: string }) => {
    if (!input || typeof input.passkey !== "string" || typeof input.url !== "string") {
      throw new Error("Invalid input");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const adminPasskey = process.env.ADMIN_PASSKEY ?? "5309";
    if (data.passkey !== adminPasskey) throw new Error("Unauthorized");
    const marker = "/storage/v1/object/public/media/";
    const markerIndex = data.url.indexOf(marker);
    if (markerIndex === -1) return { ok: true, deleted: false };
    const path = decodeURIComponent(data.url.slice(markerIndex + marker.length).split("?")[0]);
    if (!path || path.includes("..")) throw new Error("Invalid media path");
    const { error } = await supabaseAdmin.storage.from("media").remove([path]);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: true };
  });
