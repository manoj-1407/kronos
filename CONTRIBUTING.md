# Contributing to Kronos

Thanks for your interest in improving Kronos.

## Development setup

1. Fork and clone the repository.
2. Run `setup.ps1` on Windows, or install backend/frontend dependencies manually.
3. Start backend and frontend locally.

## Contribution guidelines

- Keep PRs focused and reviewable.
- Prefer clear names and short functions over clever abstractions.
- Add tests for behavior changes.
- Preserve existing simulation contracts unless intentionally versioned.
- Never commit secrets, `.env` files, local DB files, or dependency caches.

## Pull request checklist

- [ ] Code builds locally
- [ ] Backend tests pass
- [ ] Frontend build passes
- [ ] Docs updated for behavior/config changes
- [ ] No sensitive data in diff

## Commit style

Use concise, descriptive messages that explain intent.

Examples:

- `improve disk scheduler validation and edge-case handling`
- `add scenario presets and history CSV export`

## Issues

When reporting bugs, include:

- Steps to reproduce
- Expected result
- Actual result
- Environment details (OS, browser, Python/Node versions)
