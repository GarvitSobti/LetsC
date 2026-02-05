# Git Cheat Sheet for Absolute Beginners

## What is Git?

Git helps multiple people work on the same code without breaking each other's work. Think of it like Google Docs for code!

## Basic Concepts

### Repository (Repo)

- Your project folder that Git tracks
- Lives on your computer AND on GitHub

### Branch

- A separate version of your code
- Like a parallel universe where you can experiment
- `main` = the official version
- Your branch = your workspace

### Commit

- Saving your changes with a message
- Like a checkpoint in a video game

### Push

- Uploading your changes to GitHub
- Makes your code visible to others

### Pull

- Downloading changes from GitHub
- Gets your teammates' code

### Merge

- Combining two branches together
- Usually your branch → main

## Commands You'll Use Every Day

### 1️⃣ Starting Your Work

```bash
# See what branch you're on
git branch

# Get the latest code
git pull origin main

# Create and switch to your branch
git checkout -b yourname/feature-name
```

### 2️⃣ Saving Your Work

```bash
# See what files you changed
git status

# Add all changes
git add .

# OR add specific file
git add filename.html

# Save with a message
git commit -m "feat: what you did"

# Upload to GitHub
git push origin yourname/feature-name
```

### 3️⃣ Switching Branches

```bash
# See all branches
git branch

# Switch to a different branch
git checkout branch-name

# Switch to main
git checkout main
```

## Common Scenarios

### Scenario 1: Starting a New Feature

```bash
git checkout main
git pull origin main
git checkout -b yourname/new-feature
# ... make your changes ...
git add .
git commit -m "feat: added new feature"
git push origin yourname/new-feature
```

### Scenario 2: Someone Made Changes to Main

```bash
git checkout main
git pull origin main
git checkout yourname/your-branch
git merge main
# If conflicts, fix them in VS Code
git add .
git commit -m "fix: merge main into my branch"
git push origin yourname/your-branch
```

### Scenario 3: Oops, I Made a Mistake!

```bash
# Before committing - undo changes to a file
git checkout -- filename

# Before committing - undo ALL changes
git reset --hard

# After committing - undo last commit (keep changes)
git reset --soft HEAD~1

# After committing - undo last commit (delete changes)
git reset --hard HEAD~1
```

## Reading Git Status

When you run `git status`, you might see:

### Green text = "Staged" (ready to commit)

```bash
Changes to be committed:
  modified: index.html
```

### Red text = "Unstaged" (changed but not ready)

```bash
Changes not staged for commit:
  modified: style.css
```

### Untracked = New files Git doesn't know about

```bash
Untracked files:
  new-file.js
```

## Understanding Git Messages

### "Your branch is up to date"

✅ Good! You have the latest code.

### "Your branch is ahead by X commits"

⚠️ You have changes not pushed yet. Run `git push`.

### "Your branch is behind by X commits"

⚠️ Someone else pushed code. Run `git pull`.

### "Merge conflict"

❌ Two people changed the same code. You need to choose which to keep.

## Fixing Merge Conflicts

1. Git will mark conflicts in your file like this:

```
<<<<<<< HEAD
Your code
=======
Their code
>>>>>>> main
```

2. Open the file in VS Code
3. Decide which code to keep
4. Delete the `<<<<<<<`, `=======`, `>>>>>>>` markers
5. Save the file
6. Run:

```bash
git add .
git commit -m "fix: resolve merge conflict"
git push origin yourname/branch
```

## Best Practices

### ✅ DO

- Pull before you start working
- Commit often (every small change)
- Write clear commit messages
- Create a new branch for each feature
- Push your code regularly

### ❌ DON'T

- Work directly on main
- Commit broken code
- Write vague messages like "fixed stuff"
- Go days without pushing
- Force push (`git push -f`) unless you're sure

## Quick Reference Table

| I want to...      | Command                                    |
| ----------------- | ------------------------------------------ |
| See changed files | `git status`                               |
| Create new branch | `git checkout -b name`                     |
| Switch branch     | `git checkout name`                        |
| Save changes      | `git add .` then `git commit -m "message"` |
| Upload to GitHub  | `git push origin branch-name`              |
| Get latest code   | `git pull origin main`                     |
| See all branches  | `git branch`                               |
| Undo changes      | `git reset --hard`                         |

## Help! Common Errors

### "fatal: not a git repository"

You're not in the project folder. `cd` to the right folder.

### "error: failed to push"

Someone else pushed code. Run `git pull` first, then `git push`.

### "Please commit or stash your changes"

You have unsaved work. Commit it or run `git stash`.

### "error: pathspec 'branch' did not match"

The branch doesn't exist. Check spelling with `git branch`.

## Still Confused?

1. **Read the error message** - Git usually tells you what to do
2. **Google it** - Copy the error message
3. **Ask the team** - Everyone was a beginner once!
4. **Use GitHub Desktop** - A visual tool if commands are scary

---

**Remember**: Git is like a time machine for your code. You can't really break anything permanently! 🚀
