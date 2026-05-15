# Sprint 1 Quick Start Guide

**Goal:** Set up NullRift UI foundation in 4-6 hours

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18.x or higher
- ✅ npm 9.x or higher
- ✅ Git installed
- ✅ Code editor (VS Code recommended)
- ✅ watsonx.ai credentials (API key + Project ID)

**Check versions:**
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

---

## Step-by-Step Execution

### Phase 1: Project Initialization (30 minutes)

```bash
# 1. Create Next.js project
npx create-next-app@latest nullrift-ui --typescript --tailwind --app --eslint

# Configuration prompts:
# ✅ TypeScript: Yes
# ✅ ESLint: Yes
# ✅ Tailwind CSS: Yes
# ✅ src/ directory: Yes
# ✅ App Router: Yes
# ❌ Turbopack: No (optional)
# ✅ Import alias: Yes (@/*)

# 2. Navigate to project
cd nullrift-ui

# 3. Install core dependencies
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slider framer-motion class-variance-authority clsx tailwind-merge tailwindcss-animate

# 4. Install dev dependencies
npm install -D @types/node typescript eslint prettier eslint-config-prettier

# 5. Initialize Shadcn UI
npx shadcn-ui@latest init
# Choose: Default style, Slate color, CSS variables: Yes

# 6. Add Shadcn components
npx shadcn-ui@latest add button input card select slider label
```

**Checkpoint:** Run `npm list --depth=0` to verify installations

---

### Phase 2: Folder Structure (30 minutes)

```bash
# Create all directories
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

# Create .gitkeep files
touch src/components/generated/.gitkeep
touch public/examples/.gitkeep
touch public/videos/.gitkeep
touch public/images/.gitkeep
touch tests/unit/.gitkeep
touch tests/e2e/.gitkeep
```

**Checkpoint:** Run `tree -L 3 src/` to verify structure

---

### Phase 3: Core Files (90 minutes)

#### 3.1 Create Utils (10 min)

Create [`src/lib/utils.ts`](src/lib/utils.ts):

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}

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

#### 3.2 Update Layout (15 min)

Update [`src/app/layout.tsx`](src/app/layout.tsx):

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

#### 3.3 Configure Tailwind (20 min)

Update [`tailwind.config.ts`](tailwind.config.ts) - see full config in implementation plan.

#### 3.4 Create watsonx Types (10 min)

Create [`src/lib/watsonx/types.ts`](src/lib/watsonx/types.ts) - see full types in implementation plan.

#### 3.5 Create watsonx Client (45 min)

Create [`src/lib/watsonx/client.ts`](src/lib/watsonx/client.ts) - see full implementation in implementation plan.

**Checkpoint:** Run `npm run type-check` - should have no errors

---

### Phase 4: Configuration (30 minutes)

#### 4.1 Environment Variables (10 min)

Create [`.env.local.example`](.env.local.example):

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

Copy to actual file:
```bash
cp .env.local.example .env.local
# Edit .env.local with your actual credentials
```

#### 4.2 watsonx Config (10 min)

Create [`src/config/watsonx.ts`](src/config/watsonx.ts):

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

#### 4.3 Site Config (10 min)

Create [`src/config/site.ts`](src/config/site.ts):

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

### Phase 5: API Routes (30 minutes)

#### 5.1 Generation Endpoint (20 min)

Create [`src/app/api/generate/route.ts`](src/app/api/generate/route.ts) - see full implementation in implementation plan.

#### 5.2 Health Endpoint (10 min)

Create [`src/app/api/health/route.ts`](src/app/api/health/route.ts) - see full implementation in implementation plan.

**Checkpoint:** Run `npm run type-check` again

---

### Phase 6: Documentation (15 minutes)

Create [`docs/watsonx-integration.md`](docs/watsonx-integration.md) - see template in implementation plan.

---

### Phase 7: Verification (20 minutes)

```bash
# 1. Type check
npm run type-check

# 2. Lint check
npm run lint

# 3. Start dev server
npm run dev

# 4. In another terminal, test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-...",
#   "watsonx": {
#     "configured": true,
#     "modelId": "ibm/granite-13b-chat-v2"
#   }
# }

# 5. Open browser
# Navigate to http://localhost:3000
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Health endpoint returns 200 OK
- [ ] All folders created correctly
- [ ] Environment variables loaded
- [ ] Shadcn UI components available
- [ ] Tailwind CSS working

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/utils'"

**Solution:**
```bash
# Check tsconfig.json has correct paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "WATSONX_API_KEY is not defined"

**Solution:**
```bash
# Ensure .env.local exists and has correct values
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Issue: Shadcn components not found

**Solution:**
```bash
# Reinstall Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card select slider label
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001
```

---

## Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Project initialization | 30 min |
| 2 | Folder structure | 30 min |
| 3 | Core files | 90 min |
| 4 | Configuration | 30 min |
| 5 | API routes | 30 min |
| 6 | Documentation | 15 min |
| 7 | Verification | 20 min |
| **Total** | | **4h 5m** |
| Buffer | Troubleshooting | 1h 55m |
| **Grand Total** | | **6h** |

---

## Success Criteria

✅ **Sprint 1 is complete when:**

1. Next.js dev server runs without errors
2. All TypeScript files compile successfully
3. Health API endpoint returns valid JSON
4. Folder structure matches architecture
5. watsonx.ai client is implemented
6. Environment variables are configured
7. Basic documentation is created

---

## Next Steps

After Sprint 1 completion:

1. **Sprint 2:** Build landing page with hero section
2. **Sprint 3:** Implement watsonx.ai generation engine
3. **Sprint 4:** Create interactive preview system
4. **Sprint 5:** Build UX tuning panel
5. **Sprint 6:** Implement code export system
6. **Sprint 7:** Polish and demo preparation

---

## Resources

- **Implementation Plan:** [`sprint1-implementation-plan.md`](sprint1-implementation-plan.md)
- **Workflow Diagram:** [`sprint1-workflow.md`](sprint1-workflow.md)
- **Architecture:** [`architecture.md`](architecture.md)
- **Shadcn UI:** https://ui.shadcn.com
- **Next.js Docs:** https://nextjs.org/docs
- **watsonx.ai Docs:** https://www.ibm.com/docs/en/watsonx-as-a-service

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed implementation plan
3. Verify all prerequisites are met
4. Check Node.js and npm versions
5. Ensure watsonx.ai credentials are valid

---

**Ready to start? Run the first command:**

```bash
npx create-next-app@latest nullrift-ui --typescript --tailwind --app --eslint
```

Good luck! 🚀