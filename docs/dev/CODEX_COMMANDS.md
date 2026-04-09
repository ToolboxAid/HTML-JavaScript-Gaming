MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_SHARED_EXTRACTION_50_VECTOR_NUMBER_NORMALIZATION_TO_SHARED_MATH exactly as written in `docs/pr/BUILD_PR_SHARED_EXTRACTION_50_VECTOR_NUMBER_NORMALIZATION_TO_SHARED_MATH.md`.

Hard constraints:
- Touch exactly 3 code files:
  - create `src/shared/math/numberNormalization.js`
  - modify `tools/shared/vector/vectorGeometryMath.js`
  - modify `tools/shared/vector/vectorAssetContract.js`
- Do not touch any other file.
- Preserve exact behavior from PR 49 for `toFiniteNumber` and `roundNumber`.
- Do not broaden scope.
- Package output to `<project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_50_VECTOR_NUMBER_NORMALIZATION_TO_SHARED_MATH_delta.zip`
