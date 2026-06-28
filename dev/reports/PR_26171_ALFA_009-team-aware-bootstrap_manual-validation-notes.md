# PR_26171_ALFA_009 Manual Validation Notes

## Primary Alfa Owner Command

```powershell
npm run dev:bootstrap -- --team alfa
```

Expected diagnostics:

- `Team: alfa`
- `Role: owner`
- `Web URL: http://127.0.0.1:5510`
- `API URL: http://127.0.0.1:5511/api`
- `Browser launch: http://127.0.0.1:5510/index.html`

## Primary Alfa Codex Command

```powershell
npm run dev:bootstrap -- --team alfa --role codex
```

Expected diagnostics:

- `Team: alfa`
- `Role: codex`
- `Web URL: http://127.0.0.1:5512`
- `API URL: http://127.0.0.1:5513/api`
- `Browser launch: skipped for codex role`

## Legacy Command

```powershell
npm run dev:local-api
```

Expected result:

- Legacy startup remains available.
- The legacy command still runs `node --use-system-ca ./dev/scripts/start-local-api-server.mjs`.

## Other Startup Commands

```powershell
npm run dev:bootstrap -- --team owner
npm run dev:bootstrap -- --team bravo
npm run dev:bootstrap -- --team charlie
npm run dev:bootstrap -- charlie
npm run dev:bootstrap -- --team delta
npm run dev:bootstrap -- --team echo
npm run dev:bootstrap -- --team foxtrot
npm run dev:bootstrap -- --team golf
npm run dev:bootstrap -- --team hotel
```

For Charlie, both forms should show:

- `Team: charlie`
- `Web URL: http://127.0.0.1:5530`
- `API URL: http://127.0.0.1:5531/api`
- `Browser launch: http://127.0.0.1:5530/index.html`

If `.env` or the current shell already has `GAMEFOUNDRY_SITE_URL` or `GAMEFOUNDRY_API_URL`, bootstrap should still show the resolved team/role ports in diagnostics and launch the browser from the computed `GAMEFOUNDRY_SITE_URL`.

## Failure Checks

```powershell
npm run dev:bootstrap -- --team omega
npm run dev:bootstrap -- --team alfa --role reviewer
```

Expected result:

- Unknown team fails with the supported team list.
- Unknown role fails with the supported role list.
