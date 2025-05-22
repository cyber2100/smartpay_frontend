# Project Overview

A modern web application built with cutting-edge technologies to deliver a seamless user experience.

## Technologies

This project is built with:

- **Vite** - Next-generation frontend tooling
- **TypeScript** - Typed JavaScript for better developer experience
- **React** - Component-based UI library
- **shadcn-ui** - Beautifully designed components built with Radix UI and Tailwind
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository

```sh
git clone <your-repository-url>
```

2. Navigate to the project directory

```sh
cd <project-directory>
```

3. Install dependencies

```sh
npm install
# or
yarn install
```

4. Start the development server

```sh
npm run dev
# or
yarn dev
```

5. Open your browser and visit: `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Check TypeScript types

## Deployment

### Building for Production

```sh
npm run build
# or
yarn build
```

This will generate a `dist` directory with your compiled code that's ready to be deployed.

### Deployment Options

- **Static Hosting** - Deploy the `dist` directory to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
- **Docker** - Use the included Dockerfile to containerize the application
- **Traditional Hosting** - Upload the `dist` directory to any web server
