MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_SAMPLES_INDEX_UI_BEHAVIOR_RESTORE

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_SAMPLES_INDEX_UI_BEHAVIOR_RESTORE.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if execution-backed status changes are earned
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling
- keep scope limited to /samples/index.html and directly related sample-index UI/data/rendering dependencies
- preserve the current accepted page shell

Required work:
1. Restore all intended sample filter dropdowns on /samples/index.html, including phase, class, and the remaining third filter.
2. Restore functioning filter behavior.
3. Restore the pin affordance as a pin, not a button.
4. Restore the pinned list/section and its behavior.
5. Restore preview image rendering from the correct sample metadata.
6. Make the preview image the launch <a> target.
7. Restore hover zoom behavior on the preview image.
8. Keep the page shell and shared header/body consistency intact.
9. Keep the change narrow, testable, and behavior-restoring rather than redesigning.
