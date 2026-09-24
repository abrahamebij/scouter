import { NextRequest, NextResponse } from "next/server";

const COW_API_BASE = "https://api.cow.fi";

/**
 * Proxy requests to the CoW Protocol API.
 * Avoids CORS issues when the browser calls api.cow.fi directly.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${COW_API_BASE}/${targetPath}${queryString}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  };

  // Forward API key if present
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      fetchOptions.body = await request.text();
    } catch {
      // No body
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to proxy to CoW API", details: String(error) },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
