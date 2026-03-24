# XCAPE Frontend

A modern React + TypeScript + Vite frontend for the XCAPE automated reservoir history matching platform.

## Features

- ⚛️ **React 18** with TypeScript
- 🎨 **Material UI** for professional UI components
- 🌓 **Dark/Light Mode** toggle with Redux state management
- 📱 **Responsive Design** for mobile and desktop
- 🗂️ **Path Aliases** for cleaner imports
- 🚀 **Vite** for fast development and builds
- 📊 **Recharts** for data visualization
- 🛣️ **React Router** for navigation

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5
- **Build Tool**: Vite
- **UI Libraries**: Material UI v5 + Tailwind CSS v3
- **State Management**: Redux Toolkit
- **Styling**: Material UI Emotion + Tailwind CSS
- **Charts**: Recharts
- **Router**: React Router v6

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── store/           # Redux store & slices
├── hooks/           # Custom React hooks
├── styles/          # Global styles & theme
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── App.tsx          # Main App component
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Lint

Check code quality:
```bash
npm run lint
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Color Scheme

- **Primary**: #0F4C81 (Deep Blue)
- **Secondary**: #1F7A8C (Teal)
- **Accent**: #F4B400 (Amber/Gold)
- **Background**: #F7F9FC (Light Gray-Blue)
- **Card Surface**: #FFFFFF
- **Text**: #1F2937 (Dark Slate)
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444

## Pages

- **Home**: Landing page with key concepts and CTAs
- **Concepts**: Paginated list of reservoir simulation concepts
- **User Guide**: Instructions on using the XCAPE platform
- **XCAPE Simulator**: Main interactive simulation interface
- **About**: Project details and problem statement
- **Profiles**: Team member and contributor profiles
- **Contact**: Contact form and information

## Path Aliases

Import paths are simplified using path aliases:

```typescript
// Instead of:
import { Button } from '../../../components/Button'

// Use:
import { Button } from '@components/Button'
```

Available aliases:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@hooks/*` → `src/hooks/*`
- `@store/*` → `src/store/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`
- `@styles/*` → `src/styles/*`

## Redux Store

The Redux store includes:

- **theme**: Theme state (light/dark mode)
  - `toggleTheme()`: Switch between light and dark modes
  - `setTheme(mode)`: Set specific theme mode

## Contributing

1. Create a new branch for your feature
2. Follow the existing code structure
3. Ensure TypeScript compilation succeeds
4. Run linter before committing
5. Submit a pull request

## License

This project is part of the XCAPE Final Year Project.

## Support

For issues or questions, please contact the XCAPE development team.
