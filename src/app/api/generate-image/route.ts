import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { text } = body;

    // Validate and sanitize the prompt
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input: 'text' must be a non-empty string.");
    }

    // Sanitize
    text = text.replace(/[^\w\s]/gi, ""); 

    console.log("Sanitized prompt:", text);

    const url = new URL(
      "https://zchisholm--zap-studio-model-generate.modal.run/"
    );
    url.searchParams.set("prompt", text);

    console.log("Requesting URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.ZAP_API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const filename = `${crypto.randomUUID()}.jpg`;

    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    console.log("Image uploaded to:", blob.url);

    // Store the mapping (prompt -> image URL) as a JSON file
    const metadataFilename = `${crypto.randomUUID()}.json`;

    const metadataBlob = await put(
      metadataFilename,
      JSON.stringify({
        prompt: text,
        imageUrl: blob.url,
      }),
      {
        access: "public",
        contentType: "application/json",
      }
    );

    console.log("Prompt metadata stored at:", metadataBlob.url);

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      metadataUrl: metadataBlob.url, 
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
