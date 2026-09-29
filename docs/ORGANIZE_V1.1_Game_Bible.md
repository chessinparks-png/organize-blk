# ORGANIZE — V1.1 GAME BIBLE + CLAUDE CODE BUILD PACKET

Status: CONTENT / NARRATIVE ARCHITECTURE FROZEN FOR V1 BUILD  
Game name: **ORGANIZE**  
Version: **V1.1**  
Primary build target: **offline-capable mobile-first web app / PWA**  
Core interaction: **READ A LITTLE → THINK A LITTLE → TAP**

---

# 1. PRODUCT DEFINITION

ORGANIZE is a minimalist historical narrative game about Black organizing in the United States.

The player moves through 12 historical stories. Each story puts the player inside a concrete organizing problem, lets them witness or respond to historically grounded pressures, and then shows what actually happened.

The game is not:
- a textbook
- a quiz
- a trivia game
- a biography collection
- a "how to organize" course
- a simulation claiming to know alternate-history outcomes
- a political persuasion tool
- a branching narrative where the player rewrites history

The player should feel:
- curious
- surprised
- immersed
- occasionally uncomfortable
- rewarded for progressing
- trusted to draw conclusions without being lectured

The game should feel sleek, quiet, elegant, and deliberate.

---

# 2. NON-NEGOTIABLE DESIGN RULES

## 2.1 Interaction rule

Every interaction must remain compatible with:

**READ A LITTLE → THINK A LITTLE → TAP**

No required typing.
No required journaling.
No text entry.
No keyboard interaction.
Playable one-handed on a phone.

## 2.2 Big-type rule

Large typography is allowed and encouraged for:
- facts
- dates
- numbers
- names
- consequences
- unanswered questions
- dramatic historical turns

Large typography must NOT tell the player what the history "means."

Good:
- 20 → 3,000
- NO CONTRACT.
- 12 YEARS
- NOW THE NETWORK MOVES.
- THE LANDFILL WAS BUILT.
- DID YOU LOSE?
- WHAT NOW?

Bad:
- COLLECTIVE ACTION CREATES POWER.
- INFRASTRUCTURE IS THE KEY TO MOVEMENTS.
- LOCAL KNOWLEDGE ALWAYS MATTERS.

## 2.3 Decision rule

A decision only exists when:
- history contained genuine uncertainty, disagreement, cost, or tradeoff
- more than one choice is defensible in the moment
- the historical answer is not obvious from the setup

Never reward the player for picking what history did.

No:
- CORRECT
- WRONG
- green checkmarks
- red Xs
- bonus XP for historical alignment

After a choice, use:

# HERE'S WHAT HAPPENED

When appropriate:
- THEY DISAGREED.
- THEY TRIED BOTH.
- SOMETHING ELSE CHANGED.
- THE GROUP CHANGED SHAPE.
- THE LANDFILL WAS BUILT.

## 2.4 Witness rule

Many scenes should have no choice.

The player may simply:
- tap through escalating numbers
- watch years pass
- see a network grow
- see a system fail
- watch an organization change
- see a consequence appear

This is intentional.

## 2.5 Historical integrity

Do not:
- invent dialogue
- invent meetings
- invent votes
- invent tactical disputes
- invent quotes
- invent emotional reactions
- simplify tactic → victory
- make one person stand in for an entire organization when disagreement existed
- turn sourced political claims into the game's own universal truth

If a quote is shown, it must be sourced.

## 2.6 Story length

Target story playtime:
- shortest: ~2 minutes
- longest: ~5 minutes
- most: ~3 minutes

Normal screen copy:
- 1–4 short paragraphs maximum
- usually 20–60 words
- decision options: 2–8 words
- avoid scrolling where possible

## 2.7 Optional depth

Every story may include a **LOOK CLOSER** button after completion.

LOOK CLOSER is optional.
No XP.
Never required for understanding later gameplay.

Possible cards:
- THE PEOPLE
- THE PLACE
- THE WORK
- THE DOCUMENT
- THE OPPOSITION
- WHAT HAPPENED LATER

