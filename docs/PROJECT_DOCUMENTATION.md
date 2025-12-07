# Split Money - Project Documentation

## 📋 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Approach & Architecture](#approach--architecture)
4. [Tasks & Deliverables](#tasks--deliverables)
5. [Project Plan](#project-plan)
6. [Technical Specifications](#technical-specifications)
7. [Success Criteria](#success-criteria)

---

## 🎯 Problem Statement

### Current Challenges

**Expense Splitting Complexity**
- Manually tracking who paid for what becomes tedious in group settings
- Calculating splits (equal, percentage, custom amounts) is error-prone
- No easy way to see who owes whom at a glance
- Settling up requires manual calculations and multiple conversations
- No historical record of expenses and settlements

**Platform Limitations**
- Existing solutions (Splitwise, Venmo, etc.) require:
  - Account creation and verification
  - Sharing personal financial information
  - Dependency on internet connectivity
  - Privacy concerns with third-party services
  - Platform lock-in

**User Pain Points**
- Roommates splitting rent, utilities, groceries
- Friends splitting restaurant bills, travel expenses
- Event organizers managing group expenses
- Family members tracking shared household costs
- Need for offline functionality
- Desire for privacy and data ownership

### Target Users

1. **Roommates** - Sharing living expenses
2. **Friends** - Splitting social expenses (dinners, trips, events)
3. **Families** - Managing household expenses
4. **Event Organizers** - Tracking group event costs
5. **Small Groups** - Any group needing expense splitting

### Goals

- **Simplify** expense splitting and balance tracking
- **Provide** offline-first functionality
- **Ensure** user privacy and data ownership
- **Support** multiple platforms (Android + Web PWA)
- **Maintain** high code quality with strict enforcement

---

## 💡 Solution Overview

### Split Money - Expense Splitting Made Simple

**Split Money** is a comprehensive expense splitting application that allows users to:
- Create groups for shared expenses
- Add expenses and split them among group members
- Track balances (who owes whom)
- Settle up expenses easily
- View expense history and analytics
- Work offline with local data storage

### Key Features

#### Core Functionality
1. **Group Management**
   - Create groups (roommates, trips, events)
   - Add/remove members
   - Set group preferences

2. **Expense Management**
   - Add expenses with details (amount, description, date, category)
   - Split expenses:
     - Equally among all members
     - By custom amounts
     - By percentage
   - Assign who paid
   - Add notes and receipts

3. **Balance Tracking**
   - Real-time balance calculation
   - See who owes you and who you owe
   - Group-wise and overall balances
   - Visual balance representation

4. **Settlement**
   - Mark expenses as settled
   - Track settlement history
   - Multiple settlement methods

5. **Analytics & Reports**
   - Expense breakdown by category
   - Spending trends over time
   - Group spending analysis
   - Export reports

#### Technical Features
- **Offline-First**: Works without internet connection
- **Cross-Platform**: Android app + Web PWA
- **Privacy-Focused**: All data stored locally
- **PWA Support**: Installable web app with offline capabilities
- **Version Management**: Automatic versioning across platforms

---

## 🏗️ Approach & Architecture

### Technology Stack

#### Android App
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose (or Material Design Components)
- **Architecture**: MVVM (Model-View-ViewModel)
- **Database**: Room Database (SQLite)
- **Dependency Injection**: Hilt/Dagger
- **Async Operations**: Coroutines & Flow
- **Build System**: Gradle

#### Web PWA
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **State Management**: Zustand with persistence
- **Routing**: React Router
- **Storage**: IndexedDB (via localforage)
- **PWA**: VitePWA plugin with Workbox

### Architecture Patterns

#### Android Architecture
```
┌─────────────────────────────────────┐
│         UI Layer (Compose)          │
│  Activities, Fragments, Composables │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      ViewModel Layer                 │
│  Business Logic, State Management    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository Layer                │
│  Data Access Abstraction             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Layer                      │
│  Room Database, Network (if needed)  │
└─────────────────────────────────────┘
```

#### Web Architecture
```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  React Components, Pages            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      State Management Layer          │
│  Zustand Stores, React Query         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Service Layer                   │
│  Business Logic, Data Processing     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Storage Layer                   │
│  IndexedDB (localforage)            │
└─────────────────────────────────────┘
```

### Data Models

#### Core Entities

**Group**
```typescript
{
  id: string
  name: string
  description?: string
  members: Member[]
  createdAt: Date
  updatedAt: Date
}
```

**Member**
```typescript
{
  id: string
  groupId: string
  name: string
  email?: string
  avatar?: string
  joinedAt: Date
}
```

**Expense**
```typescript
{
  id: string
  groupId: string
  paidBy: string // memberId
  amount: number
  description: string
  category: string
  date: Date
  splits: ExpenseSplit[]
  settled: boolean
  createdAt: Date
}
```

**ExpenseSplit**
```typescript
{
  id: string
  expenseId: string
  memberId: string
  amount: number
  percentage?: number
  settled: boolean
}
```

**Balance**
```typescript
{
  memberId: string
  groupId: string
  totalOwed: number // positive = owes, negative = owed to
  expenses: Expense[]
}
```

### Code Quality & Enforcement

#### Strict Enforcement Mechanisms
- **Pre-commit Hooks**: Linting, type checking, build validation, tests
- **Pre-push Hooks**: Branch protection
- **GitHub Actions**: CI/CD pipeline with PR checks
- **Version Management**: Automatic version bumping
- **Test Lock System**: TDD approach with locked tests
- **Enforcement Lock System**: Protection against bypassing checks

#### Quality Standards
- Zero tolerance for bypassing checks
- All production code must pass linting
- Type safety enforced (TypeScript/Kotlin)
- Build must succeed before commit
- Tests must pass (TDD approach)
- Version bump required for every PR

---

## ✅ Tasks & Deliverables

### Phase 1: Foundation & Setup ✅ (COMPLETED)

#### Setup Tasks
- [x] Project structure setup
- [x] Android project configuration
- [x] Web PWA project configuration
- [x] Git hooks and enforcement setup
- [x] GitHub Actions workflows
- [x] Version management system
- [x] Documentation structure

#### Deliverables
- ✅ Android project with Gradle configuration
- ✅ React PWA with Vite and TypeScript
- ✅ Git hooks (Husky) configured
- ✅ GitHub Actions workflows
- ✅ Version management scripts
- ✅ Enforcement mechanisms
- ✅ Basic documentation

### Phase 2: Core Data Models & Storage

#### Tasks
- [ ] Design data models (Group, Member, Expense, Balance)
- [ ] Implement Room Database entities (Android)
- [ ] Implement IndexedDB schema (Web)
- [ ] Create data access layer (DAOs/Repositories)
- [ ] Implement data migration system
- [ ] Add data validation logic
- [ ] Create backup/restore functionality

#### Deliverables
- Database schema documentation
- Room Database entities and DAOs
- IndexedDB storage implementation
- Repository pattern implementation
- Data migration scripts
- Backup/restore feature

### Phase 3: Core Features - Groups & Members

#### Tasks
- [ ] Create group management UI (Android)
- [ ] Create group management UI (Web)
- [ ] Implement group CRUD operations
- [ ] Add member management functionality
- [ ] Implement group settings
- [ ] Add group search and filtering
- [ ] Create group detail views

#### Deliverables
- Group creation/editing screens
- Member management interface
- Group list and detail views
- Group settings page
- Search and filter functionality

### Phase 4: Core Features - Expenses

#### Tasks
- [ ] Design expense creation UI
- [ ] Implement expense CRUD operations
- [ ] Add expense splitting logic:
  - Equal split
  - Custom amount split
  - Percentage split
- [ ] Implement expense categories
- [ ] Add expense editing and deletion
- [ ] Create expense list and detail views
- [ ] Add expense filtering and search

#### Deliverables
- Expense creation form
- Expense splitting calculator
- Expense list and detail views
- Category management
- Expense filtering and search
- Expense editing functionality

### Phase 5: Balance Tracking & Settlement

#### Tasks
- [ ] Implement balance calculation logic
- [ ] Create balance display UI
- [ ] Add "who owes whom" visualization
- [ ] Implement settlement functionality
- [ ] Add settlement history tracking
- [ ] Create balance summary views
- [ ] Implement group-wise and overall balances

#### Deliverables
- Balance calculation engine
- Balance display components
- Settlement interface
- Settlement history view
- Balance summary dashboard
- Visual balance representation

### Phase 6: Analytics & Reports

#### Tasks
- [ ] Design analytics dashboard
- [ ] Implement expense breakdown by category
- [ ] Add spending trends over time
- [ ] Create group spending analysis
- [ ] Implement export functionality (CSV/PDF)
- [ ] Add chart visualizations
- [ ] Create report generation

#### Deliverables
- Analytics dashboard
- Category-wise expense breakdown
- Spending trend charts
- Group analysis views
- Export functionality
- Report generation feature

### Phase 7: UI/UX Enhancement

#### Tasks
- [ ] Implement Material Design 3 (Android)
- [ ] Create consistent design system
- [ ] Add dark/light theme support
- [ ] Implement responsive design (Web)
- [ ] Add loading states and skeletons
- [ ] Create error handling UI
- [ ] Add toast notifications
- [ ] Implement empty states

#### Deliverables
- Material Design 3 implementation
- Design system documentation
- Theme switching functionality
- Responsive layouts
- Loading and error states
- Notification system
- Empty state designs

### Phase 8: PWA Features

#### Tasks
- [ ] Configure service worker
- [ ] Implement offline functionality
- [ ] Add install prompt
- [ ] Create app manifest
- [ ] Implement background sync
- [ ] Add push notifications (optional)
- [ ] Test PWA installation

#### Deliverables
- Service worker implementation
- Offline mode functionality
- PWA installation support
- App manifest configuration
- Background sync feature

### Phase 9: Testing & Quality Assurance

#### Tasks
- [ ] Write unit tests for core logic
- [ ] Create integration tests
- [ ] Implement E2E tests (Playwright)
- [ ] Add Android instrumentation tests
- [ ] Perform accessibility testing
- [ ] Conduct performance testing
- [ ] Security audit

#### Deliverables
- Unit test suite (>80% coverage)
- Integration test suite
- E2E test suite
- Android test suite
- Accessibility report
- Performance benchmarks
- Security audit report

### Phase 10: Documentation & Deployment

#### Tasks
- [ ] Complete API documentation
- [ ] Create user guide
- [ ] Write developer documentation
- [ ] Set up deployment pipeline
- [ ] Configure GitHub Pages (Web)
- [ ] Prepare Google Play Store listing (Android)
- [ ] Create release notes

#### Deliverables
- Complete API documentation
- User guide
- Developer guide
- Deployment documentation
- Production deployment
- App store listings
- Release documentation

---

## 📅 Project Plan

### Timeline Overview

```
Phase 1: Foundation & Setup          ✅ COMPLETED (Week 1)
Phase 2: Data Models & Storage      🔄 IN PROGRESS (Week 2)
Phase 3: Groups & Members           📋 PLANNED (Week 3)
Phase 4: Expenses                   📋 PLANNED (Week 4-5)
Phase 5: Balance & Settlement       📋 PLANNED (Week 6)
Phase 6: Analytics & Reports        📋 PLANNED (Week 7)
Phase 7: UI/UX Enhancement          📋 PLANNED (Week 8)
Phase 8: PWA Features               📋 PLANNED (Week 9)
Phase 9: Testing & QA              📋 PLANNED (Week 10)
Phase 10: Documentation & Deploy   📋 PLANNED (Week 11)
```

### Milestones

#### Milestone 1: MVP Core Features (Week 6)
- Groups and members management
- Basic expense creation and splitting
- Balance tracking
- Settlement functionality

#### Milestone 2: Enhanced Features (Week 8)
- Analytics and reports
- UI/UX improvements
- PWA features
- Offline functionality

#### Milestone 3: Production Ready (Week 11)
- Complete test coverage
- Documentation
- Deployment
- App store readiness

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Implement feature following TDD approach
   - Write tests first, then implementation
   - Ensure all pre-commit checks pass
   - Create PR with proper description

2. **Code Review**
   - PR must pass all GitHub Actions checks
   - Code review by team/self-review
   - Address feedback
   - Merge to `main`

3. **Release Process**
   - Version auto-bumps on merge
   - GitHub release created
   - PWA deploys to GitHub Pages
   - Android APK generated

---

## 🔧 Technical Specifications

### Android Specifications

#### Minimum Requirements
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Java Version**: 17
- **Kotlin Version**: 1.9.20
- **Gradle Version**: 8.1.2

#### Key Dependencies
- Room Database: 2.6.1
- Jetpack Compose: Latest stable
- Hilt: Latest stable
- Coroutines: Latest stable
- Material Design Components: Latest

### Web PWA Specifications

#### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

#### PWA Requirements
- Service Worker support
- HTTPS (required for PWA)
- Manifest.json
- Offline functionality
- Installable

#### Key Dependencies
- React: ^18.3.1
- TypeScript: ^5.2.2
- Vite: ^5.0.8
- Material UI: ^7.3.5
- Zustand: ^5.0.8
- localforage: ^1.10.0

### Performance Targets

#### Android
- App launch time: < 2 seconds
- Screen transition: < 300ms
- Database queries: < 100ms
- Memory usage: < 150MB

#### Web PWA
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 90
- Bundle size: < 500KB (gzipped)

### Security Requirements

- All data stored locally (no cloud sync by default)
- No sensitive data in logs
- Input validation on all forms
- SQL injection prevention (Room parameterized queries)
- XSS prevention (React auto-escaping)
- HTTPS for PWA deployment

---

## 🎯 Success Criteria

### Functional Requirements

1. **Core Functionality**
   - ✅ Users can create groups and add members
   - ✅ Users can add expenses and split them
   - ✅ Balance calculation is accurate
   - ✅ Settlement functionality works correctly
   - ✅ Data persists across app restarts

2. **Platform Support**
   - ✅ Android app works on Android 7.0+
   - ✅ Web PWA works on modern browsers
   - ✅ Offline functionality works on both platforms

3. **User Experience**
   - ✅ Intuitive UI/UX
   - ✅ Fast performance
   - ✅ Responsive design
   - ✅ Accessible (WCAG 2.1 AA)

### Non-Functional Requirements

1. **Quality**
   - ✅ Code coverage > 80%
   - ✅ Zero critical bugs
   - ✅ All tests passing
   - ✅ Code quality checks passing

2. **Performance**
   - ✅ Meets performance targets
   - ✅ Lighthouse score > 90
   - ✅ Smooth animations (60fps)

3. **Reliability**
   - ✅ No data loss
   - ✅ Graceful error handling
   - ✅ Offline functionality works

4. **Maintainability**
   - ✅ Well-documented code
   - ✅ Clear architecture
   - ✅ Easy to extend

### Business Goals

1. **User Adoption**
   - Target: 1000+ users in first month
   - User retention: > 60% after 30 days
   - Positive user feedback: > 4.5/5 stars

2. **Technical Excellence**
   - Zero critical security vulnerabilities
   - 99.9% uptime for PWA
   - Fast load times

3. **Code Quality**
   - Strict enforcement mechanisms working
   - All PRs pass quality checks
   - Continuous improvement

---

## 📊 Risk Management

### Technical Risks

1. **Data Migration Complexity**
   - Risk: Breaking changes in data models
   - Mitigation: Versioned migrations, thorough testing

2. **Cross-Platform Consistency**
   - Risk: Different behavior on Android vs Web
   - Mitigation: Shared business logic, comprehensive testing

3. **Performance Issues**
   - Risk: Slow with large datasets
   - Mitigation: Pagination, indexing, performance testing

### Project Risks

1. **Scope Creep**
   - Risk: Adding too many features
   - Mitigation: Strict prioritization, MVP focus

2. **Timeline Delays**
   - Risk: Missing deadlines
   - Mitigation: Buffer time, regular reviews

3. **Quality Compromise**
   - Risk: Rushing to meet deadlines
   - Mitigation: Strict enforcement, no bypassing

---

## 📝 Notes

### Assumptions

1. Users have basic smartphone/web browser access
2. Users understand basic expense splitting concepts
3. No backend server required (local storage only)
4. Internet connectivity optional (offline-first)

### Constraints

1. Must work offline
2. Must maintain user privacy (local storage)
3. Must follow strict code quality standards
4. Must support Android 7.0+ and modern browsers

### Future Enhancements

1. Cloud sync (optional)
2. Multi-currency support
3. Receipt scanning (OCR)
4. Recurring expenses
5. Budget tracking
6. Export to accounting software
7. Group chat/messaging
8. Payment integration

---

## 📚 References

- [Splitwise API Documentation](https://dev.splitwise.com/)
- [Material Design Guidelines](https://material.io/design)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Room Database Guide](https://developer.android.com/training/data-storage/room)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-12-06  
**Status**: Active Development

