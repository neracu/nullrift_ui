import { NextResponse } from "next/server";
import { watsonxConfig } from "@/config/watsonx";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    watsonx: {
      configured: !!(watsonxConfig.apiKey && watsonxConfig.projectId),
      modelId: watsonxConfig.modelId,
    },
  };

  return NextResponse.json(health);
}

// Made with Bob