---

# 3. VISUAL / EXPERIENCE DIRECTION

## 3.1 Mood

Minimal.
Editorial.
Museum-like without feeling institutional.
Modern but not trendy.
Calm.
Dark-mode-first is acceptable, but support light mode if easy.

No clutter.
No badges everywhere.
No confetti.
No cartoon trophies.
No loud gamification.

## 3.2 Typography

Typography carries much of the emotional experience.

Use:
- one strong display face or system-equivalent
- one clean readable body face
- strong contrast
- generous whitespace

Large historical numbers should feel cinematic.

## 3.3 Motion

Use subtle motion only:
- fade in
- fade out
- number progression
- year progression
- card reveal
- quiet grid rearrangement
- short progress animation

Avoid:
- bouncy UI
- excessive parallax
- celebratory particle effects
- arcade-like transitions

## 3.4 Buttons

Large tap targets.
Simple.
Usually stacked vertically.
No more than 3 options except when historically necessary.
Binary choices are encouraged where appropriate.

## 3.5 Progress

Show:
- story number
- campaign progress
- total XP quietly

XP is secondary.

Do not show XP during the final story ending.

---

# 4. TECHNICAL BUILD REQUIREMENTS

Build ORGANIZE as a static, offline-capable web app / PWA.

Requirements:
- mobile-first
- responsive desktop layout
- installable on phone
- offline after first load
- no backend
- no login
- no cloud dependency
- no analytics in V1
- no ads
- no external API needed at runtime
- no network requirement after assets are cached

Suggested implementation:
- HTML / CSS / vanilla JS OR lightweight framework if truly beneficial
- service worker for offline caching
- web app manifest
- localStorage or IndexedDB for progress
- content stored locally in structured JSON/JS objects
- no build dependency that makes distribution fragile unless necessary

Save locally:
- current story
- completed stories
- XP
- optional story revisit state
- theme preference
- reduced motion preference if exposed

Provide:
- Restart Story
- Revisit Stories
- Reset Progress (with confirmation)

No user-generated content.

---

# 5. CORE NAVIGATION

## Home

Logo / wordmark:
# ORGANIZE

Primary button:
**CONTINUE**

Secondary:
**STORIES**

Small:
**ABOUT**

Optional:
theme toggle

## Story flow

Story intro
→ tap-through witness beats
→ decision when present
→ HERE'S WHAT HAPPENED
→ continuation beats
→ memory card
→ +100 XP
→ optional LOOK CLOSER
→ NEXT STORY

## Revisit screen

Show 12 story cards.
Completed cards reveal memory phrase.
Incomplete cards show number/title only or remain muted.

Do not show test scores.

---

# 6. XP

Story completion:
+100 XP

Total possible V1 XP:
1,200

No XP for:
- correct choices
- optional reading
- connections
- remembering names
- dates
- revisits

On Story 12:
update XP internally but do not interrupt the ending with a visible XP reward.

---

# 7. CONNECTION MECHANIC

Use sparingly.

Visual label:
# YOU'VE SEEN THIS BEFORE

Connections should compare different historical surfaces with a shared structural tension.

No matching quizzes unless explicitly specified.

V1.1 connections:

## Connection 1 — Story 4
Atlanta:
THEY NEEDED YOUR LABOR.

Washington:
THEY NEEDED YOUR MONEY.

No question.

## Connection 2 — Story 5
12 YEARS
beside
381 DAYS

No explanation.

## Connection 3 — Story 6
Montgomery:
THE NETWORK EXISTED BEFORE ROSA PARKS.

Mississippi:
PEOPLE WERE ORGANIZING BEFORE SNCC ARRIVED.

No quiz.

## Connection 4 — before / within Story 11
1932:
STILL NO CONTRACT.

1970s:
FREEDOM FARM COLLAPSES.

1982:
THE LANDFILL WAS BUILT.

No explanation.

Then:
DID YOU LOSE?

## Connection 5 — finale
1 SHILLING
BREAKFAST.
30 OF 1,500
US HELPING US

