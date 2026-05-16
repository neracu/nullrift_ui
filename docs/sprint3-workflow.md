# Sprint 3: Development Workflow & Architecture

## 🔄 Complete Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant PromptInput
    participant API
    participant WatsonxClient
    participant Parser
    participant CodeGen
    participant Preview

    User->>PromptInput: Enter prompt
    PromptInput->>PromptInput: Validate input
    PromptInput->>API: POST /api/generate
    API->>WatsonxClient: generateComponent()
    
    WatsonxClient->>WatsonxClient: buildEnhancedPrompt()
    WatsonxClient->>watsonx.ai: API Request
    
    alt Success
        watsonx.ai-->>WatsonxClient: Generated text
        WatsonxClient->>Parser: parseResponse()
        Parser->>Parser: extractJSON()
        Parser->>Parser: validateSchema()
        Parser-->>WatsonxClient: ComponentSchema
        
        WatsonxClient->>CodeGen: generateCode()
        CodeGen->>CodeGen: buildReactComponent()
        CodeGen->>CodeGen: formatCode()
        CodeGen-->>WatsonxClient: Generated code
        
        WatsonxClient-->>API: GenerationResponse
        API-->>PromptInput: Success response
        PromptInput->>Preview: Render component
        Preview-->>User: Display preview
    else Error
        watsonx.ai-->>WatsonxClient: Error
        WatsonxClient->>WatsonxClient: handleError()
        WatsonxClient->>WatsonxClient: retryWithBackoff()
        alt Retry Success
            WatsonxClient-->>API: Success
        else Retry Failed
            WatsonxClient-->>API: Error response
            API-->>PromptInput: Error
            PromptInput-->>User: Show error message
        end
    end
```

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend
        A[Prompt Input] --> B[Loading State]
        B --> C[Preview/Error]
        D[Example Prompts] --> A
    end
    
    subgraph API Layer
        E[/api/generate] --> F[Request Validator]
        F --> G[Rate Limiter]
        G --> H[WatsonxClient]
    end
    
    subgraph Generation Pipeline
        H --> I[Prompt Builder]
        I --> J[watsonx.ai API]
        J --> K[Response Parser]
        K --> L[Schema Validator]
        L --> M[Code Generator]
    end
    
    subgraph Storage
        N[(Cache)] -.-> H
        O[(Logs)] -.-> E
    end
    
    A -->|POST| E
    M -->|Response| E
    E -->|JSON| C
    
    style A fill:#e1f5ff
    style M fill:#d4edda
    style J fill:#fff3cd
```

## 📊 Component Hierarchy

```mermaid
graph TD
    A[Builder Page] --> B[Navbar]
    A --> C[Prompt Section]
    A --> D[Result Section]
    
    C --> E[Prompt Input]
    C --> F[Example Dropdown]
    C --> G[Generate Button]
    
    D --> H{State}
    H -->|Loading| I[Generation Loading]
    H -->|Error| J[Generation Error]
    H -->|Success| K[Component Preview]
    
    I --> L[Progress Bar]
    I --> M[Stage Indicator]
    I --> N[Cancel Button]
    
    J --> O[Error Message]
    J --> P[Retry Button]
    J --> Q[Error Details]
    
    K --> R[Preview Frame]
    K --> S[Code Tabs]
    K --> T[Export Button]
    
    style A fill:#f0f0f0
    style H fill:#fff3cd
    style K fill:#d4edda
```

## 🔧 Data Flow

```mermaid
flowchart LR
    A[User Prompt] --> B{Validate}
    B -->|Valid| C[Build Enhanced Prompt]
    B -->|Invalid| D[Show Error]
    
    C --> E[Add System Context]
    E --> F[Add Few-Shot Examples]
    F --> G[Add Instructions]
    
    G --> H[Send to watsonx.ai]
    H --> I{Response OK?}
    
    I -->|Yes| J[Extract JSON]
    I -->|No| K{Retry?}
    
    K -->|Yes| L[Exponential Backoff]
    L --> H
    K -->|No| M[Return Error]
    
    J --> N[Validate Schema]
    N --> O{Valid?}
    
    O -->|Yes| P[Generate Code]
    O -->|No| Q[Use Fallback]
    
    P --> R[Format Code]
    R --> S[Return Result]
    Q --> S
    
    style A fill:#e1f5ff
    style S fill:#d4edda
    style M fill:#f8d7da
```

## 🎯 Implementation Phases

```mermaid
gantt
    title Sprint 3 Timeline (12 Hours)
    dateFormat HH
    axisFormat %H
    
    section Backend
    Enhance WatsonxClient     :a1, 06, 2h
    Create Prompt Templates   :a2, after a1, 2h
    Build Response Parser     :a3, after a2, 2h
    Implement Code Generator  :a4, after a3, 2h
    
    section Frontend
    Prompt Input Component    :b1, 10, 2h
    Loading State Component   :b2, after b1, 1h
    Error Display Component   :b3, after b2, 1h
    Builder Page Layout       :b4, after b3, 2h
    
    section Testing
    Unit Tests               :c1, 14, 1h
    Integration Tests        :c2, after c1, 1h
    E2E Tests               :c3, after c2, 1h
    
    section Polish
    Documentation           :d1, 17, 0.5h
    Performance Optimization :d2, after d1, 0.5h
```

## 🧪 Testing Strategy

