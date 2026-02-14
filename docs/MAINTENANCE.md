# Repo maintenance — what not to push

This project keeps some files **out of the public repo** (via `.gitignore`). They are useful locally but are internal, deployment-specific, or redundant for anyone cloning the repo.

## Ignored files (see `.gitignore`)

| File(s) | Reason |
|--------|--------|
| `VERCEL_DEPLOY.md` | Deployment steps for one host. Users choose their own hosting; no need to ship this. |
| `MONEROPAY_DASHBOARD_CURSOR_PROMPT.md` | Cursor AI prompt / internal dev context. Not needed for building or running the app. |
| `NEXT.md` | Internal roadmap and todo list. |
| `SETTINGS_COPY_OVERVIEW.md` | Internal copy/UX planning for Settings. |
| `docs/FEEDBACK_*.md` | Internal feedback from testing sessions. |
| `docs/OPTION_B_TEST_RUN_LOG.md` | Internal test run log (Option B / Docker). |

## What *is* pushed (public docs)

- **README.md** — Project overview, Quick Start, Security, Development.
- **LICENSE**
- **FLOW.md** — Full setup flow (zero to merchant); useful for deployers.
- **docs/TESTING.md** — How to run and test (mock, Docker remote, Docker local).
- **docs/MERCHANT_FLOWS_AND_FAILURE_MODES.md** — What the merchant sees and what can go wrong.
- **frontend/README.md** — Frontend package notes.

## If a file was already committed

To stop tracking a file that’s now in `.gitignore` (without deleting it on disk):

```bash
git rm --cached VERCEL_DEPLOY.md
# or for a pattern:
git rm --cached docs/FEEDBACK_2026-02-14.md docs/OPTION_B_TEST_RUN_LOG.md
```

Then commit. The file stays on your machine but won’t be pushed in future.