No explanatory moral.

---

# 8. APPROVED CAMPAIGN ORDER

1. THE WASHERWOMEN
2. ONE SHILLING
3. DON'T LET THE COMPANY KNOW
4. BUY WHERE YOU CAN WORK
5. BEFORE ROSA PARKS
6. WHO KNOWS THIS PLACE?
7. WE LIVE HERE.
8. BREAKFAST.
9. WE FOUND EACH OTHER.
10. 40 ACRES
11. DID YOU LOSE?
12. US HELPING US

---

# 9. STORY 1 — THE WASHERWOMEN

Location:
Atlanta, 1881

Player role:
One of the Black washerwomen joining the movement.

Memory:
# 20 → 3,000

Decision count:
1

## OPEN

ATLANTA · 1881

HAUL.

tap

SCRUB.

tap

BOIL.

tap

IRON.

tap

Short context:
You earn your living washing other people's clothes by hand.

Twenty washerwomen meet.

They agree on a common rate.

## GROWTH

20

tap

200

tap

1,000

tap

# 3,000

Short context:
They canvass neighborhoods and build support through community networks.

## PRESSURE

The city responds with arrests, fines, and a proposed $25 annual license aimed at washerwomen's organizations.

## DECISION

What do you do?

- PAY IT
- REFUSE IT
- END THE STRIKE

After tap:

# HERE'S WHAT HAPPENED

They offered to pay.

Use the sourced historical wording only if the quote is available in the approved source packet. A short verified fragment may be used:
"control the washing for the city"

Then:

# THE LICENSE FEE WAS DROPPED.

tap

# THE STEAM LAUNDRIES KEPT COMING.

Do not add a moral summary.

## COMPLETE

THE WASHERWOMEN

+100 XP

Memory:
# 20 → 3,000

---

# 10. STORY 2 — ONE SHILLING

Location:
Philadelphia, 1787–1793

Player role:
A member of the Free African Society community.

Memory:
# 1 SHILLING.

Decision count:
1

## OPEN

PHILADELPHIA · 1787

# 1 SHILLING

Every month.

tap

For a full year before you can draw assistance.

Short context:
Members build a shared fund for sickness, family support, and other needs.

## DECISION

A member has fallen three months behind.

What happens?

- REMOVE THEM
- ASK WHY
- IGNORE IT

## REVEAL

# HERE'S WHAT HAPPENED

Members first investigated why someone had fallen behind. If there was no sufficient reason and payment still did not resume, removal could follow.

## CARE SEQUENCE

SICKNESS

tap

WIDOWS

tap

CHILDREN

tap

Briefly explain support for members, surviving widows, and children's education/apprenticeship.

## 1793 TURN

PHILADELPHIA · 1793

# FEVER.

Yellow fever spreads through the city.

Black Philadelphians are asked to help nurse the sick and bury the dead.

The belief that Black residents were immune proves false.

Black residents die too.

Then:

# YOU ALREADY HAVE AN ORGANIZATION.

Witness sequence:

NURSE

BURY

CARE

Then:

# THE ACCUSATIONS COME AFTERWARD.

Black caregivers are accused of exploiting the crisis.

Then:

# ALLEN AND JONES PUBLISH THEIR OWN ACCOUNT.

End here.

## COMPLETE

ONE SHILLING

+100 XP

Memory:
# 1 SHILLING.

---

# 11. STORY 3 — DON'T LET THE COMPANY KNOW

Location:
Washington, 1925–1937

Player role:
A Pullman porter's wife / family member helping the organizing effort.

Memory:
# 12 YEARS

Decision count:
1

## OPEN

WASHINGTON · 1925

Pullman porters want an independent union.

The company watches the men.

tap

Women carry literature into homes.

tap

Organizing moves where surveillance is weaker.

Introduce:
# ROSINA TUCKER

One short line:
Her husband is a Pullman porter. She joins the Washington organizing effort.

Do not promise she will reappear.

## TIME

1925

tap

1928

# NO CONTRACT.

tap

1932

