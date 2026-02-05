# Contributing to Team LetsC Hackathon Project

Thank you for contributing! Here's how to get started.

## Branch Naming Convention

Use this format: `yourname/feature-description`

Examples:

- `garvit/login-page`
- `rohan/api-integration`
- `priya/mobile-responsive`
- `amit/bug-fix-navbar`

## Commit Message Guidelines

### Format

```
<type>: <short description>

<optional longer description>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat: Add user login form with validation

fix: Resolve navbar alignment issue on mobile

docs: Update README with API documentation

style: Format code according to style guide
```

## Pull Request Process

1. **Create your branch**

   ```bash
   git checkout -b yourname/feature-name
   ```

2. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat: Add awesome feature"
   ```

3. **Push to GitHub**

   ```bash
   git push origin yourname/feature-name
   ```

4. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the template
   - Request review from at least 1 teammate

5. **Address Review Comments**
   - Make requested changes
   - Push new commits
   - Reply to comments

6. **Merge**
   - Wait for approval
   - Merge using "Squash and Merge"
   - Delete your branch after merging

## Code Review Checklist

Before requesting review, make sure:

- [ ] Code works locally
- [ ] No console errors
- [ ] Code is formatted properly
- [ ] Comments added for complex logic
- [ ] No unnecessary files committed
- [ ] Followed naming conventions

## What NOT to Do

- Don't commit directly to `main`
- Don't commit `node_modules/`
- Don't commit `.env` files
- Don't push broken code
- Don't force push (`git push -f`) unless you know what you're doing

## Need Help?

- Ask in team chat
- Tag teammates in GitHub comments
- Check existing issues and PRs
- Google is your friend!

## During Hackathon

**Balance speed with quality:**

- Reviews should be completed within 30 minutes
- Prioritize functionality over optimization
- Optimize only if time permits
- Maintain clear communication
