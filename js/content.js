/*
 * ORGANIZE — V1.1 CONTENT FILE
 * ---------------------------------------------------------------------------
 * This is the ONE file that holds every word the player sees.
 * Source of truth: docs/ORGANIZE_V1.1_Game_Bible.md (content frozen for V1).
 *
 * Editing rules
 *  - Story text is transcribed from the Game Bible. Do not rewrite it here
 *    without updating the Bible first.
 *  - Any line NOT taken verbatim from the Bible is marked `draft: true` and a
 *    `note`. These are listed in docs/SOURCE_TODOS.md and must be confirmed
 *    by a human editor. `npm run check` lists them too.
 *  - Content that the Bible makes conditional on the source packet uses
 *    `requires: "<flag>"`. It only renders if the matching flag in
 *    SOURCE_FLAGS is true; otherwise its `fallback` renders (or nothing).
 *  - LOOK CLOSER cards render only if present in a story's `lookCloser` array.
 *    Leave the array empty until sourced text exists. Never invent a card.
 *
 * Beat types (see js/app.js for renderers)
 *  title        { text, heading? }                       place/date slate
 *  big          { text, kicker?, lines?, dark? }         large type
 *  body         { lines, kicker?, stepped? }             short paragraphs
 *  number       { steps, kicker? }                       counting progression
 *  tapSequence  { items, mode: replace|stack|chain, kicker?, instant? }
 *  decision     { id, question?, options, lines?, heading?, kicker? }
 *  reveal       { decision, heading?, echo?, lines?, list?, quote?, kicker? }
 *  split        { left:{label,text}, right:{label,text}, lines? }
 *  timeline     { steps:[{year, text?, big?, lines?}] }
 *  connection   { layout: pairs|side|years|cards, items, label? }
 *  storyComplete — appended automatically (unless story.silentComplete)
 *  finalGrid    — the campaign ending, driven by `ending` below
 *
 * A line/item may be a string or { text, draft?, note?, requires?, fallback? }.
 * Inline **double asterisks** render as emphasis.
 */
