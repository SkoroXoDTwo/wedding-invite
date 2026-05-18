import { readFile, stat } from "fs/promises";
import { join, normalize } from "path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function getContentType(filePath: string) {
  const match = filePath.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? contentTypes[match[0]] : undefined;
}

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { path } = await params;
  const safePath = normalize(path.join("/")).replace(/^(\.\.(\/|\\|$))+/, "");
  const uploadsRoot = join(process.cwd(), "public", "uploads");
  const filePath = join(uploadsRoot, safePath);

  if (!filePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const contentType = getContentType(filePath);
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
