# Lovable → GitHub connection workflow

Use this when you want code changes instead of prompt-only edits in Lovable.

## In Lovable

1. Open your project.
2. Go to **Integrations / GitHub**.
3. Connect the GitHub account/org that should own the repo.
4. Choose one:
   - **Create new repo** from this project, or
   - **Connect existing repo** and sync to a branch.
5. Confirm initial push.

## In this workspace

Use the helper script to import the code into `/workspace/testing`:

```bash
./scripts/import-from-github.sh <github_repo_url> [branch]
```

Example:

```bash
./scripts/import-from-github.sh https://github.com/your-org/switchhands-app.git main
```

## After import

Run at minimum:

```bash
git status
rg --files | head
```

Then request a repair pass, and I will make concrete code fixes and validation checks.


## Clone directly (local workflow)

If your Lovable project is already connected to GitHub, clone it locally:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
```

Then run app checks and push fixes; Lovable will sync those commits back into the project.
