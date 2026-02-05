# Quick Reference Guide for Team LetsC

## 🚀 First Time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd LetsC

# 2. Install Node.js dependencies
npm install

# 3. Open in VS Code
code .
```

## 💻 Daily Workflow

```bash
# 1. Get latest code (ALWAYS do this first!)
git pull origin main

# 2. Create your branch
git checkout -b yourname/feature-name

# 3. Make changes in VS Code

# 4. Check what you changed
git status

# 5. Add and commit
git add .
git commit -m "feat: describe what you did"

# 6. Push your branch
git push origin yourname/feature-name

# 7. Create Pull Request on GitHub
```

## 🔧 Useful Git Commands

### See your current branch

```bash
git branch
```

### Switch to a different branch

```bash
git checkout branch-name
```

### See what changed

```bash
git status
git diff
```

### Undo changes (before commit)

```bash
git checkout -- filename
```

### Update your branch with latest main

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## 🌐 Running the Project

### Frontend Only (Simple)

1. Open `frontend/index.html` in browser
2. Or use VS Code Live Server extension

### With Backend (Node.js)

```bash
# Install dependencies (first time only)
npm install

# Start the server
npm start

# For development (auto-restart on changes)
npm run dev
```

## 📁 Where to Put Your Code

- **HTML files** → `frontend/`
- **CSS styles** → `frontend/css/`
- **JavaScript** → `frontend/js/`
- **Images/fonts** → `frontend/assets/`
- **Backend code** → `backend/`

## 🎨 VS Code Extensions (Recommended)

Install these in VS Code:

1. **Live Server** - Preview HTML instantly
2. **Prettier** - Auto-format code
3. **GitLens** - Better Git visualization
4. **Auto Rename Tag** - Rename HTML tags easily

## 🆘 Emergency Fixes

### I committed to main by mistake!

```bash
git checkout -b yourname/fix-branch
git push origin yourname/fix-branch
git checkout main
git reset --hard origin/main
```

### I have merge conflicts!

1. Open the file in VS Code
2. Look for `<<<<<<<` markers
3. Choose which code to keep
4. Delete the markers
5. Save and commit:

```bash
git add .
git commit -m "fix: resolve merge conflicts"
```

### I want to start over!

```bash
# Discard ALL local changes (careful!)
git reset --hard origin/main
```

## 📞 Who to Ask

- **Git issues** → Garvit / Team lead
- **Code errors** → Post in team chat
- **Merge conflicts** → Ask anyone who's free
- **Deployment** → Coordinate with team

## ⚡ Hackathon Speed Tips

1. **Use templates** - Don't write everything from scratch
2. **Copy-paste wisely** - Reuse code from our own project
3. **Comment later** - Get it working first
4. **Test frequently** - Don't wait until the end
5. **Commit often** - Small commits = easier to fix

## 🔗 Important Links

- **Repository**: [Add GitHub link here]
- **Live Demo**: [Add link after deployment]
- **Team Chat**: [Add Discord/Slack link]
- **Design**: [Add Figma link if you have one]

---

**Pro Tip**: Bookmark this file! You'll need it during the hackathon.
