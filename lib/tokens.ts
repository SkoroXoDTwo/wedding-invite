import { randomBytes } from "crypto";

export function createGuestToken() {
  return randomBytes(18).toString("hex");
}
