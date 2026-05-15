export const watsonxConfig = {
  apiKey: process.env.WATSONX_API_KEY || "",
  projectId: process.env.WATSONX_PROJECT_ID || "",
  modelId: process.env.WATSONX_MODEL_ID || "ibm/granite-13b-chat-v2",
  apiUrl: process.env.WATSONX_API_URL || "https://us-south.ml.cloud.ibm.com",
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
