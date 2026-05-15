# Sprint 1: Foundation & Setup - Implementation Plan
**Duration:** Hours 0-6  
**Goal:** Working Next.js app with watsonx.ai client configured

---

## Overview

This sprint establishes the foundational infrastructure for NullRift UI, including:
- Next.js 14 project setup with TypeScript and Tailwind CSS
- UI component libraries (Shadcn UI + Aceternity UI)
- Complete folder structure
- watsonx.ai integration client
- API routes for generation and health checks

---

## Task Breakdown

### 1. Initialize Next.js 14 Project
**Estimated Time:** 15 minutes

```bash
# Create Next.js project with TypeScript, Tailwind, and App Router
npx create-next-app@latest nullrift-ui --typescript --tailwind --app --eslint

# Navigate to project directory
cd nullrift-ui
```

**Configuration Options:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Turbopack (optional)
- ✅ Import alias (@/*)

---

### 2. Install Core Dependencies
**Estimated Time:** 20 minutes

```bash
# Radix UI primitives (for Shadcn UI)
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slider

# Animation and styling utilities
npm install framer-motion class-variance-authority clsx tailwind-merge

# Development dependencies
npm install -D @types/node typescript eslint prettier eslint-config-prettier
```

**Purpose:**
- **Radix UI:** Accessible, unstyled component primitives
- **Framer Motion:** Animation library for smooth transitions
- **CVA:** Type-safe variant styling
- **clsx + tailwind-merge:** Efficient className management
- **Prettier:** Code formatting

---

### 3. Set Up Shadcn UI
**Estimated Time:** 15 minutes

```bash
# Initialize Shadcn UI
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add button input card select slider label
```

**Configuration:**
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Import alias: @/components

**Components Added:**
- `button.tsx` - Interactive buttons
- `input.tsx` - Form inputs
- `card.tsx` - Content containers
- `select.tsx` - Dropdown selects
- `slider.tsx` - Range sliders
- `label.tsx` - Form labels

---

### 4. Install Aceternity UI Components
**Estimated Time:** 20 minutes

Aceternity UI components need to be manually added. Key components for landing page:

```bash
# Create aceternity directory
mkdir -p src/components/aceternity
```

**Required Components:**
1. `background-beams.tsx` - Animated background effect
2. `text-generate-effect.tsx` - Text animation
3. `hero-highlight.tsx` - Hero section highlights
4. `spotlight.tsx` - Spotlight effect

**Note:** These will be copied from Aceternity UI documentation and adapted for the project.

---

### 5. Create Folder Structure
**Estimated Time:** 30 minutes

```bash
# Create all directories at once
mkdir -p src/app/builder
mkdir -p src/app/api/generate
mkdir -p src/app/api/export
mkdir -p src/app/api/health
mkdir -p src/components/ui
mkdir -p src/components/aceternity
mkdir -p src/components/landing
mkdir -p src/components/builder
mkdir -p src/components/generated
mkdir -p src/lib/watsonx
mkdir -p src/lib/generator
mkdir -p src/lib/preview
mkdir -p src/lib/tuning
mkdir -p src/lib/export
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/config
mkdir -p public/examples
mkdir -p public/videos
mkdir -p public/images
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p docs

# Create .gitkeep files for empty directories
touch src/components/generated/.gitkeep
touch public/examples/.gitkeep
touch public/videos/.gitkeep
touch public/images/.gitkeep
touch tests/unit/.gitkeep
touch tests/e2e/.gitkeep
```

**Folder Structure Verification:**
```
nullrift_ui/
├── src/
│   ├── app/
│   │   ├── builder/
│   │   └── api/
│   │       ├── generate/
│   │       ├── export/
│   │       └── health/
│   ├── components/
│   │   ├── ui/
│   │   ├── aceternity/
│   │   ├── landing/
│   │   ├── builder/
│   │   └── generated/
│   ├── lib/
│   │   ├── watsonx/
│   │   ├── generator/
│   │   ├── preview/
│   │   ├── tuning/
│   │   └── export/
│   ├── hooks/
│   ├── types/
│   └── config/
├── public/
│   ├── examples/
│   ├── videos/
│   └── images/
├── tests/
│   ├── unit/
│   └── e2e/
└── docs/
```

---

### 6. Configure Tailwind CSS
**Estimated Time:** 20 minutes

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Install Animation Plugin:**
```bash
npm install tailwindcss-animate
```

---

### 7. Create Utility Functions
**Estimated Time:** 10 minutes

**File:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

---

### 8. Set Up Basic Layout
**Estimated Time:** 15 minutes

**File:** `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NullRift UI - AI-Powered Component Generator",
  description: "Generate production-ready UI components with AI in seconds",
  keywords: ["AI", "UI", "components", "React", "Next.js", "watsonx.ai"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
      </body>
    </html>
  );
}
```

---

### 9. Create watsonx.ai Client
**Estimated Time:** 45 minutes

**File:** `src/lib/watsonx/types.ts`

```typescript
export interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  modelId: string;
  apiUrl: string;
}

export interface GenerationRequest {
  prompt: string;
  parameters?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
  };
}

export interface ComponentSchema {
  id: string;
  name: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  fields: Array<{
    id: string;
    type: "input" | "select" | "textarea" | "checkbox";
    label: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      pattern?: string;
      message?: string;
    };
  }>;
  styling: {
    theme?: "light" | "dark";
    primaryColor?: string;
    borderRadius?: "sm" | "md" | "lg" | "xl";
    spacing?: "compact" | "normal" | "relaxed";
  };
  layout: "single-column" | "two-column" | "grid";
  createdAt: string;
}

export interface GenerationResponse {
  schema: ComponentSchema;
  metadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
  };
}
```

**File:** `src/lib/watsonx/client.ts`

```typescript
import type {
  WatsonxConfig,
  GenerationRequest,
  GenerationResponse,
  ComponentSchema,
} from "./types";

export class WatsonxClient {
  private config: WatsonxConfig;

  constructor(config: WatsonxConfig) {
    this.config = config;
  }

  async generateComponent(
    request: GenerationRequest
  ): Promise<GenerationResponse> {
    const enhancedPrompt = this.buildPrompt(request.prompt);

    const response = await fetch(
      `${this.config.apiUrl}/ml/v1/text/generation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model_id: this.config.modelId,
          project_id: this.config.projectId,
          input: enhancedPrompt,
          parameters: request.parameters || {
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`watsonx.ai API error: ${response.statusText}`);
    }

    const data = await response.json();
    const schema = this.parseResponse(data.results[0].generated_text);

    return {
      schema,
      metadata: {
        model: this.config.modelId,
        tokensUsed:
          data.results[0].input_token_count +
          data.results[0].generated_token_count,
        generationTime: Date.now(),
      },
    };
  }

  private buildPrompt(userPrompt: string): string {
    return `You are an expert UI/UX designer and React developer. Generate a component schema based on the following request:

User Request: ${userPrompt}

Output a JSON schema with the following structure:
{
  "name": "ComponentName",
  "description": "Brief description",
  "props": [
    {
      "name": "propName",
      "type": "string | number | boolean",
      "required": true,
      "defaultValue": "value"
    }
  ],
  "fields": [
    {
      "id": "field1",
      "type": "input | select | textarea | checkbox",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "validation": {
        "required": true,
        "pattern": "regex pattern",
        "message": "Error message"
      }
    }
  ],
  "styling": {
    "theme": "light | dark",
    "primaryColor": "#hex",
    "borderRadius": "sm | md | lg | xl",
    "spacing": "compact | normal | relaxed"
  },
  "layout": "single-column | two-column | grid"
}

Generate ONLY valid JSON, no additional text.`;
  }

  private parseResponse(text: string): ComponentSchema {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from watsonx.ai");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return this.transformToSchema(parsed);
  }

  private transformToSchema(data: any): ComponentSchema {
    return {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      props: data.props || [],
      fields: data.fields || [],
      styling: data.styling || {},
      layout: data.layout || "single-column",
      createdAt: new Date().toISOString(),
    };
  }
}
```

---

### 10. Configure Environment Variables
**Estimated Time:** 10 minutes

**File:** `.env.local.example`

```bash
# watsonx.ai Configuration
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
WATSONX_API_URL=https://us-south.ml.cloud.ibm.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**File:** `src/config/watsonx.ts`

```typescript
export const watsonxConfig = {
  apiKey: process.env.WATSONX_API_KEY || "",
  projectId: process.env.WATSONX_PROJECT_ID || "",
  modelId: process.env.WATSONX_MODEL_ID || "ibm/granite-13b-chat-v2",
  apiUrl: process.env.WATSONX_API_URL || "https://us-south.ml.cloud.ibm.com",
};

export function validateWatsonxConfig() {
  const required = ["apiKey", "projectId"];
  const missing = required.filter((key) => !watsonxConfig[key as keyof typeof watsonxConfig]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required watsonx.ai configuration: ${missing.join(", ")}`
    );
  }
}
```

**Setup Instructions:**
```bash
# Copy example to actual .env.local
cp .env.local.example .env.local

# Edit .env.local with your actual credentials
# (User will need to provide their watsonx.ai credentials)
```

---

### 11. Create API Routes
**Estimated Time:** 30 minutes

**File:** `src/app/api/generate/route.ts`

```typescript
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
```

**File:** `src/app/api/health/route.ts`

```typescript
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
```

---

### 12. Create Site Configuration
**Estimated Time:** 10 minutes

**File:** `src/config/site.ts`

```typescript
export const siteConfig = {
  name: "NullRift UI",
  description: "AI-Powered Component Generator",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/yourusername/nullrift-ui",
    twitter: "https://twitter.com/nullrift",
  },
};
```

---

### 13. Update Package.json Scripts
**Estimated Time:** 5 minutes

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 14. Create Initial Documentation
**Estimated Time:** 15 minutes

**File:** `docs/watsonx-integration.md`

```markdown
# watsonx.ai Integration Guide

## Setup

1. Obtain watsonx.ai credentials from IBM Cloud
2. Copy `.env.local.example` to `.env.local`
3. Fill in your credentials:
   - `WATSONX_API_KEY`
   - `WATSONX_PROJECT_ID`

## API Usage

### Generate Component

```typescript
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Create a contact form with name, email, and message fields",
    parameters: {
      max_tokens: 2000,
      temperature: 0.7,
    },
  }),
});

const data = await response.json();
```

## Testing

Check health endpoint:
```bash
curl http://localhost:3000/api/health
```
```

---

### 15. Verification Checklist
**Estimated Time:** 15 minutes

Run these commands to verify setup:

```bash
# 1. Check dependencies
npm list --depth=0

# 2. Type check
npm run type-check

# 3. Lint check
npm run lint

# 4. Start development server
npm run dev

# 5. Test health endpoint
curl http://localhost:3000/api/health

# 6. Verify folder structure
tree -L 3 src/
```

**Expected Results:**
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Dev server runs on http://localhost:3000
- ✅ Health endpoint returns 200 OK
- ✅ All folders created correctly

---

## Deliverables

At the end of Sprint 1, you should have:

1. ✅ Working Next.js 14 application
2. ✅ Complete folder structure
3. ✅ Shadcn UI + Aceternity UI installed
4. ✅ watsonx.ai client configured
5. ✅ API routes functional
6. ✅ Environment variables set up
7. ✅ Basic documentation created

---

## Next Steps (Sprint 2)

- Build landing page with hero section
- Implement Aceternity UI effects
- Create "How It Works" section
- Add demo video placeholder

---

## Troubleshooting

### Common Issues

**Issue:** `WATSONX_API_KEY is not defined`
- **Solution:** Copy `.env.local.example` to `.env.local` and add credentials

**Issue:** Shadcn UI components not found
- **Solution:** Run `npx shadcn-ui@latest add [component]` again

**Issue:** TypeScript errors in watsonx client
- **Solution:** Ensure all types are properly imported from `./types`

**Issue:** Port 3000 already in use
- **Solution:** Kill existing process or use different port: `npm run dev -- -p 3001`

---

## Time Tracking

| Task | Estimated | Actual |
|------|-----------|--------|
| Project initialization | 15 min | ___ |
| Dependencies installation | 20 min | ___ |
| Shadcn UI setup | 15 min | ___ |
| Aceternity UI setup | 20 min | ___ |
| Folder structure | 30 min | ___ |
| Tailwind config | 20 min | ___ |
| Utils creation | 10 min | ___ |
| Layout setup | 15 min | ___ |
| watsonx.ai client | 45 min | ___ |
| Environment config | 10 min | ___ |
| API routes | 30 min | ___ |
| Site config | 10 min | ___ |
| Package.json scripts | 5 min | ___ |
| Documentation | 15 min | ___ |
| Verification | 15 min | ___ |
| **Total** | **4h 45m** | ___ |

**Buffer:** 1h 15m for unexpected issues

---

## Success Criteria

- [ ] `npm run dev` starts without errors
- [ ] `/api/health` returns valid JSON
- [ ] All TypeScript files compile successfully
- [ ] Tailwind CSS classes work correctly
- [ ] Shadcn UI components render properly
- [ ] watsonx.ai client can be instantiated
- [ ] Environment variables load correctly
- [ ] Folder structure matches architecture