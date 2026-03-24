# Contributing to Rho

Thank you for your interest in contributing to Rho!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/rho-research-agent.git
   cd rho-research-agent
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Make your changes and write tests.

### 3. Run Tests

```bash
pytest tests/ -v
```

### 4. Lint and Format

```bash
make lint
make format
```

### 5. Commit

Follow the commit message format:
```
type(scope): description

types:
  - feat: new feature
  - fix: bug fix
  - docs: documentation
  - test: tests
  - refactor: code refactoring
  - chore: maintenance
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

- Follow PEP 8
- Use type hints where possible
- Write docstrings for public functions
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass
- Aim for >80% code coverage

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Check the documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
