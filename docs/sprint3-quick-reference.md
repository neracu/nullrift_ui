# Sprint 3: Quick Reference Guide

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure watsonx.ai credentials are set
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm run test          # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only

# Build for production
npm run build

# Check health
curl http://localhost:3000/api/health
```

---

## 📁 File Locations

### Backend Files
| File | Purpose | Status |
|------|---------|--------|
| [`src/lib/watsonx/client.ts`](../src/lib/watsonx/client.ts) | WatsonxClient class | ✅ Exists (needs enhancement) |
| `src/lib/watsonx/prompts.ts` | Prompt templates | ❌ To create |
| `src/lib/watsonx/parser.ts` | Response parser | ❌ To create |
| `src/lib/generator/code-builder.ts` | Code generator | ❌ To create |
| [`src/app/api/generate/route.ts`](../src/app/api/generate/route.ts) | API endpoint | ✅ Exists (needs enhancement) |

### Frontend Files
| File | Purpose | Status |
|------|---------|--------|
| `src/components/builder/prompt-input.tsx` | Prompt input UI | ❌ To create |
| `src/components/builder/generation-loading.tsx` | Loading state | ❌ To create |
| `src/components/builder/generation-error.tsx` | Error display | ❌ To create |
| `src/app/builder/page.tsx` | Builder page | ❌ To create |

### Configuration Files
| File | Purpose | Status |
|------|---------|--------|
| [`src/config/watsonx.ts`](../src/config/watsonx.ts) | watsonx config | ✅ Exists |
| `src/config/example-prompts.ts` | Example prompts | ❌ To create |

### Type Definitions
| File | Purpose | Status |
|------|---------|--------|
| [`src/lib/watsonx/types.ts`](../src/lib/watsonx/types.ts) | watsonx types | ✅ Exists |
| `src/types/component.ts` | Component schema | ❌ To create |
| `src/types/generation.ts` | Generation types | ❌ To create |

---

## 🔧 Key Functions to Implement

### 1. Enhanced WatsonxClient
```typescript
// src/lib/watsonx/client.ts

class WatsonxClient {
  // Add retry logic
  async generateWithRetry(request: GenerationRequest): Promise<GenerationResponse>
  
  // Add timeout handling
  async generateWithTimeout(request: GenerationRequest, timeout: number): Promise<GenerationResponse>
  
  // Add caching
  async getCachedOrGenerate(request: GenerationRequest): Promise<GenerationResponse>
}
```

### 2. Prompt Templates
```typescript
// src/lib/watsonx/prompts.ts

export function buildEnhancedPrompt(
  userPrompt: string,
  category?: ComponentCategory
): string

export const PROMPT_TEMPLATES: Record<ComponentCategory, PromptTemplate>

export const FEW_SHOT_EXAMPLES: FewShotExample[]
```

### 3. Response Parser
```typescript
// src/lib/watsonx/parser.ts

export function extractJSON(text: string): object

export function validateSchema(data: unknown): ComponentSchema

export function parseAndValidate(text: string): ComponentSchema

export function handleParseError(error: Error): ParsedResponse
```

### 4. Code Generator
```typescript
// src/lib/generator/code-builder.ts

export class CodeBuilder {
  generateReactComponent(schema: ComponentSchema): GeneratedCode
  
  generateTypeDefinitions(schema: ComponentSchema): string
  
  generateValidationLogic(fields: FieldDefinition[]): string
  
  formatCode(code: string): string
}
```

---

## 🎨 Component Props

### PromptInput
```typescript
interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  examples: ExamplePrompt[];
  placeholder?: string;
  maxLength?: number;
}
```

### GenerationLoading
```typescript
interface GenerationLoadingProps {
  stage: 'analyzing' | 'generating' | 'validating' | 'building';
  progress: number; // 0-100
  onCancel?: () => void;
  estimatedTime?: number; // seconds
}
```

### GenerationError
```typescript
interface GenerationErrorProps {
  error: string;
  details?: string;
  onRetry: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
}
```

---

## 🧪 Test Examples

### Unit Test Template
```typescript
// tests/unit/watsonx/client.test.ts

describe('WatsonxClient', () => {
  let client: WatsonxClient;
  
  beforeEach(() => {
    client = new WatsonxClient(mockConfig);
  });
  
  it('should generate component successfully', async () => {
    const result = await client.generateComponent({
      prompt: 'Create a button'
    });
    
    expect(result.schema).toBeDefined();
    expect(result.schema.name).toBe('Button');
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    await expect(
      client.generateComponent({ prompt: '' })
    ).rejects.toThrow();
  });
});
```

### Integration Test Template
```typescript
// tests/integration/api/generate.test.ts

