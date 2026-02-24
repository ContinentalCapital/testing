# SwitchHands workspace

This repository can only be fixed once the actual Lovable-generated application source code is present.

## Current status

- Network access to external sites from this environment is blocked by a proxy (`CONNECT tunnel failed, response 403`).
- I cannot directly open your private Lovable project/GitHub connection from this container.
- I **can** immediately patch and verify code after it is synced into this repo.

## Fastest path to get this fixed

1. Open your Lovable project:
   - `https://lovable.dev/projects/36e58d6e-f208-4ac8-9c4f-c5edfd38e088`
2. In Lovable, use **GitHub connection** and push/export the project code to a GitHub repo.
3. In this workspace, run:

   ```bash
   ./scripts/import-from-github.sh <github_repo_url> [branch]
   ```

4. After import, I can run a full repair pass (build, tests, accessibility checks, and user-flow fixes).

## Included helpers

- `scripts/import-from-github.sh` — imports app code from a GitHub repo into this workspace safely.
- `scripts/verify-switchhands.sh` — smoke checks for the production URL.
- `docs/lovable-github-connection.md` — exact Lovable → GitHub sync workflow.


## Verification commands after code sync

Run these after the Lovable app source is available:

```bash
./scripts/verify-realtime-403-fix.sh
./scripts/run-security-scan.sh
```


## Direct clone option

If your Lovable project is already connected, you can clone directly:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
```

Then share the real repository URL here and I can patch the code.
