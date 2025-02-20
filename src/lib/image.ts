import path from "path";
import * as fs from "fs";

export async function createImageURL(fileName: string, fileBase64: string) {
  const uploadDirs = [
    path.join(process.cwd(), "public/uploads"),
    // Add production path if in production
    ...(process.env.NODE_ENV === "production"
      ? [__dirname.split(".next")[0] + "public/uploads"]
      : []),
  ];

  // Extract the MIME type and base64 content
  const regex = /^data:([A-Za-z-+/]+);base64,(.+)$/;
  const matches = regex.exec(fileBase64);

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const [, mimeType, base64Content] = matches;

  if (!mimeType || !base64Content) {
    throw new Error("Error on image match!");
  }

  // Get file extension from mime type
  const extension = mimeType.split("/")[1];
  const fileNameWithExt = `${fileName}.${extension}`;
  const fileBuffer = Buffer.from(base64Content, "base64");

  // Save file to all directories
  for (const dir of uploadDirs) {
    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileNameWithExt);
    fs.writeFileSync(filePath, fileBuffer);
  }

  const BASE_URL = process.env.VERCEL_URL ?? process.env.NEXTAUTH_URL;
  // Return the public URL (same for both environments)
  return `${BASE_URL}/api/public/${fileNameWithExt}`;
}