(function () {
  'use strict';

  // Flip to true ONLY once the approved source packet confirms the content.
  var SOURCE_FLAGS = {
    // Story 1 — "Use the sourced historical wording only if the quote is
    // available in the approved source packet."
    washerwomenQuote: false,
    // Story 7 — "If exact amount is not included in the supplied source
    // packet, render: MAJOR REPAIRS"
    barryFarmRepairAmount: false,
    // Story 11 — "Briefly mention roughly 500 arrests if supported in
    // supplied sources."
    warrenArrestCount: false
  };

  var HERE = "HERE'S WHAT HAPPENED";

  var stories = [
    // ---------------------------------------------------------------- 1
    {
      id: 'washerwomen',
      order: 1,
      title: 'THE WASHERWOMEN',
      place: 'Atlanta',
      period: '1881',
      role: 'One of the Black washerwomen joining the movement.',
      memory: '20 → 3,000',
      chrono: { label: '1881', rank: 2 },
      xp: 100,
      beats: [
        { type: 'title', text: 'ATLANTA · 1881' },
        { type: 'tapSequence', mode: 'replace', items: ['HAUL.', 'SCRUB.', 'BOIL.', 'IRON.'] },
        { type: 'body', lines: [
          "You earn your living washing other people's clothes by hand.",
          'Twenty washerwomen meet.',
          'They agree on a common rate.'
        ] },
        { type: 'number', steps: ['20', '200', '1,000', '3,000'] },
        { type: 'body', lines: ['They canvass neighborhoods and build support through community networks.'] },
        { type: 'decision', id: 'license',
          lines: ["The city responds with arrests, fines, and a proposed $25 annual license aimed at washerwomen's organizations."],
          question: 'What do you do?',
          options: ['PAY IT', 'REFUSE IT', 'END THE STRIKE'] },
        { type: 'reveal', decision: 'license', heading: HERE,
          lines: ['They offered to pay.'],
          quote: { text: 'control the washing for the city', requires: 'washerwomenQuote' } },
        { type: 'big', text: 'THE LICENSE FEE WAS DROPPED.' },
        { type: 'big', text: 'THE STEAM LAUNDRIES KEPT COMING.' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'one-shilling',
      order: 2,
      title: 'ONE SHILLING',
      place: 'Philadelphia',
      period: '1787–1793',
      role: 'A member of the Free African Society community.',
      memory: '1 SHILLING.',
      chrono: { label: '1787', rank: 1 },
      xp: 100,
      beats: [
        { type: 'title', text: 'PHILADELPHIA · 1787' },
        { type: 'tapSequence', mode: 'stack', items: [
          { text: '1 SHILLING', style: 'big' },
          { text: 'Every month.', style: 'para' },
          { text: 'For a full year before you can draw assistance.', style: 'para' }
        ], firstTogether: 2 },
        { type: 'body', lines: ['Members build a shared fund for sickness, family support, and other needs.'] },
        { type: 'decision', id: 'behind',
          lines: ['A member has fallen three months behind.'],
          question: 'What happens?',
          options: ['REMOVE THEM', 'ASK WHY', 'IGNORE IT'] },
        { type: 'reveal', decision: 'behind', heading: HERE,
          lines: ['Members first investigated why someone had fallen behind. If there was no sufficient reason and payment still did not resume, removal could follow.'] },
        { type: 'tapSequence', mode: 'stack', items: [
          'SICKNESS', 'WIDOWS', 'CHILDREN',
          { text: "Support for members, surviving widows, and children's education and apprenticeship.", style: 'para',
            draft: true, note: "Bible: \"Briefly explain support for members, surviving widows, and children's education/apprenticeship.\" Wording assembled from that direction; needs editor copy." }
        ] },
        { type: 'title', text: 'PHILADELPHIA · 1793' },
        { type: 'big', text: 'FEVER.', lines: ['Yellow fever spreads through the city.'] },
        { type: 'body', stepped: true, lines: [
          'Black Philadelphians are asked to help nurse the sick and bury the dead.',
          'The belief that Black residents were immune proves false.',
          'Black residents die too.'
        ] },
        { type: 'big', text: 'YOU ALREADY HAVE AN ORGANIZATION.' },
        { type: 'tapSequence', mode: 'replace', items: ['NURSE', 'BURY', 'CARE'] },
        { type: 'big', text: 'THE ACCUSATIONS COME AFTERWARD.',
          lines: ['Black caregivers are accused of exploiting the crisis.'] },
        { type: 'big', text: 'ALLEN AND JONES PUBLISH THEIR OWN ACCOUNT.' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'dont-let-the-company-know',
      order: 3,
      title: "DON'T LET THE COMPANY KNOW",
      place: 'Washington',
      period: '1925–1937',
      role: "A Pullman porter's wife / family member helping the organizing effort.",
      memory: '12 YEARS',
      chrono: { label: '1925', rank: 3 },
      xp: 100,
      beats: [
        { type: 'title', text: 'WASHINGTON · 1925' },
        { type: 'tapSequence', mode: 'stack', firstTogether: 2, items: [
          { text: 'Pullman porters want an independent union.', style: 'para' },
          { text: 'The company watches the men.', style: 'para' },
          { text: 'Women carry literature into homes.', style: 'para' },
          { text: 'Organizing moves where surveillance is weaker.', style: 'para' }
        ] },
        { type: 'big', text: 'ROSINA TUCKER',
          lines: ['Her husband is a Pullman porter. She joins the Washington organizing effort.'] },
        { type: 'timeline', steps: [
          { year: '1925' },
          { year: '1928', text: 'NO CONTRACT.' },
          { year: '1932', text: 'STILL NO CONTRACT.' }
        ] },
        { type: 'decision', id: 'keep-going',
          lines: ['Membership has fallen. Some supporters have lost jobs.'],
          question: 'Keep going?',
          options: ['KEEP GOING', 'STOP'] },
        { type: 'reveal', decision: 'keep-going', heading: HERE,
          lines: ['Some porters left.', 'The Brotherhood survived.'] },
        { type: 'big', text: 'SOMETHING ELSE CHANGED.',
          lines: ["Federal labor protections improved the union's position."] },
        { type: 'timeline', steps: [
          { year: '1935', text: 'AFL charter.', small: true },
          { year: '1937', text: 'PULLMAN SIGNS.' }
        ] },
        { type: 'big', text: '12 YEARS' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'buy-where-you-can-work',
      order: 4,
      title: 'BUY WHERE YOU CAN WORK',
      place: 'Washington',
      period: '1933–1938',
      role: 'A Black Washington resident participating in an employment campaign.',
      memory: 'WHAT DO THEY NEED FROM YOU?',
      chrono: { label: '1933', rank: 4 },
      xp: 100,
      beats: [
        { type: 'big', text: 'STILL IN WASHINGTON...' },
        { type: 'title', text: 'WASHINGTON · 1933' },
        { type: 'body', lines: ['Black residents spend money in neighborhood businesses that often refuse to employ Black workers.'] },
        { type: 'tapSequence', mode: 'chain', kicker: 'Hamburger Grill',
          items: ['workers replaced', 'community pressure', 'boycott / picket', 'workers return'] },
        { type: 'decision', id: 'pressure', kicker: 'Sanitary Grocery',
          lines: [
            'The New Negro Alliance asks the company to hire Black clerks as positions open.',
            'The company refuses.'
          ],
          question: 'What pressure comes next?',
          options: ['PICKET', 'KEEP NEGOTIATING', 'MOVE ON'] },
        { type: 'reveal', decision: 'pressure', heading: HERE, lines: ['They picketed.'] },
        { type: 'big', text: 'BUY WHERE YOU CAN WORK', style: 'sign' },
        { type: 'timeline', arrows: true, steps: [
          { year: '1933' },
          { year: '1938', lines: ['The company seeks legal restrictions on the picketing.'] }
        ] },
        { type: 'decision', id: 'injunction',
          lines: ['A court orders the picket stopped.'],
          question: 'What now?',
          options: ['CHALLENGE IT', 'END IT', 'CHANGE TACTICS'] },
        { type: 'reveal', decision: 'injunction', heading: HERE,
          lines: [
            'The case reaches the U.S. Supreme Court.',
            'The Court holds that the dispute falls within federal labor-dispute law and that the lower federal court could not issue the injunction as it had.'
          ] },
        { type: 'body', lines: ['The Court did **not** order stores to hire Black workers.'] },
        { type: 'connection', layout: 'pairs', items: [
          { label: 'ATLANTA', text: 'THEY NEEDED YOUR LABOR.' },
          { label: 'WASHINGTON', text: 'THEY NEEDED YOUR MONEY.' }
        ] }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'before-rosa-parks',
      order: 5,
      title: 'BEFORE ROSA PARKS',
      place: 'Montgomery',
      period: '1950s–1956',
      role: 'A Black Montgomery resident participating in the boycott movement.',
      memory: '381 DAYS',
      memoryNote: 'And every one had a morning.',
      chrono: { label: '1955', rank: 5 },
      xp: 100,
      beats: [
        { type: 'title', text: 'MONTGOMERY · BEFORE 1955' },
        { type: 'body', stepped: true, lines: [
          'Black riders have complained about treatment on the buses for years.',
          'A group of Black women has already been pressing city officials and discussing boycott strategy.'
        ] },
        { type: 'big', text: "WOMEN'S POLITICAL COUNCIL" },
        { type: 'big', kicker: 'DECEMBER 1, 1955', text: 'ROSA PARKS IS ARRESTED.' },
        { type: 'big', text: 'NOW THE NETWORK MOVES.' },
        { type: 'tapSequence', mode: 'stack', items: ['leaflets', 'one-day boycott', 'mass participation'] },
        { type: 'decision', id: 'demands',
          heading: "YOU'RE GOING TO KEEP GOING.",
          question: 'What do you ask for?',
          options: ['END SEGREGATED SEATING', 'FAIRER SEATING WITHIN THE RULES', 'BLACK DRIVERS ON BLACK ROUTES'] },
        { type: 'reveal', decision: 'demands', heading: HERE,
          lines: ['The early demands included:'],
          list: [
            'courteous treatment',
            'Black drivers on predominantly Black routes',
            'revised seating that did not yet require abolishing segregation'
          ] },
        { type: 'body', lines: ['Later, strategy shifts toward directly challenging segregation itself.'] },
        { type: 'body', kicker: 'DAY 2', lines: ['People still need to get to work.'] },
        { type: 'tapSequence', mode: 'replace', items: ['PEOPLE WALK.', 'TAXIS HELP.', 'THE CITY PRESSURES THEM.'] },
        { type: 'tapSequence', mode: 'stack', style: 'tally', items: [
          '325 CARS',
          '22 CHURCH STATION WAGONS',
          '43 DISPATCH STATIONS',
          '42 PICKUP STATIONS',
          '~30,000 RIDES A DAY'
        ] },
        { type: 'big', text: 'DAY 200' },
        { type: 'decision', id: 'pause',
          lines: ['A proposal could pause the boycott while negotiations continue.'],
          question: 'What would you support?',
          options: ['PAUSE', 'KEEP GOING', 'SET CONDITIONS'] },
        { type: 'reveal', decision: 'pause', heading: "THEY DIDN'T ALL AGREE.",
          echo: 'You chose {choice}. Some of them did too.' },
        { type: 'split',
          left: { label: 'STREET', text: 'BOYCOTT' },
          right: { label: 'COURT', text: 'BROWDER v. GAYLE' },
          lines: [
            { text: 'Separate federal litigation ended segregated bus seating.', draft: true,
              note: 'Bible: "Briefly explain separate federal litigation ending segregated bus seating." Wording assembled from that direction; needs editor copy.' }
          ] },
        { type: 'big', text: 'DAY 381' },
        { type: 'connection', layout: 'side', items: [
          { text: '12 YEARS' },
          { text: '381 DAYS' }
        ] }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'who-knows-this-place',
      order: 6,
      title: 'WHO KNOWS THIS PLACE?',
      place: 'Mississippi',
      period: 'early 1960s–1964',
      role: 'A young SNCC field organizer.',
      memory: 'WHO KNOWS THIS PLACE?',
      chrono: { label: '1964', rank: 7 },
      xp: 100,
      beats: [
        { type: 'title', text: 'MISSISSIPPI' },
        { type: 'body', stepped: true, lines: [
          'You are willing to organize.',
          'But people were organizing here before you arrived.'
        ] },
        { type: 'big', text: 'AMZIE MOORE',
          lines: ['An experienced Mississippi organizer with local relationships and knowledge.'] },
        { type: 'tapSequence', mode: 'stack', items: ['local introductions', 'homes', 'churches', 'routes', 'risks'] },
        { type: 'tapSequence', mode: 'stack', items: [
          { text: 'FANNIE LOU HAMER', style: 'big' },
          { text: 'She attempts to register to vote.', style: 'para' },
          { text: 'That same day, she is fired from the plantation where she has worked for 18 years.', style: 'para' }
        ] },
        { type: 'decision', id: 'begin',
          lines: ['You are new.', 'Local people know the relationships and the risks.'],
          question: 'How do you begin?',
          options: ['START PUBLICLY', 'WORK THROUGH LOCAL NETWORKS'] },
        { type: 'reveal', decision: 'begin', heading: HERE,
          lines: ['SNCC organizers often depended on existing local organizers and networks to know where work could take root.'] },
        { type: 'connection', layout: 'pairs', items: [
          { label: 'MONTGOMERY', text: 'THE NETWORK EXISTED BEFORE ROSA PARKS.' },
          { label: 'MISSISSIPPI', text: 'PEOPLE WERE ORGANIZING BEFORE SNCC ARRIVED.' }
        ] },
        { type: 'title', text: '1964', kicker: 'Freedom Summer' },
        { type: 'body', lines: ['Violence continues.', 'National attention remains limited.'] },
        { type: 'decision', id: 'bring-them',
          lines: [
            'Bringing hundreds of mostly white Northern students could attract attention and resources.',
            'It could also overwhelm local leadership.'
          ],
          question: 'Bring them?',
          options: ['YES', 'NO'] },
        { type: 'reveal', decision: 'bring-them', heading: 'THEY DISAGREED.',
          echo: 'You chose {choice}. So did some of them.',
          lines: [
            { text: 'SNCC/COFO activists and local leaders disagreed sharply. Some feared the project would undercut grassroots leadership. Others supported it.', draft: true,
              note: 'Bible: "Briefly explain that SNCC/COFO activists and local leaders disagreed sharply; some feared the project would undercut grassroots leadership while others supported it." Direction split into sentences; confirm.' }
          ] },
        { type: 'body', lines: ['Freedom Summer proceeds.'] }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 7
    {
      id: 'we-live-here',
      order: 7,
      title: 'WE LIVE HERE.',
      place: 'Barry Farm, Washington',
      period: '1960s',
      role: 'A Barry Farm resident.',
      memory: 'WE LIVE HERE.',
      chrono: { label: '1960s', rank: 6 },
      xp: 100,
      beats: [
        { type: 'big', text: 'BACK IN WASHINGTON...' },
        { type: 'title', text: 'BARRY FARM · 1960s' },
        { type: 'tapSequence', mode: 'replace', items: ['RATS.', 'LEAKS.', 'BROKEN FAUCETS.', 'BAD FURNACES.'] },
        { type: 'body', lines: ['Housing officials control the buildings.', 'Residents live with the consequences.'] },
        { type: 'body', lines: ['Federal anti-poverty resources and local organizing support enter the area.'] },
        { type: 'big', text: 'THE BAND OF ANGELS', names: ['LILLIAN WRIGHT', 'ETTA MAE HORN'] },
        { type: 'tapSequence', mode: 'stack', items: [
          'residents organize around conditions',
          'pressure housing officials',
          'major repair commitment'
        ] },
        { type: 'tapSequence', mode: 'chain', items: [
          'BROKEN',
          'ORGANIZED',
          { text: '$1.5 MILLION IN REPAIRS', style: 'big', requires: 'barryFarmRepairAmount',
            fallback: { text: 'MAJOR REPAIRS', style: 'big' } }
        ] },
        { type: 'decision', id: 'scope',
          lines: [
            'Housing conditions improve.',
            'But residents are also confronting income, health care, welfare, and public-agency treatment.'
          ],
          question: 'What should the group do?',
          options: ['STAY WITH HOUSING', 'EXPAND THE WORK'] },
        { type: 'reveal', decision: 'scope', heading: HERE, lines: ['They expanded.'] },
        { type: 'tapSequence', mode: 'stack', items: ['housing', 'income', 'health', 'welfare rights'] }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 8
    // MUST contain zero decisions (Bible §16). Enforced by tools/check-content.mjs.
    {
      id: 'breakfast',
      order: 8,
      title: 'BREAKFAST.',
      place: 'Oakland',
      period: '1969',
      role: 'Witness / local Panther program participant',
      memory: 'BREAKFAST.',
      chrono: { label: '1969', rank: 8 },
      xp: 100,
      beats: [
        { type: 'title', text: 'OAKLAND · 1969' },
        { type: 'body', stepped: true, lines: [
          'You want fundamental political change.',
          'A child is going to school hungry tomorrow.'
        ] },
        { type: 'big', text: 'TOMORROW MORNING COMES FIRST.' },
        { type: 'big', text: 'BREAKFAST.' },
        { type: 'tapSequence', mode: 'chain', items: [
          'FOOD', 'KITCHEN', 'VOLUNTEERS', 'DONATIONS', 'COOK', 'CLEAN',
          { text: 'DO IT AGAIN TOMORROW.', style: 'big' }
        ] },
        { type: 'body', style: 'approved', lines: ["A program isn't only an idea. It has opening hours."] },
        { type: 'tapSequence', mode: 'stack', instant: true, items: [
          'BREAKFAST', 'CLINICS', 'SICKLE-CELL TESTING', 'SCHOOLS', 'LEGAL AID', 'TRANSPORTATION'
        ] },
        { type: 'big', text: 'THE FBI NOTICES BREAKFAST.' },
        { type: 'body', stepped: true, lines: [
          { text: 'COINTELPRO targets the Panthers.', draft: true,
            note: 'Bible bullet: "COINTELPRO targets the Panthers" (period added).' },
          { text: 'The breakfast program is specifically treated as politically threatening.', draft: true,
            note: 'Bible bullet: "the breakfast program is specifically treated as politically threatening" (capitalized).' },
          { text: 'Surveillance and disruption intensify.', draft: true,
            note: 'Bible bullet: "surveillance / disruption intensify". Slash rendered as "and"; confirm.' }
        ] },
        { type: 'tapSequence', mode: 'replace', items: ['SURVEILLANCE', 'DISINFORMATION', 'RAIDS'] },
        { type: 'body', lines: [
          { text: 'There is also internal strategic conflict within the Party.', draft: true,
            note: 'Bible: "Then briefly acknowledge internal strategic conflict within the Party." No copy supplied; placeholder assembled from that direction. Needs editor copy.' }
        ] },
        { type: 'big', text: 'BREAKFAST.' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 9
    {
      id: 'we-found-each-other',
      order: 9,
      title: 'WE FOUND EACH OTHER.',
      place: 'Boston',
      period: '1974–1977',
      role: 'A member of the Combahee River Collective.',
      memory: 'WE FOUND EACH OTHER.',
      chrono: { label: '1974', rank: 10 },
      xp: 100,
      beats: [
        { type: 'title', text: 'BOSTON · 1974' },
        { type: 'body', lines: [
          { text: 'After years, members felt they had finally found each other.', draft: true,
            note: "Bible: \"Use the Collective's own sourced sentiment: after years, members felt they had finally found each other. Do not invent dialogue beyond verified text.\" No verified text was supplied, so the Bible's paraphrase is shown (no quotation marks). Replace with the sourced wording when available." }
        ] },
        { type: 'body', stepped: true, lines: [
          'You have found people who recognize experiences that other movements often failed to address.',
          'You still do not know what this group will become.'
        ] },
        { type: 'decision', id: 'first',
          question: 'What should come first?',
          options: ['TALK', 'POLITICAL WORK', 'STUDY'] },
        { type: 'reveal', decision: 'first', heading: 'ALL OF THESE — BUT NOT AT ONCE.',
          list: ['consciousness-raising', 'individual political work', 'later study/writing'] },
        { type: 'tapSequence', mode: 'replace', items: ['WORK', 'SEXISM', 'RACISM', 'FAMILY', 'SEXUALITY', 'MONEY'] },
        { type: 'decision', id: 'stall',
          lines: ['Membership drops.', 'Meetings slow.', 'Disagreements deepen.'],
          question: 'What does that mean?',
          options: ["IT'S FAILING", 'CHANGE HOW WE WORK', 'KEEP MEETING'] },
        { type: 'reveal', decision: 'stall', heading: 'THE GROUP CHANGED SHAPE.',
          lines: ['Some members stopped attending.', 'Those remaining reorganized around study, writing, and political work.'] },
        // Bible gives no question line for Decision 3; none is invented.
        { type: 'decision', id: 'independent', kicker: 'NBFO',
          lines: ['The Collective has serious disagreements with the larger organization it came from.'],
          options: ['STAY', 'GO INDEPENDENT'] },
        { type: 'reveal', decision: 'independent', heading: HERE,
          lines: ['They became an independent collective.'] },
        { type: 'title', text: 'BOSTON · 1977', quiet: true, draft: true,
          note: 'Bible: "Use a quiet final beat rather than a recap chart." No copy supplied; a silent place/date slate (from the story header "Boston, 1974–1977") is used. Confirm.' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 10
    {
      id: '40-acres',
      order: 10,
      title: '40 ACRES',
      place: 'Mississippi',
      period: '1969–1970s',
      role: 'A poor local family / cooperative member.',
      memory: '30 OF 1,500',
      chrono: { label: '1969', rank: 9 },
      xp: 100,
      beats: [
        { type: 'title', text: 'MISSISSIPPI · 1969' },
        { type: 'big', text: 'FANNIE LOU HAMER' },
        { type: 'big', text: '40 ACRES', lines: ['Freedom Farm Cooperative begins.'] },
        { type: 'tapSequence', mode: 'stack', items: ['food crops', 'cash crops', 'land', 'families'] },
        { type: 'tapSequence', mode: 'stack', style: 'bigstack', items: [
          { text: '$1 / MONTH', style: 'big' },
          { text: '30 CAN PAY', style: 'big' },
          { text: '~1,500 ARE CONNECTED', style: 'big' }
        ] },
        { type: 'decision', id: 'protect',
          lines: ['The people who need the cooperative most often have the least money.'],
          question: 'What do you protect?',
          options: ['THE BUDGET', 'ACCESS'] },
        { type: 'reveal', decision: 'protect', heading: HERE,
          lines: ['Many families who could not pay still benefited.', 'Outside fundraising helped sustain the project.'] },
        { type: 'tapSequence', mode: 'chain', kicker: 'Pig Bank', items: [
          { row: ['35', '+', '5', '=', '40 PIGS'] },
          'PIGLETS', 'FAMILIES', 'FOOD', 'MORE PIGS'
        ] },
        { type: 'big', text: '+640 ACRES' },
        { type: 'tapSequence', mode: 'stack', items: ['DROUGHT', 'FLOODS', 'CROP LOSSES', 'DONATIONS FALL', 'DEBT REMAINS'] },
        { type: 'big', text: 'IT HELPED PEOPLE.' },
        { type: 'big', text: 'IT STILL COLLAPSED.' }
      ],
      lookCloser: []
    },

    // ---------------------------------------------------------------- 11
    {
      id: 'did-you-lose',
      order: 11,
      title: 'DID YOU LOSE?',
      place: 'Warren County, North Carolina',
      period: '1982',
      role: 'Local resident / protest participant.',
      memory: 'DID YOU LOSE?',
      chrono: { label: '1982', rank: 11 },
      xp: 100,
      beats: [
        // Pre-connection, "shown silently" before the story begins.
        { type: 'connection', layout: 'years', items: [
          { label: '1932', text: 'STILL NO CONTRACT.' },
          { label: '1970s', text: 'FREEDOM FARM COLLAPSES.' },
          { label: '1982', text: 'THE LANDFILL WAS BUILT.' }
        ] },
        { type: 'title', text: 'WARREN COUNTY · 1982' },
        { type: 'body', lines: ['The state plans to bury PCB-contaminated soil in the county.'] },
        { type: 'tapSequence', mode: 'stack', firstTogether: 3, items: [
          { text: 'Residents have already:', style: 'para' },
          'attended hearings',
          'gone to court',
          { text: 'The landfill is still coming.', style: 'para' }
        ] },
        { type: 'decision', id: 'trucks',
          lines: ['The trucks are arriving.'],
          question: 'What changes now?',
          options: ['BLOCK THEM', 'KEEP FIGHTING IN COURT', 'NEGOTIATE'] },
        { type: 'reveal', decision: 'trucks', heading: 'PEOPLE PUT THEIR BODIES IN THE ROAD.' },
        { type: 'tapSequence', mode: 'chain', items: [
          'TRUCK', 'PEOPLE', 'ARRESTS', 'MORE PEOPLE',
          { text: 'Roughly 500 arrests.', style: 'para', requires: 'warrenArrestCount', draft: true,
            note: 'Bible: "Briefly mention roughly 500 arrests if supported in supplied sources." Hidden until SOURCE_FLAGS.warrenArrestCount is set.' }
        ] },
        { type: 'body', kicker: 'Washington', lines: ['Walter Fauntroy joins and is arrested.'] },
        { type: 'big', text: 'THE LANDFILL WAS BUILT.', dark: true },
        { type: 'big', text: 'THE LANDFILL WAS BUILT.', dark: true },
        { type: 'body', stepped: true, lines: [
          'Fauntroy requests a federal investigation.',
          'GAO identifies a broader racial/economic pattern in siting.'
        ] },
        { type: 'big', text: 'THE QUESTION CHANGED.' },
        { type: 'tapSequence', mode: 'chain', items: [
          'WHY HERE?',
          { text: 'WHERE ELSE?', style: 'big' }
        ] },
        { type: 'big', text: 'THE LANDFILL WAS STILL BUILT.' },
        { type: 'big', text: 'DID YOU LOSE?' }
      ],
      // Bible: Warren County's later environmental-justice significance
      // "belongs in LOOK CLOSER". No sourced text supplied yet, so no card.
      lookCloser: []
    },

    // ---------------------------------------------------------------- 12
    {
      id: 'us-helping-us',
      order: 12,
      title: 'US HELPING US',
      place: 'Washington',
      period: '1980s → today',
      role: 'Member of the Black gay Washington community / volunteer network.',
      memory: 'US HELPING US',
      chrono: { label: '1985 → TODAY', rank: 12 },
      xp: 100,
      // XP is added internally; no completion screen, no visible XP.
      silentComplete: true,
      hideXp: true,
      beats: [
        { type: 'big', text: 'BACK IN WASHINGTON...' },
        { type: 'title', text: 'EARLY 1980s' },
        { type: 'tapSequence', mode: 'replace', kicker: 'The Clubhouse', items: ['DANCE', 'FRIENDS', 'LOVE', 'COMMUNITY'] },
        { type: 'body', stepped: true, lines: [
          'Familiar faces begin disappearing.',
          'People are becoming sick.',
          'People are dying.'
        ] },
        { type: 'tapSequence', mode: 'replace', items: ['RIDES', 'FOOD', 'BILLS', 'COMPANY'] },
        { type: 'big', text: 'CARE STARTS INFORMALLY.' },
        { type: 'big', kicker: '1985', text: 'US HELPING US',
          lines: [
            { text: 'A volunteer, self-help network.', draft: true,
              note: 'Bible: "Briefly explain the volunteer/self-help network." No copy supplied; fragment assembled from that direction. Health caution applies to any expansion: never present holistic practices as substitutes for evidence-based HIV treatment.' }
          ] },
        { type: 'decision', id: 'formalize',
          lines: [
            'More people rely on the network.',
            'Informal care is flexible.',
            'Formal organization can bring funding, staff, and programs—but also administration and structure.'
          ],
          question: 'What now?',
          options: ['STAY INFORMAL', 'BUILD AN ORGANIZATION'] },
        { type: 'reveal', decision: 'formalize', heading: HERE, kicker: '1988',
          lines: ['The network incorporates as a nonprofit.'] },
        { type: 'timeline', arrows: true, steps: [
          { year: '1988' },
          { year: 'TODAY' }
        ] },
        { type: 'big', kicker: 'WASHINGTON · TODAY', text: 'STILL HERE.',
          lines: ['Us Helping Us continues operating programs and services in Washington.'] },
        // Final connection: "Show cards only". "1 SHILLING" is written
        // without a period here in the Bible (Story 2 memory has one).
        { type: 'connection', layout: 'cards', label: null, items: [
          { text: '1 SHILLING' },
          { text: 'BREAKFAST.' },
          { text: '30 OF 1,500' },
          { text: 'US HELPING US' }
        ] }
      ],
      lookCloser: []
    }
  ];

  /*
   * LOOK CLOSER card format (none are present in V1.1 — see docs/SOURCE_TODOS.md):
   *   lookCloser: [
   *     { kind: 'THE PLACE', title: 'Optional title', body: ['Paragraph', ...],
   *       source: 'Citation for the text above' }
   *   ]
   * Allowed kinds: THE PEOPLE, THE PLACE, THE WORK, THE DOCUMENT,
   * THE OPPOSITION, WHAT HAPPENED LATER. Max 2–3 per story. No XP.
   */

  window.ORGANIZE_CONTENT = {
    version: '1.1.0',
    sourceFlags: SOURCE_FLAGS,
    stories: stories,
    xpPerStory: 100,

    // Campaign ending (Bible §21). Order of appearance = story order.
    // Chronological order = story.chrono.rank. Years shown = story.chrono.label.
    ending: {
      question: 'WHAT NOW?',
      revisitLabel: 'REVISIT STORIES',
      revisitDelayMs: 2600
    },

    ui: {
      appName: 'ORGANIZE',
      continue: 'CONTINUE',
      begin: 'BEGIN',
      stories: 'STORIES',
      about: 'ABOUT',
      next: 'CONTINUE',
      nextStory: 'NEXT STORY',
      lookCloser: 'LOOK CLOSER',
      restartStory: 'RESTART STORY',
      home: 'HOME',
      close: 'CLOSE',
      resetProgress: 'RESET PROGRESS',
      resetConfirm: 'Erase all progress on this device? Completed stories, choices and XP will be cleared.',
      resetYes: 'ERASE PROGRESS',
      cancel: 'CANCEL',
      connectionLabel: "YOU'VE SEEN THIS BEFORE",
      heresWhatHappened: HERE,
      storyLabel: 'STORY',
      xp: 'XP',
      locked: 'Not yet',
      replay: 'Revisit'
    },

    // About screen: short and neutral. Product description taken from Bible §1.
    about: {
      title: 'ABOUT',
      paragraphs: [
        'ORGANIZE is a minimalist historical narrative game about Black organizing in the United States.',
        'You move through 12 historical stories. Each story puts you inside a concrete organizing problem, lets you witness or respond to historically grounded pressures, and then shows what actually happened.'
      ],
      howTo: 'READ A LITTLE → THINK A LITTLE → TAP',
      privacy: 'No account. No tracking. Progress and choices are saved only on this device, and the game works offline after the first visit.'
    }
  };
})();
