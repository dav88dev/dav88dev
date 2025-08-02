# 🤝 Contributing to Portfolio Website

Thank you for considering contributing to this project! This guide will help you understand our development process and how to contribute effectively.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dav88dev.git
   cd dav88dev
   ```
3. **Set up development environment**:
   ```bash
   ./dev.sh
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🏗️ Development Setup

### Prerequisites

- **Go 1.24+** - Backend server
- **Node.js 18+** - Frontend build system
- **Rust** (optional) - WASM skills visualization
- **Git** - Version control

### Installation

1. **Backend dependencies**:
   ```bash
   go mod download
   ```

2. **Frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **WASM dependencies** (if working on skills visualization):
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

### Running Locally

```bash
# Start development server
./dev.sh

# Or manually:
go run main.go &
cd frontend && npm run dev
```

Visit `http://localhost:8081` to see your changes.

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages and automated versioning.

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

### Scopes
- `frontend`: Frontend/UI changes
- `backend`: Go server changes
- `wasm`: WASM skills visualization
- `ci`: CI/CD pipeline changes
- `docs`: Documentation
- `deps`: Dependencies
- `config`: Configuration changes
- `security`: Security-related changes
- `performance`: Performance optimizations

### Examples
```bash
feat(frontend): add dark mode toggle
fix(backend): resolve memory leak in request handler
docs(api): update endpoint documentation
perf(wasm): optimize skills visualization rendering
ci(release): add automated semantic versioning

# Breaking change
feat(api): change authentication method

BREAKING CHANGE: API now requires OAuth2 instead of API keys
```

### Git Message Template

Set up the commit message template:
```bash
git config commit.template .gitmessage
```

### Commitizen (Recommended)

For interactive commit message creation:
```bash
npm install -g commitizen cz-conventional-changelog
git cz  # Instead of git commit
```

## 🔄 Pull Request Process

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed
- Ensure all checks pass locally

### 3. Test Your Changes
```bash
# Run tests
npm test
go test -v ./...

# Check formatting
npm run lint
go fmt ./...

# Build to verify
npm run build
go build
```

### 4. Submit Pull Request
1. Push your branch to your fork
2. Create a Pull Request to the `develop` branch
3. Fill out the PR template completely
4. Link any related issues

### 5. Code Review Process
- Maintainers will review your code
- Address any feedback promptly
- Automated checks must pass
- At least one approval required

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
go test -v ./...
go test -race ./...
go test -coverprofile=coverage.out ./...
```

### Integration Tests
```bash
./scripts/integration-test.sh
```

### Manual Testing Checklist
- [ ] Site loads correctly on desktop
- [ ] Site loads correctly on mobile
- [ ] Navigation works properly
- [ ] WASM skills visualization loads
- [ ] All forms submit correctly
- [ ] No console errors
- [ ] Performance is acceptable

## 🎨 Code Style

### Go Code Style
- Follow `gofmt` formatting
- Use meaningful variable names
- Add comments for exported functions
- Follow Go best practices

### Frontend Code Style
- Use ESLint configuration
- Prefer TypeScript when possible
- Follow component naming conventions
- Use CSS custom properties for theming

### CSS/Styling
- Use semantic class names
- Follow BEM methodology when appropriate
- Maintain responsive design
- Optimize for performance

## 📚 Documentation

### Code Documentation
- Comment complex logic
- Update README.md for significant changes
- Document API changes
- Include examples in documentation

### API Documentation
- Update OpenAPI specs if applicable
- Document new endpoints
- Include request/response examples
- Note any breaking changes

## 🚀 Release Process

We use automated semantic versioning based on commit messages:

### Version Bumping
- `feat`: Minor version bump (1.0.0 → 1.1.0)
- `fix`: Patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE`: Major version bump (1.0.0 → 2.0.0)

### Release Workflow
1. **Development**: Work on `feature/*` branches
2. **Integration**: Merge to `develop` branch
3. **Testing**: Automated tests run on `develop`
4. **Release**: Merge `develop` to `master` triggers release
5. **Deployment**: Automated deployment to production

### Manual Release
```bash
# Trigger manual release
npm run release

# Dry run to preview
npm run release:dry
```

## 🐛 Issue Reporting

### Bug Reports
Use the bug report template and include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Screenshots if applicable
- Console errors

### Feature Requests
Use the feature request template and include:
- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Mockups or examples if helpful

## 🔒 Security

### Reporting Security Issues
- **DO NOT** open public issues for security vulnerabilities
- Email security concerns to: security@dav88.dev
- Include detailed description and steps to reproduce

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Follow OWASP security guidelines
- Test for common vulnerabilities

## 📋 Project Structure

```
.
├── .github/          # GitHub workflows and templates
├── config/           # Configuration files
├── docs/            # Documentation
├── frontend/        # Frontend source code
├── internal/        # Internal Go packages
├── static/          # Static assets (generated)
├── templates/       # HTML templates
├── wasm-frontend/   # WASM source code (if applicable)
├── main.go         # Main application entry point
├── go.mod          # Go dependencies
├── package.json    # Node.js dependencies and scripts
└── README.md       # Project overview
```

## 🤔 Need Help?

- 📖 Check the [documentation](./docs/)
- 🐛 Search [existing issues](https://github.com/dav88dev/dav88dev/issues)
- 💬 Start a [discussion](https://github.com/dav88dev/dav88dev/discussions)
- 📧 Email: support@dav88.dev

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Added to the contributors section

Thank you for contributing! 🎉