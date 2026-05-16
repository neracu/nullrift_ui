# Sprint 4: Interactive Preview System - Implementation Plan

## 🎯 Sprint Overview

**Duration:** Hours 18-27 (9 hours)  
**Status:** Planning Phase  
**Goal:** Build interactive preview canvas with real-time component rendering

### Sprint Objectives
1. ✅ Create dynamic component renderer
2. ✅ Build state management system
3. ✅ Implement preview canvas with viewport controls
4. ✅ Add real-time updates
5. ✅ Support interactive elements

---

## 📋 Task Breakdown

### Phase 1: Core Preview Infrastructure (Hours 18-21)

#### 1.1 Dynamic Component Renderer
**File:** `src/lib/preview/renderer.tsx`

**Features:**
- Use React.createElement for dynamic rendering
- Handle form state management
- Implement validation logic
- Support all field types
- Error boundary for safety

#### 1.2 State Manager
**File:** `src/lib/preview/state-manager.ts`

**Features:**
- Track form values
- Handle validation errors
- Manage component lifecycle
- Event handling
- State persistence

#### 1.3 Preview Hook
**File:** `src/hooks/use-preview.ts`

**Features:**
- Manage preview state
- Handle user interactions
- Update code in real-time
- Viewport management
- Theme switching

### Phase 2: Preview Canvas UI (Hours 21-24)

#### 2.1 Preview Canvas Component
**File:** `src/components/builder/preview-canvas.tsx`

**Features:**
- Iframe isolation for safety
- Viewport switcher (mobile/tablet/desktop)
- Interactive component rendering
- Real-time updates
- Loading states

#### 2.2 Preview Controls
**File:** `src/components/builder/preview-controls.tsx`

**Features:**
- Zoom in/out
- Viewport selection
- Theme toggle (light/dark)
- Reset button
- Refresh button

#### 2.3 Code Display
**File:** `src/components/builder/code-display.tsx`

**Features:**
- Syntax highlighting
- Copy to clipboard
- Download as file
- Multiple tabs (Component, Types, Styles)

### Phase 3: Integration & Polish (Hours 24-27)

#### 3.1 Builder Page
**File:** `src/app/builder/page.tsx`

**Features:**
- Complete layout
- State management
- Component integration
- Responsive design

#### 3.2 Component Preview
**File:** `src/components/builder/component-preview.tsx`

**Features:**
- Generated component display
- Schema information
- Metadata display

---

## 🏗️ Architecture

```
Builder Page
├── Prompt Input
├── Generation Loading/Error
└── Result Section
    ├── Preview Canvas
    │   ├── Viewport Controls
    │   ├── Preview Frame (iframe)
    │   └── Interactive Component
    └── Code Display
        ├── Component Tab
        ├── Types Tab
        └── Styles Tab
```

---

## 📦 Implementation Details

### Dynamic Renderer Strategy

```typescript
// Use React.createElement for dynamic rendering
const renderField = (field: FieldDefinition) => {
  switch (field.type) {
    case 'input':
      return React.createElement('input', {
        type: 'text',
        value: state[field.id],
        onChange: (e) => handleChange(field.id, e.target.value)
      });
    // ... other field types
  }
};
```

### State Management

```typescript
interface PreviewState {
  formData: Record<string, any>;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
}
```

### Viewport Sizes

```typescript
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};
```

---

## 🎨 Design System

- Glassmorphic preview frame
- Smooth viewport transitions
- Interactive controls
- Syntax-highlighted code
- Responsive layout

---

## ✅ Success Criteria

- [ ] Components render dynamically
- [ ] Form state works correctly
- [ ] Validation displays properly
- [ ] Viewport switching is smooth
- [ ] Code display is accurate
- [ ] Theme toggle works
- [ ] Mobile responsive

---

**Made with ❤️ by Bob**