# STILL NO CONTRACT.

Short context:
Membership has fallen. Some supporters have lost jobs.

## DECISION

Keep going?

- KEEP GOING
- STOP

## REVEAL

# HERE'S WHAT HAPPENED

Some porters left.
The Brotherhood survived.

Then:

# SOMETHING ELSE CHANGED.

Federal labor protections improved the union's position.

1935:
AFL charter.

1937:

# PULLMAN SIGNS.

Then:

# 12 YEARS

## COMPLETE

+100 XP

Memory:
# 12 YEARS

---

# 12. STORY 4 — BUY WHERE YOU CAN WORK

Location:
Washington, 1933–1938

Player role:
A Black Washington resident participating in an employment campaign.

Memory:
# WHAT DO THEY NEED FROM YOU?

Decision count:
2

## OPEN

# STILL IN WASHINGTON...

WASHINGTON · 1933

Black residents spend money in neighborhood businesses that often refuse to employ Black workers.

Witness the Hamburger Grill campaign briefly:
workers replaced
community pressure
boycott / picket
workers return

Do not turn this into a decision.

## SANITARY GROCERY

The New Negro Alliance asks the company to hire Black clerks as positions open.

The company refuses.

## DECISION 1

What pressure comes next?

- PICKET
- KEEP NEGOTIATING
- MOVE ON

## REVEAL

# HERE'S WHAT HAPPENED

They picketed.

Show documented slogan:

# BUY WHERE YOU CAN WORK

## TIME JUMP

1933

→

1938

The company seeks legal restrictions on the picketing.

## DECISION 2

A court orders the picket stopped.

What now?

- CHALLENGE IT
- END IT
- CHANGE TACTICS

## REVEAL

The case reaches the U.S. Supreme Court.

The Court holds that the dispute falls within federal labor-dispute law and that the lower federal court could not issue the injunction as it had.

Then:

The Court did **not** order stores to hire Black workers.

## CONNECTION 1

ATLANTA

THEY NEEDED YOUR LABOR.

tap

WASHINGTON

THEY NEEDED YOUR MONEY.

No question.

## COMPLETE

+100 XP

Memory:
# WHAT DO THEY NEED FROM YOU?

---

# 13. STORY 5 — BEFORE ROSA PARKS

Location:
Montgomery, 1950s–1956

Player role:
A Black Montgomery resident participating in the boycott movement.

Memory:
# 381 DAYS

Decision count:
2

## OPEN

MONTGOMERY · BEFORE 1955

Black riders have complained about treatment on the buses for years.

A group of Black women has already been pressing city officials and discussing boycott strategy.

Reveal name after context:

# WOMEN'S POLITICAL COUNCIL

Then:

DECEMBER 1, 1955

# ROSA PARKS IS ARRESTED.

Then:

# NOW THE NETWORK MOVES.

Witness:
leaflets
one-day boycott
mass participation

Do not ask whether to continue.

## DECISION 1 — DEMANDS

# YOU'RE GOING TO KEEP GOING.

What do you ask for?

- END SEGREGATED SEATING
- FAIRER SEATING WITHIN THE RULES
- BLACK DRIVERS ON BLACK ROUTES

## REVEAL

# HERE'S WHAT HAPPENED

The early demands included:
- courteous treatment
- Black drivers on predominantly Black routes
- revised seating that did not yet require abolishing segregation

Do not describe the demands as wise or timid.

Later, strategy shifts toward directly challenging segregation itself.

## DAY 2

People still need to get to work.

Witness:

PEOPLE WALK.

tap

TAXIS HELP.

tap

THE CITY PRESSURES THEM.

tap

Then:

325 CARS

tap

22 CHURCH STATION WAGONS

tap

43 DISPATCH STATIONS

tap

42 PICKUP STATIONS

tap

~30,000 RIDES A DAY

Then:

# DAY 200

No moral summary.

## DECISION 2 — PAUSE

A proposal could pause the boycott while negotiations continue.

What would you support?

- PAUSE
- KEEP GOING
- SET CONDITIONS

