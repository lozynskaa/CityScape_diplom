import crypto from "crypto";

export async function hashPassword(password: string) {
  const passwordHash: string = await new Promise((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashBuffer = hash.digest();
    resolve(hashBuffer.toString("hex"));
  });

  return passwordHash;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const localPasswordHash = await hashPassword(password);
  return localPasswordHash === passwordHash;
}
