# PR_26171_006 Manual Validation Notes

- Confirmed targeted Playwright flow opens the Theme V2 Messages tool.
- Confirmed seeded categories and emotion profiles load.
- Confirmed a message can be created with the `Urgent` emotion profile.
- Confirmed a message segment can be created with the same `Urgent` emotion profile.
- Confirmed `Urgent` reports usage count `2`.
- Confirmed referenced-profile deactivation is blocked through the Local API.
- Confirmed referenced-profile deactivation is blocked through the UI and displays an actionable diagnostic.
- Confirmed no delete behavior, TTS behavior, speech preview, voice provider adapter, runtime playback, or audio playback behavior was introduced.
- Manual merge validation was not performed because `npm run test:workspace-v2` failed.
