## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Shipping changes
- After making dashboard changes the user asked for, commit and push to `origin/main` and let Vercel's GitHub integration auto-deploy — do this without asking for confirmation first; the user has standing approval for this specific repo/workflow.
- Exception: if the working tree also has unrelated/in-progress changes (files the user didn't ask you to touch this turn), only stage and commit your own changes — ask before bundling in unrelated uncommitted work.
