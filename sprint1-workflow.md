# Sprint 1 Workflow Diagram

## Execution Flow

```mermaid
graph TD
    A[Start Sprint 1] --> B[Initialize Next.js Project]
    B --> C[Install Dependencies]
    C --> D[Set Up UI Libraries]
    D --> E[Create Folder Structure]
    E --> F[Configure Tailwind CSS]
    F --> G[Create Utility Functions]
    G --> H[Set Up Layout]
    H --> I[Implement watsonx.ai Client]
    I --> J[Configure Environment]
    J --> K[Create API Routes]
    K --> L[Verify Setup]
    L --> M[Sprint 1 Complete]
    
    style A fill:#e1f5ff
    style M fill:#c8e6c9
    style I fill:#fff9c4
    style K fill:#fff9c4
```

## Dependency Chain

```mermaid
graph LR
    A[Next.js Init] --> B[Dependencies]
    B --> C[Shadcn UI]
    B --> D[Aceternity UI]
    C --> E[Folder Structure]
    D --> E
    E --> F[Utils & Config]
    F --> G[watsonx Client]
    G --> H[API Routes]
    H --> I[Verification]
    
    style A fill:#bbdefb
    style G fill:#fff59d
    style H fill:#fff59d
    style I fill:#a5d6a7
```

## Parallel Tasks

```mermaid
gantt
    title Sprint 1 Task Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Setup
    Initialize Project           :00:00, 15m
    Install Dependencies         :00:15, 20m
    
    section UI Libraries
    Shadcn UI Setup             :00:35, 15m
    Aceternity UI Setup         :00:50, 20m
    
    section Structure
    Create Folders              :01:10, 30m
    Configure Tailwind          :01:40, 20m
    
    section Core Files
    Utils & Layout              :02:00, 25m
    watsonx Client              :02:25, 45m
    
    section Integration
    Environment Config          :03:10, 10m
    API Routes                  :03:20, 30m
    Documentation               :03:50, 15m
    
    section Verification
    Testing & Verification      :04:05, 15m
```

## Component Dependencies

```mermaid
graph TB
    subgraph "Foundation Layer"
        A[Next.js 14]
        B[TypeScript]
        C[Tailwind CSS]
    end
    
    subgraph "UI Layer"
        D[Shadcn UI]
        E[Aceternity UI]
        F[Radix UI]
    end
    
    subgraph "Integration Layer"
        G[watsonx.ai Client]
        H[API Routes]
        I[Environment Config]
    end
    
    subgraph "Utility Layer"
        J[Utils Functions]
        K[Type Definitions]
        L[Config Files]
    end
    
    A --> D
    A --> E
    B --> G
    C --> D
    F --> D
    G --> H
    I --> G
    J --> H
    K --> G
    L --> I
    
    style A fill:#2196f3,color:#fff
    style G fill:#ff9800,color:#fff
    style H fill:#ff9800,color:#fff
```

## File Creation Order

```mermaid
flowchart TD
    Start([Start]) --> Init[Initialize Next.js]
    Init --> PkgJson[package.json created]
    PkgJson --> InstallDeps[Install Dependencies]
    InstallDeps --> ShadcnInit[Initialize Shadcn UI]
    ShadcnInit --> CreateDirs[Create Directory Structure]
    
    CreateDirs --> Utils[src/lib/utils.ts]
    CreateDirs --> Layout[src/app/layout.tsx]
    CreateDirs --> Types[src/lib/watsonx/types.ts]
    
    Types --> Client[src/lib/watsonx/client.ts]
    Utils --> Client
    
    Client --> EnvExample[.env.local.example]
    EnvExample --> WatsonxConfig[src/config/watsonx.ts]
    
    WatsonxConfig --> GenRoute[src/app/api/generate/route.ts]
    WatsonxConfig --> HealthRoute[src/app/api/health/route.ts]
    
    GenRoute --> SiteConfig[src/config/site.ts]
    HealthRoute --> SiteConfig
    
    SiteConfig --> TailwindConfig[tailwind.config.ts]
    TailwindConfig --> Docs[docs/watsonx-integration.md]
    Docs --> Verify[Verification & Testing]
    Verify --> End([Sprint 1 Complete])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style Client fill:#fff9c4
    style GenRoute fill:#fff9c4
    style HealthRoute fill:#fff9c4
```

