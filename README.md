# NullRift UI

AI-Powered Component Generator with watsonx.ai

## Overview

NullRift UI is an intelligent UI component generator that leverages IBM watsonx.ai to create React components from natural language descriptions. Built with Next.js 16, TypeScript, and Tailwind CSS, it provides a seamless experience for generating, customizing, and exporting production-ready UI components.

## Features

- 🤖 **AI-Powered Generation**: Natural language to React component conversion using watsonx.ai
- 🎨 **Real-time Preview**: Instant visual feedback with live component rendering
- ⚙️ **Fine-tuning Controls**: Adjust complexity, styling, and responsiveness
- 📦 **Multiple Export Formats**: Export as React, Vue, or HTML
- 🎯 **Modern Stack**: Built with Next.js 16, React 19, and TypeScript
- 🌈 **Beautiful UI**: Powered by Tailwind CSS and Framer Motion animations

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **AI**: IBM watsonx.ai

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- IBM watsonx.ai API credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nullrift-ui.git
cd nullrift-ui
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your watsonx.ai credentials:
```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
nullrift-ui/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utility functions and services
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── config/           # Configuration files
├── public/               # Static assets
├── docs/                 # Documentation
└── tests/                # Test files
```

## Usage

1. Navigate to the builder page
2. Enter a natural language description of your desired component
3. Adjust fine-tuning parameters (optional)
4. Click "Generate" to create your component
5. Preview the generated component in real-time
6. Export in your preferred format (React, Vue, or HTML)

## Documentation

For detailed documentation, see the [docs](./docs) directory:
- [watsonx Integration Guide](./docs/watsonx-integration.md)
- [Architecture Overview](./architecture.md)
- [Sprint 1 Implementation Plan](./sprint1-implementation-plan.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

NullRift Team

## Acknowledgments

- IBM watsonx.ai for AI capabilities
- Aceternity UI for design inspiration
- The Next.js and React communities