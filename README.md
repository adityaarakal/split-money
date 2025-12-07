# Split Money

A comprehensive Android app clone of Splitwise - Expense splitting and management built with Kotlin. Split expenses with friends, track balances, and settle up easily.

## 🚀 Features

### Core Expense Management
- 💰 **Expense Splitting**: Split expenses equally, by amount, or by percentage
- 👥 **Groups**: Create groups for shared expenses (roommates, trips, events)
- 📊 **Balance Tracking**: Track who owes whom and settle up easily
- 💳 **Multiple Payment Methods**: Support for various payment methods
- 📱 **Offline Support**: Works offline with local data storage

### User Experience
- ✅ **Toast Notifications**: Real-time feedback for all operations
- ⏳ **Loading States**: Skeleton loaders and spinners for better UX
- ↩️ **Undo Functionality**: Restore deleted items within 10 minutes
- 💾 **Data Backup/Restore**: Full backup and restore functionality
- 🎨 **Dark/Light Theme**: System-aware theme switching
- 📱 **Material Design**: Modern Material Design 3 UI

## 🛠️ Tech Stack

### Android
- **Kotlin** for app development
- **Jetpack Compose** for modern UI (or Material Design Components)
- **Room Database** for local data persistence
- **Coroutines & Flow** for asynchronous operations
- **Hilt/Dagger** for dependency injection
- **Retrofit** for API calls (if backend integration)

### Web (PWA)
- **React 18+** with TypeScript
- **Vite** for build tooling and dev server
- **Material UI (MUI)** for UI components
- **Zustand** for state management with persistence
- **React Router** for navigation
- **localforage** for IndexedDB persistence
- **PWA Support** with Service Worker and Web App Manifest

## 🔒 Strict Code Quality Enforcement

This repository enforces strict code quality checks that **cannot be bypassed**:

- ✅ **Git Hooks**: Pre-commit validation (Android Lint, Build, Tests)
- ✅ **TDD Approach**: Locked tests are DELIVERED features - fix implementation, NOT tests
- ✅ **Git Wrapper**: Blocks `--no-verify` bypass attempts
- ✅ **GitHub Actions**: Server-side enforcement on all PRs
- ✅ **Branch Protection**: Requires status checks before merge
- ✅ **Enforcement Lock System**: Checksum-based protection for enforcement files
- ✅ **Test Lock System**: Prevents modification of locked test files

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

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Node.js 18+ and npm (for version management scripts)
- Android SDK with API level 24+ (Android 7.0)

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

3. Open the project in Android Studio:
   - File → Open → Select the project directory
   - Android Studio will sync Gradle files automatically

4. Run the app:
   - Click the Run button or press `Shift+F10`
   - Select an emulator or connected device

## 🏗️ Project Structure

```
split-money/
├── app/                          # Android app module
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/             # Kotlin source files
│   │   │   ├── res/              # Resources (layouts, drawables, etc.)
│   │   │   └── AndroidManifest.xml
│   │   └── test/                 # Unit tests
│   └── build.gradle              # App-level Gradle config
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
│       └── release-branch.yml    # Release branch management
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

1. Open project in Android Studio
2. Click Run or press `Shift+F10`
3. Select an emulator or device

### Building for Production

```bash
./gradlew assembleRelease
```

The APK will be in `app/build/outputs/apk/release/`

### Running Tests

```bash
./gradlew test
```

### Code Quality Checks

```bash
# Lint check
./gradlew ktlintCheck

# Build check
./gradlew assembleDebug
```

## 📚 Documentation

### Core Documentation
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Developer documentation and architecture
- **[Requirements](docs/REQUIREMENTS.md)**: Complete requirements specification
- **[Architecture](docs/ARCHITECTURE.md)**: Application architecture documentation

### Testing & Quality Assurance
- **[TDD Approach](docs/TDD_APPROACH.md)**: Test-Driven Development principles
- **[Lock Policy](docs/LOCK_POLICY.md)**: File locking mechanism and policies
- **[AI Agent TDD Rules](docs/AI_AGENT_TDD_RULES.md)**: Rules for AI agents regarding tests

## 🐛 Troubleshooting

### Build Issues

If you encounter build failures:
- Clean and rebuild: `./gradlew clean build`
- Invalidate caches in Android Studio: File → Invalidate Caches / Restart
- Check JDK version: Ensure JDK 17+ is configured

### Gradle Issues

- Ensure Gradle wrapper is executable: `chmod +x gradlew`
- Sync Gradle files: File → Sync Project with Gradle Files

## 🚀 Deployment

### Web PWA (Vercel)

The frontend PWA is automatically deployed to **Vercel** on every push to `main`:

- **Production URL**: `https://split-money.vercel.app` (or custom domain)
- **Preview Deployments**: Created for every PR
- **Automatic HTTPS**: SSL certificates managed by Vercel
- **Global CDN**: Fast content delivery worldwide

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for detailed deployment guide.

### Android App

The Android app is built locally and distributed via:
- **Local Build**: `./gradlew assembleRelease`
- **APK**: Generated in `app/build/outputs/apk/release/`
- **Google Play Store**: (Future) Submit APK for distribution

### Building Release APK

1. Build release APK:
```bash
./gradlew assembleRelease
```

2. Sign the APK (if not already signed):
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore your-keystore.jks app/build/outputs/apk/release/app-release-unsigned.apk alias_name
```

3. Zipalign the APK:
```bash
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk app-release.apk
```

### Google Play Store

1. Build App Bundle:
```bash
./gradlew bundleRelease
```

2. Upload to Google Play Console

## 📝 License

MIT

## 🤝 Contributing

1. Check `docs/tasks.md` for current task status
2. Follow the existing code structure and patterns
3. Add tests for new features
4. Update documentation as needed
5. Ensure all pre-commit checks pass

## 🎉 Recent Updates

- ✅ Strict code quality enforcement with Git hooks and GitHub Actions
- ✅ Enforcement lock system to protect enforcement files from modification
- ✅ Semantic versioning system with automatic version bumps
- ✅ TDD approach with locked tests as delivered features


