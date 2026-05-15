import { NextRequest, NextResponse } from "next/server";
import { WatsonxClient } from "@/lib/watsonx/client";
import { watsonxConfig, validateWatsonxConfig } from "@/config/watsonx";

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    validateWatsonxConfig();

    // Parse request body
    const body = await request.json();
    const { prompt, parameters } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt provided" },
        { status: 400 }
      );
    }

    // Initialize watsonx.ai client
    const client = new WatsonxClient(watsonxConfig);

    // Generate component
    const result = await client.generateComponent({
      prompt,
      parameters,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}

// Made with Bob