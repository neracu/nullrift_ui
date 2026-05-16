# watsonx.ai Integration Guide

## Overview

NullRift UI uses IBM watsonx.ai to generate intelligent UI component schemas based on natural language descriptions. This document explains how to set up and use the watsonx.ai integration.

---

## Prerequisites

Before you begin, ensure you have:

1. **IBM Cloud Account**: Sign up at [cloud.ibm.com](https://cloud.ibm.com)
2. **watsonx.ai Access**: Enable watsonx.ai service in your IBM Cloud account
3. **API Credentials**: Obtain your API key and Project ID

---

## Setup Instructions

### 1. Obtain watsonx.ai Credentials

1. Log in to [IBM Cloud](https://cloud.ibm.com)
2. Navigate to **watsonx.ai** service
3. Create a new project or select an existing one
4. Copy your **Project ID** from the project settings
5. Generate an **API Key** from IBM Cloud IAM:
   - Go to **Manage** → **Access (IAM)** → **API keys**
   - Click **Create an IBM Cloud API key**
   - Save the API key securely

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   WATSONX_API_KEY=your_actual_api_key_here
   WATSONX_PROJECT_ID=your_actual_project_id_here
   WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
   WATSONX_API_URL=https://us-south.ml.cloud.ibm.com
   ```

3. **Important**: Never commit `.env.local` to version control!

---

## API Usage

### Generate Component

Use the `/api/generate` endpoint to create component schemas:

```typescript
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Create a contact form with name, email, and message fields",
    parameters: {
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
    },
  }),
});

const data = await response.json();
console.log(data.schema); // Generated component schema
```

### Response Format

```typescript
{
  "schema": {
    "id": "uuid",
    "name": "ContactForm",
    "description": "A contact form component",
    "props": [...],
    "fields": [...],
    "styling": {...},
    "layout": "single-column",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "metadata": {
    "model": "ibm/granite-13b-chat-v2",
    "tokensUsed": 1234,
    "generationTime": 1234567890
  }
}
```

---

## Health Check

Test your watsonx.ai configuration:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "watsonx": {
    "configured": true,
    "modelId": "ibm/granite-3-8b-instruct"
  }
}
```

---

## Available Models

NullRift UI supports various watsonx.ai models:

| Model ID | Description | Best For |
|----------|-------------|----------|
| `ibm/granite-3-8b-instruct` | Default model (Recommended) | Fast, efficient component generation |
| `ibm/granite-13b-chat-v2` | Chat model | Conversational component generation |
| `ibm/granite-20b-code-instruct` | Code-focused | Complex components with detailed logic |
| `meta-llama/llama-2-70b-chat` | Large model | Detailed schemas and complex requirements |

To change the model, update `WATSONX_MODEL_ID` in `.env.local`.

---

## Configuration Options

### Generation Parameters

Customize the generation behavior:

```typescript
{
  max_tokens: 2000,      // Maximum tokens to generate (500-4000)
  temperature: 0.7,      // Creativity level (0.0-1.0)
  top_p: 0.9,           // Nucleus sampling (0.0-1.0)
}
```

**Recommendations:**
- **Precise components**: `temperature: 0.3-0.5`
- **Creative designs**: `temperature: 0.7-0.9`
- **Balanced**: `temperature: 0.6-0.7` (default)

---

## Error Handling

### Common Errors

**Error: "Missing required watsonx.ai configuration"**
- **Cause**: Environment variables not set
- **Solution**: Ensure `.env.local` exists with valid credentials

**Error: "watsonx.ai API error: 401 Unauthorized"**
- **Cause**: Invalid API key
- **Solution**: Verify your API key in IBM Cloud

**Error: "watsonx.ai API error: 403 Forbidden"**
- **Cause**: Project ID mismatch or insufficient permissions
- **Solution**: Check project ID and IAM permissions

**Error: "Invalid response format from watsonx.ai"**
- **Cause**: Model returned non-JSON response
- **Solution**: Try adjusting temperature or using a different model

---

## Best Practices

### 1. Prompt Engineering

Write clear, specific prompts:

✅ **Good:**
```
Create a user registration form with:
- Email field with validation
- Password field with strength indicator
- Confirm password field
- Terms and conditions checkbox
- Submit button
```

❌ **Bad:**
```
Make a form
```

### 2. Rate Limiting

Implement rate limiting to avoid API quota exhaustion:

```typescript
// Example: Debounce generation requests
const debouncedGenerate = debounce(generateComponent, 1000);
```

### 3. Caching

Cache generated schemas to reduce API calls:

```typescript
const cacheKey = `schema:${hash(prompt)}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

### 4. Error Recovery

Always handle errors gracefully:

```typescript
try {
  const result = await client.generateComponent({ prompt });
  return result;
} catch (error) {
  console.error("Generation failed:", error);
  return fallbackSchema;
}
```

---

## Testing

### Unit Tests

Test the watsonx client:

```typescript
import { WatsonxClient } from "@/lib/watsonx/client";

describe("WatsonxClient", () => {
  it("should generate component schema", async () => {
    const client = new WatsonxClient(config);
    const result = await client.generateComponent({
      prompt: "Create a button component",
    });
    expect(result.schema).toBeDefined();
  });
});
```

### Integration Tests

Test the API endpoint:

```bash
# Test generation endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple button"}'

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Debug Mode

Enable detailed logging:

```typescript
// In watsonx/client.ts
console.log("Request:", { prompt, parameters });
console.log("Response:", data);
```

### Verify Configuration

Check if environment variables are loaded:

```typescript
import { watsonxConfig } from "@/config/watsonx";
console.log("Config:", {
  hasApiKey: !!watsonxConfig.apiKey,
  hasProjectId: !!watsonxConfig.projectId,
  modelId: watsonxConfig.modelId,
});
```

---

## Security Considerations

1. **Never expose API keys**: Keep `.env.local` out of version control
2. **Use environment variables**: Don't hardcode credentials
3. **Implement authentication**: Protect API routes in production
4. **Rate limiting**: Prevent abuse of generation endpoints
5. **Input validation**: Sanitize user prompts before sending to watsonx.ai

---

## Resources

- [watsonx.ai Documentation](https://www.ibm.com/docs/en/watsonx-as-a-service)
- [IBM Cloud API Keys](https://cloud.ibm.com/docs/account?topic=account-userapikey)
- [watsonx.ai Models](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=models-supported-foundation)
- [NullRift UI Architecture](../architecture.md)

---

## Support

For issues related to:
- **watsonx.ai API**: Contact IBM Cloud Support
- **NullRift UI**: Open an issue on GitHub
- **Integration**: Check this documentation first

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0

---

Made with Bob 🤖