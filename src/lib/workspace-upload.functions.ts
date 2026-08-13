import { createServerFn } from "@tanstack/react-start";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;

export const uploadWorkspaceMedia = createServerFn({ method: "POST" })
  .inputValidator((input: { fileName: string; dataUrl: string }) => {
    if (!input || typeof input.fileName !== "string") throw new Error("Invalid input");
    if (!input.dataUrl?.startsWith("data:")) throw new Error("Invalid file");
    return input;
  })
  .handler(async ({ data }) => {
    const match = data.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL");
    const [, contentType, b64] = match;
    if (!ALLOWED.test(contentType)) throw new Error("Unsupported file type");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > MAX_BYTES) throw new Error("File too large (max 8MB)");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (contentType.split("/")[1] ?? "bin").replace(/[^a-z0-9]/gi, "");
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
    const path = `workspace/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