## REVEAL

# THEY DIDN'T ALL AGREE.

Then show:
"You chose [PLAYER CHOICE]. Some of them did too."

No scoring.

Then split screen:

STREET
# BOYCOTT

COURT
# BROWDER v. GAYLE

Briefly explain separate federal litigation ending segregated bus seating.

Then:

# DAY 381

## CONNECTION 2

12 YEARS

beside

381 DAYS

Nothing else.

## COMPLETE

+100 XP

Memory:
# 381 DAYS

Small line:
And every one had a morning.

---

# 14. STORY 6 — WHO KNOWS THIS PLACE?

Location:
Mississippi, early 1960s–1964

Player role:
A young SNCC field organizer.

Memory:
# WHO KNOWS THIS PLACE?

Decision count:
2

## OPEN

MISSISSIPPI

You are willing to organize.

But people were organizing here before you arrived.

Introduce:

# AMZIE MOORE

Brief context:
An experienced Mississippi organizer with local relationships and knowledge.

Witness:
local introductions
homes
churches
routes
risks

## FANNIE LOU HAMER PLANT

# FANNIE LOU HAMER

She attempts to register to vote.

That same day, she is fired from the plantation where she has worked for 18 years.

Do not say "remember her."

## DECISION 1

You are new.
Local people know the relationships and the risks.

How do you begin?

- START PUBLICLY
- WORK THROUGH LOCAL NETWORKS

## REVEAL

SNCC organizers often depended on existing local organizers and networks to know where work could take root.

Do not write a moral summary.

## CONNECTION 3

MONTGOMERY

THE NETWORK EXISTED BEFORE ROSA PARKS.

tap

MISSISSIPPI

PEOPLE WERE ORGANIZING BEFORE SNCC ARRIVED.

No quiz.

## FREEDOM SUMMER

1964

Violence continues.
National attention remains limited.

Bringing hundreds of mostly white Northern students could attract attention and resources.

It could also overwhelm local leadership.

## DECISION 2

Bring them?

- YES
- NO

## REVEAL

# THEY DISAGREED.

Show:
"You chose [YES/NO]. So did some of them."

Briefly explain that SNCC/COFO activists and local leaders disagreed sharply; some feared the project would undercut grassroots leadership while others supported it.

Freedom Summer proceeds.

## COMPLETE

+100 XP

Memory:
# WHO KNOWS THIS PLACE?

---

# 15. STORY 7 — WE LIVE HERE.

Location:
Barry Farm, Washington, 1960s

Player role:
A Barry Farm resident.

Memory:
# WE LIVE HERE.

Decision count:
1

## OPEN

# BACK IN WASHINGTON...

BARRY FARM · 1960s

RATS.

tap

LEAKS.

tap

BROKEN FAUCETS.

tap

BAD FURNACES.

Short context:
Housing officials control the buildings.
Residents live with the consequences.

## ORGANIZING

Federal anti-poverty resources and local organizing support enter the area.

Introduce:

# THE BAND OF ANGELS

LILLIAN WRIGHT
ETTA MAE HORN

No biography cards.

Witness:
residents organize around conditions
pressure housing officials
major repair commitment

Visual:

BROKEN

↓

ORGANIZED

↓

# $1.5 MILLION IN REPAIRS

If exact amount is not included in the supplied source packet, render:
# MAJOR REPAIRS

Do not invent precision.

## DECISION

Housing conditions improve.

But residents are also confronting income, health care, welfare, and public-agency treatment.

What should the group do?

- STAY WITH HOUSING
- EXPAND THE WORK

## REVEAL

# HERE'S WHAT HAPPENED

They expanded.

Briefly show:
housing
income
health
welfare rights

No lesson line.

## COMPLETE

+100 XP

Memory:
# WE LIVE HERE.

---

# 16. STORY 8 — BREAKFAST.

Location:
Oakland, 1969

Player role:
Witness / local Panther program participant

Memory:
# BREAKFAST.

Decision count:
0

This story MUST contain no decision unless historical content is later explicitly revised.

