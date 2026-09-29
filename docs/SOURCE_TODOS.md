# Source & copy TODOs — need human confirmation

Implementation followed the V1.1 Game Bible. Nothing below was "improved".
Each item is either **gated** (hidden until a source flag is switched on),
**drafted** (a stage direction in the Bible was turned into minimal on-screen
copy, marked `draft: true` in `js/content.js`), or an **ambiguity** where the
Bible's wording was preserved and a presentation choice had to be made.

`npm run check` prints the current list of draft lines.

## A. Gated on the source packet (currently OFF — safer wording shown)

No source packet was supplied with the build, so every conditional item uses the
Bible's safer option. To enable one, confirm the source, then set the flag in
`SOURCE_FLAGS` at the top of `js/content.js`.

| Flag | Story | If ON | Currently shown |
|---|---|---|---|
| `washerwomenQuote` | 1 | Quote fragment “control the washing for the city” under “They offered to pay.” | “They offered to pay.” only |
| `barryFarmRepairAmount` | 7 | `$1.5 MILLION IN REPAIRS` | `MAJOR REPAIRS` |
| `warrenArrestCount` | 11 | “Roughly 500 arrests.” after the TRUCK → PEOPLE chain | nothing |

## B. Drafted copy (Bible gave a direction, not the words)

| # | Story | Bible direction | On-screen draft |
|---|---|---|---|
| 1 | 2 | “Briefly explain support for members, surviving widows, and children's education/apprenticeship.” | Support for members, surviving widows, and children's education and apprenticeship. |
| 2 | 5 | “Briefly explain separate federal litigation ending segregated bus seating.” | Separate federal litigation ended segregated bus seating. |
| 3 | 6 | “Briefly explain that SNCC/COFO activists and local leaders disagreed sharply; some feared … while others supported it.” | SNCC/COFO activists and local leaders disagreed sharply. Some feared the project would undercut grassroots leadership. Others supported it. |
| 4 | 8 | COINTELPRO bullet points | COINTELPRO targets the Panthers. / The breakfast program is specifically treated as politically threatening. / Surveillance and disruption intensify. |
| 5 | 8 | “Then briefly acknowledge internal strategic conflict within the Party.” | There is also internal strategic conflict within the Party. **Needs editor copy.** |
| 6 | 9 | “Use the Collective's own sourced sentiment: after years, members felt they had finally found each other.” | The Bible's paraphrase, shown as plain text (no quotation marks). **Replace with the Collective's verified wording if it should be quoted.** |
| 7 | 9 | “Use a quiet final beat rather than a recap chart.” | A silent slate: BOSTON · 1977 (from the story header “Boston, 1974–1977”). |
| 8 | 12 | “Briefly explain the volunteer/self-help network.” | A volunteer, self-help network. Health caution preserved: no holistic-health content was added. |

## C. LOOK CLOSER — no cards shipped

The Bible allows 2–3 LOOK CLOSER cards per story but supplies no card text. Per
§22 (“leave that card out instead of inventing it”) every `lookCloser` array is
empty, so the button does not render. The feature is fully built; add sourced
cards (with a `source` field) to enable it. Priority candidate named by the Bible:

- Story 11 — Warren County's later environmental-justice significance (Bible:
  “belongs in LOOK CLOSER, not the main ending”).

## D. Ambiguities — wording preserved, presentation choice flagged

1. **Section headings as labels.** A few Bible section headings name a specific
   thing the copy refers to (“the company”, “the larger organization”). They are
   shown as small labels: *Hamburger Grill*, *Sanitary Grocery* (S4), *Freedom
   Summer* (S6), *NBFO* (S9), *Pig Bank* (S10), *The Clubhouse* (S12),
   *DAY 2* (S5). Confirm, especially **NBFO** (acronym is not spelled out anywhere
   in the Bible).
2. **Story 9, Decision 3** has no question line in the Bible. None was invented;
   the screen shows the NBFO context line and the two options.
3. **Reveal headings.** Where a reveal has no heading in the Bible (S4 decision 2,
   S9 decision 3, S10, S12), §2.3's default “HERE'S WHAT HAPPENED” is used.
4. **“YOU'VE SEEN THIS BEFORE” label** (§7) is shown on connections 1–4. It is
   omitted on the Story 12 final connection (“Show cards only”). The Story 11
   pre-connection (“Show silently”) shows the label but no narration — confirm.
5. **“1 SHILLING” vs “1 SHILLING.”** Story 2's memory has a period; the Story 12
   final connection and §7 do not. Both preserved as written.
6. **Story 8 approved line** “A program isn't only an idea. It has opening
   hours.” is written in quotation marks in the Bible but is game copy, not a
   sourced quote. It is shown in italics without quotation marks so it is not
   mistaken for a historical quotation.
7. **Story 11 “Then Washington re-enters”** is rendered as a small *Washington*
   label above “Walter Fauntroy joins and is arrested.” No title for Fauntroy was
   added.
8. **Story 12 “Then time moves forward.”** rendered as a silent 1988 → TODAY
   year step with no copy.
9. **Home “CONTINUE”.** Shows BEGIN before anything is played, CONTINUE after,
   and STORIES once the campaign is finished.
10. **Ending pacing.** The Bible describes the ending as a sequence; to honour
    “no auto-advance”, each memory card, the grid, the chronological reorder, and
    the fade to WHAT NOW? each wait for a tap. The only timed element is the
    delayed REVISIT STORIES button, which the Bible specifies.
11. **About screen** paraphrases Bible §1 in second person, plus one privacy
    line. No political framing.
