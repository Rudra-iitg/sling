# Contributing to Sling

First off, thank you for considering contributing to Sling! It's people like you that make Sling such a great tool for travelers around the world.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 95, Safari 15]
- Node Version: [e.g., 16.13.0]
- App Version: [e.g., 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Contributing Code

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes with clear commit messages
6. Push to your fork
7. Submit a pull request

## 🔧 Development Process

### Setting Up Your Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/sling.git
   cd sling
   ```

2. **Install dependencies**
   ```bash
   cd travel-companion
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Project Structure

```
sling/
├── travel-companion/
│   ├── public/           # Frontend files
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   └── index.html    # Main HTML
│   └── server/           # Backend files
│       ├── routes/       # API routes
│       ├── database.js   # Database operations
│       └── index.js      # Server entry point
```

## 🎨 Style Guidelines

### JavaScript Style Guide

- Use ES6+ features
- Use `const` and `let` instead of `var`
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await for asynchronous code

**Good Example:**
```javascript
async function fetchUserTrips(userId) {
    try {
        const trips = await db.getTripsByUser(userId);
        return trips;
    } catch (error) {
        console.error('Error fetching user trips:', error);
        throw error;
    }
}
```

**Bad Example:**
```javascript
function getUserTrips(u) {
    var t = db.getTripsByUser(u);
    return t;
}
```

### CSS Style Guide

- Use CSS variables for colors and common values
- Follow BEM naming convention for classes
- Keep selectors specific but not overly nested
- Mobile-first responsive design
- Use meaningful class names

**Good Example:**
```css
.trip-card {
    padding: 1rem;
    border-radius: var(--radius);
}

.trip-card__title {
    font-size: 1.25rem;
    color: var(--dark);
}

.trip-card__title--featured {
    color: var(--primary);
}
```

### HTML Style Guide

- Use semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Use meaningful IDs and classes
- Keep markup clean and readable

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or correcting tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(trips): add filter by transport mode

- Added dropdown for transport mode selection
- Updated search API to handle transport filter
- Added tests for new filter functionality

Closes #123
```

```
fix(auth): resolve JWT token expiration issue

The JWT tokens were expiring too quickly due to incorrect
configuration. Updated the expiration time to 7 days.

Fixes #456
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of your own code
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] No new warnings generated
- [ ] Tested on multiple browsers (if frontend)
- [ ] Tested edge cases

### PR Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes

## Screenshots (if applicable)
Add screenshots to demonstrate the changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes on multiple browsers (if frontend)
```

### Review Process

1. At least one maintainer review is required
2. All comments must be resolved
3. All CI checks must pass
4. Changes may be requested before approval
5. Once approved, a maintainer will merge the PR

## 🏆 Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes for their contributions
- Our website (coming soon)

## 💬 Communication

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private matters (rudra@example.com)

## 📚 Additional Resources

- [Project README](README.md)
- [TODO & Roadmap](TODO.md)
- [License](LICENSE)

## 🎉 Thank You!

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute!

---

**Happy Contributing! 🚀**