## OPEN

OAKLAND · 1969

You want fundamental political change.

A child is going to school hungry tomorrow.

# TOMORROW MORNING COMES FIRST.

Then:

# BREAKFAST.

## LOGISTICS CHAIN

FOOD

↓

KITCHEN

↓

VOLUNTEERS

↓

DONATIONS

↓

COOK

↓

CLEAN

↓

# DO IT AGAIN TOMORROW.

Then:

"A program isn't only an idea. It has opening hours."

This line is approved.

## EXPANSION

Fast visual only:

BREAKFAST

CLINICS

SICKLE-CELL TESTING

SCHOOLS

LEGAL AID

TRANSPORTATION

Do not linger.

## TURN

# THE FBI NOTICES BREAKFAST.

Briefly explain:
- COINTELPRO targets the Panthers
- the breakfast program is specifically treated as politically threatening
- surveillance / disruption intensify

Witness:

SURVEILLANCE

tap

DISINFORMATION

tap

RAIDS

Then briefly acknowledge internal strategic conflict within the Party.

Do not turn this into a lecture.

## END

# BREAKFAST.

No interpretation.

## COMPLETE

+100 XP

Memory:
# BREAKFAST.

---

# 17. STORY 9 — WE FOUND EACH OTHER.

Location:
Boston, 1974–1977

Player role:
A member of the Combahee River Collective.

Memory:
# WE FOUND EACH OTHER.

Decision count:
3

## OPEN

BOSTON · 1974

Use the Collective's own sourced sentiment:
after years, members felt they had finally found each other.

Do not invent dialogue beyond verified text.

Then:

You have found people who recognize experiences that other movements often failed to address.

You still do not know what this group will become.

## DECISION 1

What should come first?

- TALK
- POLITICAL WORK
- STUDY

## REVEAL

# ALL OF THESE — BUT NOT AT ONCE.

Briefly explain:
consciousness-raising
individual political work
later study/writing

## EXPERIENCE SEQUENCE

WORK
SEXISM
RACISM
FAMILY
SEXUALITY
MONEY

No poster summary.

## STALL

Membership drops.
Meetings slow.
Disagreements deepen.

## DECISION 2

What does that mean?

- IT'S FAILING
- CHANGE HOW WE WORK
- KEEP MEETING

## REVEAL

# THE GROUP CHANGED SHAPE.

Some members stopped attending.
Those remaining reorganized around study, writing, and political work.

## NBFO

The Collective has serious disagreements with the larger organization it came from.

## DECISION 3

- STAY
- GO INDEPENDENT

## REVEAL

They became an independent collective.

Do not add a moral.

## END

Use a quiet final beat rather than a recap chart.

## COMPLETE

+100 XP

Memory:
# WE FOUND EACH OTHER.

---

# 18. STORY 10 — 40 ACRES

Location:
Mississippi, 1969–1970s

Player role:
A poor local family / cooperative member.

Memory:
# 30 OF 1,500

Decision count:
1

## OPEN

MISSISSIPPI · 1969

# FANNIE LOU HAMER

No biography.
Player has already encountered her in Story 6.

Then:

# 40 ACRES

Brief context:
Freedom Farm Cooperative begins.

Witness:
food crops
cash crops
land
families

## RESOURCE SCREEN

# $1 / MONTH

tap

# 30 CAN PAY

tap

# ~1,500 ARE CONNECTED

## DECISION

The people who need the cooperative most often have the least money.

What do you protect?

- THE BUDGET
- ACCESS

## REVEAL

Many families who could not pay still benefited.

Outside fundraising helped sustain the project.

No poster line.

## PIG BANK

35

+

5

=

40 PIGS

↓

PIGLETS

↓

FAMILIES

↓

FOOD

↓

MORE PIGS

## EXPANSION

# +640 ACRES

Then deterioration is witnessed:

DROUGHT

tap

FLOODS

tap

CROP LOSSES

tap

DONATIONS FALL

tap

DEBT REMAINS

Then:

# IT HELPED PEOPLE.

tap

