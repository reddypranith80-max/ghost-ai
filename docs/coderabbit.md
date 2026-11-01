# CodeRabbit

Config lives in `.coderabbit.yaml` (validated against the published v2 schema).

## Install
1. Open https://github.com/apps/coderabbitai and click Install.
2. Choose the account/org and select this repository (or all repositories).
3. Sign in to coderabbit.ai with GitHub if prompted. Open a PR; a summary and walkthrough should appear within a minute or two.

## Require it before merge
Settings > Branches > add a rule for `main` (or a ruleset):
- Require a pull request before merging.
- Require status checks: `Typecheck, lint, build`, `Docker build and smoke test`, and `CodeRabbit` once it has reported on a PR (the check only appears in the picker after its first run).
- Optionally require conversation resolution. With `request_changes_workflow: true` CodeRabbit requests changes until its comments are resolved and approves afterward.

## Talking to it in a PR
- `@coderabbitai review` : review new commits (also useful for draft PRs).
- `@coderabbitai full review` : re-review everything.
- `@coderabbitai summary` : regenerate the PR summary.
- `@coderabbitai resolve` : resolve all of its comments.
- `@coderabbitai pause` / `resume` : stop or restart automatic reviews.
- `@coderabbitai generate docstrings` : propose docstrings.
- Reply to any of its comments with a question; `chat.auto_reply` is on, so it answers without a mention.