describe('POST /api/generate', () => {
  it('should generate component from prompt', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Create a login form' })
      .expect(200);
    
    expect(response.body.schema).toBeDefined();
    expect(response.body.metadata).toBeDefined();
  });
});
```

---

## 📊 API Reference

### POST /api/generate

**Request:**
```json
{
  "prompt": "Create a contact form with name, email, and message",
  "parameters": {
    "max_tokens": 2000,
    "temperature": 0.7,
    "top_p": 0.9
  }
}
```

**Response (Success):**
```json
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

**Response (Error):**
```json
{
  "error": "Generation failed",
  "details": "Invalid response format from watsonx.ai",
  "code": "PARSE_ERROR"
}
```

### GET /api/health

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "watsonx": {
    "configured": true,
    "modelId": "ibm/granite-13b-chat-v2"
  }
}
```

---

## 🎯 Example Prompts

### Forms
```
✅ "Create a login form with email and password fields"
✅ "Build a user registration form with password strength indicator"
✅ "Design a contact form with name, email, phone, and message"
✅ "Make a survey form with multiple choice and text questions"
```

### Cards
```
✅ "Create a product card with image, title, price, and add to cart button"
✅ "Build a user profile card with avatar, name, bio, and social links"
✅ "Design a blog post card with thumbnail, title, excerpt, and read more"
✅ "Make a pricing card with features list and CTA button"
```

### Modals
```
✅ "Create a confirmation modal for delete actions"
✅ "Build a success modal with animation"
✅ "Design a form modal for adding new items"
✅ "Make an alert modal with different severity levels"
```

---

## 🚨 Common Issues & Solutions

### Issue: "Missing required watsonx.ai configuration"
**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify environment variables
echo $WATSONX_API_KEY
echo $WATSONX_PROJECT_ID
```

### Issue: "Invalid response format from watsonx.ai"
**Solution:**
- Check prompt clarity
- Adjust temperature (lower = more structured)
- Try different model
- Check few-shot examples

### Issue: "Rate limit exceeded"
**Solution:**
- Implement request debouncing
- Add caching layer
- Use exponential backoff
- Monitor API usage

### Issue: "Code generation failed"
**Solution:**
- Validate schema structure
- Check field definitions
- Verify styling config
- Review error logs

---

## 📈 Performance Checklist

### Backend
- [ ] Response time <2s average
- [ ] Retry logic with exponential backoff
- [ ] Request caching implemented
- [ ] Error handling comprehensive
- [ ] Logging detailed but not verbose

### Frontend
- [ ] Loading states smooth
- [ ] Error messages clear
- [ ] Input validation immediate
- [ ] UI responsive on mobile
- [ ] Animations performant

### Testing
- [ ] Unit tests >85% coverage
- [ ] Integration tests pass
- [ ] E2E tests cover main flows
- [ ] Performance tests included
- [ ] Error scenarios tested

---

## 🔍 Debugging Tips

### Enable Debug Logging
```typescript
// In watsonx/client.ts
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Request:', { prompt, parameters });
  console.log('Response:', data);
}
```

### Test API Directly
```bash
# Test generation endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple button"}'

# Test health endpoint
curl http://localhost:3000/api/health
```

### Check watsonx.ai Configuration
```typescript
import { watsonxConfig } from '@/config/watsonx';

console.log('Config:', {
  hasApiKey: !!watsonxConfig.apiKey,
  hasProjectId: !!watsonxConfig.projectId,
  modelId: watsonxConfig.modelId,
  apiUrl: watsonxConfig.apiUrl
});
```

---

## 📚 Additional Resources

### Documentation
- [watsonx.ai Docs](https://www.ibm.com/docs/en/watsonx-as-a-service)
- [IBM Cloud API Keys](https://cloud.ibm.com/docs/account?topic=account-userapikey)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Internal Docs
- [Architecture Overview](../architecture.md)
- [Sprint 3 Plan](../SPRINT3_PLAN.md)
- [Sprint 3 Workflow](./sprint3-workflow.md)
- [watsonx Integration Guide](./watsonx-integration.md)

---

## ✅ Pre-Implementation Checklist

Before starting implementation:

- [ ] Read [`SPRINT3_PLAN.md`](../SPRINT3_PLAN.md)
- [ ] Review [`architecture.md`](../architecture.md) Sprint 3 section
- [ ] Check [`docs/watsonx-integration.md`](./watsonx-integration.md)
- [ ] Verify `.env.local` is configured
- [ ] Understand existing code structure
- [ ] Review todo list
- [ ] Set up development environment
- [ ] Run existing tests to ensure baseline

---

## 🎯 Success Criteria Summary

### Must Have
✅ Working generation pipeline  
✅ Robust error handling  
✅ User-friendly interface  
✅ Basic test coverage  
✅ Documentation complete

### Nice to Have
⭐ Advanced caching  
⭐ Performance optimization  
⭐ Comprehensive examples  
⭐ Advanced error recovery  
⭐ Analytics integration

---

**Made with ❤️ by Bob**