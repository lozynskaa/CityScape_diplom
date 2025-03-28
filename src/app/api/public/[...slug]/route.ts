import { type NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const slug = (await params).slug; // 'a', 'b', or 'c'

  try {
    if (!slug?.length) {
      return new Response(null, { status: 404 });
    }

    const publicDir = path.join(process.cwd(), "public/uploads");
    const fileUrl = slug.join("/");
    const filePath = path.join(publicDir, fileUrl);

    // Перевірка, чи існує файл
    await fs.promises.access(filePath, fs.constants.F_OK);

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }[ext] ?? "application/octet-stream";

    const stream = fs.createReadStream(filePath);

    //@ts-expect-error Here can be error related to stream
    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response(null, { status: 404 });
  }
}
