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
- `Browser launch: opened http://127.0.0.1:5510/index.html`

## Primary Alfa Codex Command

```powershell
npm run dev:bootstrap -- --team alfa --role codex
```

Expected diagnostics:

- `Team: alfa`
- `Role: codex`
- `Web URL: http://127.0.0.1:5512`
- `API URL: http://127.0.0.1:5513/api`
- `Browser launch: suppressed for codex role`

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
npm run dev:bootstrap -- --team delta
npm run dev:bootstrap -- --team echo
npm run dev:bootstrap -- --team foxtrot
npm run dev:bootstrap -- --team golf
npm run dev:bootstrap -- --team hotel
```

## Failure Checks

```powershell
npm run dev:bootstrap -- --team omega
npm run dev:bootstrap -- --team alfa --role reviewer
```

Expected result:

- Unknown team fails with the supported team list.
- Unknown role fails with the supported role list.
