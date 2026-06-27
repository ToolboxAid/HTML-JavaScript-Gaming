# PR_26171_037 Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Use archive `old_text2speech-V2` as behavior reference only | PASS | Reviewed archive controls and engine behavior; rebuilt in current architecture. |
| Active tool path is `toolbox/text-to-speech/` | PASS | Page and module live under the active toolbox path. |
| Restore browser TTS capability | PASS | Browser preview uses `TextToSpeechEngine` and Web Speech API. |
| Creator can enter text | PASS | Textarea is wired into preview request creation. |
| Creator can select available browser voice | PASS | Voice select is populated from browser voices and handles empty state. |
| Creator can adjust rate, pitch, and volume | PASS | Sliders update visible values and preview request options. |
| Speak/Preview can call browser TTS | PASS | Playwright confirms `speechSynthesis.speak` path is called when available. |
| Stop speech | PASS | Playwright confirms Stop calls cancel. |
| Visible actionable unavailable-engine error | PASS | Missing Web Speech API shows an unavailable status and disables preview actions. |
| Do not block browser TTS behind provider not implemented | PASS | Browser provider is implemented locally; paid providers remain planning only. |
| Remove placeholder-only provider behavior | PASS | Placeholder generation/export shell behavior was removed from active preview path. |
| JavaScript external only | PASS | Page references external scripts only. |
| No inline script/style/event handlers | PASS | Targeted static validation passed. |
| Theme V2 only | PASS | Page references Theme V2 stylesheet and shared partials. |
| No fake generation | PASS | No fake audio generation added. |
| No database tables | PASS | No schema or database table changes made. |
| No external paid provider integration | PASS | Paid provider adapters are planning metadata only. |
| Remove incorrect `tools/text2speech` path | PASS | Static check confirms the path is absent. |
