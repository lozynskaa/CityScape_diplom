import path from "path";
import * as fs from "fs";

export async function createImageURL(fileName: string, fileBase64: string) {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  const filePath = path.join(uploadsDir, fileName);

  // Ensure the directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const base64Content = fileBase64.split(",")[1]!;
  // Write the file
  const fileBuffer = Buffer.from(base64Content, "base64"); // Convert Bun's File to Buffer
  fs.writeFileSync(filePath, Buffer.from(fileBuffer));

  // Construct the URL
  const url = `/uploads/${fileName}`;

  // Save the URL in the database (pseudo-code)
  // await db.insert({ url }).into('images');

  return url;
}