# IT STILL COLLAPSED.

No consolation.

## COMPLETE

+100 XP

Memory:
# 30 OF 1,500

---

# 19. STORY 11 — DID YOU LOSE?

Location:
Warren County, North Carolina, 1982

Player role:
Local resident / protest participant.

Memory:
# DID YOU LOSE?

Decision count:
1

## PRE-CONNECTION

Show silently:

1932
# STILL NO CONTRACT.

tap

1970s
# FREEDOM FARM COLLAPSES.

tap

1982
# THE LANDFILL WAS BUILT.

Then begin story.

## OPEN

WARREN COUNTY · 1982

The state plans to bury PCB-contaminated soil in the county.

Residents have already:
- attended hearings
- gone to court

The landfill is still coming.

## DECISION

The trucks are arriving.

What changes now?

- BLOCK THEM
- KEEP FIGHTING IN COURT
- NEGOTIATE

## REVEAL

# PEOPLE PUT THEIR BODIES IN THE ROAD.

Witness:

TRUCK

↓

PEOPLE

↓

ARRESTS

↓

MORE PEOPLE

Briefly mention roughly 500 arrests if supported in supplied sources.

Then Washington re-enters:
Walter Fauntroy joins and is arrested.

Do not include a designer explanation about "federal power."

## LOSS

Black screen.

# THE LANDFILL WAS BUILT.

tap

# THE LANDFILL WAS BUILT.

Then witness:
Fauntroy requests a federal investigation.
GAO identifies a broader racial/economic pattern in siting.

Then:

# THE QUESTION CHANGED.

WHY HERE?

↓

# WHERE ELSE?

Then:

# THE LANDFILL WAS STILL BUILT.

Finally:

# DID YOU LOSE?

No answer.

## COMPLETE

+100 XP

Memory:
# DID YOU LOSE?

Any explanation of Warren County's later environmental-justice significance belongs in LOOK CLOSER, not the main ending.

---

# 20. STORY 12 — US HELPING US

Location:
Washington, 1980s → today

Player role:
Member of the Black gay Washington community / volunteer network.

Memory:
# US HELPING US

Decision count:
1

## OPEN

# BACK IN WASHINGTON...

EARLY 1980s

THE CLUBHOUSE

Before illness, establish community:

DANCE

tap

FRIENDS

tap

LOVE

tap

COMMUNITY

Then:

Familiar faces begin disappearing.

tap

People are becoming sick.

tap

People are dying.

No decision here.

## INFORMAL CARE

Witness:

RIDES

tap

FOOD

tap

BILLS

tap

COMPANY

Then:

# CARE STARTS INFORMALLY.

## 1985

# US HELPING US

Briefly explain the volunteer/self-help network.

Health caution:
Any historical holistic-health practices must be described historically and never presented as substitutes for evidence-based HIV treatment.

## DECISION

More people rely on the network.

Informal care is flexible.

Formal organization can bring funding, staff, and programs—but also administration and structure.

What now?

- STAY INFORMAL
- BUILD AN ORGANIZATION

## REVEAL

1988:
the network incorporates as a nonprofit.

Then time moves forward.

## PRESENT BRIDGE

WASHINGTON · TODAY

# STILL HERE.

Briefly state:
Us Helping Us continues operating programs and services in Washington.

No promotional copy.

## FINAL CONNECTION

Show cards only:

# 1 SHILLING

# BREAKFAST.

# 30 OF 1,500

# US HELPING US

No explanatory caption required.

## COMPLETE

Internally add +100 XP.

Do NOT display XP before the ending.

---

# 21. CAMPAIGN ENDING

After Story 12:

Black screen.

Memory cards appear one at a time:

20 → 3,000  
1 SHILLING.  
12 YEARS  
WHAT DO THEY NEED FROM YOU?  
381 DAYS  
WHO KNOWS THIS PLACE?  
WE LIVE HERE.  
BREAKFAST.  
WE FOUND EACH OTHER.  
30 OF 1,500  
DID YOU LOSE?  
US HELPING US

