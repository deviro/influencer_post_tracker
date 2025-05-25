# Influencer Post Tracker

A modern React application built with Vite, TypeScript, Tailwind CSS, and shadcn/ui components. This project demonstrates a clean table-based interface for tracking influencer data and is configured for deployment to GitHub Pages.

## Features

- 🚀 **Modern Stack**: React 18 + TypeScript + Vite
- 🎨 **Beautiful UI**: shadcn/ui components with Tailwind CSS
- 📊 **Table Components**: Fully featured data tables with search functionality
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔍 **Search & Filter**: Real-time search across influencer data
- 🚀 **GitHub Pages Ready**: Automated deployment workflow

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **GitHub Actions** - Automated deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/influencer_post_tracker.git
cd influencer_post_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles with Tailwind
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Push to main branch**:
   - The workflow will automatically trigger on push to main
   - Your app will be available at: `https://yourusername.github.io/influencer_post_tracker/`

### Manual Deployment:

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## Adding New Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Popular components for data applications:
- `dialog` - Modal dialogs
- `form` - Form components
- `select` - Dropdown selects
- `badge` - Status badges
- `pagination` - Table pagination

## Customization

### Tailwind Configuration
Edit `tailwind.config.js` to customize your design system.

### shadcn/ui Theme
Modify `src/index.css` to adjust the color scheme and styling.

### Adding New Features
The app structure supports easy extension:
- Add new data types in the interfaces
- Create new table components
- Implement CRUD operations
- Add data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own applications.

---

Built with ❤️ using React, TypeScript, and shadcn/ui
