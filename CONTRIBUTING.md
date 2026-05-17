# Contributing to NullRift UI

First off, thank you for considering contributing to NullRift UI! It's people like you that make NullRift UI such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@nullrift.com.

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- IBM watsonx.ai API credentials (for testing AI features)

### First Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/nullrift-ui.git
   cd nullrift-ui
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/nullrift/nullrift-ui.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```
6. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Error messages** or console logs

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and motivation
- **Proposed solution** or implementation ideas
- **Alternative solutions** you've considered
- **Mockups or examples** if applicable

### 🔧 Code Contributions

1. **Find an issue** to work on or create a new one
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding standards
5. **Write or update tests** as needed
6. **Update documentation** if required
7. **Submit a pull request**

---

## Development Setup

### Project Structure

```
nullrift-ui/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── config/           # Configuration
├── tests/                # Test files
├── public/               # Static assets
└── docs/                 # Documentation
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript checking

# Testing
npm test                 # Run tests
npm run test:ui          # Tests with UI
npm run test:coverage    # Coverage report
```

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit regularly

3. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Run tests and linting**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow our guidelines
- [ ] Branch is up to date with `main`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass (tests, linting, build)
2. **At least one maintainer** must review and approve
3. **Address feedback** promptly and professionally
4. **Squash commits** if requested
5. **Maintainer will merge** once approved

---

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Define **proper types** (avoid `any`)
- Use **interfaces** for object shapes
- Export types from dedicated files

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Avoid
const user: any = { ... };
```

### React Components

- Use **functional components** with hooks
- Use **TypeScript** for props
- Keep components **small and focused**
- Use **proper naming** (PascalCase for components)

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Styling

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** approach
- Use **CSS variables** for theme values
- Keep styles **consistent** with design system

### File Organization

- **One component per file**
- **Co-locate related files** (component + test + styles)
- Use **index files** for clean imports
- Keep **utilities separate** from components

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **Types/Interfaces**: PascalCase (`UserData`)

---

## Testing Guidelines

### Unit Tests

- Test **individual functions** and components
- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)
- Mock **external dependencies**

```typescript
describe('formatDate', () => {
  it('should format date in ISO format', () => {
    // Arrange
    const date = new Date('2026-01-01');
    
    // Act
    const result = formatDate(date);
    
    // Assert
    expect(result).toBe('2026-01-01');
  });
});
```

### Integration Tests

- Test **component interactions**
- Test **API endpoints**
- Use **realistic data**
- Test **error scenarios**

### Test Coverage

- Aim for **80%+ coverage**
- Focus on **critical paths**
- Don't test **implementation details**
- Test **user behavior**, not code

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(builder): add drag-and-drop component reordering

Implement drag-and-drop functionality for reordering form fields
in the builder interface using @dnd-kit library.

Closes #123
```

```bash
fix(export): resolve Vue component export formatting

Fix indentation and syntax issues in Vue component exports.
Ensure proper script setup and template formatting.

Fixes #456
```

### Best Practices

- Use **present tense** ("add" not "added")
- Use **imperative mood** ("move" not "moves")
- Keep **subject line under 50 characters**
- Capitalize **first letter** of subject
- No **period** at the end of subject
- Separate **subject from body** with blank line
- Wrap **body at 72 characters**
- Reference **issues and PRs** in footer

---

## Questions?

If you have questions, feel free to:

- 💬 Join our [Discord community](https://discord.gg/nullrift)
- 📧 Email us at support@nullrift.com
- 🐛 Open an issue on GitHub

---

## Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributors page (coming soon)

Thank you for contributing to NullRift UI! 🚀