```mermaid
graph TB
    A[Testing Strategy] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    
    B --> B1[WatsonxClient]
    B --> B2[Parser]
    B --> B3[Code Generator]
    B --> B4[Components]
    
    C --> C1[API Endpoints]
    C --> C2[Error Handling]
    C --> C3[Rate Limiting]
    
    D --> D1[Generation Flow]
    D --> D2[Error Recovery]
    D --> D3[User Interactions]
    
    B1 --> E[Jest]
    B2 --> E
    B3 --> E
    B4 --> F[React Testing Library]
    
    C1 --> G[Supertest]
    C2 --> G
    C3 --> G
    
    D1 --> H[Playwright]
    D2 --> H
    D3 --> H
    
    style A fill:#f0f0f0
    style E fill:#d4edda
    style F fill:#d4edda
    style G fill:#d4edda
    style H fill:#d4edda
```

## 🚨 Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type?}
    
    B -->|Config Error| C[Show Setup Instructions]
    B -->|API Error| D{Status Code?}
    B -->|Parse Error| E[Try Fallback]
    B -->|Generation Error| F[Log & Notify]
    
    D -->|429 Rate Limit| G[Wait & Retry]
    D -->|401/403 Auth| H[Check Credentials]
    D -->|500 Server| I[Retry with Backoff]
    D -->|408 Timeout| J[Retry Once]
    
    G --> K{Retry Count?}
    I --> K
    J --> K
    
    K -->|< Max| L[Exponential Backoff]
    K -->|>= Max| M[Show Error to User]
    
    L --> N[Retry Request]
    N --> O{Success?}
    
    O -->|Yes| P[Return Result]
    O -->|No| K
    
    C --> M
    E --> M
    F --> M
    H --> M
    
    M --> Q[User Action Required]
    
    style A fill:#f8d7da
    style P fill:#d4edda
    style Q fill:#fff3cd
```

## 📦 Module Dependencies

```mermaid
graph LR
    A[Builder Page] --> B[Prompt Input]
    A --> C[Generation Loading]
    A --> D[Generation Error]
    A --> E[Component Preview]
    
    B --> F[/api/generate]
    F --> G[WatsonxClient]
    
    G --> H[Prompt Templates]
    G --> I[Response Parser]
    G --> J[watsonx.ai API]
    
    I --> K[Schema Validator]
    K --> L[Code Generator]
    
    L --> M[Code Formatters]
    L --> N[Template Engine]
    
    style A fill:#e1f5ff
    style F fill:#fff3cd
    style L fill:#d4edda
```

## 🎨 UI State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Validating: User enters prompt
    Validating --> Idle: Invalid input
    Validating --> Generating: Valid input
    
    Generating --> Loading: API call started
    Loading --> Success: Generation complete
    Loading --> Error: Generation failed
    
    Error --> Idle: User dismisses
    Error --> Generating: User retries
    
    Success --> Previewing: Show component
    Previewing --> Editing: User modifies
    Editing --> Generating: Regenerate
    
    Previewing --> Exporting: User exports
    Exporting --> Success: Export complete
    
    Success --> Idle: Start new
    
    note right of Loading
        Show progress:
        - Analyzing
        - Generating
        - Validating
        - Building
    end note
    
    note right of Error
        Show:
        - Error message
        - Retry button
        - Error details
    end note
```

## 🔐 Security Flow

```mermaid
flowchart TD
    A[User Request] --> B[Rate Limiter]
    B --> C{Within Limits?}
    
    C -->|No| D[Return 429]
    C -->|Yes| E[Validate Input]
    
    E --> F{Valid?}
    F -->|No| G[Return 400]
    F -->|Yes| H[Sanitize Prompt]
    
    H --> I[Check API Keys]
    I --> J{Keys Valid?}
    
    J -->|No| K[Return 401]
    J -->|Yes| L[Make API Call]
    
    L --> M[Validate Response]
    M --> N{Safe?}
    
    N -->|No| O[Filter Content]
    N -->|Yes| P[Return Result]
    
    O --> P
    
    style D fill:#f8d7da
    style G fill:#f8d7da
    style K fill:#f8d7da
    style P fill:#d4edda
```

## 📈 Performance Optimization

```mermaid
graph TB
    A[Performance Strategy] --> B[Caching]
    A --> C[Code Splitting]
    A --> D[Lazy Loading]
    A --> E[Optimization]
    
    B --> B1[Response Cache]
    B --> B2[Schema Cache]
    B --> B3[Code Cache]
    
    C --> C1[Route-based Splitting]
    C --> C2[Component Splitting]
    
    D --> D1[Preview Components]
    D --> D2[Heavy Libraries]
    
    E --> E1[Debounce Input]
    E --> E2[Memoize Results]
    E --> E3[Virtual Scrolling]
    
    style A fill:#f0f0f0
    style B fill:#d4edda
    style C fill:#d4edda
    style D fill:#d4edda
    style E fill:#d4edda
```

---

## 🎯 Key Takeaways

### Critical Path
1. **Prompt Engineering** → Better generation quality
2. **Error Handling** → Robust user experience
3. **Code Generation** → Production-ready output
4. **Testing** → Confidence in deployment

### Success Metrics
- ⚡ <2s API response time
- ✅ >95% parser success rate
- 🎨 Beautiful, responsive UI
- 🧪 >85% test coverage
- 📚 Complete documentation

### Risk Mitigation
- Implement retry logic early
- Add comprehensive error handling
- Test with various prompts
- Monitor API usage
- Cache successful generations

---

**Made with ❤️ by Bob**