Then cards shrink into a simple grid.

Then the grid silently reorders itself chronologically.

Display years subtly:

1787  
1881  
1925  
1933  
1955  
1960s  
1964  
1969  
1969  
1974  
1982  
1985 → TODAY

No narration.

Then all cards fade.

Black.

# WHAT NOW?

Nothing underneath at first.

After a short delay:
**REVISIT STORIES**

Do not display:
- congratulations
- final score
- certificate
- "you learned..."
- action prompt
- political call to action
- essay box

---

# 22. LOOK CLOSER

Optional after each story.

Implementation:
modal / drawer / secondary page.

Never required.

No XP.

Keep content local.

For V1, each story may have 2–3 short cards.

If source text is not yet supplied for a Look Closer card, leave that card out instead of inventing it.

---

# 23. ACCESSIBILITY

Required:
- keyboard navigable on desktop
- screen-reader labels
- sufficient contrast
- reduced-motion support
- text scales cleanly
- large tap targets
- no information encoded only by color
- no auto-advancing text
- no mandatory sound

Sound is optional in V1.
If used, provide mute.

---

# 24. CONTENT ARCHITECTURE

Do NOT hard-code all story markup manually if avoidable.

Store each story as structured content.

Suggested data model:

```js
{
  id: "washerwomen",
  order: 1,
  title: "THE WASHERWOMEN",
  place: "Atlanta",
  period: "1881",
  memory: "20 → 3,000",
  xp: 100,
  beats: [
    { type: "title", text: "ATLANTA · 1881" },
    { type: "big", text: "HAUL." },
    { type: "tap_continue" },
    { type: "decision", ... },
    { type: "reveal", ... },
    { type: "connection", ... }
  ],
  lookCloser: [...]
}
```

Supported beat types should include:
- title
- body
- big
- number
- tapSequence
- decision
- reveal
- split
- timeline
- connection
- storyComplete
- finalGrid

This keeps content separate from presentation.

---

# 25. STATE LOGIC

A decision should save:
- story id
- decision id
- player's selected option

This is only so the game can later say:
"You chose PAUSE. Some of them did too."

Do not compute:
- alignment
- ideology
- organizer score
- personality result
- right/wrong score

No profiling.

---

# 26. SOURCE / CONTENT DISCIPLINE FOR CLAUDE CODE

Claude Code is an implementer here.

It must NOT:
- add new historical facts
- rewrite decisions
- add extra lessons
- change story order
- add new stories
- invent quotes
- invent dialogue
- "improve" political framing
- add quizzes
- add achievements
- add streaks
- add leaderboards
- add AI-generated content at runtime

If a copy block seems unclear:
leave a TODO marker and flag it in the implementation notes instead of rewriting history.

---

# 27. V1 ACCEPTANCE CHECKLIST

A build is ready for review only if:

- [ ] App works offline after first load
- [ ] Mobile-first layout is polished
- [ ] All 12 stories are present in approved order
- [ ] Decision count matches approved structure
- [ ] Story 8 has zero decisions
- [ ] No right/wrong choice feedback exists
- [ ] No "both" answer is used as an easy historical winner
- [ ] No moral-summary posters were added
- [ ] Story 12 does not show final XP before ending
- [ ] Final grid reorders chronologically
- [ ] Final screen says only WHAT NOW? before delayed revisit control
- [ ] Progress persists locally
- [ ] User can revisit completed stories
- [ ] User can reset progress
- [ ] No network/API dependency at runtime
- [ ] No analytics
- [ ] No login
- [ ] No backend
- [ ] Accessibility basics work
- [ ] Reduced motion works
- [ ] Source cautions are preserved
- [ ] No content has been invented by the implementation model

---

# 28. BUILD PHILOSOPHY

The app should feel more like:
- an interactive essay
- a quiet narrative game
- a museum installation in your pocket

and less like:
- Duolingo
- a school LMS
- a civics quiz
- a PowerPoint
- a nonprofit training module

The player should leave with historical situations living in memory.

Not a list of lessons.

That is the product.
