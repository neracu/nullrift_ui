# 🚀 NullRift UI

<div align="center">

**AI-Powered UI Component Generator**

Transform natural language descriptions into production-ready React components using IBM watsonx.ai

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Demo](#-demo) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

NullRift UI is an intelligent UI component generator that leverages IBM watsonx.ai to create interactive, production-ready React components from natural language descriptions. Built with Next.js 16, TypeScript, and Tailwind CSS, it provides a seamless experience for generating, customizing, and exporting clean, maintainable code.

### 🎯 Key Innovation

Unlike static code generators, NullRift UI creates **fully interactive previews** you can click and test in real-time, with a visual tuning panel for customization—no coding required until you're ready to export.

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Natural Language Input**: Describe your component in plain English
- **Intelligent Parsing**: watsonx.ai understands context and requirements
- **Smart Code Generation**: Produces clean, semantic, and accessible code

### 🎨 Real-Time Preview & Interaction
- **Live Component Rendering**: See your component come to life instantly
- **Interactive Testing**: Click buttons, fill forms, test validation
- **Responsive Preview**: Test across different screen sizes

### ⚙️ Visual Fine-Tuning
- **Style Controls**: Adjust colors, spacing, borders, and typography
- **Structure Editor**: Add, remove, or reorder form fields
- **Behavior Settings**: Configure validation, animations, and interactions
- **Theme Toggle**: Switch between light and dark modes

### 📦 Multi-Format Export
- **React Components**: TypeScript + Tailwind CSS
- **Vue.js Components**: Vue 3 with Composition API
- **HTML/CSS**: Standalone HTML with inline styles
- **Clean Code**: Production-ready with proper formatting

### 🎯 Developer Experience
- **Component Library**: Pre-built templates and examples
- **Keyboard Shortcuts**: Efficient workflow navigation
- **Code Syntax Highlighting**: Beautiful code display with Shiki
- **Error Handling**: Graceful error messages and recovery

---

## 🎬 Demo

### Example Workflow

1. **Enter a prompt**: "Create a registration form with email, password, and country selection"
2. **AI generates**: Complete React component with validation
3. **Preview & test**: Interact with the live component
4. **Fine-tune**: Adjust colors, spacing, and structure visually
5. **Export**: Download clean code in your preferred format

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **IBM watsonx.ai** API credentials ([Get started here](https://www.ibm.com/watsonx))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nullrift-ui.git
   cd nullrift-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure watsonx.ai credentials**
   
   Edit `.env.local` and add your credentials:
   ```env
   WATSONX_API_KEY=your_api_key_here
   WATSONX_PROJECT_ID=your_project_id_here
   WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
   WATSONX_API_URL=https://us-south.ml.cloud.ibm.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

### Project Structure

```
nullrift-ui/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── builder/           # Builder page
│   │   ├── login/             # Authentication
│   │   └── pricing/           # Pricing page
│   ├── components/            # React components
│   │   ├── builder/           # Builder-specific components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── landing/           # Landing page components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility functions
│   │   ├── watsonx/          # watsonx.ai integration
│   │   ├── generator/        # Code generation logic
│   │   ├── export/           # Export functionality
│   │   ├── preview/          # Preview system
│   │   └── tuning/           # Fine-tuning controls
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── config/                # Configuration files
├── public/                    # Static assets
├── tests/                     # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
└── docs/                      # Additional documentation
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking

# Testing
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### Core Technologies

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript 6](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **AI**: [IBM watsonx.ai](https://www.ibm.com/watsonx) - Enterprise AI platform
- **Testing**: [Vitest](https://vitest.dev/) - Fast unit testing framework

### Additional Documentation

- 📘 [Architecture Overview](./architecture.md) - System design and architecture
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- 🧪 [Testing Guide](./TESTING_GUIDE.md) - Testing strategy and examples
- 🔌 [watsonx Integration](./docs/watsonx-integration.md) - AI integration details

---

## 🎯 Usage

### Basic Component Generation

1. Navigate to the **Builder** page
2. Enter your component description in the prompt input
3. Adjust fine-tuning parameters (optional):
   - **Complexity**: Simple, Moderate, or Complex
   - **Styling**: Minimal, Balanced, or Rich
   - **Responsiveness**: Mobile-first, Desktop-first, or Adaptive
4. Click **Generate** to create your component
5. Preview and interact with the generated component
6. Use the tuning panel to customize:
   - **Style**: Colors, spacing, borders, typography
   - **Structure**: Add/remove/reorder fields
   - **Behavior**: Validation rules, animations
7. Click **Export** to download your code

### Example Prompts

```
"Create a login form with email and password fields"

"Build a pricing table with three tiers and feature comparison"

"Design a contact form with name, email, message, and file upload"

"Generate a user profile card with avatar, bio, and social links"

"Create a dashboard sidebar with navigation and user menu"
```

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Generate component
- `Ctrl/Cmd + E` - Export code
- `Ctrl/Cmd + K` - Open keyboard shortcuts
- `Escape` - Close modals

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👥 Authors

**NullRift Team**

---

## 🙏 Acknowledgments

- [IBM watsonx.ai](https://www.ibm.com/watsonx) for AI capabilities
- [Aceternity UI](https://ui.aceternity.com/) for design inspiration
- [shadcn/ui](https://ui.shadcn.com/) for component patterns
- The Next.js and React communities

---

## 📞 Support

- 📧 Email: support@nullrift.com
- 💬 Discord: [Join our community](https://discord.gg/nullrift)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nullrift-ui/issues)
- 📖 Docs: [Documentation](./docs)

---

<div align="center">

**Made with ❤️ by the NullRift Team**

⭐ Star us on GitHub if you find this project useful!

</div>