## Critical Path

The critical path for Sprint 1 (tasks that cannot be parallelized):

1. **Initialize Next.js** (15 min) → Must be first
2. **Install Dependencies** (20 min) → Requires project
3. **Shadcn UI Setup** (15 min) → Requires dependencies
4. **Create Folder Structure** (30 min) → Requires project
5. **Create watsonx Client** (45 min) → Requires structure
6. **Create API Routes** (30 min) → Requires client
7. **Verification** (15 min) → Must be last

**Total Critical Path Time:** ~2h 50m

## Parallelizable Tasks

These tasks can be done in parallel after folder structure is created:

- Configure Tailwind CSS
- Create utility functions
- Set up basic layout
- Install Aceternity UI components
- Create documentation

**Time Saved:** ~1h 20m

## Risk Mitigation Points

```mermaid
graph TD
    A[Start] --> B{Dependencies Install OK?}
    B -->|No| C[Check npm/node versions]
    B -->|Yes| D{Shadcn UI Setup OK?}
    
    D -->|No| E[Reinstall Radix UI]
    D -->|Yes| F{watsonx Client Compiles?}
    
    F -->|No| G[Check TypeScript config]
    F -->|Yes| H{API Routes Work?}
    
    H -->|No| I[Check environment variables]
    H -->|Yes| J[Success]
    
    C --> B
    E --> D
    G --> F
    I --> H
    
    style J fill:#4caf50,color:#fff
    style C fill:#ff9800,color:#fff
    style E fill:#ff9800,color:#fff
    style G fill:#ff9800,color:#fff
    style I fill:#ff9800,color:#fff
```

## Checkpoint Schedule

| Time | Checkpoint | Verification |
|------|------------|--------------|
| 0:35 | Dependencies installed | `npm list --depth=0` |
| 1:10 | UI libraries ready | `npx shadcn-ui@latest add button` |
| 1:40 | Folder structure complete | `tree -L 3 src/` |
| 2:25 | Utils & layout working | `npm run type-check` |
| 3:10 | watsonx client implemented | TypeScript compiles |
| 3:50 | API routes created | `curl /api/health` |
| 4:20 | Full verification | Dev server runs |

## Success Metrics

```mermaid
pie title Sprint 1 Completion Criteria
    "Project Setup" : 20
    "UI Libraries" : 15
    "Folder Structure" : 10
    "watsonx Integration" : 30
    "API Routes" : 15
    "Verification" : 10
```

## Team Coordination

```mermaid
sequenceDiagram
    participant IBM Bob
    participant Frontend Team
    participant System
    
    IBM Bob->>System: Initialize Next.js
    IBM Bob->>System: Install dependencies
    IBM Bob->>System: Setup Shadcn UI
    
    par Parallel Work
        IBM Bob->>System: Create watsonx client
        Frontend Team->>System: Install Aceternity UI
        Frontend Team->>System: Setup layout
    end
    
    IBM Bob->>System: Create API routes
    IBM Bob->>System: Configure environment
    
    Frontend Team->>System: Create utils
    Frontend Team->>System: Setup color palette
    
    IBM Bob->>System: Verify setup
    System-->>IBM Bob: All tests pass
    System-->>Frontend Team: Ready for Sprint 2
```

---

## Quick Reference Commands

### Setup Phase
```bash
# Initialize project
npx create-next-app@latest nullrift-ui --typescript --tailwind --app

# Install dependencies
npm install @radix-ui/react-slot framer-motion class-variance-authority clsx tailwind-merge

# Setup Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card select slider label
```

### Verification Phase
```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Start dev server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

### Troubleshooting
```bash
# Clear cache
rm -rf .next node_modules
npm install

# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher
```

---

## Notes

- **Estimated Total Time:** 4-6 hours (including buffer)
- **Critical Dependencies:** Node.js 18+, npm 9+, watsonx.ai credentials
- **Blockers:** watsonx.ai API access required for full testing
- **Fallback:** Mock watsonx client if API not available during setup