# BUILD_PR_LEVEL_17_35_SAMPLE_RENUMBER_AND_INDEX_ALIGNMENT

Implement:

1. Rename sample folders:
- samples/1623-* → samples/1701-*
- samples/1624-* → samples/1702-*
- samples/1625-* → samples/1703-*
- samples/1626-* → samples/1704-*
- samples/1627-* → samples/1705-*
- samples/1628-* → samples/1706-*
- samples/1629-* → samples/1707-*

2. Update samples/index.html:
- replace all references
- ensure ordering is correct

3. Update any internal references if present

Constraints:
- no code changes
- pure renumber + alignment

Validation:
- all samples load from index
- no broken links
