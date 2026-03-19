PR-015 — usage rules

### When To Use Supported Compatibility Surface Snippets

Use these snippets when the export is documented as:
- currently supported for compatibility needs
- important for present callers
- not under immediate transition-focused caution in docs

### When To Use Transition-Planning-Note Snippets

Use these snippets when the export is documented as:
- currently supported for compatibility use
- still available for existing callers
- under future documentation or migration planning review

### Writing Rules

- choose the snippet family that matches the approved documentation posture
- preserve confidence for current callers
- do not imply runtime changes unless an approved PR explicitly changes support policy
- adapt wording to context without violating preferred/avoided language rules

### Do Not

- mix posture language from both groups in a way that creates confusion
- imply approved removal, deprecation, or breakage
- over-promise permanent future status that has not been established
