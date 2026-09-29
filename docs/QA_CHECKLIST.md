# QA checklist — ORGANIZE V1.1

Automated: `npm run check` (content) and `npm run test:e2e` (browser playthrough,
needs Playwright). Manual steps below cover what automation can't judge.

## Automated (tools/check-content.mjs)
- [ ] 12 stories in approved order, titles exact
- [ ] Decision counts 1,1,1,2,2,2,1,0,3,1,1,1 — Story 8 has zero
- [ ] Every decision followed by its reveal; ≤ 3 options each
- [ ] Every non-draft story string appears verbatim in the Game Bible
- [ ] No forbidden gamification / moral-summary vocabulary (story, UI, About)
- [ ] XP total 1,200; Story 12 completes silently
- [ ] Ending chronological labels match Bible §21
- [ ] Any LOOK CLOSER card has a `source`

## Automated (tools/e2e.mjs, phone / small phone / desktop)
- [ ] All 12 stories play start to finish with no console errors
- [ ] Decision choice is stored; reveal echoes “You chose PAUSE. Some of them did too.” / “You chose YES. So did some of them.”
- [ ] Completion screen: memory + “+100 XP”, no LOOK CLOSER button (no cards in data)
- [ ] Refresh mid-story resumes on the same beat and step
- [ ] Story 12: XP hidden; ending shows no XP; XP still reaches 1,200 internally
- [ ] Ending: 12 cards one at a time → grid → visible chronological reorder → only WHAT NOW? → REVISIT STORIES after delay
- [ ] Revisit a completed story; Restart Story; Home
- [ ] Offline reload works, progress kept, a story plays offline
- [ ] Theme + reduced motion toggles persist
- [ ] Reset Progress (with confirmation) clears everything
- [ ] No external network requests; no horizontal text overflow

## Manual
- [ ] Install to home screen (Android Chrome: menu → Install app; iOS Safari: Share → Add to Home Screen); launches full-screen, works in airplane mode
- [ ] One-handed play: Continue sits bottom-right; tapping anywhere on the story advances; options are ≥ 56px tall
- [ ] No beat auto-advances (leave any screen for 30 s)
- [ ] Keyboard (desktop): Tab reaches all controls; Space / Enter / → continue; Esc opens the story menu
- [ ] Screen reader (VoiceOver / TalkBack): new text is announced; decisions read question + options
- [ ] OS “Reduce motion” on → no sliding, count-ups or grid glide (opacity only)
- [ ] Browser zoom 200% / large text: still readable, scrolls inside the beat rather than clipping
- [ ] Light theme contrast readable; nothing conveyed by colour alone
- [ ] Read every screen against the Bible once (docs/SOURCE_TODOS.md lists every deviation)
