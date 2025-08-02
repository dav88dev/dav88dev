# 🌊 Git Workflow & Branch Strategy

This document defines the standardized Git workflow for this project, ensuring consistent development practices and proper CI/CD integration.

## 📋 Table of Contents

- [🌊 Branch Strategy](#-branch-strategy)
- [🔄 Development Workflow](#-development-workflow)
- [🚀 Feature Development](#-feature-development)
- [🐛 Bug Fixes & Hotfixes](#-bug-fixes--hotfixes)
- [📦 Release Process](#-release-process)
- [🛡️ Branch Protection](#️-branch-protection)
- [📝 Commit Guidelines](#-commit-guidelines)
- [🔧 CI/CD Integration](#-cicd-integration)

## 🌊 Branch Strategy

We follow **GitFlow** with GitHub Actions integration:

```
master         ──●──●──●──●──         (stable releases)
               ╱    ╱    ╱
develop       ●──●──●──●──●──         (integration)
             ╱    ╱    ╱
feature/x   ●──●──                   (new features)
           ╱
hotfix/y  ●──                       (critical fixes)
```

### 🏷️ Branch Types

| Branch Type | Purpose | Source | Target | CI/CD |
|-------------|---------|--------|--------|-------|
| `master` | Production releases | `develop` or `hotfix/*` | - | ✅ Full deployment |
| `develop` | Integration branch | `feature/*` | `master` | ✅ Staging deployment |
| `feature/*` | New features | `develop` | `develop` | ✅ Testing only |
| `hotfix/*` | Critical fixes | `master` | `master` + `develop` | ✅ Emergency deployment |
| `bugfix/*` | Non-critical fixes | `develop` | `develop` | ✅ Testing only |
| `release/*` | Release preparation | `develop` | `master` | ✅ Release candidate |

## 🔄 Development Workflow

### 1. **Starting Work**
```bash
# Always start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/amazing-new-feature
```

### 2. **Development Cycle**
```bash
# Make changes and commit frequently
git add .
git commit -m "feat(scope): add amazing functionality"

# Push regularly for backup and collaboration
git push origin feature/amazing-new-feature
```

### 3. **Integration**
```bash
# Before creating PR, sync with develop
git checkout develop
git pull origin develop
git checkout feature/amazing-new-feature
git rebase develop  # or merge develop

# Push updated branch
git push origin feature/amazing-new-feature --force-with-lease
```

### 4. **Pull Request**
1. Create PR from `feature/amazing-new-feature` → `develop`
2. Fill out PR template completely
3. Request code review
4. Ensure all CI checks pass
5. Merge after approval

## 🚀 Feature Development

### Feature Branch Naming
```bash
feature/user-authentication
feature/payment-integration
feature/dashboard-redesign
feature/api-v2-endpoints
```

### Feature Workflow
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. Develop feature
# ... make changes ...
git commit -m "feat(auth): implement OAuth2 login"
git commit -m "feat(auth): add user session management"
git commit -m "test(auth): add authentication tests"

# 3. Keep feature updated
git fetch origin
git rebase origin/develop

# 4. Create PR when ready
gh pr create --title "feat: implement user authentication" \
             --body "Implements OAuth2 login with session management" \
             --base develop

# 5. After PR approval and merge
git checkout develop
git pull origin develop
git branch -d feature/user-authentication
```

## 🐛 Bug Fixes & Hotfixes

### 🔥 Critical Hotfix (Production Issue)
```bash
# 1. Create hotfix from master
git checkout master
git pull origin master
git checkout -b hotfix/critical-security-patch

# 2. Fix the issue
git commit -m "fix(security): patch critical vulnerability CVE-2023-XXXX"

# 3. Create PR to master (emergency)
gh pr create --title "hotfix: critical security patch" \
             --body "Emergency fix for production security issue" \
             --base master

# 4. After merge to master, also merge to develop
git checkout develop
git pull origin develop
git merge master
git push origin develop

# 5. Cleanup
git branch -d hotfix/critical-security-patch
```

### 🐛 Regular Bug Fix
```bash
# 1. Create bugfix from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-navigation-issue

# 2. Fix the bug
git commit -m "fix(ui): resolve navigation menu disappearing on scroll"

# 3. Create PR to develop
gh pr create --title "fix: navigation menu visibility issue" \
             --base develop

# 4. Cleanup after merge
git checkout develop
git pull origin develop
git branch -d bugfix/fix-navigation-issue
```

## 📦 Release Process

### 🏷️ Release Branch Workflow
```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Prepare release (bump versions, update changelog)
npm version minor  # or patch/major
git commit -m "chore(release): bump version to 1.2.0"

# 3. Create PR to master
gh pr create --title "release: v1.2.0" \
             --body "Release version 1.2.0 with new features" \
             --base master

# 4. After PR approval and merge to master
# Automatic: GitHub Actions will tag and deploy

# 5. Merge release back to develop
git checkout develop
git pull origin develop
git merge release/v1.2.0
git push origin develop

# 6. Cleanup
git branch -d release/v1.2.0
```

### 🤖 Automatic Release (Recommended)
```bash
# 1. Just merge develop to master via PR
# 2. Semantic Release will automatically:
#    - Analyze commits
#    - Determine version bump
#    - Create tag and release
#    - Generate changelog
#    - Deploy to production
```

## 🛡️ Branch Protection

### Master Branch Rules
- ✅ Require PR before merging
- ✅ Require status checks to pass
- ✅ Require up-to-date branches
- ✅ Require at least 1 approval
- ✅ Dismiss stale reviews
- ✅ Restrict force pushes
- ✅ Restrict deletions

### Develop Branch Rules
- ✅ Require PR before merging  
- ✅ Require status checks to pass
- ✅ Allow force pushes (for rebasing)

## 📝 Commit Guidelines

### Conventional Commits Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(ui): resolve navigation issue` |
| `docs` | Documentation | `docs(api): update endpoint docs` |
| `style` | Code style | `style(css): fix indentation` |
| `refactor` | Code refactoring | `refactor(auth): simplify login logic` |
| `perf` | Performance | `perf(wasm): optimize rendering` |
| `test` | Tests | `test(api): add integration tests` |
| `build` | Build system | `build(docker): update base image` |
| `ci` | CI changes | `ci(actions): add security scan` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `revert` | Revert commit | `revert: undo breaking change` |

### Breaking Changes
```bash
feat(api): change authentication method

BREAKING CHANGE: API now requires OAuth2 instead of API keys.
Migration guide: https://docs.example.com/migrate-oauth2
```

## 🔧 CI/CD Integration

### Trigger Conditions

| Branch Pattern | CI Tests | Security Scan | Deploy Target | Release |
|----------------|----------|---------------|---------------|---------|
| `master` | ✅ Full | ✅ Yes | 🚀 Production | ✅ Auto |
| `develop` | ✅ Full | ✅ Yes | 🧪 Staging | ❌ No |
| `feature/*` | ✅ Basic | ✅ Yes | ❌ None | ❌ No |
| `hotfix/*` | ✅ Full | ✅ Yes | 🚀 Production | ✅ Auto |
| `release/*` | ✅ Full | ✅ Yes | 🧪 Staging | ❌ No |

### Required Status Checks
- ✅ Frontend tests and linting
- ✅ Backend tests and formatting
- ✅ WASM compilation (if applicable)
- ✅ Security vulnerability scan
- ✅ Docker image build
- ✅ Integration tests

## 🚀 Quick Reference Commands

### Daily Development
```bash
# Start new feature
git checkout develop && git pull origin develop
git checkout -b feature/my-feature

# Daily sync
git fetch origin && git rebase origin/develop

# Create PR
gh pr create --base develop

# Finish feature
git checkout develop && git pull origin develop
git branch -d feature/my-feature
```

### Emergency Hotfix
```bash
# Emergency fix
git checkout master && git pull origin master
git checkout -b hotfix/critical-fix
# ... make fix ...
gh pr create --base master
```

### Release
```bash
# Manual release branch
git checkout develop && git pull origin develop
git checkout -b release/v1.0.0
gh pr create --base master

# Or just merge develop to master for auto-release
```

## 📊 Workflow Examples

### Example 1: Adding New Feature
```bash
# Week 1: Start feature
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard

# Week 1-2: Development
git commit -m "feat(dashboard): add user profile section"
git commit -m "feat(dashboard): implement settings panel"
git commit -m "test(dashboard): add component tests"

# Week 2: Ready for review
git rebase origin/develop
gh pr create --base develop

# Week 2: After approval
git checkout develop
git pull origin develop  # includes merged feature
git branch -d feature/user-dashboard
```

### Example 2: Production Hotfix
```bash
# Production issue discovered
git checkout master
git pull origin master
git checkout -b hotfix/memory-leak-fix

# Fix immediately
git commit -m "fix(server): resolve memory leak in request handler"

# Emergency deployment
gh pr create --base master --title "HOTFIX: Memory leak fix"
# Auto-deploys after merge

# Update develop
git checkout develop
git merge master
git push origin develop
```

## 🎯 Best Practices

### ✅ Do
- Always work in feature branches
- Use descriptive branch names
- Write clear commit messages
- Keep commits focused and small
- Rebase feature branches before PR
- Test locally before pushing
- Use draft PRs for work in progress
- Delete merged branches

### ❌ Don't
- Commit directly to master or develop
- Use generic commit messages
- Mix unrelated changes in one commit
- Force push to shared branches
- Ignore CI failures
- Skip code review
- Leave stale branches

## 🔗 Related Documentation

- [Contributing Guidelines](../CONTRIBUTING.md)
- [GitHub Best Practices](./GITHUB_BEST_PRACTICES.md)
- [Security Guidelines](../.github/SECURITY.md)
- [Pull Request Template](../.github/pull_request_template.md)

---

**📌 Remember**: This workflow ensures code quality, proper testing, and reliable deployments. When in doubt, create a branch and a PR!