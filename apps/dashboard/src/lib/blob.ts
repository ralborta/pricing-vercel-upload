import { put, list, del } from "@vercel/blob";
const bucket = process.env.BLOB_BUCKET || "pricing-suite";

export async function blobPut(path: string, body: string | Blob | ArrayBuffer, contentType: string) {
  const res = await put(`${bucket}/${path}`, body, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType,
    addRandomSuffix: false,
    access: "public"
  });
  return res.url;
}

export async function blobList(prefix: string) {
  const res = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, prefix: `${bucket}/${prefix}` });
  return res.blobs;
}

export async function blobDel(path: string) {
  return del(`${bucket}/${path}`, { token: process.env.BLOB_READ_WRITE_TOKEN });
}



