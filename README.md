# Hackathon Project - Team LetsC 🚀

Welcome to our hackathon project repository! This is a starter template ready for rapid development.

## 🎯 Quick Start for Beginners

### First Time Setup (Do this once)

#### 1. Clone this Repository
```bash
# Open Command Prompt or Git Bash and run:
git clone <your-repo-url-here>
cd LetsC
```

#### 2. Install Required Software
- **VS Code**: Download from https://code.visualstudio.com/
- **Node.js**: Download from https://nodejs.org/ (LTS version)
- **Git**: Download from https://git-scm.com/

#### 3. Open the Project
```bash
# Open VS Code in the project folder
code .
```

## 📁 Project Structure

```
LetsC/
├── frontend/           # All frontend code (HTML, CSS, JS)
│   ├── index.html     # Main page
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── assets/        # Images, fonts, etc.
├── backend/           # Backend code (if needed)
│   └── server.js      # Server file
├── docs/              # Documentation
└── README.md          # This file
```

## 🔧 Development Workflow

### For Team Members: How to Work Together

#### Step 1: Get the Latest Code
**ALWAYS** do this before you start working:
```bash
git pull origin main
```

#### Step 2: Create Your Own Branch
Never work directly on `main`! Create your own branch:
```bash
# Replace "your-name" and "feature-name" with actual values
git checkout -b your-name/feature-name

# Example:
# git checkout -b garvit/login-page
# git checkout -b rohan/navbar
```

#### Step 3: Make Your Changes
- Edit files in VS Code
- Save your changes (Ctrl + S)
- Test your code!

#### Step 4: Commit Your Changes
```bash
# See what files you changed
git status

# Add your changes
git add .

# Commit with a clear message
git commit -m "Add login page with email validation"
```

#### Step 5: Push Your Branch
```bash
# Push your branch to GitHub
git push origin your-name/feature-name
```

#### Step 6: Create a Pull Request
1. Go to GitHub repository in your browser
2. Click "Pull Requests" tab
3. Click "New Pull Request"
4. Select your branch
5. Add description of what you did
6. Request review from a teammate
7. Wait for approval, then merge!

## 🚫 Important Git Rules

1. **NEVER push directly to `main`** - Always use branches!
2. **Pull before you start** - Always get the latest code first
3. **Commit often** - Small commits are better than big ones
4. **Write clear messages** - Explain what you did
5. **Test before pushing** - Make sure your code works!

## 🆘 Common Git Problems & Solutions

### "I have merge conflicts!"
```bash
# Get the latest code
git pull origin main

# Open the conflicted files in VS Code
# Look for <<<<<<, =====, >>>>>> markers
# Keep the code you want, delete the markers
# Then:
git add .
git commit -m "Resolve merge conflicts"
```

### "I made changes on main by mistake!"
```bash
# Create a new branch with your changes
git checkout -b your-name/fix-branch

# Push to the new branch
git push origin your-name/fix-branch

# Switch back to main and reset
git checkout main
git reset --hard origin/main
```

### "I need to undo my last commit"
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes (careful!)
git reset --hard HEAD~1
```

## 💻 Running the Project

### Frontend Only
```bash
# Open frontend/index.html in your browser
# Or use Live Server extension in VS Code
```

### With Backend (Node.js)
```bash
# Install dependencies
npm install

# Run the server
npm start
```

## 📝 Coding Standards

### File Naming
- Use lowercase with hyphens: `login-page.html`, `user-auth.js`
- Be descriptive: `header-styles.css` not `style2.css`

### Code Style
- **Indent**: Use 2 spaces (set in VS Code)
- **Comments**: Explain WHY, not WHAT
- **Variables**: Use meaningful names (`userName` not `x`)

### Commit Messages
Good examples:
- ✅ "Add user login form with validation"
- ✅ "Fix navbar responsive design on mobile"
- ✅ "Update README with installation steps"

Bad examples:
- ❌ "fixed stuff"
- ❌ "changes"
- ❌ "asdfgh"

## 👥 Team Communication

### Before You Start
- Check if someone is already working on it
- Communicate in team chat
- Assign yourself on GitHub Issues

### When You're Stuck
1. Google the error message
2. Check Stack Overflow
3. Ask in team chat
4. Ask your teammates!

### Daily Standup (Recommended)
Share 3 things:
1. What did you do yesterday?
2. What will you do today?
3. Any blockers/problems?

## 🎯 During the Hackathon

### Time Management
- **First 2 hours**: Plan & divide tasks
- **Next 60%**: Core features development
- **Last 40%**: Testing, bug fixes, polish
- **Final 2 hours**: Deployment & presentation prep

### Task Division Tips
1. Break down the problem into small tasks
2. Create GitHub Issues for each task
3. Assign tasks based on skills/interests
4. Set realistic deadlines

## 📚 Helpful Resources

- **Git Basics**: https://git-scm.com/book/en/v2
- **HTML/CSS/JS**: https://developer.mozilla.org/
- **VS Code Tips**: https://code.visualstudio.com/docs
- **GitHub Guides**: https://guides.github.com/

## 🏆 Let's Win This! 

Remember:
- Communication is KEY
- Done is better than perfect
- Help each other
- Have fun!

---

**Questions?** Ask in the team chat or create a GitHub Issue!
