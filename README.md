# Split Money

A comprehensive React Web PWA clone of Splitwise - Expense splitting and management built with React, TypeScript, and Vite. Split expenses with friends, track balances, and settle up easily.

## 🚀 Features

### Core Expense Management
- 💰 **Expense Splitting**: Split expenses equally, by amount, or by percentage
- 👥 **Groups**: Create groups for shared expenses (roommates, trips, events)
- 📊 **Balance Tracking**: Track who owes whom and settle up easily
- 💳 **Multiple Payment Methods**: Support for various payment methods
- 📱 **Offline Support**: Works offline with local data storage (IndexedDB)

### User Experience
- ✅ **Toast Notifications**: Real-time feedback for all operations
- ⏳ **Loading States**: Skeleton loaders and spinners for better UX
- ↩️ **Undo Functionality**: Restore deleted items within 10 minutes
- 💾 **Data Backup/Restore**: Full backup and restore functionality
- 🎨 **Dark/Light Theme**: System-aware theme switching
- 📱 **Material Design**: Modern Material UI (MUI) components
- 📱 **Responsive Design**: Perfectly responsive across mobile, tablet, and desktop

## 🛠️ Tech Stack

### Web PWA
- **React 18+** with TypeScript
- **Vite** for build tooling and dev server
- **Material UI (MUI)** for UI components
- **Zustand** for state management with persistence
- **React Router** for navigation
- **localforage** for IndexedDB persistence
- **PWA Support** with Service Worker and Web App Manifest (VitePWA plugin)
- **Playwright** for E2E testing

## 🔒 Strict Code Quality Enforcement

This repository enforces strict code quality checks that **cannot be bypassed**:

- ✅ **Git Hooks**: Pre-commit validation (ESLint, TypeScript, Build, Tests)
- ✅ **TDD Approach**: Locked tests are DELIVERED features - fix implementation, NOT tests
- ✅ **Git Wrapper**: Blocks `--no-verify` bypass attempts
- ✅ **GitHub Actions**: Server-side enforcement on all PRs
- ✅ **Branch Protection**: Requires status checks before merge
- ✅ **Enforcement Lock System**: Checksum-based protection for enforcement files
- ✅ **Test Lock System**: Prevents modification of locked test files
- ✅ **Responsive Design Mandate**: All UI components must be responsive

### Protection Setup (Required)

After cloning, install protections:

```bash
npm install
npm run install-protection
source ~/.bashrc  # or ~/.zshrc (or restart terminal)
```

**Important**: Run `npm run install-protection` after `npm install` to enable strict local enforcement.

**Zero Tolerance Policy**:
- ❌ `--no-verify` is **ABSOLUTELY FORBIDDEN**
- ❌ Direct commits to `main` are **BLOCKED**
- ❌ Bypass attempts are **DETECTED AND BLOCKED**
- ✅ All checks must pass before commit
- ✅ Server-side checks provide ultimate enforcement

## 📦 Installation

### Prerequisites

- **Node.js 18+** and npm (for development and build)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd split-money
```

2. Install dependencies and protections:
```bash
npm install
npm run install-protection
source ~/.bashrc  # or ~/.zshrc (or restart terminal)
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser:
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - The app will hot-reload on file changes

## 🏗️ Project Structure

```
split-money/
├── frontend/                     # React PWA TypeScript frontend
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Page components
│   │   ├── store/                # Zustand stores
│   │   ├── utils/                # Utility functions
│   │   └── types/                # TypeScript type definitions
│   ├── public/
│   │   └── version.json          # Version file for relative versioning
│   ├── vite.config.ts           # Vite config with PWA plugin
│   └── package.json
├── scripts/                      # Build and enforcement scripts
│   ├── version-utils.sh          # Version management utilities
│   ├── validate-version-bump.sh  # Version bump validation
│   └── ...
├── .github/
│   └── workflows/               # GitHub Actions workflows
│       ├── pr-checks.yml         # PR quality checks
│       ├── version-bump.yml     # Automatic version bumping
│       └── lighthouse.yml        # Lighthouse CI
├── .husky/                      # Git hooks
│   ├── pre-commit               # Pre-commit validation
│   ├── pre-push                 # Pre-push validation
│   └── commit-msg               # Commit message validation
├── package.json                 # Root package.json (for scripts)
├── VERSION.txt                  # Current version
└── README.md
```

