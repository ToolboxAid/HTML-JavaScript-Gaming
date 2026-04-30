# Restart Notes — PR 11.110

Caveat added:
- The only validation is schema validation.
- If JSON does not match schema, show the error on screen.
- Runtime must not normalize, transform, convert, repair, infer, or fallback.
- Missing file and malformed JSON are allowed pre-schema errors and must also be visible.
