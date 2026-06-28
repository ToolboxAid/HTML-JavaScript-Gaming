# Product Owner Review Notes - Objects Stack

## Stack Under Review
- PR_26179_ALFA_011 Objects Manager
- PR_26179_ALFA_012 Object Properties
- PR_26179_ALFA_013 Object Asset Links
- PR_26179_ALFA_014 Objects Journey Readiness

## Review Goal
Confirm the Objects MVP is Product Owner testable from object creation through Journey readiness without starting Worlds, Rules, or behavior-editor work.

## PR011 - Objects Manager
Product Owner testable outcome:
- Open `toolbox/objects/index.html`.
- Sign in as a Creator.
- Add an object row with a name, type, state, render mode, and capabilities.
- Save, refresh, and confirm the object remains for the current Game Hub game.
- Edit and delete the object.
- Sign out, attempt to save, and confirm redirect to `account/sign-in.html`.

Acceptance checks:
- Objects load through the API/database path.
- Browser does not own product data.
- Guest writes redirect to sign-in.
- Object rows persist after refresh.

## PR012 - Object Properties
Product Owner testable outcome:
- Select an object and open Object Details.
- Edit Name, Description, Type, Tags, Active, Visible, Sprite reference, Audio reference, and Default values.
- Confirm required-field validation and friendly messages.
- Confirm Save and Cancel behavior.
- Confirm unsaved-change messaging appears only when edits are pending.
- Refresh and confirm saved details persist.

Acceptance checks:
- Details persist through the existing Objects API/database service.
- Duplicate or invalid details are blocked with friendly messages.
- No behavior editor, Rules integration, or Worlds integration appears.

## PR013 - Object Asset Links
Product Owner testable outcome:
- Select an object with sprite, audio, or message references.
- Review the Asset Links section.
- Confirm valid sprite references link to Sprite Editor.
- Confirm valid message references link to Messages.
- Confirm missing sprite, audio, and message references show friendly warnings.

Acceptance checks:
- Reference review is readable without internal implementation wording.
- Missing references are surfaced as review guidance, not runtime errors.
- Existing Objects API architecture is preserved.
- No new Rules, Worlds, or behavior-editor scope appears.

## PR014 - Objects Journey Readiness
Product Owner testable outcome:
- Open Game Journey for the current Game Hub game.
- Review the Objects Stage Readiness accordion.
- Confirm readiness criteria list saved objects, name/type/state coverage, player-facing interactivity, sprite reference coverage, and Product Owner review details.
- Confirm the Product Owner review checklist is present.
- Confirm Journey progress reflects meaningful Objects completion when Objects are review-ready.
- Refresh and confirm readiness display remains stable.

Acceptance checks:
- Journey consumes Objects as read-only API data.
- Journey does not create, edit, or duplicate Objects logic.
- Journey progress display updates without writing new Journey completion metrics.
- No Rules, Worlds, or behavior-editor work starts.

## End-to-End Review Flow
1. Open Game Hub and confirm the active game.
2. Open Objects and save a review-ready object.
3. Edit Object Details and save review context.
4. Verify asset/reference warnings or links.
5. Open Game Journey for the same game.
6. Confirm Objects Stage Readiness and the Objects progress bucket.
7. Record any Product Owner findings before Worlds begins.

## Explicit Non-Scope For This Stack
- Worlds integration: not started.
- Rules integration: not started.
- Behavior editor: not started.
- Collision configuration beyond current Objects metadata: not started.
- Engine runtime object instantiation work: not started.

## Product Owner Decision Needed
Product Owner review should decide whether the Objects MVP is accepted as testable before Alfa proceeds to any Worlds-related work.
