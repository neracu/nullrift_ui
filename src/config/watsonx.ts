function trimEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Default IBM watsonx `text/generation` API version query value. */
export const WATSONX_TEXT_GENERATION_API_VERSION = "2024-05-31";

/** Default foundation model for text generation (watsonx `model_id`). */
export const WATSONX_DEFAULT_MODEL_ID = "ibm/granite-3-8b-instruct";

/** Legacy short id from older examples; watsonx requires full `vendor/model` ids. */
const LEGACY_MODEL_ID_ALIASES: Record<string, string> = {
  "granite-4-h-small": WATSONX_DEFAULT_MODEL_ID,
};

function resolveModelId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return WATSONX_DEFAULT_MODEL_ID;
  }
  const alias = LEGACY_MODEL_ID_ALIASES[trimmed.toLowerCase()];
  return alias ?? trimmed;
}

export const watsonxConfig = {
  apiKey: trimEnv(process.env.WATSONX_API_KEY),
  projectId: trimEnv(process.env.WATSONX_PROJECT_ID),
  modelId: resolveModelId(trimEnv(process.env.WATSONX_MODEL_ID)),
  apiUrl: trimEnv(process.env.WATSONX_API_URL) || "https://us-south.ml.cloud.ibm.com",
  apiVersion:
    trimEnv(process.env.WATSONX_API_VERSION) || WATSONX_TEXT_GENERATION_API_VERSION,
};

export function validateWatsonxConfig() {
  const required = ["apiKey", "projectId"];
  const missing = required.filter(
    (key) => !watsonxConfig[key as keyof typeof watsonxConfig]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required watsonx.ai configuration: ${missing.join(", ")}`
    );
  }
}

// Made with Bob
