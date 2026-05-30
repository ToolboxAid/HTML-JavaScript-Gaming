# PR_26146_141-160 Instrument Audit

## Ownership

PASS: Instruments tab owns editable GM Type/Patch, volume, pan, octave range, transpose, lifecycle controls, and audition keyboard.

PASS: Octave Timeline owns only quick select/mute/solo/hide workflow for instruments.

PASS: `selectedInstrumentId` stays synchronized between Timeline quick rows and Instruments tab.

## Lifecycle

PASS: Duplicate instrument row is wired and updates canonical playback data.

PASS: Move Up and Move Down are wired and keep selected instrument state synchronized.

PASS: Delete uses confirmation before removing an instrument row.

PASS: Instrument preset Save, Duplicate, and Load are wired and report status.

## Audition and Range

PASS: Audition keyboard uses selected instrument context.

PASS: Active playable range is displayed with octave range metadata.

PASS: Piano audition and instrument audition both report status.

## Future Controls

PASS: Future effects and advanced controls remain red/unwired when incomplete.

