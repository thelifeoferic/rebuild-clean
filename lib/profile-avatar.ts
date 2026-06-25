import type { SupabaseClient } from "@supabase/supabase-js";

const avatarSize = 512;
const avatarBucket = "avatars";

export async function prepareProfileAvatar(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const side = Math.min(image.width, image.height);
  const sourceX = Math.max(0, Math.round((image.width - side) / 2));
  const sourceY = Math.max(0, Math.round((image.height - side) / 2));
  const canvas = document.createElement("canvas");
  canvas.width = avatarSize;
  canvas.height = avatarSize;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare that photo.");

  context.drawImage(image, sourceX, sourceY, side, side, 0, 0, avatarSize, avatarSize);
  return canvas.toDataURL("image/jpeg", 0.84);
}

export async function uploadProfileAvatar(client: SupabaseClient, avatarDataUrl: string) {
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) throw new Error("Sign in before uploading a cloud profile photo.");

  const response = await fetch(avatarDataUrl);
  const blob = await response.blob();
  const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
  const { error } = await client.storage.from(avatarBucket).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = client.storage.from(avatarBucket).getPublicUrl(path);
  return data.publicUrl;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Photo could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Photo could not be loaded."));
    image.src = src;
  });
}
