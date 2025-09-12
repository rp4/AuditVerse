# Contributing to AuditVerse

First off, thank you for considering contributing to AuditVerse! It's people like you that make AuditVerse such a great tool. 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Show empathy towards other community members
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 16+ installed
- Git configured with your GitHub account
- A modern code editor (VS Code recommended)
- Basic knowledge of JavaScript and D3.js

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/AuditVerse.git
   cd AuditVerse
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original/AuditVerse.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (browser, OS, version)

**Bug Report Template:**
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g., Chrome 95]
- OS: [e.g., Windows 10]
- AuditVerse Version: [e.g., 1.0.0]

## Additional Context
[Any other relevant information]
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternatives** - What other solutions did you consider?
- **Additional context** - Mockups, examples, etc.

### 🔧 Your First Code Contribution

Unsure where to begin? Look for these labels:

- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `documentation` - Documentation improvements
- `enhancement` - New features
- `bug` - Bug fixes

### 📝 Improving Documentation

Documentation is crucial! You can help by:

- Fixing typos and grammar
- Adding examples
- Improving clarity
- Translating documentation
- Adding tutorials

## Development Process

### 1. Understanding the Codebase

```
src/
├── core/           # Business logic (start here for logic changes)
├── visualization/  # D3.js components (for visual changes)
├── ui/            # UI components (for interface changes)
├── data/          # Data handling (for data processing)
└── api/           # API integration (for backend work)
```

### 2. Making Changes

#### For New Features:
1. Discuss the feature in an issue first
2. Create comprehensive tests
3. Update documentation
4. Ensure backward compatibility

#### For Bug Fixes:
1. Add a test that reproduces the bug
2. Fix the bug
3. Ensure all tests pass
4. Document the fix

### 3. Testing Your Changes

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch

# Check coverage
npm run test:coverage
```

### 4. Code Quality Checks

```bash
# Lint your code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking (if applicable)
npm run type-check
```

## Style Guidelines

### JavaScript Style Guide

We follow these conventions:

```javascript
// ✅ Good
const calculateRiskScore = (likelihood, severity) => {
  return likelihood * severity;
};

// ❌ Bad
function calc_risk(l, s) {
  return l*s
}
```

**Key Points:**
- Use ES6+ features
- Prefer `const` over `let`, never use `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Add JSDoc comments for functions

### CSS Style Guide

```css
/* ✅ Good */
.risk-node {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--risk-color);
}

/* ❌ Bad */
.riskNode {
  display:flex;align-items:center;
  padding:10px;
  background-color:#ff0000;
}
```

**Key Points:**
- Use kebab-case for class names
- Use CSS variables for colors and sizes
- Keep specificity low
- Mobile-first approach

### D3.js Conventions

```javascript
// ✅ Good - Clear, reusable, performant
const updateNodes = (selection, data) => {
  const nodes = selection.selectAll('.node')
    .data(data, d => d.id);
  
  nodes.enter()
    .append('circle')
    .attr('class', 'node')
    .merge(nodes)
    .attr('r', d => d.radius)
    .attr('fill', d => d.color);
  
  nodes.exit().remove();
};

// ❌ Bad - Unclear, non-performant
selection.selectAll('.node').remove();
data.forEach(d => {
  selection.append('circle')
    .attr('class', 'node')
    .attr('r', d.radius)
    .attr('fill', d.color);
});
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
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
- `chore`: Other changes

### Examples
```bash
# Feature
git commit -m "feat(visualization): add risk heatmap view"

# Bug fix
git commit -m "fix(controls): correct orbit animation timing"

# Documentation
git commit -m "docs(readme): add installation instructions"

# Multiple changes (use body)
git commit -m "feat(api): add data export endpoint

- Add JSON export functionality
- Add CSV export functionality
- Add PDF report generation
- Update API documentation

Closes #123"
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

3. **Update documentation**
   - Add JSDoc comments
   - Update README if needed
   - Add examples if applicable

### PR Template

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors
- [ ] Responsive design maintained

## Screenshots
[If applicable]

## Related Issues
Fixes #[issue number]
```

### Review Process

1. **Automated Checks** - CI/CD runs tests and linting
2. **Code Review** - Maintainer reviews code
3. **Testing** - Manual testing if needed
4. **Feedback** - Address review comments
5. **Merge** - Squash and merge when approved

### After Merge

- Delete your feature branch
- Update your fork
- Celebrate! 🎉

## Project Structure Guidelines

### Adding New Visualizations

1. Create component in `src/visualization/`
2. Add tests in `tests/unit/visualization/`
3. Document in `docs/api/`
4. Add example in `docs/examples/`

Example structure:
```javascript
// src/visualization/graphs/NewGraph.js
export class NewGraph {
  constructor(container, data, options = {}) {
    this.container = container;
    this.data = data;
    this.options = { ...defaultOptions, ...options };
  }

  render() {
    // Implementation
  }

  update(newData) {
    // Update logic
  }

  destroy() {
    // Cleanup
  }
}
```

### Adding New Data Adapters

```javascript
// src/data/adapters/NewAdapter.js
export class NewAdapter {
  static validate(data) {
    // Validation logic
    return true;
  }

  static transform(rawData) {
    // Transform to internal format
    return transformedData;
  }

  static export(data, format) {
    // Export logic
    return exportedData;
  }
}
```

## Community

### Getting Help

- **Discord**: [Join our Discord](https://discord.gg/auditverse)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/AuditVerse/discussions)
- **Stack Overflow**: Tag questions with `auditverse`

### Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes
- Project website

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Maintainers:
- Have write access to the repository
- Help review pull requests
- Guide project direction
- Mentor new contributors

## Resources

### Learning Resources
- [D3.js Documentation](https://d3js.org/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Our Architecture Guide](ARCHITECTURE.md)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Postman](https://www.postman.com/) for API testing

## Questions?

Feel free to:
- Open an issue
- Start a discussion
- Reach out on Discord
- Email: contribute@auditverse.io

---

Thank you for contributing to AuditVerse! Your efforts help make risk visualization better for everyone. 🚀