## 🎯 Key Features

### Expense Splitting
- Create expenses and split them among group members
- Support for equal splits, custom amounts, and percentages
- Track who paid and who owes what

### Groups
- Create groups for different contexts (roommates, trips, events)
- Add/remove members from groups
- View group expenses and balances

### Balance Tracking
- See who owes you and who you owe
- Settle up with friends
- Transaction history

## 🔧 Development

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

### Building for Production

```bash
npm run build
```

The production build will be in `frontend/dist/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

### Running Tests

```bash
# E2E tests (Playwright)
npm run test:e2e

# Run all tests
npm run test:all
```

### Code Quality Checks

```bash
# Lint check
cd frontend
npm run lint

# Type check
cd frontend
npm run type-check

# Build check
cd frontend
npm run build
```

## 📚 Documentation

### Core Documentation
- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md)**: Complete project overview, architecture, and specifications
- **[Tasks Breakdown](docs/TASKS_BREAKDOWN.md)**: Detailed task list and deliverables
- **[Responsive Design Mandate](docs/RESPONSIVE_DESIGN_MANDATE.md)**: Responsive design requirements and guidelines

### Testing & Quality Assurance
- **[TDD Approach](docs/TDD_APPROACH.md)**: Test-Driven Development principles
- **[Lock Policy](docs/LOCK_POLICY.md)**: File locking mechanism and policies
- **[AI Agent TDD Rules](docs/AI_AGENT_TDD_RULES.md)**: Rules for AI agents regarding tests

### Deployment
- **[Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)**: Deployment guide for Vercel

## 🐛 Troubleshooting

### Build Issues

If you encounter build failures:
- Clean and rebuild: `cd frontend && rm -rf dist node_modules && npm install && npm run build`
- Check Node.js version: Ensure Node.js 18+ is installed (`node --version`)
- Clear npm cache: `npm cache clean --force`

### Development Server Issues

- Port already in use: Change port in `frontend/vite.config.ts` or kill the process using the port
- Module not found: Run `npm install` in the root and `frontend` directory

## 🚀 Deployment

### Web PWA (Vercel)

The frontend PWA is automatically deployed to **Vercel** on every push to `main`:

- **Production URL**: `https://split-money.vercel.app` (or custom domain)
- **Preview Deployments**: Created for every PR
- **Automatic HTTPS**: SSL certificates managed by Vercel
- **Global CDN**: Fast content delivery worldwide

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for detailed deployment guide.

### Manual Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy `frontend/dist/` to your hosting provider:
   - Vercel: Connect GitHub repo or use Vercel CLI
   - Netlify: Drag and drop `frontend/dist/` folder
   - GitHub Pages: Configure GitHub Actions workflow

## 📝 License

MIT

## 🤝 Contributing

1. Check `docs/TASKS_BREAKDOWN.md` for current task status
2. Follow the existing code structure and patterns
3. Add tests for new features
4. Update documentation as needed
5. Ensure all pre-commit checks pass
6. **MANDATORY**: All UI components must be responsive (mobile, tablet, desktop)

## 🎉 Recent Updates

- ✅ Strict code quality enforcement with Git hooks and GitHub Actions
- ✅ Enforcement lock system to protect enforcement files from modification
- ✅ Semantic versioning system with automatic version bumps
- ✅ TDD approach with locked tests as delivered features
- ✅ Responsive design mandate across all deliverables
- ✅ Vercel deployment setup for automatic PWA deployment
