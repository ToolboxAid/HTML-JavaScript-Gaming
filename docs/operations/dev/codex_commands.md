MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_INLINE_ATTR_CLEANUP_FINAL

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_INLINE_ATTR_CLEANUP_FINAL.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if this PR touches an existing STYLE item execution-backed
- remove all targeted inline style="" attributes
- if the rules match or are close to a higher-level existing CSS path, reuse it
- create new shared CSS only when necessary
- do NOT introduce inline style=""
- do NOT introduce embedded <style> blocks
- do NOT introduce JS-generated styling
- preserve behavior/layout as closely as possible

Targets:
- tools/Tool Host/index.html
- tools/Vector Map Editor/how_to_use.html

Confirmed inline style targets:
- label.field width:100%
- textarea width:100%
- data-tool-host-mount-container min-height/border/radius/overflow/background
- .callout margin-top:16px

Required work:
1. Audit the remaining inline style="" attributes in the targeted files.
2. Reuse higher-level existing CSS when the rules already match or are close enough.
3. Create new shared CSS classes/selectors only if reuse would be incorrect.
4. Remove the inline style="" attributes.
5. Update markup to use classes or existing selectors accordingly.
6. Keep the change narrow, testable, and free of inline/embedded styling in the targeted files.
