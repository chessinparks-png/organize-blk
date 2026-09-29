/*
 * ORGANIZE — app engine.
 * Presentation only. Every player-facing word lives in js/content.js.
 * No network calls, no analytics, no scoring. Decisions store only the
 * selected option so a reveal can say "You chose X."
 */
(function () {
  'use strict';

  var C = window.ORGANIZE_CONTENT;
  var UI = C.ui;
  var STORIES = C.stories.slice().sort(function (a, b) { return a.order - b.order; });
  var KEY = 'organize.v1';
  var root = document.documentElement;

  /* ------------------------------------------------------------------ utils */

  function storyById(id) {
    for (var i = 0; i < STORIES.length; i++) if (STORIES[i].id === id) return STORIES[i];
    return null;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function plain(t) { return String(t).replace(/\*\*/g, ''); }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function reduced() { return root.classList.contains('rm'); }

  function setRich(node, text) {
    var parts = String(text).split(/\*\*(.+?)\*\*/g);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      if (i % 2) { var s = document.createElement('strong'); s.textContent = parts[i]; node.appendChild(s); }
      else node.appendChild(document.createTextNode(parts[i]));
    }
    return node;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) setRich(n, text);
    return n;
  }

  // Source-gated content: render only if its flag is on, else its fallback.
  function resolve(item) {
    if (item == null) return null;
    if (typeof item === 'object' && item.requires && !C.sourceFlags[item.requires]) {
      return item.fallback != null ? resolve(item.fallback) : null;
    }
    return item;
  }
  function textOf(item) { return typeof item === 'string' ? item : item.text; }
  function resolveAll(list) {
    var out = [];
    (list || []).forEach(function (x) { var r = resolve(x); if (r != null) out.push(r); });
    return out;
  }

  // Large type: pick a size tier from length, cap by the longest word so a
  // word never breaks or overflows on a narrow phone.
  function fit(node, text) {
    var t = plain(text);
    var wl = 3;
    t.split(/\s+/).forEach(function (w) { if (w.length > wl) wl = w.length; });
    var len = t.length;
    node.dataset.tier = len <= 6 ? 'xl' : len <= 14 ? 'l' : len <= 26 ? 'm' : 's';
    node.style.setProperty('--wl', wl);
    return node;
  }
  function big(text, cls, tag) { return fit(el(tag || 'h2', 'big' + (cls ? ' ' + cls : ''), text), text); }
  function para(line) {
    var p = el('p', 'para', textOf(line));
    if (line && line.draft) p.dataset.draft = 'true';
    return p;
  }
  function kicker(text) { return el('p', 'kicker', text); }
  function step(node, s) { node.dataset.s = s; return node; }

  /* ------------------------------------------------------------ live region */

  var live;
  function announce(text) {
    if (!live || !text) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 40);
  }

  // Reveal every [data-s] element up to step i (or exactly i in replace mode).
  function showSteps(rootNode, i, animate, replace) {
    var said = [];
    rootNode.querySelectorAll('[data-s]').forEach(function (n) {
      var s = +n.dataset.s;
      var on = replace ? s === i : s <= i;
      if (on && !n.classList.contains('on')) {
        n.classList.add('on');
        n.classList.toggle('anim', !!animate);
        if (!n.hasAttribute('aria-hidden')) said.push(n.textContent);
      } else if (!on) {
        n.classList.remove('on', 'anim');
      }
    });
    if (said.length) announce(said.join('. '));
  }

  /* ------------------------------------------------------------------ store */

  var Store = {
    s: null,
    defaults: function () {
      return {
        v: 1,
        current: null,        // { storyId, beat, step, revisit, awarded } | { ending: true, step }
        completed: [],        // story ids
        xp: 0,
        choices: {},          // { storyId: { decisionId: optionLabel } } — nothing else
        campaignComplete: false,
        prefs: { theme: 'dark', motion: 'system' }
      };
    },
    load: function () {
      var d = this.defaults(), data = null;
      try { data = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch (e) { data = null; }
      if (data && typeof data === 'object') {
        if (Array.isArray(data.completed)) d.completed = data.completed.filter(function (id) { return !!storyById(id); });
        if (data.choices && typeof data.choices === 'object') d.choices = data.choices;
        if (data.current && typeof data.current === 'object') d.current = data.current;
        d.campaignComplete = !!data.campaignComplete;
        if (data.prefs && typeof data.prefs === 'object') {
          if (data.prefs.theme === 'light' || data.prefs.theme === 'dark') d.prefs.theme = data.prefs.theme;
          if (data.prefs.motion === 'reduce' || data.prefs.motion === 'system') d.prefs.motion = data.prefs.motion;
        }
      }
      this.s = d;
      this.s.xp = this.xp();
    },
    save: function () {
      this.s.xp = this.xp();
      try { window.localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* private mode: play on */ }
    },
    xp: function () {
      var total = 0;
      this.s.completed.forEach(function (id) { var st = storyById(id); if (st) total += st.xp || C.xpPerStory; });
      return total;
    },
    isDone: function (id) { return this.s.completed.indexOf(id) !== -1; },
    unlocked: function (st) {
      if (st.order === 1 || this.isDone(st.id)) return true;
      var prev = STORIES[STORIES.indexOf(st) - 1];
      return !!prev && this.isDone(prev.id);
    },
    frontier: function () {
      for (var i = 0; i < STORIES.length; i++) if (!this.isDone(STORIES[i].id)) return STORIES[i];
      return null;
    },
    complete: function (id) {
      if (this.isDone(id)) return false;
      this.s.completed.push(id);
      this.save();
      return true;
    },
    choose: function (storyId, decisionId, label) {
      if (!this.s.choices[storyId]) this.s.choices[storyId] = {};
      this.s.choices[storyId][decisionId] = label;
      this.save();
    },
    choice: function (storyId, decisionId) {
      return (this.s.choices[storyId] || {})[decisionId] || null;
    },
    reset: function () {
      var prefs = this.s.prefs;
      this.s = this.defaults();
      this.s.prefs = prefs;
      this.save();
    }
  };

  /* ------------------------------------------------------------------ prefs */

  var motionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function applyPrefs() {
    var p = Store.s.prefs;
    root.dataset.theme = p.theme;
    var rm = p.motion === 'reduce' || (motionMQ && motionMQ.matches);
    root.classList.toggle('rm', !!rm);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', p.theme === 'light' ? '#f4f1ea' : '#0b0b0a');
  }
  if (motionMQ && motionMQ.addEventListener) motionMQ.addEventListener('change', applyPrefs);

  /* ------------------------------------------------------------------ beats */
  // Each builder returns { el, steps, show(i, animate), interactive? }.

  var Beats = {};

  function simple(node, steps, replace) {
    return {
      el: node,
      steps: steps,
      show: function (i, a) { showSteps(node, i, a, replace); }
    };
  }

  Beats.intro = function (b, ctx) {
    var w = el('div', 'beat beat-intro');
    w.appendChild(step(kicker(UI.storyLabel + ' ' + pad(ctx.story.order)), 0));
    w.appendChild(step(big(ctx.story.title, 'intro-title'), 0));
    return simple(w, 1);
  };

  Beats.title = function (b) {
    var w = el('div', 'beat beat-title' + (b.quiet ? ' quiet' : ''));
    if (b.kicker) w.appendChild(step(kicker(b.kicker), 0));
    w.appendChild(step(el('h2', 'slate', b.text), 0));
    return simple(w, 1);
  };

  Beats.big = function (b) {
    var w = el('div', 'beat beat-big' + (b.style ? ' is-' + b.style : ''));
    if (b.kicker) w.appendChild(step(kicker(b.kicker), 0));
    w.appendChild(step(big(b.text), 0));
    resolveAll(b.lines).forEach(function (l) { w.appendChild(step(para(l), 0)).classList.add('late'); });
    if (b.names) {
      var ul = el('ul', 'names');
      b.names.forEach(function (n) { ul.appendChild(el('li', null, n)); });
      w.appendChild(step(ul, 0)).classList.add('late');
    }
    var v = simple(w, 1);
    v.dark = !!b.dark;
    return v;
  };

  Beats.body = function (b) {
    var w = el('div', 'beat beat-body' + (b.style ? ' is-' + b.style : ''));
    if (b.kicker) w.appendChild(step(kicker(b.kicker), 0));
    var lines = resolveAll(b.lines);
    lines.forEach(function (l, i) { w.appendChild(step(para(l), b.stepped ? i : 0)); });
    return simple(w, b.stepped ? Math.max(lines.length, 1) : 1);
  };

  function num(t) { var m = String(t).replace(/,/g, '').match(/^\d+$/); return m ? +m[0] : null; }
  function fmt(n, like) { var s = String(Math.round(n)); return /,/.test(like) ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s; }

  // Count from one value to the next (or swap instantly under reduced motion).
  function countTo(node, from, to, label) {
    var a = num(from), z = num(to);
    if (node._raf) window.cancelAnimationFrame(node._raf);
    if (a == null || z == null || reduced()) { node.textContent = label; return; }
    var t0 = now(), dur = 900;
    (function tick() {
      var p = Math.min(1, (now() - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = p < 1 ? fmt(a + (z - a) * e, label) : label;
      if (p < 1) node._raf = window.requestAnimationFrame(tick);
    })();
  }

  Beats.number = function (b) {
    var w = el('div', 'beat beat-number');
    if (b.kicker) w.appendChild(kicker(b.kicker));
    var trail = el('p', 'trail'); trail.setAttribute('aria-hidden', 'true');
    var longest = b.steps.reduce(function (m, s) { return s.length > m.length ? s : m; }, '');
    var n = fit(el('h2', 'big numeral'), longest);
    w.appendChild(trail); w.appendChild(n);
    var shown = -1;
    return {
      el: w,
      steps: b.steps.length,
      show: function (i, a) {
        trail.textContent = b.steps.slice(0, i).join('  →  ');
        if (a && shown >= 0 && i === shown + 1) countTo(n, b.steps[shown], b.steps[i], b.steps[i]);
        else n.textContent = b.steps[i];
        if (a) { n.classList.remove('pulse'); void n.offsetWidth; n.classList.add('pulse'); }
        shown = i;
        announce(b.steps[i]);
      }
    };
  };

  function seqItem(item, mode, style) {
    if (item.row) {
      var row = el('p', 'row');
      item.row.forEach(function (t) { row.appendChild(el('span', /^[+=]$/.test(t) ? 'op' : 'term', t)); });
      return row;
    }
    var t = textOf(item);
    var st = item.style || (mode === 'replace' ? 'big' : 'item');
    if (st === 'para') return para(item);
    if (st === 'big') return big(t, style === 'bigstack' ? 'compact' : '');
    var p = el('p', 'item');
    var m = style === 'tally' && t.match(/^(~?[\d,]+)\s+(.*)$/);
    if (m) { p.classList.add('tally'); p.appendChild(el('span', 'n', m[1])); p.appendChild(document.createTextNode(' ')); p.appendChild(el('span', 'u', m[2])); }
    else setRich(p, t);
    return p;
  }

  Beats.tapSequence = function (b) {
    var mode = b.mode || 'stack';
    var items = resolveAll(b.items);
    var w = el('div', 'beat beat-seq mode-' + mode + (b.style ? ' is-' + b.style : '') + (items.length > 5 ? ' long' : ''));
    if (b.kicker) { var k = kicker(b.kicker); k.classList.add('keep'); w.appendChild(k); }
    var together = Math.max(1, b.firstTogether || 1);
    var list = el('div', 'seq');
    var s = 0;
    items.forEach(function (item, i) {
      s = b.instant ? 0 : Math.max(0, i - together + 1);
      if (mode === 'chain' && i > 0) {
        var arrow = el('p', 'arrow', '↓'); arrow.setAttribute('aria-hidden', 'true');
        list.appendChild(step(arrow, s));
      }
      var node = step(seqItem(item, mode, b.style), s);
      if (b.instant) node.style.animationDelay = (i * 90) + 'ms';
      list.appendChild(node);
    });
    w.appendChild(list);
    var steps = b.instant ? 1 : Math.max(1, items.length - together + 1);
    return simple(w, steps, mode === 'replace');
  };

  Beats.decision = function (b, ctx) {
    var w = el('div', 'beat beat-decision');
    if (b.kicker) w.appendChild(kicker(b.kicker));
    if (b.heading) w.appendChild(big(b.heading, 'decision-heading'));
    resolveAll(b.lines).forEach(function (l) { w.appendChild(para(l)); });
    var q = null;
    if (b.question) { q = el('h2', 'question', b.question); q.id = 'q-' + ctx.story.id + '-' + b.id; w.appendChild(q); }
    var group = el('div', 'options');
    group.setAttribute('role', 'group');
    if (q) group.setAttribute('aria-labelledby', q.id);
    else group.setAttribute('aria-label', b.options.join(', '));
    var picked = false;
    b.options.forEach(function (label, i) {
      var btn = el('button', 'opt', label);
      btn.type = 'button';
      btn.style.animationDelay = (160 + i * 70) + 'ms';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (picked) return;
        picked = true;
        btn.classList.add('chosen');
        group.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        ctx.choose(b.id, label);
      });
      group.appendChild(btn);
    });
    w.appendChild(group);
    return {
      el: w, steps: 1, interactive: true,
      show: function () {
        var said = [];
        w.querySelectorAll('.kicker, .big, .para, .question').forEach(function (n) { said.push(n.textContent); });
        announce(said.join('. '));
      }
    };
  };

  Beats.reveal = function (b, ctx) {
    var w = el('div', 'beat beat-reveal');
    w.appendChild(step(big(b.heading || UI.heresWhatHappened, 'reveal-heading'), 0));
    var s = 1, has = false;
    var chosen = b.decision ? Store.choice(ctx.story.id, b.decision) : null;
    if (b.echo && chosen) {
      var parts = b.echo.split('{choice}');
      var p = el('p', 'echo');
      p.appendChild(document.createTextNode(parts[0]));
      p.appendChild(el('strong', null, chosen));
      p.appendChild(document.createTextNode(parts.slice(1).join(chosen)));
      w.appendChild(step(p, s)); has = true;
    }
    if (b.kicker) { w.appendChild(step(kicker(b.kicker), s)); has = true; }
    resolveAll(b.lines).forEach(function (l) { w.appendChild(step(para(l), s)); has = true; });
    var list = resolveAll(b.list);
    if (list.length) {
      var ul = el('ul', 'list');
      list.forEach(function (x) { ul.appendChild(el('li', null, textOf(x))); });
      w.appendChild(step(ul, s)); has = true;
    }
    var q = resolve(b.quote);
    if (q) {
      var bq = el('blockquote', 'quote');
      bq.appendChild(el('p', null, '“' + textOf(q) + '”'));
      w.appendChild(step(bq, s)); has = true;
    }
    return simple(w, has ? 2 : 1);
  };

  Beats.split = function (b) {
    var w = el('div', 'beat beat-split');
    var box = el('div', 'halves');
    [b.left, b.right].forEach(function (side, i) {
      var h = el('div', 'half');
      h.appendChild(kicker(side.label));
      h.appendChild(big(side.text, 'split-text'));
      box.appendChild(step(h, i));
    });
    w.appendChild(box);
    var lines = resolveAll(b.lines);
    lines.forEach(function (l) { w.appendChild(step(para(l), 2)); });
    return simple(w, lines.length ? 3 : 2);
  };

  Beats.timeline = function (b) {
    var w = el('div', 'beat beat-timeline');
    var track = el('ol', 'track'); track.setAttribute('aria-hidden', 'true');
    var yr = fit(el('h2', 'big numeral year'), b.steps.reduce(function (m, s) { return s.year.length > m.length ? s.year : m; }, ''));
    var sub = el('div', 'sub');
    w.appendChild(track); w.appendChild(yr); w.appendChild(sub);
    var shown = -1;
    return {
      el: w,
      steps: b.steps.length,
      show: function (i, a) {
        track.textContent = '';
        b.steps.forEach(function (s, k) {
          if (k > i) return;
          if (k > 0) track.appendChild(el('li', 'sep', b.arrows ? '→' : '·'));
          track.appendChild(el('li', k === i ? 'now' : null, s.year));
        });
        var cur = b.steps[i];
        if (a && shown >= 0 && i === shown + 1) countTo(yr, b.steps[shown].year, cur.year, cur.year);
        else yr.textContent = cur.year;
        sub.textContent = '';
        var said = [cur.year];
        if (cur.text) {
          var t = cur.small ? el('p', 'para', cur.text) : big(cur.text, 'timeline-text', 'p');
          if (a) t.classList.add('on', 'anim'); else t.classList.add('on');
          sub.appendChild(t); said.push(cur.text);
        }
        (cur.lines || []).forEach(function (l) {
          var p = para(l); p.classList.add('on'); if (a) p.classList.add('anim');
          sub.appendChild(p); said.push(textOf(l));
        });
        shown = i;
        announce(said.join('. '));
      }
    };
  };

  Beats.connection = function (b) {
    var layout = b.layout || 'pairs';
    var w = el('div', 'beat beat-connection layout-' + layout);
    if (b.label !== null) {
      var k = kicker(b.label || UI.connectionLabel); k.classList.add('connection-label');
      w.appendChild(step(k, 0));
    }
    var box = el('div', 'links');
    var steps = 1;
    b.items.forEach(function (it, i) {
      var s = layout === 'side' ? 0 : i;
      steps = Math.max(steps, s + 1);
      var node;
      if (layout === 'cards') {
        node = el('div', 'mem-card');
        node.appendChild(big(it.text, 'card-text', 'p'));
      } else {
        node = el('div', 'link');
        if (it.label) node.appendChild(el('p', layout === 'years' ? 'slate small' : 'kicker', it.label));
        node.appendChild(big(it.text, 'link-text', 'p'));
        if (layout === 'side') node.style.animationDelay = (i * 420) + 'ms';
      }
      if (layout === 'side' && i > 0) {
        var bar = el('span', 'beside'); bar.setAttribute('aria-hidden', 'true');
        box.appendChild(step(bar, 0));
      }
      box.appendChild(step(node, s));
    });
    w.appendChild(box);
    return simple(w, steps);
  };

  Beats.storyComplete = function (b, ctx) {
    var st = ctx.story;
    var w = el('div', 'beat beat-complete');
    w.appendChild(step(kicker(UI.storyLabel + ' ' + pad(st.order) + ' · ' + st.title), 0));
    w.appendChild(step(big(st.memory, 'memory'), 0));
    if (st.memoryNote) w.appendChild(step(el('p', 'memory-note', st.memoryNote), 0));
    if (ctx.awarded) {
      var xp = el('p', 'xp-award', '+' + (st.xp || C.xpPerStory) + ' ' + UI.xp);
      w.appendChild(step(xp, 0));
    }
    var actions = el('div', 'complete-actions');
    var next = STORIES[STORIES.indexOf(st) + 1];
    if (next && Store.unlocked(next)) {
      var nb = el('button', 'btn primary', UI.nextStory);
      nb.type = 'button';
      nb.addEventListener('click', function () { startStory(next.id, { revisit: Store.isDone(next.id) }); });
      actions.appendChild(nb);
    }
    var cards = resolveAll(st.lookCloser);
    if (cards.length) {
      var lc = el('button', 'btn', UI.lookCloser);
      lc.type = 'button';
      lc.addEventListener('click', function () { openLookCloser(st); });
      actions.appendChild(lc);
    }
    var sb = el('button', 'btn quiet', UI.stories);
    sb.type = 'button';
    sb.addEventListener('click', function () { Store.s.current = null; Store.save(); go('stories'); });
    actions.appendChild(sb);
    w.appendChild(step(actions, 0));
    return {
      el: w, steps: 1, interactive: true,
      show: function (i, a) { showSteps(w, i, a); }
    };
  };

  /* ------------------------------------------------------------------ views */

  var views = {};
  var currentView = null;
  function showView(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    currentView = name;
    root.dataset.view = name;
    window.scrollTo(0, 0);
  }

  function go(name) {
    var target = '#/' + (name === 'home' ? '' : name);
    if (location.hash === target || (name === 'home' && (location.hash === '' || location.hash === '#/'))) route();
    else location.hash = target;
  }

  function btn(label, cls, onClick) {
    var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  function progressBar(cls) {
    var bar = el('ol', 'campaign ' + (cls || ''));
    bar.setAttribute('aria-label', Store.s.completed.length + ' of ' + STORIES.length + ' stories complete');
    STORIES.forEach(function (st) {
      var li = el('li', Store.isDone(st.id) ? 'done' : null);
      li.setAttribute('aria-hidden', 'true');
      bar.appendChild(li);
    });
    return bar;
  }

  /* home */
  function renderHome() {
    var v = views.home; v.textContent = '';
    var inner = el('div', 'home-inner');
    inner.appendChild(el('h1', 'wordmark', UI.appName));
    var done = Store.s.completed.length;
    var started = done > 0 || !!Store.s.current;
    if (started) {
      inner.appendChild(progressBar('home-progress'));
      inner.appendChild(el('p', 'home-meta', done + ' / ' + STORIES.length + '  ·  ' + Store.s.xp + ' ' + UI.xp));
    }
    var nav = el('nav', 'home-actions');
    nav.setAttribute('aria-label', 'Main');
    if (Store.s.campaignComplete && !Store.s.current) {
      nav.appendChild(btn(UI.stories, 'primary', function () { go('stories'); }));
    } else {
      nav.appendChild(btn(started ? UI.continue : UI.begin, 'primary', continueGame));
      nav.appendChild(btn(UI.stories, '', function () { go('stories'); }));
    }
    inner.appendChild(nav);
    var foot = el('div', 'home-foot');
    foot.appendChild(btn(UI.about, 'link', function () { go('about'); }));
    foot.appendChild(themeToggle('link'));
    inner.appendChild(foot);
    v.appendChild(inner);
    showView('home');
  }

  function themeToggle(cls) {
    var light = Store.s.prefs.theme === 'light';
    var b = btn(light ? 'DARK' : 'LIGHT', cls, function () {
      Store.s.prefs.theme = Store.s.prefs.theme === 'light' ? 'dark' : 'light';
      Store.save(); applyPrefs();
      b.textContent = Store.s.prefs.theme === 'light' ? 'DARK' : 'LIGHT';
      b.setAttribute('aria-label', 'Switch to ' + b.textContent.toLowerCase() + ' theme');
    });
    b.setAttribute('aria-label', 'Switch to ' + b.textContent.toLowerCase() + ' theme');
    return b;
  }

  function continueGame() {
    var cur = Store.s.current;
    if (cur && (cur.ending || storyById(cur.storyId))) { go('play'); return; }
    var f = Store.frontier();
    if (f) startStory(f.id, { revisit: false });
    else go('stories');
  }

  /* stories */
  function renderStories() {
    var v = views.stories; v.textContent = '';
    var head = el('header', 'page-head');
    head.appendChild(btn('← ' + UI.appName, 'link back', function () { go('home'); }));
    head.appendChild(el('h1', 'page-title', UI.stories));
    v.appendChild(head);
    var list = el('ol', 'story-list');
    var frontier = Store.frontier();
    STORIES.forEach(function (st) {
      var li = el('li');
      var done = Store.isDone(st.id);
      var open = Store.unlocked(st);
      var card = el('button', 'story-card' + (done ? ' done' : '') + (open ? '' : ' locked') + (frontier === st ? ' frontier' : ''));
      card.type = 'button';
      card.appendChild(el('span', 'sc-num', pad(st.order)));
      card.appendChild(el('span', 'sc-title', st.title));
      if (done) card.appendChild(el('span', 'sc-memory', st.memory));
      var label = UI.storyLabel + ' ' + st.order + ': ' + st.title + (done ? '. ' + UI.replay : open ? '' : '. ' + UI.locked);
      card.setAttribute('aria-label', label);
      if (!open) { card.disabled = true; card.setAttribute('aria-disabled', 'true'); }
      else card.addEventListener('click', function () { startStory(st.id, { revisit: done }); });
      li.appendChild(card);
      list.appendChild(li);
    });
    v.appendChild(list);
    var foot = el('div', 'page-foot');
    if (Store.s.completed.length || Store.s.current || Object.keys(Store.s.choices).length) {
      foot.appendChild(btn(UI.resetProgress, 'danger', confirmReset));
    }
    v.appendChild(foot);
    showView('stories');
    var first = v.querySelector('.story-card.frontier') || v.querySelector('.back');
    if (first) first.focus({ preventScroll: true });
  }

  /* about */
  function renderAbout() {
    var v = views.about; v.textContent = '';
    var head = el('header', 'page-head');
    head.appendChild(btn('← ' + UI.appName, 'link back', function () { go('home'); }));
    head.appendChild(el('h1', 'page-title', C.about.title));
    v.appendChild(head);
    var body = el('div', 'about-body');
    C.about.paragraphs.forEach(function (p) { body.appendChild(el('p', 'para', p)); });
    body.appendChild(el('p', 'howto', C.about.howTo));
    body.appendChild(el('p', 'para small', C.about.privacy));

    var set = el('section', 'settings');
    set.setAttribute('aria-label', 'Settings');
    set.appendChild(segmented('Theme', [['dark', 'DARK'], ['light', 'LIGHT']], Store.s.prefs.theme, function (val) {
      Store.s.prefs.theme = val; Store.save(); applyPrefs();
    }));
    set.appendChild(segmented('Motion', [['system', 'DEVICE SETTING'], ['reduce', 'REDUCED']], Store.s.prefs.motion, function (val) {
      Store.s.prefs.motion = val; Store.save(); applyPrefs();
    }));
    body.appendChild(set);
    body.appendChild(el('p', 'version', 'V' + C.version));
    v.appendChild(body);
    showView('about');
    v.querySelector('.back').focus({ preventScroll: true });
  }

  function segmented(label, options, value, onChange) {
    var wrap = el('div', 'seg');
    var id = 'seg-' + label.toLowerCase();
    var lab = el('p', 'kicker', label); lab.id = id;
    wrap.appendChild(lab);
    var g = el('div', 'seg-group'); g.setAttribute('role', 'group'); g.setAttribute('aria-labelledby', id);
    options.forEach(function (o) {
      var b = btn(o[1], 'seg-btn', function () {
        g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onChange(o[0]);
      });
      b.setAttribute('aria-pressed', String(o[0] === value));
      g.appendChild(b);
    });
    wrap.appendChild(g);
    return wrap;
  }

  /* dialogs */
  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  function confirmReset() {
    var d = document.getElementById('dlg-confirm');
    d.textContent = '';
    var box = el('div', 'dlg-box');
    box.appendChild(el('p', 'para', UI.resetConfirm));
    var row = el('div', 'dlg-actions');
    row.appendChild(btn(UI.cancel, '', function () { closeDialog(d); }));
    row.appendChild(btn(UI.resetYes, 'danger', function () {
      Store.reset(); closeDialog(d); renderStories();
      announce('Progress erased.');
    }));
    box.appendChild(row);
    d.appendChild(box);
    openDialog(d);
    row.querySelector('button').focus();
  }

  function openMenu() {
    var d = document.getElementById('dlg-menu');
    d.textContent = '';
    var box = el('div', 'dlg-box menu');
    box.appendChild(el('p', 'kicker', UI.storyLabel + ' ' + pad(Play.story.order) + ' · ' + Play.story.title));
    box.appendChild(btn(UI.restartStory, '', function () { closeDialog(d); startStory(Play.story.id, { revisit: Play.revisit }); }));
    box.appendChild(btn(UI.stories, '', function () { closeDialog(d); go('stories'); }));
    box.appendChild(btn(UI.home, '', function () { closeDialog(d); go('home'); }));
    box.appendChild(btn(UI.close, 'quiet', function () { closeDialog(d); }));
    d.appendChild(box);
    openDialog(d);
    box.querySelector('button').focus();
  }

  function openLookCloser(st) {
    var cards = resolveAll(st.lookCloser);
    if (!cards.length) return;
    var d = document.getElementById('dlg-look');
    d.textContent = '';
    var box = el('div', 'dlg-box look');
    box.appendChild(el('h2', 'kicker', UI.lookCloser + ' · ' + st.title));
    cards.forEach(function (c) {
      var art = el('article', 'lc-card');
      if (c.kind) art.appendChild(el('p', 'kicker', c.kind));
      if (c.title) art.appendChild(el('h3', 'lc-title', c.title));
      [].concat(c.body || []).forEach(function (p) { art.appendChild(el('p', 'para', p)); });
      if (c.source) art.appendChild(el('p', 'lc-source', c.source));
      box.appendChild(art);
    });
    box.appendChild(btn(UI.close, 'quiet', function () { closeDialog(d); }));
    d.appendChild(box);
    openDialog(d);
    box.querySelector('button').focus();
  }

  /* ------------------------------------------------------------------- play */

  var stage, nextBtn, topStory, topXp, topCampaign, beatBar;

  var Play = {
    story: null, beats: [], bi: 0, step: 0, view: null, revisit: false, awarded: false,
    lastTap: 0, lock: false,

    begin: function (cur) {
      var st = storyById(cur.storyId);
      if (!st) { Store.s.current = null; Store.save(); go('home'); return; }
      this.story = st;
      this.revisit = !!cur.revisit;
      this.awarded = !!cur.awarded;
      this.beats = [{ type: 'intro' }]
        .concat(st.beats.filter(function (b) { return resolve(b) != null; }))
        .concat(st.silentComplete ? [] : [{ type: 'storyComplete' }]);
      this.bi = Math.max(0, Math.min(cur.beat | 0, this.beats.length - 1));
      this.step = Math.max(0, cur.step | 0);
      showView('play');
      this.chrome();
      this.render(true);
    },

    persist: function () {
      Store.s.current = { storyId: this.story.id, beat: this.bi, step: this.step, revisit: this.revisit, awarded: this.awarded };
      Store.save();
      this.progress();
    },

    chrome: function () {
      topStory.textContent = UI.storyLabel + ' ' + pad(this.story.order);
      topStory.setAttribute('aria-label', UI.storyLabel + ' ' + this.story.order + ' of ' + STORIES.length + ': ' + this.story.title);
      topCampaign.replaceWith(topCampaign = progressBar('top-campaign'));
      var hide = !!this.story.hideXp;
      topXp.hidden = hide;
      topXp.textContent = Store.s.xp + ' ' + UI.xp;
    },

    progress: function () {
      var v = this.view;
      var frac = (this.bi + (v && v.steps > 1 ? this.step / v.steps : 0)) / Math.max(1, this.beats.length - 1);
      beatBar.style.transform = 'scaleX(' + Math.min(1, frac).toFixed(4) + ')';
    },

    render: function (animate) {
      var b = this.beats[this.bi];
      if (b.type === 'storyComplete' && !this.revisit && !this.awarded) {
        this.awarded = Store.complete(this.story.id);
        topXp.textContent = Store.s.xp + ' ' + UI.xp;
        topCampaign.replaceWith(topCampaign = progressBar('top-campaign'));
      }
      var ctx = { story: this.story, awarded: this.awarded && !this.revisit, choose: this.choose.bind(this) };
      var view = Beats[b.type](resolve(b), ctx);
      this.view = view;
      if (this.step > view.steps - 1) this.step = view.steps - 1;

      var slot = el('div', 'slot');
      slot.appendChild(view.el);
      stage.querySelectorAll('.slot').forEach(function (old) {
        old.classList.add('leaving');
        old.setAttribute('aria-hidden', 'true');
        window.setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, reduced() ? 60 : 320);
      });
      stage.appendChild(slot);
      views.play.classList.toggle('blackout', !!view.dark);
      view.show(this.step, animate);

      var inter = !!view.interactive;
      var hadFocus = document.activeElement === nextBtn;
      nextBtn.hidden = inter;
      if (inter) {
        var target = view.el.querySelector('.question, .opt, .btn');
        if (target && target.classList.contains('question')) { target.tabIndex = -1; }
        if (target && (hadFocus || document.activeElement === document.body)) target.focus({ preventScroll: true });
      } else if (hadFocus || document.activeElement === document.body || !document.activeElement || !views.play.contains(document.activeElement)) {
        nextBtn.focus({ preventScroll: true });
      }
      this.persist();
    },

    advance: function () {
      var t = now();
      if (t - this.lastTap < 260 || this.lock || !this.view) return;
      this.lastTap = t;
      if (this.view.interactive) return;
      if (this.step < this.view.steps - 1) {
        this.step++;
        this.view.show(this.step, true);
        this.persist();
        return;
      }
      this.nextBeat();
    },

    nextBeat: function () {
      if (this.bi < this.beats.length - 1) {
        this.bi++; this.step = 0;
        this.render(true);
        return;
      }
      if (this.story.silentComplete) {
        // Story 12: XP is added internally and nothing is shown.
        if (!this.revisit) Store.complete(this.story.id);
        Store.s.current = { ending: true, step: 0 };
        Store.save();
        go('play');
      }
    },

    choose: function (decisionId, label) {
      Store.choose(this.story.id, decisionId, label);
      var self = this;
      this.lock = true;
      window.setTimeout(function () {
        self.lock = false;
        self.lastTap = 0;
        self.nextBeat();
      }, reduced() ? 80 : 360);
    }
  };

  function startStory(id, opts) {
    Store.s.current = { storyId: id, beat: 0, step: 0, revisit: !!(opts && opts.revisit), awarded: false };
    Store.save();
    go('play');
  }

  /* ----------------------------------------------------------------- ending */

  var Ending = {
    step: 0, deck: null, cards: [], lastTap: 0, timer: null,
    SOLO: STORIES.length,           // steps 0..11: one memory card at a time
    GRID: STORIES.length,           // step 12: cards shrink into a grid
    CHRONO: STORIES.length + 1,     // step 13: grid reorders chronologically
    FINAL: STORIES.length + 2,      // step 14: fade to black, WHAT NOW?

    begin: function (s) {
      var v = views.ending;
      v.textContent = '';
      window.clearTimeout(this.timer);
      this.step = Math.max(0, Math.min(s | 0, this.FINAL));
      this.deck = el('ol', 'deck');
      this.deck.setAttribute('aria-label', 'Memories');
      this.cards = STORIES.map(function (st) {
        var li = el('li', 'end-card');
        li.style.order = st.order;
        li.dataset.rank = st.chrono.rank;
        li.appendChild(fit(el('span', 'end-text', st.memory), st.memory));
        var y = el('span', 'end-year', st.chrono.label);
        li.appendChild(y);
        return li;
      });
      this.cards.forEach(function (c) { this.deck.appendChild(c); }, this);
      v.appendChild(this.deck);
      this.final = el('div', 'final');
      v.appendChild(this.final);
      this.hint = el('button', 'end-next', '→');
      this.hint.type = 'button';
      this.hint.setAttribute('aria-label', UI.next);
      this.hint.addEventListener('click', function (e) { e.stopPropagation(); Ending.advance(); });
      v.appendChild(this.hint);
      showView('ending');
      this.apply(this.step < this.GRID);
      this.hint.focus({ preventScroll: true });
    },

    save: function () {
      Store.s.current = { ending: true, step: this.step };
      if (this.step >= this.FINAL) { Store.s.campaignComplete = true; Store.s.current = null; }
      Store.save();
    },

    apply: function (animate) {
      var s = this.step, deck = this.deck;
      if (s < this.GRID) {
        deck.className = 'deck solo';
        this.cards.forEach(function (c, i) {
          var on = i === s;
          c.classList.toggle('current', on);
          c.classList.toggle('anim', on && animate);
        });
        announce(STORIES[s].memory);
      } else if (s === this.GRID) {
        deck.className = 'deck grid' + (animate ? ' shrink' : '');
        this.cards.forEach(function (c, i) {
          c.classList.remove('current', 'anim');
          c.style.animationDelay = animate ? (i * 45) + 'ms' : '';
        });
        announce('');
      } else if (s === this.CHRONO) {
        this.reorder(animate);
      } else {
        this.finish(animate);
      }
    },

    // FLIP: measure, reorder via CSS `order`, then glide each card into place.
    reorder: function (animate) {
      var deck = this.deck;
      deck.classList.remove('shrink');
      deck.classList.add('grid');
      var cards = this.cards;
      var first = cards.map(function (c) { return c.getBoundingClientRect(); });
      cards.forEach(function (c) { c.style.animationDelay = ''; c.style.order = c.dataset.rank; });
      deck.classList.add('chrono');
      if (!animate || reduced()) {
        announce(STORIES.slice().sort(function (a, b) { return a.chrono.rank - b.chrono.rank; })
          .map(function (st) { return st.chrono.label + ', ' + st.memory; }).join('. '));
        return;
      }
      var last = cards.map(function (c) { return c.getBoundingClientRect(); });
      cards.forEach(function (c, i) {
        var dx = first[i].left - last[i].left, dy = first[i].top - last[i].top;
        c.style.transition = 'none';
        c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      void deck.offsetWidth;
      window.requestAnimationFrame(function () {
        cards.forEach(function (c, i) {
          c.style.transition = 'transform 1400ms cubic-bezier(.45,0,.2,1) ' + (i * 30) + 'ms';
          c.style.transform = '';
        });
      });
      announce(STORIES.slice().sort(function (a, b) { return a.chrono.rank - b.chrono.rank; })
        .map(function (st) { return st.chrono.label + ', ' + st.memory; }).join('. '));
    },

    finish: function (animate) {
      var self = this;
      if (this.step === this.FINAL && !this.deck.classList.contains('chrono')) {
        this.cards.forEach(function (c) { c.style.order = c.dataset.rank; });
        this.deck.classList.add('grid', 'chrono');
      }
      this.hint.hidden = true;
      this.deck.classList.add('gone');
      var delay = animate && !reduced() ? 1300 : 0;
      this.timer = window.setTimeout(function () {
        self.deck.hidden = true;
        self.final.textContent = '';
        var q = big(C.ending.question, 'whatnow', 'h1');
        q.tabIndex = -1;
        self.final.appendChild(q);
        q.classList.add('on', 'anim');
        q.focus({ preventScroll: true });
        announce(C.ending.question);
        self.timer = window.setTimeout(function () {
          var b = btn(C.ending.revisitLabel, 'revisit', function () { go('stories'); });
          self.final.appendChild(b);
        }, C.ending.revisitDelayMs);
      }, delay);
    },

    advance: function () {
      var t = now();
      if (t - this.lastTap < 300 || this.step >= this.FINAL) return;
      this.lastTap = t;
      this.step++;
      this.save();
      this.apply(true);
    }
  };

  /* ----------------------------------------------------------------- router */

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    document.querySelectorAll('dialog[open]').forEach(closeDialog);
    if (h !== 'play') window.clearTimeout(Ending.timer);
    if (h === 'stories') return renderStories();
    if (h === 'about') return renderAbout();
    if (h === 'play') {
      var cur = Store.s.current;
      if (cur && cur.ending) return Ending.begin(cur.step);
      if (cur && storyById(cur.storyId)) return Play.begin(cur);
      if (location.hash !== '#/') { history.replaceState(null, '', '#/'); }
      return renderHome();
    }
    renderHome();
  }

  /* ------------------------------------------------------------------- init */

  function init() {
    Store.load();
    applyPrefs();
    live = document.getElementById('sr-live');
    views = {
      home: document.getElementById('view-home'),
      stories: document.getElementById('view-stories'),
      about: document.getElementById('view-about'),
      play: document.getElementById('view-play'),
      ending: document.getElementById('view-ending')
    };
    stage = document.getElementById('stage');
    nextBtn = document.getElementById('next');
    topStory = document.getElementById('top-story');
    topXp = document.getElementById('top-xp');
    topCampaign = document.getElementById('top-campaign');
    beatBar = document.getElementById('beat-bar');

    nextBtn.querySelector('.next-label').textContent = UI.next;
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); Play.advance(); });
    document.getElementById('menu-btn').addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });

    // Tap anywhere on the stage to continue (never on decisions).
    stage.addEventListener('click', function (e) {
      if (e.target.closest('button, a, dialog')) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      Play.advance();
    });
    views.ending.addEventListener('click', function (e) {
      if (e.target.closest('button, a')) return;
      Ending.advance();
    });

    document.addEventListener('keydown', function (e) {
      if (document.querySelector('dialog[open]')) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var keys = [' ', 'Enter', 'ArrowRight', 'PageDown'];
      if (currentView === 'play') {
        if (e.key === 'Escape') { e.preventDefault(); openMenu(); return; }
        if (keys.indexOf(e.key) === -1) return;
        var onBtn = e.target.closest && e.target.closest('button, a');
        if (onBtn && e.key !== 'ArrowRight') return; // native activation
        if (Play.view && Play.view.interactive) return;
        e.preventDefault(); Play.advance();
      } else if (currentView === 'ending') {
        if (keys.indexOf(e.key) === -1) return;
        var onB = e.target.closest && e.target.closest('button, a');
        if (onB && e.key !== 'ArrowRight') return;
        e.preventDefault(); Ending.advance();
      }
    });

    window.addEventListener('hashchange', route);
    route();

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () { /* offline support unavailable */ });
      });
    }
  }

  // Test hook (read-only view of stored progress; no network, no telemetry).
  window.ORGANIZE_DEBUG = { state: function () { return JSON.parse(JSON.stringify(Store.s)); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
