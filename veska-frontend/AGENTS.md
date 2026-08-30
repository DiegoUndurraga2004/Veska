# Veska Frontend — Working Agreements

## Project scope

This repository contains only the Next.js frontend for Veska.
Do not implement real backend logic, Supabase integration, OpenAI integration,
Runpod integration, Graph API, SharePoint sync, OneDrive sync, or Google Drive sync.

During Stage 1, use frontend mocks and TypeScript types aligned with:

- `.codex-context/API_CONTRACTS.md`
- `.codex-context/ROADMAP-MVP.md`
- `.codex-context/CAMBIOS_OAUTH_AI_ESPACIOS_MVP.md`
- `.codex-context/ENVIRONMENTS_AND_URLS.md`

## Development workflow

- Work incrementally.
- Keep diffs limited to the requested subtask.
- Do not modify unrelated files.
- Do not add dependencies without asking first.
- Do not commit or push automatically.
- Do not modify `main`.
- Use feature branches based on `develop`.

## Validation

After code changes, run:

```bash
npm run lint
npm run build
```

## Report:

- files changed;
- validations executed;
- remaining warnings;
- assumptions made.

## Architecture rules

- OAuth Microsoft and Google are the primary visual login methods.
- Invitation remains an alternative flow.
- Application roles and document access groups are different concepts.
- Documents belong to spaces and may have relative paths.
- Chat scopes are: - all_accessible_spaces - selected_spaces - selected_documents
  -Sensitive authorization belongs to the future backend, not the frontend.

MVP chat UX:
- New chats always use `all_accessible_spaces`.
- Do not expose editable space or document selectors in the normal new-chat flow.
- Keep `selected_spaces` and `selected_documents` only as internal future-ready contracts unless a later task explicitly enables them.
