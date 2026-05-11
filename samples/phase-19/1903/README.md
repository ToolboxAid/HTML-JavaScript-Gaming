<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1903 - Text to Speech V2 JSON Source

Sample-local contract for `samples/phase-19/1903`.

## Implementation Location

- Entrypoint: `samples/phase-19/1903/index.html`
- Sample payload: `samples/phase-19/1903/sample.1903.text2speach-V2.json`
- The payload is a Text to Speech V2 root array of named speech items and validates against `tools/schemas/tools/text2speach-V2.schema.json`.
- The sample launches `/tools/text2speach-V2/index.html` with `samplePresetPath` pointing at the sample JSON.

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-19/1903` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-19` and keeping only four-digit child folders that contain `index.html`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-19/1903/assets/images`.
- Asset folder status: present.
