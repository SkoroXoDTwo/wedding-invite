import { randomBytes } from "node:crypto";

export function createGuestToken() {
  return randomBytes(18).toString("hex");
}
