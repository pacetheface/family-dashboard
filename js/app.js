/* Knapp family hub. Classic script, no build.
   Morning rules match the previous wall: boys leave 7:10, June 7:30,
   ready-by star at 7:05 / 7:25, "N of 5 this week", chimes at 15/10/5.
   Calendar plaintext never lives in the repo — only data/today.json. */
(function () {
  'use strict';

  var STATE_KEY = 'knappWall3';
  var HUB_KEY = 'knappHub1';
  var KEY_CACHE = 'knappDashKey';
  var SOUND_KEY = 'knappSound';
  var WX_KEY = 'knappWx';
  var WAKE = 6 * 60 + 30;
  var LEAVE = { West: 7 * 60 + 10, Jack: 7 * 60 + 10, June: 7 * 60 + 30 };
  var EARLY = 5;
  var KIDS = ['West', 'Jack', 'June'];
  var BIRTH = { West: '2016-04-01', Jack: '2018-03-19', June: '2021-01-22' };
  var PARENTS = [
    { id: 'dad', name: 'Ryan', label: 'Dad', initial: 'R' },
    { id: 'mom', name: 'Jessica', label: 'Mom', initial: 'J' }
  ];
  var KID_INITIAL = { West: 'W', Jack: 'J', June: 'Ju' };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var FERIEN = [
    ['2026-08-03', '2026-09-14', 'Sommerferien'],
    ['2026-11-02', '2026-11-06', 'Herbstferien'],
    ['2026-12-24', '2027-01-08', 'Weihnachtsferien'],
    ['2027-02-08', '2027-02-12', 'Frühjahrsferien'],
    ['2027-03-22', '2027-04-02', 'Osterferien'],
    ['2027-05-18', '2027-05-28', 'Pfingstferien'],
    ['2027-08-02', '2027-09-13', 'Sommerferien']
  ];
  var HOLIDAYS = {
    '2026-01-01': 'Neujahr',
    '2026-01-06': 'Heilige Drei Könige',
    '2026-04-03': 'Karfreitag',
    '2026-04-06': 'Ostermontag',
    '2026-05-01': 'Tag der Arbeit',
    '2026-05-14': 'Christi Himmelfahrt',
    '2026-05-25': 'Pfingstmontag',
    '2026-06-04': 'Fronleichnam',
    '2026-08-15': 'Mariä Himmelfahrt',
    '2026-10-03': 'Tag der Deutschen Einheit',
    '2026-11-01': 'Allerheiligen',
    '2026-12-25': '1. Weihnachtstag',
    '2026-12-26': '2. Weihnachtstag',
    '2027-01-01': 'Neujahr',
    '2027-01-06': 'Heilige Drei Könige',
    '2027-03-26': 'Karfreitag',
    '2027-03-29': 'Ostermontag',
    '2027-05-01': 'Tag der Arbeit',
    '2027-05-06': 'Christi Himmelfahrt',
    '2027-05-17': 'Pfingstmontag',
    '2027-05-27': 'Fronleichnam',
    '2027-08-15': 'Mariä Himmelfahrt',
    '2027-10-03': 'Tag der Deutschen Einheit',
    '2027-11-01': 'Allerheiligen',
    '2027-12-25': '1. Weihnachtstag',
    '2027-12-26': '2. Weihnachtstag'
  };
  var QUOTES = [
    'Be kind and the day gets bigger.',
    'A small help is still a help.',
    'Try, rest, then try again.',
    'Look up. The sky is doing something.',
    'Friends make the walk shorter.',
    'Today is a good day to learn one new thing.',
    'Brave can be a quiet word.',
    'Share the good bit.',
    'Hands can be gentle and strong.',
    'Ask, and then listen.',
    'Make a little room for someone else.',
    'The slow way still gets there.',
    'Notice something beautiful before breakfast.',
    'Thank-you is a whole sentence.',
    'You belong at this table.',
    'Leave the place a bit nicer.'
  ];
  var JOKES = [
    ['What do you call a bear with no teeth?', 'A gummy bear.'],
    ['Why did the cookie go to the doctor?', 'It felt crummy.'],
    ['What do cows read at breakfast?', 'The moo-spaper.'],
    ['Why was the broom late?', 'It overswept.'],
    ['What do you give a sick lemon?', 'Lemon-aid.'],
    ['Why did the teddy sit on the clock?', 'He wanted to be on time.'],
    ['What is a cat’s favorite color?', 'Purr-ple.'],
    ['Why did the bicycle fall over?', 'It was two-tired.'],
    ['What do you call cheese that is not yours?', 'Nacho cheese.'],
    ['Why did the sun go to school?', 'To get brighter.'],
    ['What runs but never walks?', 'A tap.'],
    ['Why are mountains so funny?', 'They are hill-arious.'],
    ['What did the zero say to the eight?', 'Nice belt.'],
    ['Why did the tomato blush?', 'It saw the salad dressing.']
  ];
  var ANIMALS = [
    ['Alpine ibex', 'Ibex live on steep rock and climb like it is a staircase.'],
    ['Red fox', 'A fox hears a mouse under the snow and jumps straight down.'],
    ['Red squirrel', 'Squirrels hide nuts and then forget some, which plants new trees.'],
    ['White stork', 'Storks spend the summer on chimneys and fly south when it cools.'],
    ['European hedgehog', 'A hedgehog rolls into a ball of spines when it wants quiet.'],
    ['Barn owl', 'Owls fly almost without a sound so dinner does not hear them.'],
    ['Fire salamander', 'These black-and-yellow salamanders like cool, wet woods.'],
    ['Chamois', 'Chamois are goat-antelopes that bounce along the Alps.'],
    ['Great spotted woodpecker', 'A woodpecker drums on wood to talk, not only to find bugs.'],
    ['European hare', 'Hares are born with fur and open eyes, ready to run.'],
    ['Kingfisher', 'A kingfisher dives for fish and looks like a flying jewel.'],
    ['Roe deer', 'Roe deer are small, shy, and often seen at the edge of a field.'],
    ['Golden eagle', 'Eagles ride the wind and can see a rabbit from very far away.'],
    ['Common toad', 'Toads walk more than they hop, and they like a damp garden.']
  ];
  var WORDS = [
    ['Sonnenblume', 'sunflower', 'Draw a sunflower with as many petals as you are years old.'],
    ['Freundlich', 'kind', 'Say one kind sentence to someone at home.'],
    ['Berg', 'mountain', 'Build a mountain out of cushions and climb it gently.'],
    ['Schmetterling', 'butterfly', 'Find three colors a butterfly might like.'],
    ['Frühstück', 'breakfast', 'Name everything on the breakfast table in German or English.'],
    ['Regenbogen', 'rainbow', 'Point to something in the room for every rainbow color.'],
    ['zusammen', 'together', 'Do one small job side by side.'],
    ['danke', 'thank you', 'Write or say danke to somebody.'],
    ['Mut', 'courage', 'Try one thing that feels a tiny bit new.'],
    ['Pflanze', 'plant', 'Check a plant and see if the soil is thirsty.'],
    ['Lachen', 'laughter', 'Tell the joke of the day in a silly voice.'],
    ['Stern', 'star', 'Count the stars you have, then name one way you earned one.'],
    ['Zuhause', 'home', 'Draw a map of your favorite corner of home.'],
    ['Wolke', 'cloud', 'Look out the window and name the shape of a cloud.']
  ];
  var STICKERS = [
    { id: 'sun', emoji: '☀️', need: 0 },
    { id: 'leaf', emoji: '🍃', need: 3 },
    { id: 'star', emoji: '⭐', need: 6 },
    { id: 'heart', emoji: '💛', need: 10 },
    { id: 'flower', emoji: '🌼', need: 15 },
    { id: 'ball', emoji: '⚽', need: 20 },
    { id: 'book', emoji: '📘', need: 25 },
    { id: 'moon', emoji: '🌙', need: 30 },
    { id: 'train', emoji: '🚂', need: 40 },
    { id: 'cake', emoji: '🍰', need: 50 },
    { id: 'tree', emoji: '🌲', need: 60 },
    { id: 'crown', emoji: '👑', need: 75 }
  ];
  var SECTIONS = ['Produce', 'Meat & Fish', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Spices', 'Frozen', 'Drinks', 'Household', 'Other'];
  var NAV = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'kids', label: 'Kids', icon: 'morning' },
    { id: 'calendar', label: 'Calendar', icon: 'cal' },
    { id: 'playroom', label: 'Playroom', icon: 'star' },
    { id: 'meals', label: 'Meals', icon: 'meals' },
    { id: 'house', label: 'House', icon: 'house' },
    { id: 'sports', label: 'Sports', icon: 'sport' },
    { id: 'spice', label: 'Spice', icon: 'spice' },
    { id: 'date', label: 'Date', icon: 'heart' }
  ];

  var Q = {};
  (function () {
    var s = location.search.charAt(0) === '?' ? location.search.slice(1) : location.search;
    if (!s) return;
    var parts = s.split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('=');
      Q[decodeURIComponent(kv[0] || '')] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    }
  })();

  var CLOCK_OFFSET = 0;
  var FROZEN = false;
  var FROZEN_MS = 0;
  var berlinFmt = null;
  var state = { date: '', kids: {}, history: {}, chimed: {} };
  var hub = null;
  var DATA = null;
  var FILE = null;
  var calMode = 'loading';
  var unlocking = false;
  var resetArm = {};
  var WX = null;
  var soundOn = false;
  var audioCtx = null;
  var audioReady = false;
  var wakeLock = null;
  var reloaded = false;
  var page = 'home';
  var lastPage = 'home';
  var overlay = null;
  var pendingConfirm = null;
  var focusSel = '';
  var homeMorning = false;
  var morningLive = false;
  var kidsShown = 'morning';
  var calView = 'week';
  var calAnchor = '';
  var kidOn = { West: true, Jack: true, June: true };
  var playKid = 'all';
  var playTab = 'today';
  var playGroup = '';
  var parentOn = false;
  var pinBuf = '';
  var pinFlow = null;
  var pinLockUntil = 0;
  var pinFails = 0;
  var jokeOpenFor = '';
  var kitchen = { running: false, left: 0, endAt: 0, justDone: false };
  var kitchenRang = false;
  var toastTimer = null;
  var scrollKey = '';
  var mealsPane = 'plan';
  var recipeQuery = '';
  var recipeTag = 'All';
  var openSlug = '';
  var cookIndex = 0;
  var serveNow = 1;
  var RECIPE_INDEX = [];
  var RECIPE_FULL = {};

  function pad2(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 8); }
  function ymdToUtc(ymd) {
    var p = ymd.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(ymd, n) {
    var dt = new Date(ymdToUtc(ymd));
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.getUTCFullYear() + '-' + pad2(dt.getUTCMonth() + 1) + '-' + pad2(dt.getUTCDate());
  }
  function daysBetween(a, b) { return Math.round((ymdToUtc(b) - ymdToUtc(a)) / 86400000); }
  function weekdayIndex(ymd) { return new Date(ymdToUtc(ymd)).getUTCDay(); }
  function mondayOf(ymd) {
    var w = weekdayIndex(ymd);
    return addDays(ymd, w === 0 ? -6 : 1 - w);
  }
  function isWeekendYmd(ymd) {
    var w = weekdayIndex(ymd);
    return w === 0 || w === 6;
  }
  function weekdayKey(ymd) { return DAY_KEYS[weekdayIndex(ymd)]; }
  function wdLong(short) {
    var map = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
    var s = String(short || '').replace(/\./g, '');
    if (map[s]) return map[s];
    return map[s.slice(0, 3)] || s || '';
  }
  function partsOf(fmt, date) {
    var o = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, weekday: '' };
    var list = fmt.formatToParts(date);
    for (var i = 0; i < list.length; i++) {
      var t = list[i].type;
      var v = list[i].value;
      if (t === 'weekday') o.weekday = v;
      else if (t === 'year' || t === 'month' || t === 'day' || t === 'hour' || t === 'minute' || t === 'second') o[t] = parseInt(v, 10);
    }
    if (o.hour === 24) o.hour = 0;
    return o;
  }
  function wallToUtcMs(y, mo, d, h, mi, s, timeZone) {
    var want = Date.UTC(y, mo - 1, d, h, mi, s);
    var utc = want;
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    for (var i = 0; i < 4; i++) {
      var p = partsOf(fmt, new Date(utc));
      var got = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      if (got === want) return utc;
      utc += want - got;
    }
    return utc;
  }
  function berlinLocalToEpoch(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return 0;
    try { return wallToUtcMs(+m[1], +m[2], +m[3], +m[4], +m[5], +(m[6] || 0), 'Europe/Berlin'); }
    catch (e) { return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)).getTime(); }
  }
  function berlinParts(date) {
    try {
      if (!berlinFmt) {
        berlinFmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Berlin', weekday: 'short',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
      }
      var p = partsOf(berlinFmt, date);
      if (!p.year) throw new Error('bad');
      return {
        y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute, s: p.second,
        weekday: String(p.weekday || '').replace(/\./g, ''),
        ymd: p.year + '-' + pad2(p.month) + '-' + pad2(p.day)
      };
    } catch (e2) {
      return {
        y: date.getFullYear(), mo: date.getMonth() + 1, d: date.getDate(),
        h: date.getHours(), mi: date.getMinutes(), s: date.getSeconds(),
        weekday: WD_SHORT[date.getDay()],
        ymd: date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
      };
    }
  }
  function nowMs() { return FROZEN ? FROZEN_MS : Date.now() + CLOCK_OFFSET; }
  function nowParts() { return berlinParts(new Date(nowMs())); }
  function currentYmd() { return nowParts().ymd; }

  // ?test=morning starts at 06:45, ?test=afternoon at 15:55, on the next school
  // day, then both run at real speed. Saved stars and afternoon progress stay put.
  var TEST_MODE = Q.test === 'afternoon' ? 'afternoon' : (Q.test === 'morning' ? 'morning' : '');
  var TEST_MORNING = TEST_MODE === 'morning';
  var testBootMs = Date.now();
  var testOriginMs = 0;
  var testKids = {};
  var testChimed = {};
  var testAfternoon = { days: {} };
  function isSchoolDay(ymd) {
    if (hardOff(ymd)) return false;
    if (!DATA) return true;
    var who = leaveWho(ymd);
    return !!(who.boys.length || who.june);
  }
  function nextSchoolYmd(real) {
    var mins = real.h * 60 + real.mi;
    var cut = TEST_MODE === 'afternoon' ? 15 * 60 + 55 : 6 * 60 + 45;
    var start = (isSchoolDay(real.ymd) && mins < cut) ? real.ymd : addDays(real.ymd, 1);
    var ymd = start;
    for (var i = 0; i < 21; i++) {
      ymd = addDays(start, i);
      if (isSchoolDay(ymd)) return ymd;
    }
    return ymd;
  }
  if (TEST_MODE) {
    var testClock = TEST_MODE === 'afternoon' ? 'T15:55:00' : 'T06:45:00';
    testOriginMs = berlinLocalToEpoch(nextSchoolYmd(berlinParts(new Date(testBootMs))) + testClock);
  }
  function morningNowMs() {
    if (!TEST_MODE || !testOriginMs) return nowMs();
    return testOriginMs + (Date.now() - testBootMs);
  }
  function morningParts() {
    if (!TEST_MODE || !testOriginMs) return nowParts();
    return berlinParts(new Date(morningNowMs()));
  }
  function doy(ymd) { return daysBetween(ymd.slice(0, 4) + '-01-01', ymd); }
  function pick(list, ymd) { return list[((doy(ymd) % list.length) + list.length) % list.length]; }
  function prettyTime(t) {
    if (!t) return '';
    var p = String(t).split(':');
    return String(+p[0]) + ':' + (p[1] || '00');
  }
  function fmtRange(time, end) {
    if (!time) return 'All day';
    if (!end || end === time) return prettyTime(time);
    return prettyTime(time) + '–' + prettyTime(end);
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60);
  }
  function fmtLeft(sec) {
    sec = Math.max(0, Math.round(sec));
    if (sec >= 3600) {
      var h = Math.floor(sec / 3600);
      var m = Math.floor((sec % 3600) / 60);
      return h + 'h ' + pad2(m) + 'm';
    }
    return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60);
  }
  function fmtHM(min) { return Math.floor(min / 60) + ':' + pad2(min % 60); }
  function fmtClock(p) { return p.h + ':' + pad2(p.mi); }
  function fmtAt(ms) { var p = berlinParts(new Date(ms)); return p.h + ':' + pad2(p.mi); }
  function prettyDate(ymd) {
    if (!ymd || ymd.length < 10) return ymd || '';
    return (+ymd.slice(8, 10)) + ' ' + (MONTHS_S[+ymd.slice(5, 7) - 1] || '');
  }
  function longDate(p) { return wdLong(p.weekday) + ', ' + MONTHS[p.mo - 1] + ' ' + p.d; }
  function ageOf(name, ymd) {
    var birth = BIRTH[name];
    var y = +ymd.slice(0, 4) - +birth.slice(0, 4);
    if (ymd.slice(5) < birth.slice(5)) y--;
    return y;
  }
  function ferienName(ymd) {
    for (var i = 0; i < FERIEN.length; i++) {
      if (ymd >= FERIEN[i][0] && ymd <= FERIEN[i][1]) return FERIEN[i][2];
    }
    return '';
  }
  function nextFerien(ymd) {
    var best = null;
    for (var i = 0; i < FERIEN.length; i++) {
      if (FERIEN[i][1] < ymd) continue;
      if (!best || FERIEN[i][0] < best.start) best = { start: FERIEN[i][0], end: FERIEN[i][1], name: FERIEN[i][2] };
    }
    return best;
  }
  function hardOff(ymd) { return isWeekendYmd(ymd) || !!HOLIDAYS[ymd] || !!ferienName(ymd); }
  function minutesOf(t) {
    if (!t) return null;
    var p = String(t).split(':');
    return (+p[0]) * 60 + (+p[1] || 0);
  }

  if (Q.at) {
    var atMs = berlinLocalToEpoch(Q.at);
    if (atMs) {
      if (Q.freeze === '1') { FROZEN = true; FROZEN_MS = atMs; }
      else CLOCK_OFFSET = atMs - Date.now();
    }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') state = parsed;
      }
    } catch (e) {}
    if (!state.kids) state.kids = {};
    if (!state.history) state.history = {};
    if (!state.chimed) state.chimed = {};
  }
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function finishOnTime(kid, doneMs) {
    var p = berlinParts(new Date(doneMs));
    var min = p.h * 60 + p.mi;
    var limit = LEAVE[kid] - EARLY;
    if (min < limit) return true;
    if (min === limit && p.s === 0) return true;
    return false;
  }
  function resultOf(name, kid) {
    if (!kid || !kid.inAt || !kid.doneAt) return null;
    return { secs: Math.max(0, Math.round((kid.doneAt - kid.inAt) / 1000)), onTime: finishOnTime(name, kid.doneAt) };
  }
  function pruneHistory(ymd) {
    var keep = addDays(ymd, -21);
    for (var k in state.history) {
      if (Object.prototype.hasOwnProperty.call(state.history, k) && k < keep) delete state.history[k];
    }
  }
  function ensureToday(ymd) {
    if (state.date === ymd) return;
    if (state.date) {
      var snap = {};
      for (var i = 0; i < KIDS.length; i++) {
        var rec = resultOf(KIDS[i], state.kids[KIDS[i]]);
        if (rec) snap[KIDS[i]] = rec;
      }
      state.history[state.date] = snap;
      pruneHistory(ymd);
    }
    state.date = ymd;
    state.kids = {};
    state.chimed = {};
    saveState();
  }
  function kidState(name) {
    if (TEST_MORNING) {
      if (!testKids[name]) testKids[name] = { checks: {} };
      if (!testKids[name].checks) testKids[name].checks = {};
      return testKids[name];
    }
    if (!state.kids[name]) state.kids[name] = { checks: {} };
    if (!state.kids[name].checks) state.kids[name].checks = {};
    return state.kids[name];
  }
  function recordOn(name, day, today) {
    if (day === today) return resultOf(name, state.kids[name]);
    var bucket = state.history[day];
    return bucket && bucket[name] ? bucket[name] : null;
  }
  function onTimeDays(name, ymd) {
    var monday = mondayOf(ymd);
    var n = 0;
    var of = 0;
    for (var i = 0; i < 5; i++) {
      var d = addDays(monday, i);
      if (hardOff(d)) continue;
      if (d === ymd && calendarOff(name, ymd)) continue;
      of += 1;
      var rec = recordOn(name, d, ymd);
      if (rec && rec.onTime) n += 1;
    }
    return { n: n, of: of };
  }
  function weekBest(name, ymd) {
    var monday = mondayOf(ymd);
    var best = null;
    for (var i = 0; i < 7; i++) {
      var rec = recordOn(name, addDays(monday, i), ymd);
      if (rec && rec.secs != null && (best == null || rec.secs < best)) best = rec.secs;
    }
    return best;
  }
  function yesterdaySecs(name, ymd) {
    var rec = recordOn(name, addDays(ymd, -1), ymd);
    return rec ? rec.secs : null;
  }

  function seedMorning() {
    return {
      West: [
        { id: 'dress', label: 'Get dressed' },
        { id: 'teeth', label: 'Brush teeth' },
        { id: 'hw', label: 'Homework done' },
        { id: 'box', label: 'Brotbox in bag' },
        { id: 'weather', label: 'Check the weather' }
      ],
      Jack: [
        { id: 'meds', label: 'Meds taken' },
        { id: 'dress', label: 'Get dressed' },
        { id: 'teeth', label: 'Brush teeth' },
        { id: 'hw', label: 'Homework done' },
        { id: 'box', label: 'Brotbox in bag' },
        { id: 'weather', label: 'Check the weather' }
      ],
      June: [
        { id: 'dress', label: 'Get dressed' },
        { id: 'teeth', label: 'Brush teeth' },
        { id: 'snack', label: 'Snack packed' },
        { id: 'clothes', label: 'Weather clothes on' }
      ]
    };
  }
  function seedChores() {
    var morning = seedMorning();
    return {
      West: {
        morning: morning.West,
        weekend: [
          { id: 'w-room', label: 'Clean your room' },
          { id: 'w-vacuum', label: 'Vacuum the kids’ rooms' },
          { id: 'w-recycle', label: 'Sort the recycling' },
          { id: 'w-fold', label: 'Help fold the laundry' },
          { id: 'w-bins', label: 'Take the bins out' }
        ],
        bedtime: [
          { id: 'w-pj', label: 'Pyjamas on' },
          { id: 'w-teeth', label: 'Brush teeth' },
          { id: 'w-bag', label: 'Pack the school bag' },
          { id: 'w-read', label: 'Read for 15 minutes' }
        ]
      },
      Jack: {
        morning: morning.Jack,
        weekend: [
          { id: 'j-room', label: 'Clean your room' },
          { id: 'j-sink', label: 'Clean the bathroom sink' },
          { id: 'j-table', label: 'Wipe the dinner table' },
          { id: 'j-socks', label: 'Match the socks' },
          { id: 'j-plants', label: 'Water the plants' }
        ],
        bedtime: [
          { id: 'j-pj', label: 'Pyjamas on' },
          { id: 'j-teeth', label: 'Brush teeth' },
          { id: 'j-books', label: 'Books back on the shelf' },
          { id: 'j-story', label: 'One quiet story' }
        ]
      },
      June: {
        morning: morning.June,
        weekend: [
          { id: 'u-toys', label: 'Toys back in the box' },
          { id: 'u-shoes', label: 'Shoes by the door' },
          { id: 'u-table', label: 'Help set the table' },
          { id: 'u-stool', label: 'Push the stool to the sink' },
          { id: 'u-plant', label: 'Give a plant a little water' }
        ],
        bedtime: [
          { id: 'u-pj', label: 'Pyjamas on' },
          { id: 'u-teeth', label: 'Brush teeth' },
          { id: 'u-teddy', label: 'Teddy in bed' },
          { id: 'u-book', label: 'Pick a book' }
        ]
      }
    };
  }
  function seedMeals() {
    return {
      mon: { title: 'Spaghetti Bolognese', side: 'Cucumber salad', ingredients: 'Spaghetti, Ground beef, Passata, Onion, Carrot, Garlic' },
      tue: { title: 'Potato soup', side: 'Bread and butter', ingredients: 'Potatoes, Leek, Carrots, Vegetable broth, Sausage' },
      wed: { title: 'Chicken stir-fry', side: 'Rice', ingredients: 'Chicken thighs, Frozen stir-fry vegetables, Rice, Soy sauce' },
      thu: { title: 'Käsespätzle', side: 'Green salad', ingredients: 'Spätzle, Emmental, Onion, Butter, Salad' },
      fri: { title: 'Pizza night', side: 'Kids pick the toppings', ingredients: 'Pizza dough, Mozzarella, Passata, Ham, Peppers, Mushrooms' },
      sat: { title: 'Bratwurst', side: 'Potato salad', ingredients: 'Bratwurst, Potatoes, Onion, Vinegar, Mustard, Buns' },
      sun: { title: 'Roast chicken', side: 'Potatoes and carrots', ingredients: 'Whole chicken, Potatoes, Carrots, Onion, Garlic' }
    };
  }
  function seedRewards() {
    return [
      { id: 'story', title: 'Extra bedtime story', cost: 6, emoji: '📖' },
      { id: 'cocoa', title: 'Hot chocolate', cost: 8, emoji: '☕' },
      { id: 'film', title: 'Pick the Friday film', cost: 12, emoji: '🎬' },
      { id: 'breakfast', title: 'Choose Saturday breakfast', cost: 10, emoji: '🥞' },
      { id: 'park', title: 'Park afternoon', cost: 20, emoji: '🌳' },
      { id: 'late', title: 'Stay up 20 extra minutes', cost: 15, emoji: '🌙' },
      { id: 'bakery', title: 'A bakery treat', cost: 18, emoji: '🥐' },
      { id: 'book', title: 'A new book', cost: 40, emoji: '📚' }
    ];
  }
  function defaultHub() {
    var meals = seedMeals();
    var recent = [];
    ['fri', 'sun', 'wed', 'thu'].forEach(function (k) { recent.push({ title: meals[k].title, side: meals[k].side, ingredients: meals[k].ingredients }); });
    return {
      v: 1,
      pin: '',
      stars: { West: 0, Jack: 0, June: 0 },
      starLog: [],
      awarded: {},
      chores: seedChores(),
      choreDone: {},
      rewards: seedRewards(),
      redemptions: [],
      placed: [],
      kindness: 0,
      notes: [],
      meals: meals,
      recentMeals: recent,
      aldi: [
        { id: 'a-milk', text: 'Milk', section: 'Dairy & Eggs', done: false },
        { id: 'a-ban', text: 'Bananas', section: 'Produce', done: false },
        { id: 'a-bread', text: 'Bread', section: 'Bakery', done: false },
        { id: 'a-eggs', text: 'Eggs', section: 'Dairy & Eggs', done: false },
        { id: 'a-oats', text: 'Oats', section: 'Pantry', done: false }
      ],
      lists: [],
      house: [
        { id: 'air', title: 'Air the bedrooms', detail: 'Today. Five minutes with the windows open.', cadence: 'daily', doneOn: '' },
        { id: 'dish', title: 'Run the dishwasher', detail: 'Empty it in the morning, run it after dinner.', cadence: 'daily', doneOn: '' },
        { id: 'bins', title: 'Bins to the street', detail: 'Check which pickup is tomorrow and take the right bins out.', cadence: 'weekly', doneOn: '' },
        { id: 'plants', title: 'Water the plants', detail: 'Kitchen sill first, then the living room.', cadence: 'weekly', doneOn: '' },
        { id: 'towels', title: 'Fresh hand towels', detail: 'Kitchen and bathroom.', cadence: 'weekly', doneOn: '' }
      ],
      sports: [
        { id: 's1', kid: 'West', title: 'Example: club practice', day: 'Tue & Thu', time: '16:30', place: 'Add the real place', bring: 'Bottle, shoes', notes: 'Replace this with the real activity.' },
        { id: 's2', kid: 'Jack', title: 'Example: swimming', day: 'Wed', time: '15:15', place: 'Stadtbad', bring: 'Towel, goggles', notes: 'Replace this with the real activity.' },
        { id: 's3', kid: 'June', title: 'Example: playground', day: 'Sat', time: '11:00', place: 'Nearby playground', bring: 'Snack', notes: 'Replace this with the real activity.' }
      ],
      pantry: ['Salt', 'Pepper', 'Paprika', 'Cumin', 'Oregano', 'Cinnamon', 'Nutmeg', 'Bay leaves', 'Curry', 'Vanilla', 'Garlic powder', 'Italian herbs'].map(function (name, i) {
        return { id: 'p' + i, name: name, low: i === 2 || i === 4 };
      }),
      recipes: [
        { id: 'r1', title: 'Pfannkuchen', ingredients: 'Flour, milk, eggs, a pinch of salt, oil', steps: 'Whisk a thin batter. Cook small rounds in a buttered pan. Serve with applesauce or sugar.' },
        { id: 'r2', title: 'Tomato soup', ingredients: 'Passata, onion, garlic, stock, cream', steps: 'Soften the onion, add garlic and passata, simmer 15 minutes, then blend and finish with a spoon of cream.' },
        { id: 'r3', title: 'Apple crumble', ingredients: 'Apples, flour, butter, sugar, cinnamon', steps: 'Toss sliced apples with cinnamon. Rub butter into flour and sugar for the topping. Bake until the top is golden.' }
      ],
      dates: [
        { id: 'd1', title: 'Old town and cake', detail: 'A walk through Bad Tölz and one slice of cake to share.', planned: false },
        { id: 'd2', title: 'Cook something new', detail: 'Start after bedtime. Pick a recipe neither of you makes yet.', planned: false },
        { id: 'd3', title: 'Board game and tea', detail: 'Phones in a drawer. One game, a pot of tea.', planned: false },
        { id: 'd4', title: 'A view from the hill', detail: 'Drive toward the Blomberg or the Kalvarienberg and look back at town.', planned: false },
        { id: 'd5', title: 'Saturday breakfast out', detail: 'Leave before the day fills up. Anywhere that pours coffee.', planned: false }
      ],
      localEvents: [],
      note: '',
      afternoon: afternoonDefaults()
    };
  }
  function afternoonDefaults() {
    return {
      landMin: 20,
      whw: 'Weekend homework',
      kids: {
        West: {
          home: '16:00', homeFri: '13:00',
          L: ['Snack', 'Unpack backpack', 'Give lunchbox to Dad', 'Put backpack away', 'Homework done? (finished at OGT)'],
          SC: ['Reading 15 min, out loud', 'Laundry to basket', 'Empty dishwasher']
        },
        Jack: {
          home: '16:00', homeFri: '16:00',
          L: ['Snack', 'Unpack backpack', 'Give lunchbox to Dad', 'Put backpack away', 'Homework done? (finished at OGT)'],
          SC: ['Reading 15 min, out loud', 'Line up shoes', 'Set the table']
        },
        June: {
          home: '16:00', homeFri: '',
          L: ['Snack', 'Unpack Brotbox', 'Shoes away'],
          SC: []
        }
      },
      days: {}
    };
  }
  function ensureHubShape() {
    var base = defaultHub();
    if (!hub || typeof hub !== 'object') hub = base;
    Object.keys(base).forEach(function (k) {
      if (hub[k] == null) hub[k] = base[k];
    });
    KIDS.forEach(function (name) {
      if (hub.stars[name] == null) hub.stars[name] = 0;
      if (!hub.chores[name]) hub.chores[name] = base.chores[name];
      ['morning', 'weekend', 'bedtime'].forEach(function (g) {
        if (!hub.chores[name][g]) hub.chores[name][g] = base.chores[name][g];
      });
    });
    if (!hub.awarded) hub.awarded = {};
    if (!hub.choreDone) hub.choreDone = {};
    var renamed = false;
    var sectionRename = { Dairy: 'Dairy & Eggs', Meat: 'Meat & Fish' };
    (hub.aldi || []).forEach(function (item) {
      if (sectionRename[item.section]) { item.section = sectionRename[item.section]; renamed = true; }
    });
    if (renamed) saveHub();
  }
  function loadHub() {
    try {
      var raw = localStorage.getItem(HUB_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.chores && parsed.stars) hub = parsed;
      }
    } catch (e) {}
    if (!hub) hub = defaultHub();
    ensureHubShape();
  }
  function saveHub() {
    try { localStorage.setItem(HUB_KEY, JSON.stringify(hub)); } catch (e) {}
  }
  function morningTasks(name) {
    var list = hub.chores && hub.chores[name] && hub.chores[name].morning;
    return list || [];
  }
  function choresOf(name, group) {
    var list = hub.chores && hub.chores[name] && hub.chores[name][group];
    return list || [];
  }
  function allChecked(name) {
    var tasks = morningTasks(name);
    if (!tasks.length) return false;
    var k = kidState(name);
    for (var i = 0; i < tasks.length; i++) if (!k.checks[tasks[i].id]) return false;
    return true;
  }
  function choreDone(name, id, ymd) {
    return !!(hub.choreDone[ymd] && hub.choreDone[ymd][name] && hub.choreDone[ymd][name][id]);
  }
  function setChoreDone(name, id, on, ymd) {
    if (!hub.choreDone[ymd]) hub.choreDone[ymd] = {};
    if (!hub.choreDone[ymd][name]) hub.choreDone[ymd][name] = {};
    if (on) hub.choreDone[ymd][name][id] = true;
    else delete hub.choreDone[ymd][name][id];
  }
  function morningChecked(name, id) { return !!kidState(name).checks[id]; }
  function isDone(name, group, id, ymd) {
    if (group === 'morning') return morningChecked(name, id);
    return choreDone(name, id, ymd);
  }
  function addStars(kid, delta, reason) {
    if (TEST_MORNING) return false;
    if (hub.stars[kid] == null) hub.stars[kid] = 0;
    var next = hub.stars[kid] + delta;
    if (next < 0) delta = -hub.stars[kid];
    if (!delta) return false;
    hub.stars[kid] += delta;
    hub.starLog.push({ kid: kid, n: delta, reason: reason, ymd: currentYmd(), at: nowMs() });
    if (hub.starLog.length > 500) hub.starLog = hub.starLog.slice(-400);
    saveHub();
    return true;
  }
  function earned(kid) {
    var n = 0;
    (hub.starLog || []).forEach(function (row) { if (row.kid === kid && row.n > 0) n += row.n; });
    return n;
  }
  function setChoreStar(kid, id, on, reason) {
    if (TEST_MORNING) return;
    var ymd = currentYmd();
    if (!hub.awarded[ymd]) hub.awarded[ymd] = {};
    if (!hub.awarded[ymd][kid]) hub.awarded[ymd][kid] = {};
    var bag = hub.awarded[ymd][kid];
    if (on && !bag[id]) {
      bag[id] = true;
      saveHub();
      if (addStars(kid, 1, reason)) toast(kid + ' earned a star');
    } else if (!on && bag[id]) {
      delete bag[id];
      saveHub();
      addStars(kid, -1, reason);
    }
  }
  function syncMorningStar(name) {
    var k = state.kids[name];
    var on = !!(k && k.doneAt && finishOnTime(name, k.doneAt));
    setChoreStar(name, 'ontime', on, 'Ready on time');
  }
  function houseDue(task, ymd) {
    if (!task) return false;
    if (task.cadence === 'weekly') {
      var mon = mondayOf(ymd);
      return !(task.doneOn && task.doneOn >= mon && task.doneOn <= ymd);
    }
    return task.doneOn !== ymd;
  }
  function guessSection(item) {
    var s = item.toLowerCase();
    if (/frozen/.test(s)) return 'Frozen';
    if (/salt|paprika|cumin|oregano|thyme|seasoning|spice|powder/.test(s)) return 'Spices';
    if (/broth|stock|flour|pasta|rice|sauce|oil|vinegar|sugar|noodle|honey/.test(s)) return 'Pantry';
    if (/chicken|beef|pork|turkey|sausage|bacon|ham|bratwurst|fish/.test(s)) return 'Meat & Fish';
    if (/milk|cheese|yogurt|butter|cream|mozzarella|emmental|egg/.test(s)) return 'Dairy & Eggs';
    if (/bread|bun|roll|dough|spätzle|spaetzle/.test(s)) return 'Bakery';
    if (/apple|banana|salad|tomato|onion|carrot|potato|lettuce|cucumber|pepper|lemon|avocado|leek|mushroom/.test(s)) return 'Produce';
    if (/soap|paper|detergent|sponge|towel/.test(s)) return 'Household';
    return 'Pantry';
  }
  function rememberMeal(meal) {
    if (!meal || !meal.title) return;
    var title = meal.title;
    hub.recentMeals = hub.recentMeals.filter(function (m) { return m.title.toLowerCase() !== title.toLowerCase(); });
    hub.recentMeals.unshift({ title: meal.title, side: meal.side || '', ingredients: meal.ingredients || '' });
    hub.recentMeals = hub.recentMeals.slice(0, 8);
  }
  function starsEarnedBetween(kid, start, end) {
    var n = 0;
    (hub.starLog || []).forEach(function (row) {
      if (row.kid === kid && row.n > 0 && row.ymd >= start && row.ymd <= end) n += row.n;
    });
    return n;
  }

  function calendarOff(kid, ymd) {
    var day = dayBucket(ymd);
    return !!(day && day[kid] && day[kid].noSchool);
  }
  function kidHasSchool(kid, ymd) {
    if (hardOff(ymd)) return false;
    if (calendarOff(kid, ymd)) return false;
    return true;
  }
  function leaveWho(ymd) {
    var boys = [];
    if (kidHasSchool('West', ymd)) boys.push('West');
    if (kidHasSchool('Jack', ymd)) boys.push('Jack');
    return { boys: boys, june: kidHasSchool('June', ymd) };
  }
  function schoolMorning(p) {
    p = p || nowParts();
    var who = leaveWho(p.ymd);
    if (!who.boys.length && !who.june) return false;
    var mins = p.h * 60 + p.mi;
    return mins >= 5 * 60 + 30 && mins < 9 * 60 + 30;
  }
  function countTo(target, wake, nowMin, title, sub) {
    var leftSec = Math.round((target - nowMin) * 60);
    if (leftSec < 0) leftSec = 0;
    var span = (target - wake) * 60;
    var pct = span > 0 ? ((span - leftSec) / span) * 100 : 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    var urg = 'ok';
    if (leftSec <= 4 * 60) urg = 'red';
    else if (leftSec <= 8 * 60) urg = 'orange';
    else if (leftSec <= 12 * 60) urg = 'yellow';
    return { mode: 'count', title: title, big: fmtLeft(leftSec), sub: sub, pct: pct, urg: urg };
  }
  function countdownModel(p) {
    var who = leaveWho(p.ymd);
    var nowMin = p.h * 60 + p.mi + p.s / 60;
    if (!who.boys.length && !who.june) {
      var reason = HOLIDAYS[p.ymd] || ferienName(p.ymd) || (isWeekendYmd(p.ymd) ? (weekdayIndex(p.ymd) === 0 ? 'Sunday' : 'Saturday') : 'Marked on the calendar');
      return { mode: 'off', title: 'No school today', big: 'Day off', sub: reason, pct: 0, urg: 'off' };
    }
    if (who.boys.length && nowMin < LEAVE.West) {
      var title = who.boys.join(' & ') + (who.boys.length > 1 ? ' leave in' : ' leaves in');
      var sub = who.june ? 'then June · 7:30' : '';
      return countTo(LEAVE.West, WAKE, nowMin, title, sub);
    }
    if (who.june && nowMin < LEAVE.June) {
      var wake = who.boys.length ? LEAVE.West : WAKE;
      return countTo(LEAVE.June, wake, nowMin, 'June leaves in', '');
    }
    return { mode: 'gone', title: 'Have a good day', big: 'All out', sub: 'See you this afternoon', pct: 100, urg: 'gone' };
  }
  function nextSchoolMorning(p) {
    var mins = p.h * 60 + p.mi;
    var start = p.ymd;
    if ((leaveWho(p.ymd).boys.length || leaveWho(p.ymd).june) && mins >= 9 * 60 + 30) start = addDays(p.ymd, 1);
    for (var i = 0; i < 21; i++) {
      var day = addDays(start, i);
      var who = leaveWho(day);
      if (!who.boys.length && !who.june) continue;
      if (day === p.ymd && mins >= 9 * 60 + 30) continue;
      return { ymd: day, who: who };
    }
    return null;
  }
  function waitingMorningModel(p) {
    var next = nextSchoolMorning(p);
    if (!next) return { mode: 'off', title: 'Next school morning', big: '—', sub: 'No school morning in the next three weeks', pct: 0, urg: 'off', ymd: p.ymd };
    var leaveMin = next.who.boys.length ? LEAVE.West : LEAVE.June;
    var stamp = next.ymd + 'T' + pad2(Math.floor(leaveMin / 60)) + ':' + pad2(leaveMin % 60) + ':00';
    var leftSec = Math.max(0, Math.round((berlinLocalToEpoch(stamp) - morningNowMs()) / 1000));
    var when = WD_SHORT[weekdayIndex(next.ymd)] + ' ' + (+next.ymd.slice(8, 10)) + ' ' + MONTHS_S[+next.ymd.slice(5, 7) - 1];
    var bits = [];
    if (next.who.boys.length > 1) bits.push('boys leave 7:10');
    else if (next.who.boys.length === 1) bits.push(next.who.boys[0] + ' leaves 7:10');
    if (next.who.june) bits.push(next.who.boys.length ? 'June 7:30' : 'June leaves 7:30');
    return { mode: 'wait', title: 'Next school morning', big: fmtLeft(leftSec), sub: when + ' · ' + bits.join(' · '), pct: 0, urg: 'off', ymd: next.ymd };
  }
  function dayOffReason(ymd) {
    return HOLIDAYS[ymd] || ferienName(ymd) || (weekdayIndex(ymd) === 0 ? 'Sunday' : weekdayIndex(ymd) === 6 ? 'Saturday' : '');
  }

  function dayBucket(ymd) {
    if (!DATA) return null;
    if (DATA.days && DATA.days[ymd]) return DATA.days[ymd];
    if (DATA.date === ymd && DATA.kids) {
      return {
        West: DATA.kids.West || { events: [], bring: [], homework: [], noSchool: false },
        Jack: DATA.kids.Jack || { events: [], bring: [], homework: [], noSchool: false },
        June: DATA.kids.June || { events: [], bring: [], homework: [], noSchool: false },
        all: null
      };
    }
    return null;
  }
  function mergeAll(day) {
    var map = {};
    KIDS.forEach(function (name) {
      var evs = (day[name] && day[name].events) || [];
      evs.forEach(function (ev) {
        var key = (ev.time || '') + '|' + String(ev.title || '').toLowerCase();
        if (!map[key]) {
          map[key] = {
            time: ev.time || '', end: ev.end || '', title: ev.title || '',
            location: ev.location || '', allDay: !ev.time, who: [], bring: [], homework: false, detail: ''
          };
        }
        if (map[key].who.indexOf(name) < 0) map[key].who.push(name);
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }
  function kindOf(ev) {
    if (ev.kind) return ev.kind;
    if (ev.local) return 'local';
    var t = String(ev.title || '').toLowerCase();
    if (/ferien|schulfrei|feiertag|holiday|allerheiligen|weihnacht|ostern|pfingst|himmelfahrt|neujahr|einheit|könige|koenige|fronleichnam|karfreitag|silvester|mariä|maria/.test(t)) return 'holiday';
    if (/fußball|fussball|football|soccer|training|turnen|sport|schwimm|swim|practice|spiel/.test(t)) return 'sport';
    if (/arzt|zahnarzt|dentist|doctor|praxis|impf/.test(t)) return 'appt';
    if (/schule|school|kita|hort|unterricht|klasse|costume/.test(t)) return 'school';
    if (/kirche|church|gottesdienst|messe/.test(t)) return 'community';
    if (/pizza|dinner|essen|abendessen|lunch|brotzeit/.test(t)) return 'meal';
    if (/müll|trash|putz|clean|haus|bins/.test(t)) return 'house';
    return 'family';
  }
  function eventVisible(ev) {
    var anyOn = KIDS.some(function (n) { return kidOn[n]; });
    if (!anyOn) return true;
    var off = KIDS.some(function (n) { return !kidOn[n]; });
    if (!off) return true;
    var who = ev.who && ev.who.length ? ev.who : KIDS;
    return who.some(function (n) { return kidOn[n]; });
  }
  function dayEvents(ymd, useFilter) {
    var out = [];
    var seen = {};
    function add(ev) {
      var key = String(ev.title || '').toLowerCase() + '|' + (ev.time || '');
      if (!ev.title || seen[key]) return;
      seen[key] = true;
      out.push(ev);
    }
    var day = dayBucket(ymd);
    var list = [];
    if (day && day.all && day.all.length) list = day.all;
    else if (day) list = mergeAll(day);
    list.forEach(add);
    (hub.localEvents || []).forEach(function (ev) { if (ev.ymd === ymd) add(ev); });
    if (HOLIDAYS[ymd]) add({ title: HOLIDAYS[ymd], allDay: true, time: '', end: '', who: KIDS.slice(), kind: 'holiday', synthetic: true });
    var fer = ferienName(ymd);
    if (fer) add({ title: fer, allDay: true, time: '', end: '', who: KIDS.slice(), kind: 'holiday', synthetic: true });
    if (useFilter) out = out.filter(eventVisible);
    out.sort(function (a, b) {
      if (!a.time && b.time) return -1;
      if (a.time && !b.time) return 1;
      if ((a.time || '') < (b.time || '')) return -1;
      if ((a.time || '') > (b.time || '')) return 1;
      return a.title < b.title ? -1 : 1;
    });
    return out;
  }
  function evKey(ymd, ev) {
    return ymd + '||' + (ev.local ? 'L' : 'G') + '||' + (ev.time || '') + '||' + ev.title;
  }
  function findEvent(key) {
    var parts = String(key).split('||');
    var ymd = parts[0];
    var local = parts[1] === 'L';
    var time = parts[2];
    var title = parts.slice(3).join('||');
    var list = dayEvents(ymd, false);
    for (var i = 0; i < list.length; i++) {
      if (!!list[i].local === local && (list[i].time || '') === time && list[i].title === title) return { ymd: ymd, ev: list[i] };
    }
    return null;
  }
  function aggField(ymd, field) {
    var day = dayBucket(ymd);
    if (!day) return [];
    var map = {};
    KIDS.forEach(function (name) {
      var list = (day[name] && day[name][field]) || [];
      list.forEach(function (item) {
        var k = String(item).toLowerCase();
        if (!map[k]) map[k] = { item: item, who: [] };
        if (map[k].who.indexOf(name) < 0) map[k].who.push(name);
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }
  function rangeNote() {
    if (!DATA) return '';
    if (!DATA.days) return 'This calendar file has ' + prettyDate(DATA.date) + ' only. The rest of the week appears after the next Today dashboard run.';
    var ymd = currentYmd();
    if (ymd < DATA.rangeStart || ymd > DATA.rangeEnd) return 'This calendar file covers ' + prettyDate(DATA.rangeStart) + ' – ' + prettyDate(DATA.rangeEnd) + '.';
    return '';
  }

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 255;
    return out;
  }
  function bytesToB64(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function readCache() {
    try { var raw = localStorage.getItem(KEY_CACHE); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function writeCache(obj) { try { localStorage.setItem(KEY_CACHE, JSON.stringify(obj)); } catch (e) {} }
  function clearCache() { try { localStorage.removeItem(KEY_CACHE); } catch (e) {} }
  function fileOk(file) { return file && file.iter >= 200000 && file.iter <= 400000 && file.salt && file.iv && file.ct; }
  function onData(data) {
    DATA = data;
    calMode = 'open';
    unlocking = false;
    ensureToday(currentYmd());
    render();
  }
  function failUnlock(fromCache) {
    unlocking = false;
    if (fromCache) clearCache();
    DATA = null;
    calMode = 'locked';
    render();
    toast(fromCache ? 'Saved password did not match. Enter it again in Settings.' : 'That password did not open the calendar.');
  }
  function decryptFile(key, file) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(file.iv) }, key, b64ToBytes(file.ct)).then(function (buf) {
      return JSON.parse(new TextDecoder().decode(new Uint8Array(buf)));
    });
  }
  function deriveKey(password, saltBytes, iter) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']).then(function (km) {
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBytes, iterations: iter, hash: 'SHA-256' },
        km, { name: 'AES-GCM', length: 256 }, true, ['decrypt']
      );
    });
  }
  function deriveAndDecrypt(password, file, fromCache) {
    if (unlocking) return;
    unlocking = true;
    calMode = 'opening';
    deriveKey(password, b64ToBytes(file.salt), file.iter).then(function (key) {
      return crypto.subtle.exportKey('raw', key).then(function (raw) {
        writeCache({ pw: password, salt: file.salt, iter: file.iter, key: bytesToB64(new Uint8Array(raw)) });
        return decryptFile(key, file);
      });
    }).then(onData).catch(function () { failUnlock(fromCache); });
  }
  function tryDecrypt(file) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder || !window.TextDecoder) {
      calMode = 'nocrypto';
      render();
      return;
    }
    if (!fileOk(file)) {
      calMode = 'locked';
      render();
      return;
    }
    var cache = readCache();
    if (cache && cache.salt === file.salt && cache.iter === file.iter && cache.key) {
      calMode = 'opening';
      crypto.subtle.importKey('raw', b64ToBytes(cache.key), { name: 'AES-GCM' }, false, ['decrypt']).then(function (key) {
        return decryptFile(key, file);
      }).then(onData).catch(function () {
        if (cache.pw) deriveAndDecrypt(cache.pw, file, true);
        else { clearCache(); calMode = 'locked'; render(); }
      });
      return;
    }
    if (cache && cache.pw) { deriveAndDecrypt(cache.pw, file, true); return; }
    calMode = 'locked';
    render();
  }
  function unlockWith(pw) {
    pw = String(pw || '').replace(/^\s+|\s+$/g, '');
    if (!pw) { toast('Enter the family password.'); return; }
    if (!FILE) { toast('Calendar file is not loaded.'); return; }
    deriveAndDecrypt(pw, FILE, false);
  }
  function loadRecipeIndex() {
    if (!window.fetch) return;
    fetch('recipes/index.json?v=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.json();
    }).then(function (list) {
      RECIPE_INDEX = list || [];
      if (page === 'meals') render();
    }).catch(function () {});
  }
  function loadToday() {
    if (!window.fetch) { calMode = 'missing'; return; }
    fetch('data/today.json?v=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.json();
    }).then(function (file) {
      if (FILE && DATA && file.salt === FILE.salt && file.ct === FILE.ct) { FILE = file; renderSample(); return; }
      FILE = file;
      renderSample();
      tryDecrypt(file);
    }).catch(function () {
      if (!DATA) { calMode = 'missing'; render(); }
    });
  }

  function weatherSvg(kind) {
    var cloud = '<ellipse cx="26" cy="34" rx="12" ry="8" fill="#d5e4f5"/><ellipse cx="38" cy="32" rx="11" ry="9" fill="#f4f8ff"/>';
    var body = cloud;
    if (kind === 'sun') body = '<circle cx="32" cy="32" r="10" fill="#f0c14a"/><g stroke="#e2b13c" stroke-width="3" stroke-linecap="round"><path d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4 4M46 46l4 4M50 14l-4 4M18 46l-4 4"/></g>';
    else if (kind === 'partly') body = '<circle cx="44" cy="18" r="8" fill="#f0c14a"/>' + cloud;
    else if (kind === 'rain') body = cloud + '<g stroke="#7eb0e0" stroke-width="3" stroke-linecap="round"><path d="M22 46 l-3 8M32 46 l-3 8M42 46 l-3 8"/></g>';
    else if (kind === 'snow') body = cloud + '<g fill="#fff"><circle cx="22" cy="50" r="2.2"/><circle cx="32" cy="52" r="2.2"/><circle cx="42" cy="49" r="2.2"/></g>';
    else if (kind === 'storm') body = cloud + '<path d="M30 44 l-6 10 h6 l-4 8 12-14 h-6 l4-4 z" fill="#e2b13c"/>';
    else if (kind === 'fog') body = '<g stroke="#d5e4f5" stroke-width="3" stroke-linecap="round"><path d="M14 26h36M10 34h44M16 42h32"/></g>';
    return '<svg class="wx-ic" viewBox="0 0 64 64" aria-hidden="true">' + body + '</svg>';
  }
  function weatherKind(code) {
    if (code == null) return 'cloud';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'storm';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code === 0) return 'sun';
    if (code <= 3) return 'partly';
    if (code <= 48) return 'fog';
    return 'cloud';
  }
  function weatherWord(kind) {
    return { sun: 'Sunny', partly: 'Partly cloudy', cloud: 'Cloudy', rain: 'Rain', snow: 'Snow', storm: 'Storms', fog: 'Fog' }[kind] || 'Weather';
  }
  function clothing(temp, code, rain) {
    var snow = code != null && ((code >= 71 && code <= 77) || code === 85 || code === 86);
    if (snow) return 'hat, gloves and boots';
    if (rain && temp <= 8) return 'jacket and boots';
    if (rain) return 'rain jacket';
    if (temp <= 4) return 'hat and gloves';
    if (temp <= 11) return 'warm jacket';
    if (temp <= 17) return 'light jacket';
    if (temp >= 22) return 'sunscreen and a hat';
    return 'layers, just in case';
  }
  function forecastMap() {
    var map = {};
    if (!WX || !WX.data || !WX.data.daily || !WX.data.daily.time) return map;
    var d = WX.data.daily;
    for (var i = 0; i < d.time.length; i++) {
      map[d.time[i]] = {
        code: d.weather_code ? d.weather_code[i] : null,
        high: d.temperature_2m_max != null ? Math.round(d.temperature_2m_max[i]) : null,
        low: d.temperature_2m_min != null ? Math.round(d.temperature_2m_min[i]) : null,
        rain: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null
      };
    }
    return map;
  }
  function currentWeather(p) {
    if (!WX || !WX.data || !WX.data.current) return null;
    var cur = WX.data.current;
    var temp = Math.round(cur.temperature_2m);
    var code = cur.weather_code;
    if (code == null) code = cur.weathercode;
    var day = forecastMap()[p.ymd] || {};
    var kind = weatherKind(code);
    return {
      temp: temp,
      high: day.high != null ? day.high : null,
      low: day.low != null ? day.low : null,
      kind: kind,
      word: weatherWord(kind),
      hint: clothing(temp, code, kind === 'rain' || kind === 'storm'),
      rain: day.rain
    };
  }
  function fetchWeather() {
    if (!window.fetch) return;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=47.76&longitude=11.56&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=7';
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.current) throw new Error('bad weather');
      WX = { at: Date.now(), data: j };
      try { localStorage.setItem(WX_KEY, JSON.stringify(WX)); } catch (e) {}
      safeRender();
    }).catch(function () {});
  }

  function paintSound() {
    var label = soundOn && audioReady ? 'Sound on' : (soundOn ? 'Tap for sound' : 'Enable sound');
    var nodes = document.querySelectorAll('[data-role="sound"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = label;
  }
  function unlockAudio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { audioReady = true; return; }
    try {
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.resume) {
        var resumed = audioCtx.resume();
        if (resumed && resumed.then) resumed.then(function () {}, function () {});
      }
      audioReady = true;
    } catch (e) { audioReady = false; }
  }
  function chime() {
    if (!audioCtx) return;
    try {
      var t = audioCtx.currentTime;
      function tone(freq, at, dur) {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t + at);
        g.gain.setValueAtTime(0.0001, t + at);
        g.gain.exponentialRampToValueAtTime(0.05, t + at + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t + at); o.stop(t + at + dur + 0.02);
      }
      tone(523, 0, 0.35);
      tone(784, 0.18, 0.5);
    } catch (e) {}
  }
  function speak(text) {
    try {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function remind(text) {
    chime();
    setTimeout(function () { speak(text); }, 700);
  }
  function enableSound() {
    soundOn = true;
    try { localStorage.setItem(SOUND_KEY, '1'); } catch (e) {}
    unlockAudio();
    paintSound();
    remind('Sound is on');
  }
  function maybeChime(p) {
    if (!soundOn || !audioReady || !schoolMorning(p)) return;
    var who = leaveWho(p.ymd);
    var groups = [];
    if (who.boys.length) groups.push({ id: 'boys', min: LEAVE.West, who: who.boys.join(' and ') });
    if (who.june) groups.push({ id: 'june', min: LEAVE.June, who: 'June' });
    var nowMin = p.h * 60 + p.mi + p.s / 60;
    var marks = [15, 10, 5];
    for (var g = 0; g < groups.length; g++) {
      var left = groups[g].min - nowMin;
      for (var m = 0; m < marks.length; m++) {
        var mark = marks[m];
        if (left <= mark && left > mark - 0.35) {
          var key = groups[g].id + '-' + mark;
          var bag = TEST_MORNING ? testChimed : state.chimed;
          if (bag[key]) continue;
          bag[key] = true;
          if (!TEST_MORNING) saveState();
          var verb = groups[g].who.indexOf(' and ') >= 0 ? ' leave' : ' leaves';
          remind(mark + ' minutes until ' + groups[g].who + verb);
        }
      }
    }
  }
  function maybeReload(p) {
    if (reloaded || Q.at) return;
    if (p.h === 3 && p.mi < 20) {
      var flag = '';
      try { flag = sessionStorage.getItem('knappReloaded') || ''; } catch (e) {}
      if (flag === p.ymd) return;
      try { sessionStorage.setItem('knappReloaded', p.ymd); } catch (e2) {}
      reloaded = true;
      location.reload();
    }
  }
  function requestWake() {
    if (!navigator.wakeLock || !navigator.wakeLock.request) return;
    try {
      var req = navigator.wakeLock.request('screen');
      if (req && req.then) req.then(function (lock) { wakeLock = lock; }, function () {});
    } catch (e) {}
  }
  function canVoice() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
  function startVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      var rec = new SR();
      rec.lang = navigator.language || 'en-GB';
      rec.onresult = function (ev) {
        var text = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
        var input = document.getElementById('qaTitle');
        if (input && text) input.value = text;
      };
      rec.start();
    } catch (e) { toast('Voice input is not available in this browser.'); }
  }

  function moonInfo(ms) {
    var synodic = 29.53058867;
    var known = Date.UTC(2000, 0, 6, 18, 14, 0);
    var days = (ms - known) / 86400000;
    var age = ((days % synodic) + synodic) % synodic;
    var bands = [[1.84566, 'New moon'], [5.53699, 'Waxing crescent'], [9.22831, 'First quarter'], [12.91963, 'Waxing gibbous'], [16.61096, 'Full moon'], [20.30228, 'Waning gibbous'], [23.99361, 'Last quarter'], [27.68493, 'Waning crescent'], [synodic + 1, 'New moon']];
    var name = 'New moon';
    for (var i = 0; i < bands.length; i++) if (age <= bands[i][0]) { name = bands[i][1]; break; }
    var illum = Math.round((1 - Math.cos(2 * Math.PI * age / synodic)) / 2 * 100);
    return { name: name, illum: illum };
  }
  function nextUp(p) {
    var nowMin = p.h * 60 + p.mi;
    for (var ahead = 0; ahead < 8; ahead++) {
      var ymd = addDays(p.ymd, ahead);
      var events = dayEvents(ymd, false);
      var best = null;
      events.forEach(function (ev) {
        if (ev.synthetic && ahead === 0 && !ev.time) return;
        if (!ev.time) {
          if (ahead > 0 && !best) best = ev;
          return;
        }
        var m = minutesOf(ev.time);
        if (ahead === 0 && m < nowMin - 20) return;
        if (!best || (best.time && m < minutesOf(best.time)) || !best.time) best = ev;
      });
      if (best) return { ymd: ymd, ev: best, today: ahead === 0 };
    }
    return null;
  }

  function icon(name) {
    var paths = {
      home: '<path d="M4 11.5 12 4l8 7.5V20h-5.5v-6h-5V20H4z"/>',
      morning: '<path d="M4 17h16M8 17a4 4 0 0 1 8 0M12 5v2.5M5.5 9.5l1.5 1.5M18.5 9.5 17 11"/>',
      cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/>',
      star: '<path d="M12 3.5 14.4 9l6 .5-4.6 3.9 1.5 5.8L12 16.2 6.7 19.2 8.2 13.4 3.6 9.5 9.6 9z"/>',
      meals: '<path d="M8 3v8a2 2 0 0 1-2 2H6m2-10v18M6 3v5M10 3v5M16 3c1.5 2 2 4 2 7v11"/>',
      house: '<path d="M3 11 12 3l9 8"/><path d="M6 10.5V20h12v-9.5"/>',
      sport: '<circle cx="12" cy="12" r="8"/><path d="M12 4c2 2.5 2 13 0 16M4 12h16M6 7c3 1.5 9 1.5 12 0M6 17c3-1.5 9-1.5 12 0"/>',
      spice: '<path d="M9 10h6v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M10 10V8a2 2 0 0 1 4 0v2M10 4h4"/>',
      heart: '<path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/>',
      moon: '<path d="M16 4.5A8 8 0 1 0 19.5 16 6.5 6.5 0 0 1 16 4.5z"/>',
      bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
      mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>',
      plus: '<path d="M12 5v14M5 12h14"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? '' : String(value);
  }
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'on';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = ''; }, 2600);
  }
  function kidsInView() { return playKid === 'all' ? KIDS.slice() : [playKid]; }
  function chipProgress(name, ymd) {
    var group = 'morning';
    if (hardOff(ymd)) group = 'weekend';
    else if (nowParts().h >= 17) group = 'bedtime';
    var tasks = choresOf(name, group);
    var done = 0;
    tasks.forEach(function (t) { if (isDone(name, group, t.id, ymd)) done++; });
    return { done: done, total: tasks.length, stars: hub.stars[name] || 0 };
  }
  function personChip(name, ymd, pressable) {
    var prog = chipProgress(name, ymd);
    var on = kidOn[name];
    var sub = (prog.total ? prog.done + '/' + prog.total + ' · ' : '') + '★ ' + prog.stars;
    var tag = pressable ? 'button' : 'div';
    return '<' + tag + ' class="person ' + name.toLowerCase() + (on ? '' : ' off') + '" ' +
      (pressable ? 'data-act="filter-kid" data-id="' + name + '" aria-pressed="' + (on ? 'true' : 'false') + '"' : '') +
      '><span class="ava">' + esc(KID_INITIAL[name]) + '</span><span><b>' + esc(name) + ' (' + ageOf(name, ymd) + ')</b><small>' + esc(sub) + '</small></span></' + tag + '>';
  }
  function parentChip(parent, ymd) {
    var sub = parent.id === 'dad'
      ? (calMode === 'open' ? familyCount(ymd) + ' this week' : (calMode === 'loading' || calMode === 'opening' ? 'Opening calendar' : 'Calendar locked'))
      : 'Family calendar';
    return '<div class="person ' + parent.id + '"><span class="ava">' + parent.initial + '</span><span><b>' + esc(parent.label) + '</b><small>' + esc(parent.name) + ' · ' + esc(sub) + '</small></span></div>';
  }
  function familyCount(ymd) {
    var start = mondayOf(ymd);
    var n = 0;
    for (var i = 0; i < 7; i++) {
      dayEvents(addDays(start, i), false).forEach(function (ev) {
        if (ev.synthetic || ev.local) return;
        var who = ev.who || [];
        if (!who.length || who.length >= 3) n++;
      });
    }
    return n;
  }
  function peopleStrip(ymd) {
    var html = '<div class="people">';
    PARENTS.forEach(function (p) { html += parentChip(p, ymd); });
    KIDS.forEach(function (name) { html += personChip(name, ymd, true); });
    html += '</div>';
    return html;
  }
  function holidayChips(ymd) {
    var chips = [];
    if (HOLIDAYS[ymd]) chips.push(HOLIDAYS[ymd]);
    var f = ferienName(ymd);
    if (f) chips.push(f);
    else {
      var nf = nextFerien(ymd);
      if (nf && nf.start > ymd) {
        var d = daysBetween(ymd, nf.start);
        if (d > 0 && d <= 21) chips.push(nf.name + ' in ' + d + (d === 1 ? ' day' : ' days'));
      }
    }
    var best = '';
    Object.keys(HOLIDAYS).forEach(function (day) { if (day > ymd && (!best || day < best)) best = day; });
    if (best) {
      var dd = daysBetween(ymd, best);
      if (dd > 0 && dd <= 45) chips.push(HOLIDAYS[best] + ' in ' + dd + ' days');
    }
    KIDS.forEach(function (name) {
      var md = BIRTH[name].slice(5);
      var y = +ymd.slice(0, 4);
      var next = y + '-' + md;
      if (next < ymd) next = (y + 1) + '-' + md;
      var left = daysBetween(ymd, next);
      if (left === 0) chips.push(name + '’s birthday');
      else if (left > 0 && left <= 21) chips.push(name + '’s birthday in ' + left + ' days');
    });
    return chips;
  }
  function weekendBits(ymd) {
    var mon = mondayOf(ymd);
    var sat = addDays(mon, 5);
    var sun = addDays(mon, 6);
    var bits = [];
    [[sat, 'Sat'], [sun, 'Sun']].forEach(function (pair) {
      var day = pair[0];
      var label = pair[1];
      if (HOLIDAYS[day]) bits.push(label + ' · ' + HOLIDAYS[day]);
      var fer = ferienName(day);
      if (fer) bits.push(label + ' · ' + fer);
      dayEvents(day, false).forEach(function (ev) {
        if (ev.synthetic) return;
        bits.push(label + ' ' + (ev.time ? fmtRange(ev.time, ev.end) + ' ' : '') + ev.title);
      });
    });
    var nf = nextFerien(ymd);
    if (nf && nf.start > sun && daysBetween(ymd, nf.start) <= 10) bits.push(nf.name + ' starts ' + prettyDate(nf.start));
    return bits;
  }
  function todayRows(ymd) {
    var events = dayEvents(ymd, false);
    if (!events.length) {
      if (calMode === 'open' || calMode === 'locked' || calMode === 'missing') return '<p class="muted">A clear day on the calendar.</p>';
      return '<p class="muted">Opening the calendar…</p>';
    }
    return events.map(function (ev) {
      var kind = kindOf(ev);
      return '<button type="button" class="today-row ' + kind + '" data-act="event" data-key="' + esc(evKey(ymd, ev)) + '"><span class="t-time">' + esc(ev.time ? prettyTime(ev.time) : 'All day') + '</span><span>' + esc(ev.title) + '</span></button>';
    }).join('');
  }
  function bringBlock(ymd) {
    var html = '';
    var bring = aggField(ymd, 'bring');
    var hw = aggField(ymd, 'homework');
    if (bring.length) {
      html += '<div class="kicker">Bring</div><div class="chips">';
      bring.forEach(function (b) {
        var who = b.who.length < 3 ? ' · ' + b.who.join(', ') : '';
        html += '<span class="chip">' + esc(b.item + who) + '</span>';
      });
      html += '</div>';
    }
    if (hw.length) {
      html += '<div class="kicker">Homework</div>';
      hw.forEach(function (h) { html += '<div class="hwline">' + esc(h.item) + '</div>'; });
    }
    return html;
  }
  function nextTaskLabel(name, ymd) {
    var group = hardOff(ymd) ? 'weekend' : (nowParts().h >= 17 ? 'bedtime' : 'morning');
    var tasks = choresOf(name, group);
    for (var i = 0; i < tasks.length; i++) {
      if (!isDone(name, group, tasks[i].id, ymd)) return tasks[i].label;
    }
    return tasks.length ? 'All done for now' : 'Nothing on the list';
  }
  function timerBlock(name, ymd, compact, live) {
    if (!kidHasSchool(name, ymd)) return '<div class="dayoff">No school today</div>';
    var k = live ? kidState(name) : { checks: {} };
    var started = !!k.inAt;
    var done = !!(k.inAt && k.doneAt);
    var onTime = done && finishOnTime(name, k.doneAt);
    var elapsed = '--:--';
    if (done) elapsed = fmtDur(Math.round((k.doneAt - k.inAt) / 1000));
    else if (started) elapsed = fmtDur(Math.round((morningNowMs() - k.inAt) / 1000));
    var stat = onTimeDays(name, ymd);
    var badge = !stat.of ? 'Day off' : (stat.n + ' of ' + stat.of + ' this week');
    var lines = [];
    lines.push('Ready by ' + fmtHM(LEAVE[name] - EARLY));
    if (done) lines.push(onTime ? 'Done · on time' : 'Done');
    else if (started) lines.push('Checked in ' + fmtAt(k.inAt));
    else lines.push('Leaves ' + fmtHM(LEAVE[name]));
    var yday = yesterdaySecs(name, ymd);
    var best = weekBest(name, ymd);
    if (!compact && yday != null) lines.push('Yesterday ' + fmtDur(yday));
    if (!compact && best != null) lines.push('Best ' + fmtDur(best));
    var html = '<div class="kid-head"><h3>' + esc(name) + '</h3><span class="badge' + (onTime ? ' good' : '') + '">★ ' + esc(badge) + '</span></div>';
    html += '<div class="sw"><div class="elapsed' + (onTime ? ' good' : '') + '" id="elapsed-' + name + '"' + (started && !done ? ' data-run="1"' : '') + '>' + elapsed + (onTime ? ' ★' : '') + '</div>';
    html += '<div class="meta">' + lines.map(function (line) { return '<div>' + esc(line) + '</div>'; }).join('') + '</div></div>';
    if (!live) html += '<button type="button" class="checkin" disabled>Check in</button>';
    else if (!started) html += '<button type="button" class="checkin" data-act="checkin" data-kid="' + name + '">Check in</button>';
    return html;
  }
  function checklistBlock(name, ymd, live) {
    if (!kidHasSchool(name, ymd)) return '';
    var tasks = morningTasks(name);
    var k = live ? kidState(name) : { checks: {} };
    var html = '';
    tasks.forEach(function (t) {
      var on = !!k.checks[t.id];
      html += '<button type="button" class="chk' + (on ? ' done' : '') + (t.id === 'meds' ? ' meds' : '') + '" data-act="toggle" data-kid="' + name + '" data-id="' + esc(t.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (live ? '' : ' disabled') + '><span class="box"><span class="tick"></span></span><span class="lbl">' + esc(t.label) + '</span></button>';
    });
    if (k.inAt) html += '<button type="button" class="btn ghost small" data-act="reset" data-kid="' + name + '">' + esc(resetLabel(name)) + '</button>';
    return html;
  }
  function resetLabel(name) {
    if (resetArm[name] && Date.now() - resetArm[name] < 5000) return 'Tap again to start over';
    return 'Start over';
  }
  function wxStrip(p) {
    var map = forecastMap();
    var html = '<div class="wxstrip">';
    for (var i = 0; i < 7; i++) {
      var ymd = addDays(p.ymd, i);
      var day = map[ymd];
      var label = i === 0 ? 'Today' : WD_SHORT[weekdayIndex(ymd)];
      html += '<div class="wxday' + (i === 0 ? ' today' : '') + '"><div class="wd">' + label + '</div>';
      if (day) {
        html += weatherSvg(weatherKind(day.code));
        html += '<div class="wt">' + (day.high == null ? '–' : day.high + '°') + ' ' + (day.low == null ? '' : day.low + '°') + '</div>';
        html += '<div class="wr">Rain ' + (day.rain == null ? '–' : Math.round(day.rain) + '%') + '</div>';
      } else html += '<div class="wr">—</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  function wxTopHtml(p) {
    var map = forecastMap()[p.ymd];
    var cur = currentWeather(p);
    var kind = cur ? cur.kind : (map ? weatherKind(map.code) : 'cloud');
    var high = map && map.high != null ? map.high : (cur ? cur.temp : null);
    var low = map && map.low != null ? map.low : null;
    var temps = high == null ? '—' : (high + '°' + (low == null ? '' : ' / ' + low + '°'));
    return weatherSvg(kind) + '<span class="today-word">TODAY</span> <b>' + temps + '</b>';
  }

  function renderNav() {
    var html = '<div class="logo" aria-hidden="true">K</div>';
    NAV.forEach(function (item) {
      html += '<button type="button" class="navbtn' + (page === item.id ? ' on' : '') + '" data-act="nav" data-id="' + item.id + '" aria-current="' + (page === item.id ? 'page' : 'false') + '">' + icon(item.icon) + '<span>' + item.label + '</span></button>';
    });
    html += '<div class="grow"></div><button type="button" class="navbtn' + (page === 'sleep' ? ' on' : '') + '" data-act="nav" data-id="sleep">' + icon('moon') + '<span>Sleep</span></button>';
    document.getElementById('nav').innerHTML = html;
  }
  function noticeCount(p) {
    var n = 0;
    if (schoolMorning(morningParts()) && !soundOn) n++;
    if ((hub.house || []).some(function (task) { return houseDue(task, p.ymd); })) n++;
    (hub.redemptions || []).forEach(function (r) { if (r.status === 'pending') n++; });
    return n;
  }
  function renderTop() {
    var p = nowParts();
    var n = noticeCount(p);
    var voice = canVoice();
    document.getElementById('topbar').innerHTML =
      '<div class="brand"><h1>The Knapps</h1><div class="clock" id="clockTime">' + esc(fmtClock(p)) + '</div>' + (TEST_MODE ? '<span class="test-badge">Test mode</span>' : '') + '<div class="wxchip" id="wxTop">' + wxTopHtml(p) + '</div></div>' +
      '<div class="top-actions"><button type="button" class="iconbtn" data-act="bell" aria-label="Notifications">' + icon('bell') + (n ? '<span class="dot"></span>' : '') + '</button>' +
      '<button type="button" class="iconbtn" data-act="settings" aria-label="Settings">' + icon('gear') + '</button>' +
      '<button type="button" class="quick" data-act="quick">' + icon(voice ? 'mic' : 'plus') + ' Quick add</button></div>';
  }
  function renderSample() {
    var el = document.getElementById('sample');
    if (!el) return;
    if (FILE && FILE.sample) {
      el.className = 'sample';
      el.textContent = 'Sample calendar — example plans, not the real day. Sample password: knapp-sample';
    } else {
      el.className = 'sample hidden';
      el.textContent = '';
    }
  }

  function renderHome() {
    var p = nowParts();
    var mp = morningParts();
    var ymd = p.ymd;
    homeMorning = schoolMorning(mp);
    morningLive = homeMorning;
    var html = '<div class="page home">';
    if (homeMorning) html += morningBoardHtml(mp, true);
    else if (hardOff(ymd)) {
      html += '<div class="holo">No school today · ' + esc(dayOffReason(ymd) || 'Day off') + '</div>';
    }
    var due = null;
    (hub.house || []).some(function (task) { if (houseDue(task, ymd)) { due = task; return true; } return false; });
    var bits = weekendBits(ymd);
    html += '<div class="home-top">';
    html += '<article class="card banner teal">' + (due
      ? '<div><h3>' + esc(due.title) + '</h3><p>' + esc(due.detail) + '</p></div><button type="button" class="btn light" data-act="house-done" data-id="' + esc(due.id) + '">Done</button>'
      : '<div><h3>House is quiet</h3><p>Nothing due right now.</p></div>') + '</article>';
    html += '<article class="card banner green"><div><div class="kicker">This weekend</div><p>' + esc(bits.length ? bits.join(' · ') : 'Nothing planned yet.') + '</p></div></article>';
    html += '</div>';
    var chips = holidayChips(ymd);
    var view = currentWeather(p);
    var map = forecastMap()[ymd];
    html += '<div class="home-mid">';
    html += '<article class="card date-card"><div class="dayname">' + esc(wdLong(p.weekday)) + '</div><div class="daymonth">' + esc(MONTHS[p.mo - 1] + ' ' + p.d) + '</div>';
    if (view) html += '<div class="wxline">' + weatherSvg(view.kind) + '<span>' + esc(view.word) + ' · ' + (map && map.high != null ? map.high : view.temp) + '°' + (map && map.low != null ? ' / ' + map.low + '°' : '') + '</span></div><div class="muted">' + esc(view.hint) + '</div>';
    else html += '<div class="muted">Weather for Bad Tölz will show when it loads.</div>';
    html += '<div>' + chips.map(function (c) { return '<span class="holo">' + esc(c) + '</span>'; }).join('') + '</div>';
    html += '<p class="quote">“' + esc(pick(QUOTES, ymd)) + '”</p>';
    html += '<button type="button" class="sticky" data-act="note">' + (hub.note ? esc(hub.note.slice(0, 42)) : 'Sticky note') + '</button>';
    html += '<img class="botanical" alt="" src="assets/botanical.svg"></article>';
    html += '<article class="card"><div class="kicker"><span>TODAY</span><button type="button" class="linkish" data-act="nav" data-id="calendar">Calendar ›</button></div>' + todayRows(ymd) + bringBlock(ymd);
    if (calMode !== 'open') html += '<p class="muted">Unlock the family password in Settings to see Google Calendar. Holidays still show.</p>';
    var note = rangeNote();
    if (note && calMode === 'open') html += '<p class="muted">' + esc(note) + '</p>';
    html += '</article>';
    html += '<article class="card tasks-col"><div class="kicker"><span>TASKS</span><button type="button" class="linkish" data-act="nav" data-id="playroom">Playroom ›</button></div>';
    KIDS.forEach(function (name) {
      var prog = chipProgress(name, ymd);
      html += '<div class="task-block"><div class="task-head"><span>' + esc(name) + ' (' + ageOf(name, ymd) + ')</span><span>' + (prog.total ? prog.done + '/' + prog.total + ' · ' : '') + '★ ' + prog.stars + '</span></div><div class="task-next">Next: ' + esc(nextTaskLabel(name, ymd)) + '</div></div>';
    });
    var meal = hub.meals[weekdayKey(ymd)] || { title: 'Dinner', side: '' };
    html += '<div class="dinner-card"><div class="kicker">Tonight’s dinner</div>';
    if (meal.recipe) html += '<button type="button" class="meal-pic" data-act="open-recipe" data-id="' + esc(meal.recipe) + '"><img class="meal-thumb" alt="" src="recipes/photos/' + esc(meal.recipe) + '.jpg"></button>';
    html += '<h3>' + esc(meal.title || 'Choose a dinner') + '</h3><div class="muted">' + esc(meal.side || '') + '</div></div></article>';
    html += '</div>';
    html += wxStrip(p);
    html += '</div>';
    return html;
  }
  function morningBoardHtml(mp, live) {
    var model = live ? countdownModel(mp) : waitingMorningModel(mp);
    var day = live ? mp.ymd : model.ymd;
    var cur = live ? currentWeather(nowParts()) : null;
    var html = '<section class="card count-card urg-' + model.urg + '" id="countCard"><div class="mid"><div class="count-title" id="countTitle">' + esc(model.title) + '</div><div class="count-big" id="countBig">' + esc(model.big) + '</div><div class="count-sub" id="countSub">' + esc(model.sub) + (cur && cur.hint ? ' · ' + esc(cur.hint) : '') + '</div></div>';
    html += '<button type="button" class="sound" id="soundBtn" data-act="sound" data-role="sound">Enable sound</button><div class="bar"><i id="barFill" style="width:' + model.pct + '%"></i></div></section>';
    html += '<div class="morn-kids">';
    KIDS.forEach(function (name) {
      html += '<section class="card kid-card ' + name.toLowerCase() + '">' + timerBlock(name, day, true, live) + checklistBlock(name, day, live) + '</section>';
    });
    html += '</div>';
    return html;
  }
  function eventIcon(title) {
    var t = String(title || '').toLowerCase();
    if (t.indexOf('football') >= 0 || t.indexOf('soccer') >= 0 || t.indexOf('fussball') >= 0 || t.indexOf('fußball') >= 0) return '⚽';
    if (t.indexOf('forest') >= 0 || t.indexOf('wald') >= 0) return '🌲';
    if (t.indexOf('ogt') >= 0 || t.indexOf('pickup') >= 0 || t.indexOf('abhol') >= 0) return '🚗';
    if (t.indexOf('gym') >= 0 || t.indexOf('sport') >= 0 || t.indexOf('turnen') >= 0) return '🤸';
    if (t.indexOf('math') >= 0 || t.indexOf('test') >= 0 || t.indexOf('probe') >= 0) return '📘';
    if (t.indexOf('swim') >= 0 || t.indexOf('schwimm') >= 0) return '🏊';
    if (t.indexOf('music') >= 0 || t.indexOf('musik') >= 0) return '🎵';
    if (t.indexOf('dentist') >= 0 || t.indexOf('arzt') >= 0 || t.indexOf('doctor') >= 0) return '🩺';
    if (t.indexOf('ferien') >= 0 || t.indexOf('holiday') >= 0 || t.indexOf('schulfrei') >= 0) return '🏖';
    return '•';
  }
  function stopwatchSvg() {
    return '<svg class="m-ico" viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">' +
      '<circle cx="32" cy="36" r="16" fill="none" stroke="#8d8276" stroke-width="4"/>' +
      '<path d="M32 36 V26" stroke="#8d8276" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32 16 v6 M27 14 h10" stroke="#8d8276" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }
  function wallTimerHtml(name, ymd, live) {
    if (!kidHasSchool(name, ymd)) return '<div class="m-dayoff">No school today</div>';
    var k = live ? kidState(name) : { checks: {} };
    var started = !!k.inAt;
    var done = !!(k.inAt && k.doneAt);
    var onTime = done && finishOnTime(name, k.doneAt);
    var elapsed = '--:--';
    var star = '';
    if (done) {
      elapsed = fmtDur(Math.round((k.doneAt - k.inAt) / 1000));
      if (onTime) star = ' <span class="m-star">★</span>';
    } else if (started) elapsed = fmtDur(Math.round((morningNowMs() - k.inAt) / 1000));
    var lines = [];
    lines.push('Ready by ' + fmtHM(LEAVE[name] - EARLY));
    if (done) lines.push(onTime ? 'Done · on time' : 'Done');
    else if (started) lines.push('Checked in ' + fmtAt(k.inAt));
    else lines.push('Starts at check-in');
    if (!started) lines.push('Leaves ' + fmtHM(LEAVE[name]));
    if (done) lines.push('Checked in ' + fmtAt(k.inAt));
    var yday = yesterdaySecs(name, ymd);
    var best = weekBest(name, ymd);
    if (yday != null) lines.push('Yesterday ' + fmtDur(yday));
    if (best != null) lines.push('Best ' + fmtDur(best));
    var html = '<div class="m-sw' + (onTime ? ' good' : '') + '">' + stopwatchSvg() +
      '<div class="m-time" id="elapsed-' + name + '"' + (started && !done && live ? ' data-run="1"' : '') + '>' + elapsed + star + '</div>' +
      '<div class="m-meta">' + lines.map(function (line) { return '<div>' + esc(line) + '</div>'; }).join('') + '</div></div>';
    if (!live) html += '<button type="button" class="checkin ' + name.toLowerCase() + '" disabled>Check in</button>';
    else if (!started) html += '<button type="button" class="checkin ' + name.toLowerCase() + '" data-act="checkin" data-kid="' + name + '">Check in</button>';
    return html;
  }
  function wallListHtml(name, live) {
    var tasks = morningTasks(name);
    var k = live ? kidState(name) : { checks: {} };
    var html = '<div class="m-lbl">Checklist</div>';
    tasks.forEach(function (t) {
      var on = !!k.checks[t.id];
      html += '<button type="button" class="chk' + (on ? ' done' : '') + (t.id === 'meds' ? ' meds' : '') + '" data-act="toggle" data-kid="' + name + '" data-id="' + esc(t.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (live ? '' : ' disabled') + '>' +
        '<span class="box"><span class="tick"></span></span><span class="lbl">' + esc(t.label) + '</span></button>';
    });
    if (live && k.inAt) html += '<button type="button" class="m-reset" id="reset-' + name + '" data-act="reset" data-kid="' + name + '">' + esc(resetLabel(name)) + '</button>';
    return html;
  }
  function wallCalendarHtml(name, ymd) {
    var head = '<div class="m-lbl">Today</div>';
    if (calMode === 'loading' || calMode === 'opening') return head + '<div class="m-muted">Opening calendar…</div>';
    if (calMode === 'nocrypto') return head + '<div class="m-muted">This browser cannot unlock the calendar. Checklists still work.</div>';
    if (calMode === 'missing') return head + '<div class="m-muted">Calendar file not loaded.</div>';
    if (calMode !== 'open' || !DATA) return head + '<div class="m-muted">Unlock the family password to see today.</div>';
    var day = dayBucket(ymd);
    var kid = (day && day[name]) || { events: [], bring: [], homework: [] };
    var events = kid.events || [];
    var html = head;
    if (!events.length) html += '<div class="m-muted">Nothing on the calendar</div>';
    events.forEach(function (ev) {
      var line = esc(ev.title || '');
      if (ev.time) line += ' <span class="m-at">· ' + esc(prettyTime(ev.time)) + '</span>';
      html += '<div class="m-ev"><span class="m-eic">' + eventIcon(ev.title) + '</span><span>' + line + '</span></div>';
    });
    if (kid.bring && kid.bring.length) {
      html += '<div class="m-lbl">Bring</div><div class="m-chips">';
      kid.bring.forEach(function (item) { html += '<span class="m-chip">' + esc(item) + '</span>'; });
      html += '</div>';
    }
    if (kid.homework && kid.homework.length) {
      html += '<div class="m-lbl">Homework</div>';
      kid.homework.forEach(function (item) { html += '<div class="m-hw">' + esc(item) + '</div>'; });
    }
    return html;
  }
  function kidsMode(p) {
    return p.h * 60 + p.mi >= 12 * 60 ? 'afternoon' : 'morning';
  }
  function aftRoot() {
    if (TEST_MODE) {
      if (!testAfternoon.kids) {
        var seed = afternoonDefaults();
        testAfternoon.landMin = seed.landMin;
        testAfternoon.whw = seed.whw;
        testAfternoon.kids = seed.kids;
        if (!testAfternoon.days) testAfternoon.days = {};
      }
      return testAfternoon;
    }
    if (!hub.afternoon) hub.afternoon = afternoonDefaults();
    return hub.afternoon;
  }
  function aftSave() { if (!TEST_MODE) saveHub(); }
  function aftNowMin(p) { return p.h * 60 + p.mi + p.s / 60; }
  function aftFri(p) { return weekdayIndex(p.ymd) === 5; }
  function aftKid(name) { return aftRoot().kids[name]; }
  function aftHomeStr(name, p) {
    var kid = aftKid(name);
    if (aftFri(p) && kid.homeFri) return kid.homeFri;
    return kid.home || '16:00';
  }
  function aftHomeMin(name, p) {
    var parts = aftHomeStr(name, p).split(':');
    return (+parts[0]) * 60 + (+parts[1] || 0);
  }
  function aftRec(name) {
    var ymd = morningParts().ymd;
    var root = aftRoot();
    if (!root.days) root.days = {};
    if (!root.days[ymd]) root.days[ymd] = {};
    if (!root.days[ymd][name]) root.days[ymd][name] = { easy: 0, checks: {} };
    if (!root.days[ymd][name].checks) root.days[ymd][name].checks = {};
    return root.days[ymd][name];
  }
  function aftOn(name, key) { return !!aftRec(name).checks[key]; }
  function aftLandingKeys(name) {
    return (aftKid(name).L || []).map(function (_, i) { return 'L' + i; });
  }
  function aftScreenItems(name, p) {
    var sc = aftKid(name).SC || [];
    var items = sc.map(function (label, i) { return { key: 'S' + i, label: label, read: /reading/i.test(label), fri: false }; });
    if (aftFri(p) && name !== 'June' && sc.length) items.unshift({ key: 'WH', label: aftRoot().whw || 'Weekend homework', read: false, fri: true });
    var easy = aftRec(name).easy || 0;
    if (easy === 2) return [];
    if (easy === 1) {
      var wh = items.filter(function (it) { return it.fri; });
      var reading = items.filter(function (it) { return it.read; });
      return wh.concat(reading.length ? reading : items.filter(function (it) { return !it.fri; }).slice(0, 1));
    }
    return items;
  }
  function aftReadDone(name, p) {
    if (aftScreenItems(name, p).some(function (it) { return it.read && aftOn(name, it.key); })) return true;
    return aftOn(name, 'EV');
  }
  function aftPhase(name) {
    var rec = aftRec(name);
    var sc = aftKid(name).SC || [];
    if (!rec.inAt) return 'wait';
    if (!rec.landAt) return 'land';
    if (sc.length && !rec.screensAt) return 'screens';
    return 'free';
  }
  function aftMaybeScreens(name) {
    var rec = aftRec(name);
    var sc = aftKid(name).SC || [];
    if (!rec.landAt || rec.screensAt || !sc.length) return;
    var items = aftScreenItems(name, morningParts());
    if (!items.length || items.every(function (it) { return aftOn(name, it.key); })) rec.screensAt = morningNowMs();
  }
  function aftCanIn(name, p) {
    if (isWeekendYmd(p.ymd) || hardOff(p.ymd)) return true;
    return aftNowMin(p) >= aftHomeMin(name, p);
  }
  function aftLeftLabel(minsFloat) {
    var sec = Math.round(Math.abs(minsFloat) * 60);
    return (minsFloat < 0 ? '+' : '') + Math.floor(sec / 60) + ':' + pad2(sec % 60);
  }
  function aftPunchIn(name) {
    var p = morningParts();
    if (!aftCanIn(name, p)) return;
    var rec = aftRec(name);
    if (rec.inAt) return;
    rec.inAt = morningNowMs();
    aftSave();
  }
  function aftLand(name) {
    if (aftLandingKeys(name).some(function (key) { return !aftOn(name, key); })) return;
    var rec = aftRec(name);
    if (!rec.inAt || rec.landAt) return;
    rec.landAt = morningNowMs();
    aftMaybeScreens(name);
    aftSave();
  }
  function aftToggle(name, key) {
    var rec = aftRec(name);
    rec.checks[key] = !rec.checks[key];
    if (!rec.checks[key]) rec.screensAt = null;
    aftMaybeScreens(name);
    aftSave();
  }
  function aftEasy(name, value) {
    var rec = aftRec(name);
    rec.easy = rec.easy === value ? 0 : value;
    rec.screensAt = null;
    aftMaybeScreens(name);
    aftSave();
  }
  function aftUndo(name) {
    var ymd = morningParts().ymd;
    var root = aftRoot();
    if (root.days && root.days[ymd]) delete root.days[ymd][name];
    aftSave();
  }
  function aftCheckHtml(name, key, label, fri) {
    var on = aftOn(name, key);
    return '<button type="button" class="chk' + (on ? ' done' : '') + (fri ? ' fri' : '') + '" data-act="aft-check" data-kid="' + name + '" data-id="' + esc(key) + '" aria-pressed="' + (on ? 'true' : 'false') + '"><span class="box"><span class="tick"></span></span><span class="lbl">' + esc(label) + '</span></button>';
  }
  function aftColumn(name, p) {
    var rec = aftRec(name);
    var phase = aftPhase(name);
    var home = aftHomeStr(name, p);
    var left = aftHomeMin(name, p) - aftNowMin(p);
    var school = !isWeekendYmd(p.ymd) && !hardOff(p.ymd);
    var who = name === 'June' ? 'Leaving Kinderhaus' : (name === 'Jack' ? 'Leaving OGT' : 'Leaving school');
    var html = '<section class="m-col ' + name.toLowerCase() + '"><div class="m-head"><h2>' + esc(name) + '</h2><span class="badge">Home ' + esc(home) + '</span></div>';
    html += '<div class="aft-card">';
    if (phase === 'wait') {
      if (left > 0 && school) {
        html += '<div class="aft-kicker">Afternoon</div><div class="aft-huge" id="aftBig-' + name + '">' + aftLeftLabel(left) + '</div><div class="aft-line">' + esc(who) + ' at ' + esc(home) + '</div>';
      } else {
        html += '<div class="aft-kicker">Afternoon</div><div class="aft-huge" id="aftBig-' + name + '">Home</div><div class="aft-line">On the way home' + (school ? ' · left ' + esc(home) : '') + '</div>';
      }
      html += aftCanIn(name, p)
        ? '<button type="button" class="checkin ' + name.toLowerCase() + '" data-act="aft-in" data-kid="' + name + '">Punch in</button>'
        : '<button type="button" class="checkin ' + name.toLowerCase() + '" disabled>Punch in at ' + esc(home) + '</button>';
    } else if (phase === 'land') {
      var landLeft = (rec.inAt + aftRoot().landMin * 60000 - morningNowMs()) / 60000;
      var leftN = aftLandingKeys(name).filter(function (key) { return !aftOn(name, key); }).length;
      html += '<div class="aft-kicker">Landing · ' + aftRoot().landMin + ' min</div><div class="aft-huge" id="aftBig-' + name + '">' + aftLeftLabel(landLeft) + '</div>';
      html += '<div class="aft-line">Finish the landing list, then punch out</div>';
      html += leftN
        ? '<button type="button" class="checkin ' + name.toLowerCase() + '" disabled>' + leftN + ' landing task' + (leftN === 1 ? '' : 's') + ' left</button>'
        : '<button type="button" class="checkin ' + name.toLowerCase() + '" data-act="aft-land" data-kid="' + name + '">Landed</button>';
    } else if (phase === 'screens') {
      var remain = aftScreenItems(name, p).filter(function (it) { return !aftOn(name, it.key); }).length;
      html += '<div class="aft-kicker">Before screens</div><div class="aft-huge" id="aftBig-' + name + '">' + remain + '</div><div class="aft-line">' + remain + ' must-do' + (remain === 1 ? '' : 's') + ' left' + (rec.easy === 1 ? ' · easy day' : '') + '</div>';
    } else {
      html += '<div class="aft-kicker">Afternoon</div><div class="aft-huge" id="aftBig-' + name + '">' + ((aftKid(name).SC || []).length ? 'Screens' : 'Done') + '</div>';
      html += '<div class="aft-line">' + ((aftKid(name).SC || []).length ? 'Screens unlocked' + (rec.screensAt ? ' · ' + fmtAt(rec.screensAt) : '') : 'Afternoon done') + (rec.easy === 2 ? ' · skipped' : '') + '</div>';
    }
    html += '</div>';
    if (phase === 'wait') html += '<p class="m-muted">Punch in first, then the landing list opens.</p>';
    else {
      html += '<div class="m-lbl">Landing' + (rec.landAt ? ' · ' + fmtAt(rec.landAt) : '') + '</div>';
      if (rec.landAt) html += '<p class="m-muted">Landed at ' + fmtAt(rec.landAt) + '.</p>';
      else (aftKid(name).L || []).forEach(function (label, i) { html += aftCheckHtml(name, 'L' + i, label, false); });
    }
    if ((aftKid(name).SC || []).length) {
      var items = aftScreenItems(name, p);
      html += '<div class="m-lbl">Before screens' + (rec.easy === 1 ? ' · easy day, reading only' : rec.easy === 2 ? ' · skip today' : '') + '</div>';
      if (rec.screensAt) html += '<div class="aft-unlock">Screens unlocked ' + fmtAt(rec.screensAt) + '</div>';
      if (rec.easy === 2) html += '<p class="m-muted">Skipped today. That is OK.</p>';
      else items.forEach(function (it) { html += aftCheckHtml(name, it.key, it.label, it.fri); });
      if (!aftReadDone(name, p) && rec.easy !== 2 && aftNowMin(p) >= 18 * 60) {
        html += '<div class="m-lbl">Evening</div>' + aftCheckHtml(name, 'EV', 'Evening reading before bed', false);
      }
    }
    html += '<div class="aft-parent"><span>Parent</span>';
    html += '<button type="button" class="' + (rec.easy === 1 ? 'on' : '') + '" data-act="aft-easy" data-kid="' + name + '" data-id="1">Easy day</button>';
    if ((aftKid(name).SC || []).length) html += '<button type="button" class="' + (rec.easy === 2 ? 'on' : '') + '" data-act="aft-easy" data-kid="' + name + '" data-id="2">Skip today</button>';
    if (rec.inAt) html += '<button type="button" data-act="aft-undo" data-kid="' + name + '">Undo</button>';
    html += '</div></section>';
    return html;
  }
  function afternoonBanner(p) {
    var now = aftNowMin(p);
    var soon = null;
    var bits = [];
    KIDS.forEach(function (name) {
      var home = aftHomeStr(name, p);
      var left = aftHomeMin(name, p) - now;
      bits.push(name + ' ' + home);
      if (left > 0 && (!soon || left < soon.left)) soon = { left: left, home: home };
    });
    if (soon) {
      return { title: 'Home at ' + soon.home, big: soon.left >= 60 ? fmtLeft(soon.left * 60) : aftLeftLabel(soon.left), sub: bits.join(' · '), pct: 0, urg: soon.left < 10 ? 'yellow' : 'ok', mode: 'wait' };
    }
    return { title: 'Afternoon', big: 'Home', sub: 'Punch in when you get home · ' + bits.join(' · '), pct: 0, urg: 'ok', mode: 'wait' };
  }
  function renderAfternoon() {
    var p = morningParts();
    var model = afternoonBanner(p);
    var weather = currentWeather(nowParts());
    var html = '<div class="page morning-wall">';
    html += '<section class="m-top urg-' + model.urg + '" id="countCard" data-wall="1" data-phase="afternoon">';
    html += '<div class="m-clock"><div class="m-clock-time" id="mClock">' + esc(fmtClock(p)) + '</div><div class="m-clock-date" id="mDate">' + esc((p.weekday || '') + ' ' + p.d + ' ' + (MONTHS[p.mo - 1] || '')) + '</div></div>';
    html += '<div class="m-mid"><div class="count-title" id="countTitle">' + esc(model.title) + '</div><div class="count-big" id="countBig">' + esc(model.big) + '</div><div class="count-sub" id="countSub">' + esc(model.sub) + '</div></div>';
    html += '<div class="m-wx"><div class="m-wx-main" id="mWxMain">' + (weather ? weatherSvg(weather.kind) + '<span class="m-temp">' + weather.temp + '°</span>' : '<span class="m-temp">—</span>') + '</div>';
    html += '<div class="m-wx-sub" id="mWxSub">' + esc(weather ? (weather.word + (weather.hint ? ' · ' + weather.hint : '')) : 'Weather for Bad Tölz') + '</div></div>';
    html += '<div class="bar" id="bar"><i id="barFill" style="width:0"></i></div></section><div class="m-cols">';
    KIDS.forEach(function (name) { html += aftColumn(name, p); });
    html += '</div></div>';
    return html;
  }
  function renderMorning() {
    var mp = morningParts();
    var live = schoolMorning(mp);
    morningLive = live;
    var model = live ? countdownModel(mp) : waitingMorningModel(mp);
    var day = live ? mp.ymd : model.ymd;
    var weather = currentWeather(nowParts());
    var html = '<div class="page morning-wall">';
    html += '<section class="m-top urg-' + model.urg + '" id="countCard" data-wall="1">';
    html += '<div class="m-clock"><div class="m-clock-time" id="mClock">' + esc(fmtClock(mp)) + '</div><div class="m-clock-date" id="mDate">' + esc((mp.weekday || '') + ' ' + mp.d + ' ' + (MONTHS[mp.mo - 1] || '')) + '</div></div>';
    html += '<div class="m-mid"><div class="count-title" id="countTitle">' + esc(model.title) + '</div><div class="count-big' + (model.mode === 'count' || model.mode === 'wait' ? '' : ' small') + '" id="countBig">' + esc(model.big) + '</div><div class="count-sub" id="countSub">' + esc(model.sub) + '</div></div>';
    html += '<div class="m-wx"><div class="m-wx-main" id="mWxMain">' + (weather ? weatherSvg(weather.kind) + '<span class="m-temp">' + weather.temp + '°</span>' : '<span class="m-temp">—</span>') + '</div>';
    html += '<div class="m-wx-sub" id="mWxSub">' + esc(weather ? (weather.word + (weather.hint ? ' · ' + weather.hint : '')) : 'Weather for Bad Tölz') + '</div>';
    html += '<button type="button" class="sound" id="soundBtn" data-act="sound" data-role="sound">Enable sound</button></div>';
    html += '<div class="bar" id="bar"><i id="barFill" style="width:' + model.pct + '%"></i></div></section>';
    html += '<div class="m-cols">';
    KIDS.forEach(function (name) {
      var stat = onTimeDays(name, day);
      var badge = !stat.of ? 'Day off' : ('★ ' + stat.n + ' of ' + stat.of + ' this week');
      var kidNow = live ? kidState(name) : null;
      var good = kidNow && kidNow.doneAt && finishOnTime(name, kidNow.doneAt);
      html += '<section class="m-col ' + name.toLowerCase() + '"><div class="m-head"><h2>' + esc(name) + '</h2><span class="badge' + (good ? ' good' : '') + '">' + esc(badge) + '</span></div>';
      html += wallTimerHtml(name, day, live);
      html += wallCalendarHtml(name, day);
      if (kidHasSchool(name, day)) html += wallListHtml(name, live);
      html += '</section>';
    });
    html += '</div></div>';
    return html;
  }
  function renderKids() {
    var mp = morningParts();
    kidsShown = kidsMode(mp);
    if (kidsShown === 'afternoon') {
      morningLive = false;
      return renderAfternoon();
    }
    return renderMorning();
  }

  function shiftAnchor(dir) {
    if (!calAnchor) calAnchor = currentYmd();
    if (calView === 'month') {
      var y = +calAnchor.slice(0, 4);
      var m = +calAnchor.slice(5, 7) - 1 + dir;
      var dt = new Date(Date.UTC(y, m, 1));
      calAnchor = dt.getUTCFullYear() + '-' + pad2(dt.getUTCMonth() + 1) + '-01';
    } else if (calView === 'day') calAnchor = addDays(calAnchor, dir);
    else calAnchor = addDays(calAnchor, dir * 7);
  }
  function layoutTimed(events) {
    var items = [];
    events.forEach(function (ev) {
      if (!ev.time) return;
      var s = minutesOf(ev.time);
      var e = minutesOf(ev.end);
      if (e == null || e <= s) e = s + 60;
      items.push({ ev: ev, start: s, end: e });
    });
    items.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    var cols = [];
    items.forEach(function (it) {
      var c = 0;
      for (; c < cols.length; c++) if (cols[c] <= it.start) break;
      cols[c] = it.end;
      it.col = c;
    });
    var total = Math.max(cols.length, 1);
    items.forEach(function (it) { it.total = total; });
    return items;
  }
  function renderCalendar() {
    var p = nowParts();
    if (!calAnchor) calAnchor = p.ymd;
    var html = '<div class="page">';
    html += peopleStrip(p.ymd);
    var label = '';
    if (calView === 'day') label = prettyDate(calAnchor);
    else if (calView === 'month') label = MONTHS[+calAnchor.slice(5, 7) - 1] + ' ' + calAnchor.slice(0, 4);
    else label = prettyDate(mondayOf(calAnchor)) + ' – ' + prettyDate(addDays(mondayOf(calAnchor), 6));
    html += '<div class="cal-toolbar"><div class="seg">';
    ['day', 'week', 'month'].forEach(function (v) {
      html += '<button type="button" data-act="calview" data-id="' + v + '" class="' + (calView === v ? 'on' : '') + '">' + v.charAt(0).toUpperCase() + v.slice(1) + '</button>';
    });
    html += '</div><button type="button" class="navround" data-act="calshift" data-id="-1" aria-label="Previous">‹</button>';
    html += '<button type="button" class="btn light" data-act="caltoday">Today</button>';
    html += '<button type="button" class="navround" data-act="calshift" data-id="1" aria-label="Next">›</button>';
    html += '<div class="cal-range">' + esc(label) + '</div>';
    html += '<div class="legend"><span><i class="lg-school"></i>School</span><span><i class="lg-sport"></i>Sport</span><span><i class="lg-community"></i>Community</span><span><i class="lg-holiday"></i>Holiday</span><span><i class="lg-house"></i>House</span><span><i class="lg-local"></i>Added on this device</span></div></div>';
    if (calMode !== 'open') html += '<p class="muted">Google Calendar stays hidden until the family password is entered in Settings. Holidays, school breaks, and anything added on this device still show.</p>';
    var note = rangeNote();
    if (note && calMode === 'open') html += '<p class="muted">' + esc(note) + '</p>';
    if (calView === 'day') html += renderDayView(calAnchor);
    else if (calView === 'month') html += renderMonthView(calAnchor);
    else html += renderWeekView(mondayOf(calAnchor));
    html += '<p class="cal-foot">Tap an event for details. Google Calendar is read-only. Quick add stays on this device. Weeks start Monday, times are Europe/Berlin.</p></div>';
    return html;
  }
  function renderWeekView(monday) {
    var map = forecastMap();
    var html = '<div class="card week-card"><div class="week-scroll"><div class="week-head"><div></div>';
    for (var i = 0; i < 7; i++) {
      var ymd = addDays(monday, i);
      var fx = map[ymd];
      var today = ymd === currentYmd();
      html += '<div class="dh"><div class="dh-name">' + WD_SHORT[weekdayIndex(ymd)] + '</div><div class="dh-num' + (today ? ' today' : '') + '">' + (+ymd.slice(8)) + '</div>';
      if (fx && fx.high != null) html += '<span class="dh-wx">' + fx.high + '°</span>';
      html += '</div>';
    }
    html += '</div><div class="allday-row"><div></div>';
    for (var c = 0; c < 7; c++) {
      var day = addDays(monday, c);
      var all = dayEvents(day, true).filter(function (ev) { return !ev.time; });
      html += '<div class="allday-col">';
      all.slice(0, 3).forEach(function (ev) {
        html += '<button type="button" class="mini ' + kindOf(ev) + '" data-act="event" data-key="' + esc(evKey(day, ev)) + '">' + esc(ev.title) + '</button>';
      });
      if (all.length > 3) html += '<div class="muted">+' + (all.length - 3) + '</div>';
      html += '</div>';
    }
    html += '</div><div class="week-body"><div class="hours">';
    for (var h = 7; h <= 20; h++) html += '<div class="hour">' + h + '</div>';
    html += '</div>';
    for (var d = 0; d < 7; d++) {
      var y = addDays(monday, d);
      var timed = layoutTimed(dayEvents(y, true).filter(function (ev) { return !!ev.time; }));
      html += '<div class="day-col">';
      for (var line = 0; line < 14; line++) html += '<div class="hline"></div>';
      timed.forEach(function (it) {
        var top = ((Math.max(it.start, 7 * 60) - 7 * 60) / (14 * 60)) * 100;
        var end = Math.min(it.end, 21 * 60);
        var start = Math.max(it.start, 7 * 60);
        var height = Math.max(3.2, ((end - start) / (14 * 60)) * 100);
        var width = 100 / it.total;
        var left = it.col * width;
        html += '<button type="button" class="ev-block ' + kindOf(it.ev) + '" style="top:' + top + '%;height:' + height + '%;left:' + left + '%;width:' + (width - 1.5) + '%" data-act="event" data-key="' + esc(evKey(y, it.ev)) + '"><b>' + esc(it.ev.title) + '</b><span>' + esc(fmtRange(it.ev.time, it.ev.end)) + '</span></button>';
      });
      html += '</div>';
    }
    html += '</div></div></div>';
    return html;
  }
  function renderDayView(ymd) {
    var events = dayEvents(ymd, true);
    var html = '<div class="card day-list"><h2 class="serif">' + esc(wdLong(WD_SHORT[weekdayIndex(ymd)]) + ' ' + prettyDate(ymd)) + '</h2>';
    if (!events.length) html += '<p class="muted">Nothing on this day.</p>';
    events.forEach(function (ev) {
      html += '<button type="button" class="today-row ' + kindOf(ev) + '" data-act="event" data-key="' + esc(evKey(ymd, ev)) + '"><span class="t-time">' + esc(ev.time ? fmtRange(ev.time, ev.end) : 'All day') + '</span><span>' + esc(ev.title) + (ev.location ? ' · ' + esc(ev.location) : '') + '</span></button>';
    });
    html += bringBlock(ymd) + '</div>';
    return html;
  }
  function renderMonthView(anchor) {
    var y = +anchor.slice(0, 4);
    var m = +anchor.slice(5, 7);
    var first = y + '-' + pad2(m) + '-01';
    var start = mondayOf(first);
    var html = '<div class="month-grid">';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(function (d) { html += '<div class="mhead">' + d + '</div>'; });
    for (var i = 0; i < 42; i++) {
      var ymd = addDays(start, i);
      var inMonth = +ymd.slice(5, 7) === m;
      if (!inMonth && i >= 35 && +ymd.slice(8) > 7) break;
      var events = inMonth ? dayEvents(ymd, true) : [];
      html += '<button type="button" class="mcell' + (inMonth ? '' : ' empty') + (ymd === currentYmd() ? ' today' : '') + '" data-act="openday" data-id="' + ymd + '">';
      if (inMonth) {
        html += '<div class="n">' + (+ymd.slice(8)) + '</div>';
        events.slice(0, 3).forEach(function (ev) {
          html += '<span class="mpill ' + kindOf(ev) + '">' + esc(ev.title) + '</span>';
        });
        if (events.length > 3) html += '<span class="muted">+' + (events.length - 3) + '</span>';
      }
      html += '</button>';
    }
    html += '</div>';
    return html;
  }

  function groupCount(group) {
    var ymd = currentYmd();
    var done = 0;
    var total = 0;
    kidsInView().forEach(function (name) {
      choresOf(name, group).forEach(function (t) {
        total++;
        if (isDone(name, group, t.id, ymd)) done++;
      });
    });
    return done + '/' + total;
  }
  function renderPlayroom() {
    var p = nowParts();
    var ymd = p.ymd;
    if (!playGroup) playGroup = hardOff(ymd) ? 'weekend' : 'morning';
    var html = '<div class="page"><div class="play">';
    html += '<div class="card play-main"><div class="play-top">';
    html += '<button type="button" class="person' + (playKid === 'all' ? ' dad' : '') + '" data-act="playkid" data-id="all"><span class="ava">All</span><span><b>Everyone</b></span></button>';
    KIDS.forEach(function (name) {
      html += '<button type="button" class="person ' + name.toLowerCase() + (playKid === name ? '' : ' off') + '" data-act="playkid" data-id="' + name + '"><span class="ava">' + KID_INITIAL[name] + '</span><span><b>' + name + ' (' + ageOf(name, ymd) + ')</b><small>★ ' + (hub.stars[name] || 0) + '</small></span></button>';
    });
    html += '</div><div class="pills">';
    [['today', 'Today'], ['learn', 'Learn'], ['store', 'Star Store'], ['rewards', 'My Rewards'], ['stickers', 'Stickers'], ['week', 'My Week'], ['parent', 'Parent']].forEach(function (tab) {
      html += '<button type="button" class="pill' + (playTab === tab[0] ? ' on' : '') + '" data-act="playtab" data-id="' + tab[0] + '">' + tab[1] + '</button>';
    });
    html += '</div>';
    if (playTab === 'today') html += renderChoreBoard(ymd);
    else if (playTab === 'learn') html += renderLearn(ymd);
    else if (playTab === 'store') html += renderStore();
    else if (playTab === 'rewards') html += renderRewards();
    else if (playTab === 'stickers') html += renderStickers();
    else if (playTab === 'week') html += renderMyWeek(ymd);
    else html += renderParent(ymd);
    html += '</div>';
    html += renderSide(ymd);
    html += '</div></div>';
    return html;
  }
  function renderChoreBoard(ymd) {
    var html = '<p class="muted">Stars can be spent in the Star Store. A morning finished on time earns one too.</p>';
    html += '<div class="pills">';
    [['morning', 'Morning'], ['weekend', 'Weekend chores'], ['bedtime', 'Bedtime']].forEach(function (g) {
      html += '<button type="button" class="pill' + (playGroup === g[0] ? ' on' : '') + '" data-act="playgroup" data-id="' + g[0] + '">' + g[1] + ' ' + groupCount(g[0]) + '</button>';
    });
    html += '</div>';
    var kids = kidsInView();
    html += '<div class="kid-cols' + (kids.length === 1 ? ' one' : '') + '">';
    kids.forEach(function (name) {
      html += '<div><div class="task-head"><b>' + esc(name) + '</b></div>';
      if (playGroup === 'morning') html += timerBlock(name, ymd, true);
      if (playGroup === 'morning' && !kidHasSchool(name, ymd)) {
        html += '<p class="muted">The school list waits for the next morning.</p>';
      }
      choresOf(name, playGroup).forEach(function (t) {
        var on = isDone(name, playGroup, t.id, ymd);
        var disabled = playGroup === 'morning' && !kidHasSchool(name, ymd);
        html += '<button type="button" class="chore' + (on ? ' done' : '') + '" data-act="chore" data-kid="' + name + '" data-id="' + esc(t.id) + '" data-group="' + playGroup + '"' + (disabled ? ' disabled' : '') + '><span class="box"><span class="tick"></span></span><span class="star">★</span> ' + esc(t.label) + '<span class="plus">+1★</span></button>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }
  function renderLearn(ymd) {
    var word = pick(WORDS, ymd);
    var kid = playKid === 'all' ? 'West' : playKid;
    var html = '<h2>Word of the day</h2><p class="dayname" style="font-size:40px">' + esc(word[0]) + '</p><p>' + esc(word[1]) + '</p>';
    html += '<div class="card" style="box-shadow:none;background:#f8f1e4"><b>Try this</b><p>' + esc(word[2]) + '</p><p class="muted">Picked for ' + esc(kid) + ', age ' + ageOf(kid, ymd) + '. No score, no streak.</p></div>';
    return html;
  }
  function renderStore() {
    var kids = kidsInView();
    var html = '<h2>Star Store</h2><p class="muted">Ask a parent to approve. Stars are spent only when they say yes.</p><div class="store-grid">';
    (hub.rewards || []).forEach(function (reward) {
      html += '<div class="reward"><div class="emo">' + reward.emoji + '</div><b>' + esc(reward.title) + '</b><div>' + reward.cost + ' ★</div>';
      kids.forEach(function (name) {
        var have = hub.stars[name] || 0;
        if (have >= reward.cost) html += '<button type="button" class="btn dark small" data-act="ask" data-kid="' + name + '" data-id="' + esc(reward.id) + '">' + esc(name) + ' asks</button> ';
        else html += '<div class="muted">' + esc(name) + ' · ' + (reward.cost - have) + ' to go</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    if (parentOn) html += '<div class="row-actions" style="margin-top:12px"><button type="button" class="btn light" data-act="add-reward">Add a reward</button></div>';
    return html;
  }
  function renderRewards() {
    var list = (hub.redemptions || []).filter(function (r) { return playKid === 'all' || r.kid === playKid; });
    if (!list.length) return '<h2>My rewards</h2><p>No rewards yet. A parent can add them in the Star Store.</p>';
    var html = '<h2>My rewards</h2>';
    list.forEach(function (r) {
      html += '<div class="task-block"><b>' + esc(r.kid) + ' · ' + esc(r.title) + '</b><div class="muted">' + r.cost + ' ★ · ' + esc(r.status) + '</div>';
      if (r.status === 'pending' && parentOn) {
        html += '<div class="row-actions"><button type="button" class="btn dark small" data-act="approve" data-id="' + esc(r.id) + '">Approve</button><button type="button" class="btn light small" data-act="decline" data-id="' + esc(r.id) + '">Not now</button></div>';
      }
      html += '</div>';
    });
    return html;
  }
  function renderStickers() {
    if (playKid === 'all') return '<h2>Stickers</h2><p>Choose West, Jack, or June to open their sticker book.</p>';
    var got = earned(playKid);
    var html = '<h2>' + esc(playKid) + '’s stickers</h2><p class="muted">' + got + ' stars earned in all. New ones unlock as stars add up. Missing a day changes nothing.</p>';
    html += '<div class="sticker-board" id="board">';
    (hub.placed || []).filter(function (s) { return s.kid === playKid; }).forEach(function (s) {
      var sticker = STICKERS.filter(function (x) { return x.id === s.id; })[0];
      html += '<button type="button" class="placed" style="left:' + s.x + '%;top:' + s.y + '%" data-act="unstick" data-id="' + esc(s.pid) + '">' + (sticker ? sticker.emoji : '★') + '</button>';
    });
    html += '</div><div class="row-actions">';
    STICKERS.forEach(function (s) {
      var open = got >= s.need;
      html += '<button type="button" class="sticker' + (open ? '' : ' off') + '" data-act="stick" data-id="' + s.id + '"' + (open ? '' : ' disabled') + '>' + s.emoji + '</button>';
    });
    html += '</div>';
    return html;
  }
  function renderMyWeek(ymd) {
    var start = mondayOf(ymd);
    var end = addDays(start, 6);
    var html = '<h2>This week</h2><p class="muted">Only the good bits. A missed day is just a missed day.</p><div class="weekstat">';
    KIDS.forEach(function (name) {
      var chores = 0;
      for (var i = 0; i < 7; i++) {
        var day = addDays(start, i);
        var bag = hub.choreDone[day] && hub.choreDone[day][name];
        if (bag) chores += Object.keys(bag).length;
        var checks = day === ymd ? (state.kids[name] && state.kids[name].checks) : null;
        if (checks) Object.keys(checks).forEach(function (id) { if (checks[id]) chores++; });
      }
      var stat = onTimeDays(name, ymd);
      html += '<div class="card" style="box-shadow:none"><h3>' + esc(name) + '</h3><p>' + starsEarnedBetween(name, start, end) + ' stars earned</p><p>' + chores + ' chores ticked</p><p>' + (stat.of ? stat.n + ' morning' + (stat.n === 1 ? '' : 's') + ' on time' : 'No school mornings') + '</p></div>';
    });
    html += '</div>';
    return html;
  }
  function renderParent(ymd) {
    if (!parentOn) {
      pinFlow = pinFlow || { mode: hub.pin ? 'unlock' : 'create' };
      return pinPadHtml(hub.pin ? 'Parent mode' : 'Choose a 4-digit parent PIN', hub.pin ? 'This is a soft lock for stars, chores, and rewards.' : 'You will type it twice. It stays on this device.');
    }
    var html = '<div class="row-actions"><h2 style="flex:1;margin:0">Parent mode</h2><button type="button" class="btn light" data-act="parent-lock">Lock</button></div>';
    html += '<div class="pills">';
    [['morning', 'Morning'], ['weekend', 'Weekend chores'], ['bedtime', 'Bedtime']].forEach(function (g) {
      html += '<button type="button" class="pill' + ((playGroup || 'morning') === g[0] ? ' on' : '') + '" data-act="playgroup" data-id="' + g[0] + '">' + g[1] + '</button>';
    });
    html += '</div>';
    html += '<div class="star-row">';
    KIDS.forEach(function (name) {
      html += '<span>' + esc(name) + ' ★ ' + (hub.stars[name] || 0) + '</span><button type="button" class="btn light small" data-act="star" data-kid="' + name + '" data-id="-1">−</button><button type="button" class="btn light small" data-act="star" data-kid="' + name + '" data-id="1">+</button>';
    });
    html += '</div>';
    var kid = playKid === 'all' ? 'West' : playKid;
    html += '<p class="muted">Editing chores for ' + esc(kid) + ' · ' + esc(playGroup || 'morning') + '. Use the kid and chore tabs above.</p>';
    var group = playGroup || 'morning';
    choresOf(kid, group).forEach(function (t) {
      html += '<div class="row-actions"><input class="field" data-act="chore-label" data-kid="' + esc(kid) + '" data-group="' + group + '" data-id="' + esc(t.id) + '" value="' + esc(t.label) + '"><button type="button" class="btn ghost" data-act="chore-del" data-kid="' + esc(kid) + '" data-group="' + group + '" data-id="' + esc(t.id) + '">Remove</button></div>';
    });
    html += '<div class="row-actions"><input class="field" id="newChore" placeholder="New chore"><button type="button" class="btn dark" data-act="chore-add" data-kid="' + esc(kid) + '" data-group="' + group + '">Add</button></div>';
    var pending = (hub.redemptions || []).filter(function (r) { return r.status === 'pending'; });
    if (pending.length) {
      html += '<h3>Waiting for a yes</h3>';
      pending.forEach(function (r) {
        html += '<div class="row-actions"><span>' + esc(r.kid) + ' · ' + esc(r.title) + ' · ' + r.cost + ' ★</span><button type="button" class="btn dark small" data-act="approve" data-id="' + esc(r.id) + '">Approve</button><button type="button" class="btn light small" data-act="decline" data-id="' + esc(r.id) + '">Not now</button></div>';
      });
    }
    return html;
  }
  function pinPadHtml(title, sub) {
    var dots = '';
    for (var i = 0; i < 4; i++) dots += i < pinBuf.length ? '●' : '○';
    var html = '<div class="pinpad"><h2>' + esc(title) + '</h2><p class="muted">' + esc(sub) + '</p><div class="pin-dots">' + dots + '</div><div class="pin-keys">';
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) {
      html += '<button type="button" data-act="pin" data-id="' + n + '">' + n + '</button>';
    });
    html += '<span></span><button type="button" data-act="pin" data-id="0">0</button><button type="button" data-act="pin" data-id="back">⌫</button></div>';
    if (pinLockUntil && Date.now() < pinLockUntil) html += '<p class="muted">Pause a moment, then try again.</p>';
    html += '</div>';
    return html;
  }
  function renderSide(ymd) {
    var joke = pick(JOKES, ymd);
    var animal = pick(ANIMALS, ymd);
    var moon = moonInfo(nowMs());
    var open = jokeOpenFor === ymd;
    var html = '<div class="side">';
    html += '<section class="side-card joke"><h3>JOKE OF THE DAY</h3><p class="joke-q">' + esc(joke[0]) + '</p>';
    html += open ? '<p><b>' + esc(joke[1]) + '</b></p>' : '<button type="button" class="tap" data-act="joke">Tap to see the answer</button>';
    html += '</section>';
    html += '<section class="side-card animal"><h3>ANIMAL OF THE DAY</h3><p class="joke-q">' + esc(animal[0]) + '</p><p>' + esc(animal[1]) + '</p></section>';
    html += '<section class="side-card moon"><h3>MOON TONIGHT</h3><p><b>' + esc(moon.name) + '</b></p><p>' + moon.illum + '% lit</p></section>';
    html += '<section class="side-card kind"><div class="jar-row"><div><h3>KINDNESS JAR</h3><p>' + (hub.kindness || 0) + ' of 20. Full jar = +2★ each</p></div><button type="button" class="btn light" data-act="kind">+1</button></div></section>';
    html += '<section class="side-card thanks"><h3>THANK-YOU NOTES</h3><p>Send someone a thank-you note.</p>';
    (hub.notes || []).slice(0, 3).forEach(function (n) { html += '<p><b>' + esc(n.from) + ' → ' + esc(n.to) + '</b> ' + esc(n.text) + '</p>'; });
    html += '<div class="note-actions"><button type="button" class="btn" data-act="thanks">Thank you</button><button type="button" class="btn" data-act="swap">Chore swap</button></div></section>';
    html += '</div>';
    return html;
  }

  function mealCard(entry, today) {
    var meal = hub.meals[entry.key] || { title: '', side: '', ingredients: '' };
    var tonight = entry.ymd === today;
    var photo = meal.recipe ? '<button type="button" class="meal-pic" data-act="open-recipe" data-id="' + esc(meal.recipe) + '"><img class="meal-thumb" alt="" src="recipes/photos/' + esc(meal.recipe) + '.jpg"></button>' : '';
    var title = meal.recipe ? '<button type="button" class="title linkish" data-act="open-recipe" data-id="' + esc(meal.recipe) + '">' + esc(meal.title || 'Add a dinner') + '</button>' : '<div class="title">' + esc(meal.title || 'Add a dinner') + '</div>';
    return '<article class="card meal' + (tonight ? ' tonight' : '') + (meal.recipe ? ' has-photo' : '') + '">' + photo + '<h3>' + esc(wdLong(WD_SHORT[weekdayIndex(entry.ymd)]).toUpperCase()) + ' ' + esc(entry.ymd.slice(8) + '.' + entry.ymd.slice(5, 7)) + (tonight ? ' <span class="tag">Tonight</span>' : '') + '</h3>' + title + '<div class="side">' + esc(meal.side || 'Side or notes') + '</div><div class="ings">' + esc(meal.ingredients || '') + '</div><div class="row-actions"><button type="button" class="btn dark small" data-act="meal-aldi" data-day="' + entry.key + '">Add to Aldi list</button><button type="button" class="btn light small" data-act="meal-clear" data-day="' + entry.key + '">Clear</button><button type="button" class="btn ghost small" data-act="meal-edit" data-day="' + entry.key + '">Edit</button></div></article>';
  }
  function prettyQty(n) {
    if (n == null || isNaN(n)) return '';
    var rounded = Math.round(n * 100) / 100;
    var whole = Math.floor(rounded + 1e-6);
    var frac = rounded - whole;
    var known = [[0.25, '1/4'], [0.333, '1/3'], [0.5, '1/2'], [0.666, '2/3'], [0.75, '3/4']];
    var label = '';
    for (var i = 0; i < known.length; i++) {
      if (Math.abs(frac - known[i][0]) < 0.05) { label = known[i][1]; break; }
    }
    if (!label) {
      if (frac < 0.05) return String(whole);
      return String(rounded);
    }
    return (whole ? whole + ' ' : '') + label;
  }
  function scaleFactor(recipe) {
    if (!recipe || !recipe.servings) return serveNow || 1;
    return (serveNow || recipe.servings) / recipe.servings;
  }
  function formatIng(ing, factor) {
    if (ing.qty == null) return ing.item;
    return [prettyQty(ing.qty * factor), ing.unit, ing.item].filter(function (part) { return part; }).join(' ');
  }
  function recipeMinutes(text) {
    var found = [];
    var re = /(\d+)(?:\s*[–-]\s*(\d+))?\s*(hours|hour|hrs|hr|h|minutes|minute|mins|min)\b/gi;
    var match;
    while ((match = re.exec(text))) {
      var unit = match[3].toLowerCase();
      var mult = unit.charAt(0) === 'h' ? 60 : 1;
      found.push(Number(match[1]) * mult);
      if (match[2]) found.push(Number(match[2]) * mult);
    }
    var seen = {};
    return found.filter(function (n) { if (seen[n]) return false; seen[n] = true; return n > 0 && n <= 240; });
  }
  var TAG_SMALL = { and: 1, or: 1, of: 1, the: 1, a: 1, an: 1, to: 1, for: 1, in: 1, on: 1, with: 1 };
  function tagLabel(tag) {
    var wordIndex = 0;
    return String(tag || '').replace(/^\s+|\s+$/g, '').split(/(\s+|-)/).map(function (part) {
      if (!part || /^\s+$/.test(part) || part === '-') return part;
      var lower = part.toLowerCase();
      var cap = lower.charAt(0).toUpperCase() + lower.slice(1);
      var out = wordIndex > 0 && TAG_SMALL[lower] ? lower : cap;
      wordIndex += 1;
      return out;
    }).join('');
  }
  function recipeTagLabels(tags) {
    var seen = {};
    var labels = [];
    (tags || []).forEach(function (tag) {
      var label = tagLabel(tag);
      var key = label.toLowerCase();
      if (!label || seen[key]) return;
      seen[key] = true;
      labels.push(label);
    });
    return labels;
  }
  function filteredRecipes() {
    var q = recipeQuery.replace(/^\s+|\s+$/g, '').toLowerCase();
    var want = recipeTag === 'All' ? '' : tagLabel(recipeTag).toLowerCase();
    return RECIPE_INDEX.filter(function (recipe) {
      if (want && recipeTagLabels(recipe.tags).map(function (label) { return label.toLowerCase(); }).indexOf(want) < 0) return false;
      if (!q) return true;
      return recipe.title.toLowerCase().indexOf(q) >= 0 || (recipe.tags || []).join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  function recipeCardsHtml() {
    var list = filteredRecipes();
    if (!list.length) return '<p class="muted">No recipes match.</p>';
    return list.map(function (recipe) {
      var bits = [];
      if (recipe.servings) bits.push('Serves ' + recipe.servings);
      if (recipe.time && recipe.time.total) bits.push(recipe.time.total + ' min');
      return '<button type="button" class="card recipe-card" data-act="open-recipe" data-id="' + esc(recipe.slug) + '"><img alt="" src="recipes/photos/' + esc(recipe.photo) + '"><span class="recipe-body"><b>' + esc(recipe.title) + '</b><span class="muted">' + esc(bits.join(' · ')) + '</span></span></button>';
    }).join('');
  }
  function renderRecipeBrowse() {
    var labels = ['All'];
    var seen = { all: true };
    RECIPE_INDEX.forEach(function (recipe) {
      recipeTagLabels(recipe.tags).forEach(function (label) {
        var key = label.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        labels.push(label);
      });
    });
    labels.sort(function (a, b) { if (a === 'All') return -1; if (b === 'All') return 1; return a < b ? -1 : 1; });
    var html = '<div class="page"><div class="page-head"><h2>Recipes</h2><button type="button" class="btn light" data-act="meals-pane" data-id="plan">Dinners</button></div>';
    html += '<input class="field" id="recipeSearch" placeholder="Search recipes" value="' + esc(recipeQuery) + '" autocomplete="off">';
    html += '<div class="pills">';
    labels.forEach(function (tag) {
      var on = tag === 'All' ? recipeTag === 'All' : tagLabel(recipeTag).toLowerCase() === tag.toLowerCase();
      html += '<button type="button" class="pill' + (on ? ' on' : '') + '" data-act="recipe-tag" data-id="' + esc(tag) + '">' + esc(tag) + '</button>';
    });
    html += '</div><div class="recipe-grid" id="recipeGrid">' + recipeCardsHtml() + '</div></div>';
    return html;
  }
  function withRecipe(slug, done) {
    if (RECIPE_FULL[slug]) { done(RECIPE_FULL[slug]); return; }
    fetch('recipes/' + encodeURIComponent(slug) + '.json').then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.json();
    }).then(function (data) {
      RECIPE_FULL[slug] = data;
      done(data);
    }).catch(function () { toast('That recipe did not load'); });
  }
  function renderRecipeDetail() {
    var recipe = RECIPE_FULL[openSlug];
    if (!recipe) return '<div class="page"><p class="muted">Opening the recipe…</p></div>';
    var factor = scaleFactor(recipe);
    var groups = [];
    recipe.ingredients.forEach(function (ing) {
      var name = ing.group || '';
      var last = groups[groups.length - 1];
      if (!last || last.name !== name) groups.push({ name: name, items: [ing] });
      else last.items.push(ing);
    });
    var ingHtml = groups.map(function (group) {
      var head = group.name ? '<h3>' + esc(group.name) + '</h3>' : '';
      return head + group.items.map(function (ing) { return '<div class="ing-line">' + esc(formatIng(ing, factor)) + '</div>'; }).join('');
    }).join('');
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var serveLabel = recipe.servings ? String(serveNow) : '× ' + serveNow;
    var html = '<div class="page"><div class="page-head"><button type="button" class="btn light" data-act="meals-pane" data-id="recipes">Recipes</button><h2>' + esc(recipe.title) + '</h2></div>';
    var variations = '';
    if (recipe.variations && recipe.variations.length) {
      variations = '<h3 class="variation-head">Variations</h3>';
      recipe.variations.forEach(function (variation) {
        variations += '<div class="variation"><h3>' + esc(variation.name) + '</h3>';
        if (variation.notes) variations += '<p class="muted">' + esc(variation.notes) + '</p>';
        if (variation.changes && variation.changes.length) {
          variations += '<ul>';
          variation.changes.forEach(function (change) { variations += '<li>' + esc(change) + '</li>'; });
          variations += '</ul>';
        }
        if (variation.serve_with && variation.serve_with.length) {
          variations += '<p class="serve-with"><b>Serve with</b> ' + esc(variation.serve_with.join(', ')) + '</p>';
        }
        variations += '</div>';
      });
    }
    html += '<div class="recipe-detail"><article class="card recipe-hero"><img alt="" src="recipes/photos/' + esc(recipe.photo) + '"><h3 class="recipe-title">' + esc(recipe.title) + '</h3><p class="muted">' + esc(recipeTagLabels(recipe.tags).join(' · ')) + '</p>';
    if (recipe.notes) html += '<p>' + esc(recipe.notes) + '</p>';
    if (recipe.source) html += '<p class="muted"><a href="' + esc(recipe.source) + '">Original</a></p>';
    html += '</article><article class="card"><div class="kicker"><span>INGREDIENTS</span><span class="row-actions"><button type="button" class="btn light small" data-act="servings" data-id="-1">−</button><b>' + esc(serveLabel) + '</b><button type="button" class="btn light small" data-act="servings" data-id="1">+</button></span></div>';
    html += ingHtml;
    html += variations;
    html += '<div class="row-actions" style="margin-top:12px"><button type="button" class="btn dark" data-act="recipe-aldi">Add to Aldi list</button><button type="button" class="btn light" data-act="meals-pane" data-id="cook">Cook</button></div>';
    html += '<div class="kicker" style="margin-top:14px">Put on a day</div><div class="pills">';
    days.forEach(function (day) { html += '<button type="button" class="pill" data-act="recipe-day" data-id="' + day + '">' + day.charAt(0).toUpperCase() + day.slice(1) + '</button>'; });
    html += '</div></article></div><article class="card"><h3>Steps</h3><ol class="steps">';
    recipe.steps.forEach(function (step) { html += '<li>' + esc(step) + '</li>'; });
    html += '</ol></article></div>';
    return html;
  }
  function renderCookPage() {
    var recipe = RECIPE_FULL[openSlug];
    if (!recipe) return '<div class="page"><p class="muted">Opening the recipe…</p></div>';
    var step = recipe.steps[cookIndex] || '';
    var mins = recipeMinutes(step);
    var html = '<div class="page cook-page"><div class="page-head"><button type="button" class="btn light" data-act="meals-pane" data-id="recipe">Recipe</button><h2>' + esc(recipe.title) + '</h2><span class="muted">' + (cookIndex + 1) + ' of ' + recipe.steps.length + '</span></div>';
    html += '<article class="card cook-card"><p class="cook-step">' + esc(step) + '</p>';
    if (mins.length) {
      html += '<div class="pills">';
      mins.forEach(function (n) { html += '<button type="button" class="pill" data-act="cook-timer" data-id="' + n + '">Start ' + n + ' min timer</button>'; });
      html += '</div>';
    }
    html += '<div class="row-actions"><button type="button" class="btn light" data-act="cook-prev"' + (cookIndex ? '' : ' disabled') + '>Back</button><button type="button" class="btn dark" data-act="cook-next"' + (cookIndex < recipe.steps.length - 1 ? '' : ' disabled') + '>Next</button></div>';
    html += '<div class="timer-mini"><div class="kitchen" id="kitchenTime">' + fmtKitchen(kitchenMs()) + '</div><div class="k-keys">';
    [1, 5, 10, 15, 30].forEach(function (n) { html += '<button type="button" data-act="kadd" data-id="' + n + '">+' + n + '</button>'; });
    html += '<button type="button" data-act="kstop">Stop</button></div></div></article></div>';
    return html;
  }
  function renderMeals() {
    if (mealsPane === 'recipes') return renderRecipeBrowse();
    if (mealsPane === 'recipe') return renderRecipeDetail();
    if (mealsPane === 'cook') return renderCookPage();
    var ymd = currentYmd();
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(function (key, i) {
      return { key: key, ymd: addDays(mondayOf(ymd), i) };
    });
    var html = '<div class="page"><div class="page-head"><h2>Dinners this week</h2><span class="muted">' + esc(prettyDate(days[0].ymd) + ' – ' + prettyDate(days[6].ymd)) + '</span><button type="button" class="btn light" data-act="meals-pane" data-id="recipes">Recipes</button><button type="button" class="btn dark" data-act="week-aldi">Add the week’s ingredients to Aldi list</button></div>';
    html += '<div class="recent"><span class="muted">Recent · tap to put on today</span>';
    (hub.recentMeals || []).forEach(function (m, i) {
      html += '<button type="button" data-act="recent" data-id="' + i + '">' + esc(m.title) + '</button>';
    });
    html += '</div><div class="meal-grid">';
    days.forEach(function (d) { html += mealCard(d, ymd); });
    html += '<article class="card meal timer-card"><h3>KITCHEN TIMER</h3><div class="kitchen" id="kitchenTime">' + fmtKitchen(kitchenMs()) + '</div><div class="k-keys">';
    [1, 5, 10, 15, 30].forEach(function (n) { html += '<button type="button" data-act="kadd" data-id="' + n + '">+' + n + '</button>'; });
    html += '<button type="button" data-act="kstop">Stop</button></div></article></div>';
    html += '<h2>Lists</h2><div class="lists"><article class="card"><h3>Aldi list</h3>' + listHtml(hub.aldi, 'aldi') + aldiForm() + '</article>';
    html += '<article class="card"><h3>More lists</h3>';
    (hub.lists || []).forEach(function (list) {
      html += '<div class="section-label">' + esc(list.name) + '</div>' + listItemsHtml(list);
    });
    html += '<div class="add-row"><input class="field" id="newListName" placeholder="New list (DM, packing, to-do…)"><button type="button" class="btn coral" data-act="add-list">+ List</button></div></article></div></div>';
    return html;
  }
  function listHtml(items, kind) {
    var groups = {};
    (items || []).forEach(function (item) {
      var s = item.section || 'Other';
      if (!groups[s]) groups[s] = [];
      groups[s].push(item);
    });
    var html = '';
    var order = SECTIONS.slice();
    Object.keys(groups).forEach(function (section) { if (order.indexOf(section) < 0) order.push(section); });
    order.forEach(function (section) {
      if (!groups[section] || !groups[section].length) return;
      html += '<div class="section-label">' + esc(section) + '</div>';
      groups[section].forEach(function (item) {
        html += '<label class="aldi-item"><input type="checkbox" data-act="aldi-toggle" data-id="' + esc(item.id) + '"' + (item.done ? ' checked' : '') + '> <span' + (item.done ? ' style="text-decoration:line-through;color:#8d8276"' : '') + '>' + esc(item.text) + '</span></label>';
      });
    });
    if (!html) html = '<p class="muted">The list is empty.</p>';
    return html;
  }
  function aldiForm() {
    var opts = SECTIONS.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    return '<div class="add-row"><input class="field" id="aldiText" placeholder="Add an item"><select class="field" id="aldiSection" style="max-width:140px">' + opts + '</select><button type="button" class="btn coral" data-act="aldi-add">Add</button></div>';
  }
  function listItemsHtml(list) {
    var html = '';
    (list.items || []).forEach(function (item) {
      html += '<label class="list-item"><input type="checkbox" data-act="list-toggle" data-list="' + esc(list.id) + '" data-id="' + esc(item.id) + '"' + (item.done ? ' checked' : '') + '> ' + esc(item.text) + '</label>';
    });
    html += '<div class="add-row"><input class="field" placeholder="Item" id="li-' + esc(list.id) + '"><button type="button" class="btn dark small" data-act="list-add" data-id="' + esc(list.id) + '">Add</button><button type="button" class="btn ghost small" data-act="list-del" data-id="' + esc(list.id) + '">Delete list</button></div>';
    return html;
  }
  function renderHouse() {
    var ymd = currentYmd();
    var html = '<div class="page"><div class="page-head"><h2>House</h2><button type="button" class="btn dark" data-act="add-house">Add a reminder</button></div><p class="muted">Household tasks for the wall. Checking one off does not affect the kids’ stars.</p>';
    (hub.house || []).forEach(function (task) {
      var due = houseDue(task, ymd);
      html += '<article class="card house-card"><div class="row-actions"><div><b>' + esc(task.title) + '</b><div class="muted">' + esc(task.detail || '') + ' · ' + esc(task.cadence || 'daily') + (due ? '' : ' · done') + '</div></div>';
      html += '<button type="button" class="btn ' + (due ? 'dark' : 'light') + '" data-act="house-done" data-id="' + esc(task.id) + '">' + (due ? 'Done' : 'Undo') + '</button>';
      html += '<button type="button" class="btn ghost" data-act="house-del" data-id="' + esc(task.id) + '">Remove</button></div></article>';
    });
    html += '</div>';
    return html;
  }
  function renderSports() {
    var html = '<div class="page"><div class="page-head"><h2>Sports</h2><button type="button" class="btn dark" data-act="add-sport">Add an activity</button></div><p class="muted">Starter ideas you can edit. Practices on the calendar show up underneath once it is unlocked.</p><div class="columns-3">';
    KIDS.forEach(function (name) {
      html += '<article class="card sport-col"><h3>' + esc(name) + '</h3>';
      (hub.sports || []).filter(function (s) { return s.kid === name; }).forEach(function (s) {
        html += '<div class="sport-card"><b>' + esc(s.title) + '</b><div>' + esc(s.day || '') + (s.time ? ' · ' + esc(s.time) : '') + '</div><div class="muted">' + esc(s.place || '') + '</div><div class="muted">Bring: ' + esc(s.bring || '—') + '</div><button type="button" class="btn ghost small" data-act="sport-del" data-id="' + esc(s.id) + '">Remove</button></div>';
      });
      html += '</article>';
    });
    html += '</div>';
    if (calMode === 'open') {
      var ymd = currentYmd();
      var start = mondayOf(ymd);
      var found = [];
      for (var i = 0; i < 7; i++) {
        var day = addDays(start, i);
        dayEvents(day, false).forEach(function (ev) {
          if (kindOf(ev) === 'sport') found.push(prettyDate(day) + ' · ' + (ev.time ? fmtRange(ev.time, ev.end) + ' ' : '') + ev.title);
        });
      }
      html += '<article class="card"><h3>From the calendar</h3>' + (found.length ? found.map(function (line) { return '<div>' + esc(line) + '</div>'; }).join('') : '<p class="muted">No sport events in this week’s file.</p>') + '</article>';
    }
    html += '</div>';
    return html;
  }
  function renderSpice() {
    var html = '<div class="page"><div class="page-head"><h2>Spice</h2></div><div class="columns-2"><article class="card"><h3>Pantry</h3><p class="muted">Tap a jar when it is running low.</p>';
    (hub.pantry || []).forEach(function (item) {
      html += '<button type="button" class="chore' + (item.low ? ' done' : '') + '" data-act="spice-toggle" data-id="' + esc(item.id) + '">' + esc(item.name) + '<span class="plus">' + (item.low ? 'Running low' : 'In the jar') + '</span></button>';
    });
    html += '<div class="add-row"><input class="field" id="spiceName" placeholder="Add a spice"><button type="button" class="btn dark" data-act="spice-add">Add</button></div></article>';
    html += '<article class="card"><div class="row-actions"><h3 style="flex:1">Recipes</h3><button type="button" class="btn light small" data-act="add-recipe">Add</button></div>';
    (hub.recipes || []).forEach(function (r) {
      html += '<details class="recipe"><summary><b>' + esc(r.title) + '</b></summary><p>' + esc(r.ingredients) + '</p><p>' + esc(r.steps) + '</p><button type="button" class="btn ghost small" data-act="recipe-del" data-id="' + esc(r.id) + '">Remove</button></details>';
    });
    html += '</article></div></div>';
    return html;
  }
  function renderDatePage() {
    var planned = (hub.dates || []).filter(function (d) { return d.planned; })[0];
    var html = '<div class="page"><div class="page-head"><h2>Date</h2><button type="button" class="btn dark" data-act="add-date">Add an idea</button></div>';
    html += '<article class="card"><div class="kicker">This week</div><h3>' + (planned ? esc(planned.title) : 'Nothing picked yet') + '</h3><p class="muted">' + (planned ? esc(planned.detail) : 'Choose something small for Ryan and Jessica.') + '</p></article>';
    html += '<div class="idea-grid">';
    (hub.dates || []).forEach(function (d) {
      html += '<article class="card idea"><b>' + esc(d.title) + '</b><p>' + esc(d.detail) + '</p><div class="row-actions"><button type="button" class="btn ' + (d.planned ? 'light' : 'dark') + ' small" data-act="plan-date" data-id="' + esc(d.id) + '">' + (d.planned ? 'Planned' : 'Plan this') + '</button><button type="button" class="btn ghost small" data-act="date-del" data-id="' + esc(d.id) + '">Remove</button></div></article>';
    });
    html += '</div></div>';
    return html;
  }
  function renderSleep() {
    var p = nowParts();
    var view = currentWeather(p);
    var up = nextUp(p);
    var moon = moonInfo(nowMs());
    var html = '<div class="sleep-copy"><div class="sleep-time" id="sleepTime">' + esc(fmtClock(p)) + '</div>';
    html += '<div class="sleep-date" id="sleepDate">' + esc(longDate(p)) + '</div>';
    html += '<div class="sleep-wx" id="sleepWx">';
    if (view) html += esc(view.temp + '° now · ' + view.word + (view.high != null ? ' · ' + view.high + '°' : '') + (view.low != null ? ' / ' + view.low + '°' : ''));
    else html += 'Bad Tölz';
    html += '</div>';
    if (up) {
      var when = up.today ? 'TODAY' : WD_SHORT[weekdayIndex(up.ymd)].toUpperCase();
      html += '<div class="next-card ' + kindOf(up.ev) + '"><div class="k">NEXT UP · ' + when + '</div><div class="t">' + esc(up.ev.title) + (up.ev.time ? ' · ' + esc(fmtRange(up.ev.time, up.ev.end)) : '') + '</div></div>';
    }
    html += '<p class="sleep-quote">“' + esc(pick(QUOTES, p.ymd)) + '”</p>';
    html += '<div class="wake-hint">Tap anywhere to wake · ' + esc(moon.name) + '</div></div>';
    html += '<img class="sleep-art" alt="" src="assets/botanical.svg">';
    document.getElementById('sleep').innerHTML = html;
  }
  function renderView() {
    var html = '';
    if (page === 'home') html = renderHome();
    else if (page === 'kids') html = renderKids();
    else if (page === 'calendar') html = renderCalendar();
    else if (page === 'playroom') html = renderPlayroom();
    else if (page === 'meals') html = renderMeals();
    else if (page === 'house') html = renderHouse();
    else if (page === 'sports') html = renderSports();
    else if (page === 'spice') html = renderSpice();
    else if (page === 'date') html = renderDatePage();
    else html = renderHome();
    document.getElementById('view').innerHTML = html;
  }

  function kitchenMs() {
    if (!kitchen.running) return kitchen.left;
    var left = kitchen.endAt - Date.now();
    if (left <= 0) {
      kitchen.running = false;
      kitchen.left = 0;
      if (!kitchen.justDone) kitchen.justDone = true;
      return 0;
    }
    return left;
  }
  function fmtKitchen(ms) {
    var sec = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m >= 60) return Math.floor(m / 60) + ':' + pad2(m % 60) + ':' + pad2(s);
    return m + ':' + pad2(s);
  }
  function paintKitchen() {
    setText('kitchenTime', fmtKitchen(kitchenMs()));
    if (kitchen.justDone && !kitchenRang) {
      kitchenRang = true;
      kitchen.justDone = false;
      toast('Timer done');
      if (soundOn && audioReady) remind('Timer done');
    }
  }
  function paintCountdown(p) {
    var card = document.getElementById('countCard');
    if (!card) return;
    var live = schoolMorning(p);
    var model = page === 'kids' && kidsMode(p) === 'afternoon' ? afternoonBanner(p) : (live || page !== 'kids' ? countdownModel(p) : waitingMorningModel(p));
    var wall = card.getAttribute('data-wall') === '1';
    if (wall) card.className = 'm-top urg-' + model.urg;
    else card.className = 'card count-card urg-' + model.urg;
    setText('countTitle', model.title);
    var big = document.getElementById('countBig');
    if (big) {
      big.textContent = model.big;
      if (wall) big.className = 'count-big' + (model.mode === 'count' || model.mode === 'wait' ? '' : ' small');
    }
    var cur = live ? currentWeather(nowParts()) : null;
    setText('countSub', wall ? model.sub : (model.sub + (cur && cur.hint ? ' · ' + cur.hint : '')));
    if (wall) {
      var mp = morningParts();
      setText('mClock', fmtClock(mp));
      setText('mDate', (mp.weekday || '') + ' ' + mp.d + ' ' + (MONTHS[mp.mo - 1] || ''));
      var wxMain = document.getElementById('mWxMain');
      var wxSub = document.getElementById('mWxSub');
      var weather = currentWeather(nowParts());
      if (wxMain) wxMain.innerHTML = weather ? weatherSvg(weather.kind) + '<span class="m-temp">' + weather.temp + '°</span>' : '<span class="m-temp">—</span>';
      if (wxSub) wxSub.textContent = weather ? (weather.word + (weather.hint ? ' · ' + weather.hint : '')) : 'Weather for Bad Tölz';
      if (card.getAttribute('data-phase') === 'afternoon') {
        KIDS.forEach(function (name) {
          var el = document.getElementById('aftBig-' + name);
          if (!el) return;
          var phase = aftPhase(name);
          var rec = aftRec(name);
          if (phase === 'wait') {
            var left = aftHomeMin(name, mp) - aftNowMin(mp);
            var school = !isWeekendYmd(mp.ymd) && !hardOff(mp.ymd);
            el.textContent = left > 0 && school ? aftLeftLabel(left) : 'Home';
          } else if (phase === 'land') {
            el.textContent = aftLeftLabel((rec.inAt + aftRoot().landMin * 60000 - morningNowMs()) / 60000);
          }
        });
      }
    }
    var fill = document.getElementById('barFill');
    if (fill) fill.style.width = model.pct + '%';
  }
  function paintElapsed() {
    KIDS.forEach(function (name) {
      var el = document.getElementById('elapsed-' + name);
      if (!el || el.getAttribute('data-run') !== '1') return;
      var k = state.kids[name];
      if (!k || !k.inAt || k.doneAt) return;
      el.textContent = fmtDur(Math.round((morningNowMs() - k.inAt) / 1000));
    });
  }
  function paintSleep(p) {
    setText('sleepTime', fmtClock(p));
    setText('sleepDate', longDate(p));
  }

  function field(id, label, value, type) {
    return '<label>' + esc(label) + '</label><input class="field" id="' + id + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '">';
  }
  function overlayHtml() {
    if (!overlay) return '';
    var body = '';
    if (overlay.type === 'settings') body = settingsHtml();
    else if (overlay.type === 'quick') body = quickHtml();
    else if (overlay.type === 'event') body = eventHtml(overlay.key);
    else if (overlay.type === 'bell') body = bellHtml();
    else if (overlay.type === 'note') body = '<h2>Sticky note</h2><textarea class="field" id="noteText" rows="5">' + esc(hub.note || '') + '</textarea><div class="row-actions"><button type="button" class="btn dark" data-act="note-save">Save</button></div>';
    else if (overlay.type === 'confirm') body = '<h2>' + esc(overlay.message) + '</h2><div class="row-actions"><button type="button" class="btn dark" data-act="confirm-yes">Yes</button><button type="button" class="btn light" data-act="close">Cancel</button></div>';
    else if (overlay.type === 'meal') body = mealEditHtml(overlay.day);
    else if (overlay.type === 'thanks' || overlay.type === 'swap') body = noteFormHtml(overlay.type);
    else if (overlay.type === 'reward') body = '<h2>New reward</h2>' + field('rwTitle', 'Name', '') + field('rwCost', 'Star price', '10', 'number') + field('rwEmoji', 'Emoji', '⭐') + '<div class="row-actions"><button type="button" class="btn dark" data-act="reward-save">Save</button></div>';
    else if (overlay.type === 'house') body = '<h2>House reminder</h2>' + field('hTitle', 'Title', '') + field('hDetail', 'Detail', '') + '<label>How often</label><select class="field" id="hCadence"><option value="daily">Daily</option><option value="weekly">Weekly</option></select><div class="row-actions"><button type="button" class="btn dark" data-act="house-save">Save</button></div>';
    else if (overlay.type === 'sport') body = '<h2>Activity</h2>' + field('spTitle', 'Name', '') + '<label>Child</label><select class="field" id="spKid">' + KIDS.map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select>' + field('spDay', 'Day', 'Tue') + field('spTime', 'Time', '16:00') + field('spPlace', 'Place', '') + field('spBring', 'Bring', '') + '<div class="row-actions"><button type="button" class="btn dark" data-act="sport-save">Save</button></div>';
    else if (overlay.type === 'recipe') body = '<h2>Recipe</h2>' + field('rcTitle', 'Title', '') + field('rcIng', 'Ingredients', '') + '<label>Steps</label><textarea class="field" id="rcSteps" rows="4"></textarea><div class="row-actions"><button type="button" class="btn dark" data-act="recipe-save">Save</button></div>';
    else if (overlay.type === 'dateidea') body = '<h2>Date idea</h2>' + field('dtTitle', 'Title', '') + field('dtDetail', 'Detail', '') + '<div class="row-actions"><button type="button" class="btn dark" data-act="date-save">Save</button></div>';
    return '<div class="sheet" role="dialog"><button type="button" class="btn ghost close" data-act="close" aria-label="Close">Close</button>' + body + '</div>';
  }
  function settingsHtml() {
    var when = DATA && DATA.generatedAt ? DATA.generatedAt.replace('T', ' ').slice(0, 16) + ' UTC' : 'not open';
    var html = '<h2>Settings</h2>';
    html += '<p><button type="button" class="btn dark" data-act="sound" data-role="sound">Enable sound</button></p>';
    html += '<p class="muted">Sound plays a chime and, if the browser can talk, speaks at 15, 10, and 5 minutes before the boys leave at 7:10 and June at 7:30. Browsers stay quiet until this is tapped. The screen stay-awake request runs after a tap too. The page reloads itself once around 3:00 so the new day shows up.</p>';
    html += '<h3>Calendar password</h3>';
    if (calMode === 'open') html += '<p class="muted">Calendar is open' + (DATA && DATA.date ? ' · file date ' + esc(DATA.date) : '') + ' · built ' + esc(when) + '.</p><button type="button" class="btn light" data-act="lock-cal">Lock calendar on this device</button>';
    else html += '<form data-act="unlock" class="add-row"><input class="field" id="pw" type="password" autocomplete="current-password" placeholder="Family password" aria-label="Family password"><button class="btn dark" type="submit">Unlock</button></form><p class="muted">Without the password the hub still runs. Google events stay hidden.</p>';
    html += '<h3>Parent PIN</h3><p class="muted">A 4-digit soft lock for chores, the Star Store, stars, backup, and restoring the starter lists. It is not the calendar password.</p>';
    if (!parentOn) html += '<button type="button" class="btn light" data-act="open-pin">Enter parent PIN</button>';
    else html += '<button type="button" class="btn light" data-act="parent-lock">Lock parent mode</button> <button type="button" class="btn light" data-act="change-pin">Change PIN</button>';
    html += '<h3>This device only</h3><p class="muted">Meals, lists, chores, stars, rewards, House, Sports, Spice, Date, and Quick add live in this browser. They do not sync. Export a JSON file and import it on the other screen. The file includes the parent PIN and does not include Google Calendar events. Keep it private.</p>';
    if (parentOn) {
      html += '<div class="row-actions"><button type="button" class="btn dark" data-act="export">Export JSON</button><label class="btn light">Import JSON<input id="importFile" type="file" accept="application/json" style="display:none"></label><button type="button" class="btn ghost" data-act="restore">Restore starter lists</button></div>';
    } else html += '<p class="muted">Set the parent PIN and unlock parent mode to export, import, or restore.</p>';
    return html;
  }
  function quickHtml() {
    var ymd = currentYmd();
    var voice = canVoice();
    var html = '<h2>Quick add</h2><p class="muted">Saves on this device only. It does not write to Google Calendar.</p><div class="form-grid">';
    html += '<label>Title</label><div class="add-row"><input class="field" id="qaTitle" placeholder="What is happening?">' + (voice ? '<button type="button" class="btn light" data-act="voice">Voice</button>' : '') + '</div>';
    if (!voice) html += '<p class="muted">This browser has no speech recognition, so type the title.</p>';
    html += field('qaDate', 'Date', ymd, 'date');
    html += '<div class="add-row">' + field('qaStart', 'Start', '16:00', 'time') + field('qaEnd', 'End', '17:00', 'time') + '</div>';
    html += '<label class="aldi-item"><input type="checkbox" id="qaAll"> All day</label>';
    html += '<div class="checks">';
    KIDS.forEach(function (name) { html += '<label><input type="checkbox" class="qa-who" value="' + name + '" checked> ' + name + '</label>'; });
    html += '</div><label>Kind</label><select class="field" id="qaKind"><option value="local">Added on this device</option><option value="school">School</option><option value="sport">Sport</option><option value="appt">Appointment</option><option value="family">Family</option><option value="house">House</option></select>';
    html += '<label>Notes</label><textarea class="field" id="qaNotes" rows="3"></textarea>';
    html += '<button type="button" class="btn coral" data-act="quick-save">Add to this device</button></div>';
    return html;
  }
  function eventHtml(key) {
    var found = findEvent(key);
    if (!found) return '<h2>Event</h2><p>That one is no longer on the list.</p>';
    var ev = found.ev;
    var who = (ev.who && ev.who.length ? ev.who : ['Family']).join(', ');
    var html = '<h2>' + esc(ev.title) + '</h2>';
    html += '<p><b>' + esc(prettyDate(found.ymd)) + '</b> · ' + esc(ev.time ? fmtRange(ev.time, ev.end) : 'All day') + '</p>';
    html += '<p>' + esc(who) + (ev.location ? ' · ' + esc(ev.location) : '') + '</p>';
    if (ev.bring && ev.bring.length) html += '<div class="chips">' + ev.bring.map(function (b) { return '<span class="chip">' + esc(b) + '</span>'; }).join('') + '</div>';
    if (ev.homework) html += '<p><b>Homework</b></p>';
    if (ev.detail || ev.notes) html += '<p>' + esc(ev.detail || ev.notes) + '</p>';
    if (ev.local) html += '<p class="muted">Added on this device.</p><button type="button" class="btn ghost" data-act="local-del" data-id="' + esc(ev.id) + '">Delete</button>';
    else if (!ev.synthetic) html += '<p class="muted">From Google Calendar. Read only — change it in Google Calendar, and the next refresh will pick it up.</p>';
    else html += '<p class="muted">Bavarian holiday or school break, kept on the wall even when the calendar is locked.</p>';
    return html;
  }
  function bellHtml() {
    var p = nowParts();
    var html = '<h2>Notifications</h2>';
    if (schoolMorning(morningParts())) html += '<div class="notice"><b>School morning</b><div>Boys leave 7:10 · June leaves 7:30.</div></div>';
    if (schoolMorning(morningParts()) && !soundOn) html += '<div class="notice"><b>Sound is off</b><div>Tap Enable sound so the 15, 10, and 5 minute reminders can play.</div></div>';
    var any = false;
    (hub.house || []).forEach(function (task) {
      if (!houseDue(task, p.ymd)) return;
      any = true;
      html += '<div class="notice"><b>' + esc(task.title) + '</b><div>' + esc(task.detail || '') + '</div></div>';
    });
    (hub.redemptions || []).forEach(function (r) {
      if (r.status !== 'pending') return;
      any = true;
      html += '<div class="notice"><b>Reward request</b><div>' + esc(r.kid) + ' asked for ' + esc(r.title) + '.</div></div>';
    });
    html += '<div class="notice"><b>Kindness jar</b><div>' + (hub.kindness || 0) + ' of 20.</div></div>';
    if (!schoolMorning(morningParts()) && !any) html += '<p class="muted">All quiet.</p>';
    return html;
  }
  function mealEditHtml(day) {
    var meal = hub.meals[day] || { title: '', side: '', ingredients: '' };
    return '<h2>Edit dinner</h2>' + field('mTitle', 'Dinner', meal.title) + field('mSide', 'Side', meal.side) + field('mIng', 'Ingredients, comma separated', meal.ingredients) + '<div class="row-actions"><button type="button" class="btn dark" data-act="meal-save" data-day="' + esc(day) + '">Save</button></div>';
  }
  function noteFormHtml(kind) {
    var title = kind === 'swap' ? 'Chore swap' : 'Thank-you note';
    var opts = ['Dad', 'Mom'].concat(KIDS).map(function (n) { return '<option>' + n + '</option>'; }).join('');
    return '<h2>' + title + '</h2><label>From</label><select class="field" id="noteFrom">' + opts + '</select><label>To</label><select class="field" id="noteTo">' + opts + '</select><label>Note</label><textarea class="field" id="noteBody" rows="3" placeholder="' + (kind === 'swap' ? 'West will do Jack’s table wipe today' : 'Thanks for helping') + '"></textarea><div class="row-actions"><button type="button" class="btn dark" data-act="note-send" data-id="' + kind + '">Send</button></div>';
  }
  function renderOverlay() {
    var root = document.getElementById('overlay');
    if (!overlay) { root.className = 'hidden'; root.innerHTML = ''; return; }
    root.className = '';
    root.innerHTML = overlayHtml();
    var file = document.getElementById('importFile');
    if (file) file.addEventListener('change', function () {
      if (file.files && file.files[0]) importFile(file.files[0]);
    });
  }
  function closeOverlay() { overlay = null; pendingConfirm = null; renderOverlay(); }
  function askConfirm(message, fn) {
    pendingConfirm = fn;
    openOverlay({ type: 'confirm', message: message });
  }
  function openOverlay(next) { overlay = next; pinBuf = ''; renderOverlay(); }
  function safeRender() {
    var ae = document.activeElement;
    var tag = ae && ae.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (overlay) return;
    render();
  }
  function render() {
    try {
      var sleeping = page === 'sleep';
      document.getElementById('shell').classList.toggle('hidden', sleeping);
      var sleepEl = document.getElementById('sleep');
      sleepEl.classList.toggle('hidden', !sleeping);
      if (sleeping) renderSleep();
      else {
        renderNav();
        renderTop();
        renderSample();
        renderView();
      }
    renderOverlay();
    paintSound();
    restoreFocus();
    var view = document.getElementById('view');
    var key = page + '|' + mealsPane + '|' + openSlug + '|' + cookIndex;
    if (view && key !== scrollKey) {
      view.scrollTop = 0;
      scrollKey = key;
    }
    } catch (err) {
      if (window.console && console.error) console.error(err);
      var view = document.getElementById('view');
      if (view) view.textContent = 'This page hit a snag. Reload the hub.';
    }
  }
  function restoreFocus() {
    if (!focusSel) return;
    var el = document.querySelector(focusSel);
    if (el && el.focus) {
      try { el.focus(); } catch (e) {}
    }
  }
  function markFocus(el) {
    if (!el || !el.getAttribute) return;
    var id = el.getAttribute('data-id') || '';
    if (id && !/^[A-Za-z0-9_-]+$/.test(id)) { focusSel = ''; return; }
    var act = el.getAttribute('data-act') || '';
    var kid = el.getAttribute('data-kid') || '';
    focusSel = '[data-act="' + act + '"]' + (id ? '[data-id="' + id + '"]' : '') + (kid ? '[data-kid="' + kid + '"]' : '');
  }
  function go(id) {
    if (id === 'sleep' && page !== 'sleep') lastPage = page || 'home';
    page = id || 'home';
    if (id === 'home') {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    } else if (location.hash !== '#' + id) location.hash = id;
    render();
  }
  function pageFromHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (h === 'sleep') return 'sleep';
    if (h === 'morning' || h === 'kids') return 'kids';
    for (var i = 0; i < NAV.length; i++) if (NAV[i].id === h) return h;
    return 'home';
  }

  function toggleMorning(name, id) {
    if (page === 'kids' && !schoolMorning(morningParts())) return;
    if (!kidHasSchool(name, morningParts().ymd)) return;
    var k = kidState(name);
    if (!k.inAt) k.inAt = morningNowMs();
    k.checks[id] = !k.checks[id];
    if (allChecked(name)) { if (!k.doneAt) k.doneAt = morningNowMs(); }
    else k.doneAt = null;
    if (TEST_MORNING) return;
    saveState();
    var task = morningTasks(name).filter(function (t) { return t.id === id; })[0];
    setChoreStar(name, id, !!k.checks[id], task ? task.label : 'Morning task');
    syncMorningStar(name);
  }
  function checkIn(name) {
    if (page === 'kids' && !schoolMorning(morningParts())) return;
    if (!kidHasSchool(name, morningParts().ymd)) return;
    var k = kidState(name);
    if (!k.inAt) k.inAt = morningNowMs();
    if (allChecked(name) && !k.doneAt) k.doneAt = morningNowMs();
    if (TEST_MORNING) return;
    saveState();
    syncMorningStar(name);
  }
  function resetKid(name) {
    if (page === 'kids' && !schoolMorning(morningParts())) return;
    var now = Date.now();
    if (!resetArm[name] || now - resetArm[name] > 5000) {
      resetArm[name] = now;
      render();
      return;
    }
    delete resetArm[name];
    if (TEST_MORNING) {
      testKids[name] = { checks: {} };
      return;
    }
    state.kids[name] = { checks: {} };
    saveState();
  }
  function toggleChore(name, group, id) {
    if (group === 'morning') { toggleMorning(name, id); return; }
    var ymd = currentYmd();
    var on = !choreDone(name, id, ymd);
    setChoreDone(name, id, on, ymd);
    saveHub();
    var task = choresOf(name, group).filter(function (t) { return t.id === id; })[0];
    setChoreStar(name, id, on, task ? task.label : 'Chore');
  }
  function addIngredients(text) {
    var n = 0;
    String(text || '').split(',').forEach(function (part) {
      var t = part.replace(/^\s+|\s+$/g, '');
      if (!t) return;
      var exists = (hub.aldi || []).some(function (item) { return item.text.toLowerCase() === t.toLowerCase() && !item.done; });
      if (exists) return;
      hub.aldi.push({ id: uid('a'), text: t, section: guessSection(t), done: false });
      n++;
    });
    if (n) saveHub();
    return n;
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '') : '';
  }
  function submitPin(digit) {
    if (pinLockUntil && Date.now() < pinLockUntil) return;
    if (digit === 'back') pinBuf = pinBuf.slice(0, -1);
    else {
      if (pinBuf.length >= 4) return;
      pinBuf += digit;
    }
    if (pinBuf.length < 4) { render(); return; }
    var mode = (pinFlow && pinFlow.mode) || (hub.pin ? 'unlock' : 'create');
    if (mode === 'unlock' || mode === 'change-old') {
      if (pinBuf === hub.pin) {
        pinFails = 0;
        if (mode === 'change-old') { pinFlow = { mode: 'create' }; pinBuf = ''; toast('Choose a new PIN'); }
        else { parentOn = true; pinFlow = null; pinBuf = ''; toast('Parent mode is on'); }
      } else {
        pinFails++;
        pinBuf = '';
        if (pinFails >= 5) { pinLockUntil = Date.now() + 30000; pinFails = 0; }
        toast('That PIN did not match');
      }
    } else if (mode === 'create') {
      pinFlow = { mode: 'confirm', first: pinBuf };
      pinBuf = '';
    } else if (mode === 'confirm') {
      if (pinBuf === pinFlow.first) {
        hub.pin = pinBuf;
        saveHub();
        parentOn = true;
        pinFlow = null;
        pinBuf = '';
        toast('Parent PIN saved');
      } else {
        pinFlow = { mode: 'create' };
        pinBuf = '';
        toast('Those did not match. Try again.');
      }
    }
    render();
  }
  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result || ''));
        var next = data && data.hub ? data.hub : data;
        if (!next || !next.chores || !next.stars) throw new Error('shape');
        hub = next;
        ensureHubShape();
        saveHub();
        if (data && data.morning && data.morning.kids) {
          state = data.morning;
          if (!state.history) state.history = {};
          if (!state.chimed) state.chimed = {};
          if (!state.kids) state.kids = {};
          saveState();
          ensureToday(currentYmd());
        }
        toast('Imported family data');
        closeOverlay();
        render();
      } catch (e) { toast('That file is not a family backup'); }
    };
    reader.readAsText(file);
  }
  function exportHub() {
    var payload = { kind: 'knapp-hub', version: 1, exportedAt: new Date().toISOString(), hub: hub, morning: state };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'knapp-family-hub.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function restoreDefaults() {
    var pin = hub.pin;
    var stars = hub.stars;
    var starLog = hub.starLog;
    var awarded = hub.awarded;
    hub = defaultHub();
    hub.pin = pin;
    hub.stars = stars;
    hub.starLog = starLog;
    hub.awarded = awarded;
    saveHub();
    toast('Starter lists are back. Stars stayed.');
  }
  function needParent() {
    if (parentOn) return true;
    toast('A parent PIN is needed for that');
    pinFlow = { mode: hub.pin ? 'unlock' : 'create' };
    go('playroom');
    playTab = 'parent';
    render();
    return false;
  }

  function onClick(e) {
    if (soundOn) unlockAudio();
    requestWake();
    var node = e.target;
    if (node && node.nodeType !== 1) node = node.parentNode;
    if (node && node.id === 'overlay') { closeOverlay(); return; }
    var actEl = null;
    var walk = node;
    while (walk && walk !== document) {
      if (walk.getAttribute && walk.getAttribute('data-act')) { actEl = walk; break; }
      walk = walk.parentNode;
    }
    if (!actEl) return;
    var act = actEl.getAttribute('data-act');
    var id = actEl.getAttribute('data-id') || '';
    var kid = actEl.getAttribute('data-kid') || '';
    markFocus(actEl);
    if (act === 'nav') { closeOverlay(); go(id === 'morning' ? 'kids' : id); return; }
    if (act === 'aft-in') { aftPunchIn(kid); render(); return; }
    if (act === 'aft-land') { aftLand(kid); render(); return; }
    if (act === 'aft-check') { aftToggle(kid, id); render(); return; }
    if (act === 'aft-easy') { aftEasy(kid, +id); render(); return; }
    if (act === 'aft-undo') { aftUndo(kid); render(); return; }
    if (act === 'wake') { go(lastPage || 'home'); return; }
    if (act === 'close') { closeOverlay(); return; }
    if (act === 'sound') {
      if (!soundOn) enableSound();
      else { unlockAudio(); paintSound(); requestWake(); }
      return;
    }
    if (act === 'settings') { openOverlay({ type: 'settings' }); return; }
    if (act === 'bell') { openOverlay({ type: 'bell' }); return; }
    if (act === 'quick') { openOverlay({ type: 'quick' }); return; }
    if (act === 'voice') { startVoice(); return; }
    if (act === 'note') { openOverlay({ type: 'note' }); return; }
    if (act === 'note-save') { hub.note = val('noteText'); saveHub(); closeOverlay(); render(); return; }
    if (act === 'calview') { calView = id; render(); return; }
    if (act === 'calshift') { shiftAnchor(+id); render(); return; }
    if (act === 'caltoday') { calAnchor = currentYmd(); render(); return; }
    if (act === 'openday') { calAnchor = id; calView = 'day'; render(); return; }
    if (act === 'filter-kid') { kidOn[id] = !kidOn[id]; render(); return; }
    if (act === 'event') { openOverlay({ type: 'event', key: actEl.getAttribute('data-key') }); return; }
    if (act === 'checkin') { checkIn(kid); render(); return; }
    if (act === 'toggle') { toggleMorning(kid, id); render(); return; }
    if (act === 'reset') { resetKid(kid); render(); return; }
    if (act === 'playkid') { playKid = id; render(); return; }
    if (act === 'playtab') { playTab = id; if (id === 'parent' && !pinFlow) pinFlow = { mode: hub.pin ? 'unlock' : 'create' }; render(); return; }
    if (act === 'playgroup') { playGroup = id; render(); return; }
    if (act === 'chore') { toggleChore(kid, actEl.getAttribute('data-group') || playGroup, id); render(); return; }
    if (act === 'joke') { jokeOpenFor = currentYmd(); render(); return; }
    if (act === 'kind') {
      hub.kindness = (hub.kindness || 0) + 1;
      if (hub.kindness >= 20) {
        hub.kindness = 0;
        KIDS.forEach(function (name) { addStars(name, 2, 'Kindness jar'); });
        toast('The kindness jar is full. Everyone gets 2 stars.');
      } else toast('Kindness jar · ' + hub.kindness + ' of 20');
      saveHub();
      render();
      return;
    }
    if (act === 'thanks' || act === 'swap') { openOverlay({ type: act }); return; }
    if (act === 'note-send') {
      var text = val('noteBody').replace(/^\s+|\s+$/g, '');
      if (!text) { toast('Write a short note first'); return; }
      hub.notes.unshift({ id: uid('n'), from: val('noteFrom'), to: val('noteTo'), text: text, ymd: currentYmd(), kind: id });
      hub.notes = hub.notes.slice(0, 40);
      saveHub();
      toast(id === 'swap' ? 'Swap note saved' : 'Note sent');
      closeOverlay();
      render();
      return;
    }
    if (act === 'ask') {
      var reward = (hub.rewards || []).filter(function (r) { return r.id === id; })[0];
      if (!reward) return;
      if ((hub.stars[kid] || 0) < reward.cost) { toast('Not enough stars yet'); return; }
      hub.redemptions.unshift({ id: uid('rd'), kid: kid, rewardId: reward.id, title: reward.title, cost: reward.cost, status: 'pending', ymd: currentYmd() });
      saveHub();
      toast(kid + ' asked for ' + reward.title);
      render();
      return;
    }
    if (act === 'approve') {
      if (!parentOn) { needParent(); return; }
      var red = (hub.redemptions || []).filter(function (r) { return r.id === id; })[0];
      if (!red) return;
      if ((hub.stars[red.kid] || 0) < red.cost) { toast('Not enough stars right now'); return; }
      addStars(red.kid, -red.cost, 'Redeemed ' + red.title);
      red.status = 'approved';
      saveHub();
      toast('Approved');
      render();
      return;
    }
    if (act === 'decline') {
      if (!parentOn) { needParent(); return; }
      (hub.redemptions || []).forEach(function (r) { if (r.id === id) r.status = 'declined'; });
      saveHub();
      render();
      return;
    }
    if (act === 'star') {
      if (!parentOn) return;
      var delta = +id;
      if (addStars(kid, delta, delta > 0 ? 'Parent added a star' : 'Parent adjusted stars')) toast('Stars updated');
      render();
      return;
    }
    if (act === 'pin') { submitPin(id); return; }
    if (act === 'parent-lock') { parentOn = false; pinFlow = { mode: hub.pin ? 'unlock' : 'create' }; toast('Parent mode locked'); render(); return; }
    if (act === 'chore-add') {
      var label = val('newChore').replace(/^\s+|\s+$/g, '');
      if (!label) return;
      var g = actEl.getAttribute('data-group');
      hub.chores[kid][g].push({ id: uid('c'), label: label });
      saveHub();
      render();
      return;
    }
    if (act === 'chore-del') {
      var grp = actEl.getAttribute('data-group');
      hub.chores[kid][grp] = choresOf(kid, grp).filter(function (t) { return t.id !== id; });
      saveHub();
      render();
      return;
    }
    if (act === 'stick') {
      var placed = hub.placed || (hub.placed = []);
      placed.push({ pid: uid('st'), id: id, kid: playKid, x: 8 + Math.round(Math.random() * 70), y: 8 + Math.round(Math.random() * 60) });
      saveHub();
      render();
      return;
    }
    if (act === 'unstick') {
      hub.placed = (hub.placed || []).filter(function (s) { return s.pid !== id; });
      saveHub();
      render();
      return;
    }
    if (act === 'add-reward') { if (parentOn) openOverlay({ type: 'reward' }); return; }
    if (act === 'reward-save') {
      var cost = parseInt(val('rwCost'), 10);
      if (!val('rwTitle') || !cost) { toast('Name and a star price'); return; }
      hub.rewards.push({ id: uid('rw'), title: val('rwTitle'), cost: cost, emoji: val('rwEmoji') || '⭐' });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'meal-aldi') {
      var meal = hub.meals[actEl.getAttribute('data-day')];
      var n = meal ? addIngredients(meal.ingredients) : 0;
      toast(n ? 'Added ' + n + ' to the Aldi list' : 'Those items are already on the list');
      render();
      return;
    }
    if (act === 'week-aldi') {
      var total = 0;
      Object.keys(hub.meals).forEach(function (k) { total += addIngredients(hub.meals[k].ingredients); });
      toast(total ? 'Added ' + total + ' ingredients' : 'The list already has them');
      render();
      return;
    }
    if (act === 'meal-clear') {
      var day = actEl.getAttribute('data-day');
      askConfirm('Clear ' + day + '?', function () {
        hub.meals[day] = { title: '', side: '', ingredients: '' };
        saveHub();
      });
      return;
    }
    if (act === 'meal-edit') { openOverlay({ type: 'meal', day: actEl.getAttribute('data-day') }); return; }
    if (act === 'meal-save') {
      var dkey = actEl.getAttribute('data-day');
      var previous = hub.meals[dkey] || {};
      hub.meals[dkey] = { title: val('mTitle'), side: val('mSide'), ingredients: val('mIng') };
      if (previous.recipe && previous.title === hub.meals[dkey].title) hub.meals[dkey].recipe = previous.recipe;
      rememberMeal(hub.meals[dkey]);
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'recent') {
      var rec = hub.recentMeals[+id];
      if (!rec) return;
      var key = weekdayKey(currentYmd());
      hub.meals[key] = { title: rec.title, side: rec.side || '', ingredients: rec.ingredients || '' };
      saveHub();
      toast('Put on today');
      render();
      return;
    }
    if (act === 'kadd') {
      var add = (+id) * 60000;
      if (kitchen.running) kitchen.endAt += add;
      else {
        kitchen.left += add;
        kitchen.running = true;
        kitchen.endAt = Date.now() + kitchen.left;
        kitchen.justDone = false;
        kitchenRang = false;
      }
      paintKitchen();
      return;
    }
    if (act === 'kstop') {
      kitchen.running = false;
      kitchen.left = 0;
      kitchen.endAt = 0;
      kitchen.justDone = false;
      paintKitchen();
      return;
    }
    if (act === 'aldi-add') {
      var text = val('aldiText').replace(/^\s+|\s+$/g, '');
      if (!text) return;
      hub.aldi.push({ id: uid('a'), text: text, section: val('aldiSection') || 'Other', done: false });
      saveHub();
      render();
      return;
    }
    if (act === 'add-list') {
      var name = val('newListName').replace(/^\s+|\s+$/g, '');
      if (!name) return;
      hub.lists.push({ id: uid('l'), name: name, items: [] });
      saveHub();
      render();
      return;
    }
    if (act === 'list-add') {
      var list = (hub.lists || []).filter(function (l) { return l.id === id; })[0];
      var itemText = val('li-' + id).replace(/^\s+|\s+$/g, '');
      if (!list || !itemText) return;
      list.items.push({ id: uid('i'), text: itemText, done: false });
      saveHub();
      render();
      return;
    }
    if (act === 'list-del') {
      askConfirm('Delete this list?', function () { hub.lists = hub.lists.filter(function (l) { return l.id !== id; }); saveHub(); });
      return;
    }
    if (act === 'house-done') {
      (hub.house || []).forEach(function (task) {
        if (task.id !== id) return;
        task.doneOn = houseDue(task, currentYmd()) ? currentYmd() : '';
      });
      saveHub();
      render();
      return;
    }
    if (act === 'house-del') { askConfirm('Remove this reminder?', function () { hub.house = hub.house.filter(function (t) { return t.id !== id; }); saveHub(); }); return; }
    if (act === 'add-house') { openOverlay({ type: 'house' }); return; }
    if (act === 'house-save') {
      if (!val('hTitle')) return;
      hub.house.push({ id: uid('h'), title: val('hTitle'), detail: val('hDetail'), cadence: val('hCadence') || 'daily', doneOn: '' });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'add-sport') { openOverlay({ type: 'sport' }); return; }
    if (act === 'sport-save') {
      if (!val('spTitle')) return;
      hub.sports.push({ id: uid('s'), kid: val('spKid') || 'West', title: val('spTitle'), day: val('spDay'), time: val('spTime'), place: val('spPlace'), bring: val('spBring'), notes: '' });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'sport-del') { askConfirm('Remove this activity?', function () { hub.sports = hub.sports.filter(function (s) { return s.id !== id; }); saveHub(); }); return; }
    if (act === 'spice-toggle') {
      (hub.pantry || []).forEach(function (item) { if (item.id === id) item.low = !item.low; });
      saveHub();
      render();
      return;
    }
    if (act === 'spice-add') {
      var spice = val('spiceName').replace(/^\s+|\s+$/g, '');
      if (!spice) return;
      hub.pantry.push({ id: uid('p'), name: spice, low: false });
      saveHub();
      render();
      return;
    }
    if (act === 'add-recipe') { openOverlay({ type: 'recipe' }); return; }
    if (act === 'recipe-save') {
      if (!val('rcTitle')) return;
      hub.recipes.push({ id: uid('r'), title: val('rcTitle'), ingredients: val('rcIng'), steps: val('rcSteps') });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'recipe-del') { askConfirm('Remove this recipe?', function () { hub.recipes = hub.recipes.filter(function (r) { return r.id !== id; }); saveHub(); }); return; }
    if (act === 'add-date') { openOverlay({ type: 'dateidea' }); return; }
    if (act === 'date-save') {
      if (!val('dtTitle')) return;
      hub.dates.push({ id: uid('d'), title: val('dtTitle'), detail: val('dtDetail'), planned: false });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'plan-date') {
      (hub.dates || []).forEach(function (d) { d.planned = d.id === id ? !d.planned : false; });
      saveHub();
      render();
      return;
    }
    if (act === 'date-del') { askConfirm('Remove this idea?', function () { hub.dates = hub.dates.filter(function (d) { return d.id !== id; }); saveHub(); }); return; }
    if (act === 'quick-save') {
      var title = val('qaTitle').replace(/^\s+|\s+$/g, '');
      if (!title) { toast('Add a title'); return; }
      var who = [];
      var boxes = document.querySelectorAll('.qa-who');
      for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) who.push(boxes[i].value);
      var allDay = document.getElementById('qaAll') && document.getElementById('qaAll').checked;
      hub.localEvents.push({
        id: uid('ev'), ymd: val('qaDate') || currentYmd(), title: title,
        time: allDay ? '' : val('qaStart'), end: allDay ? '' : val('qaEnd'),
        allDay: !!allDay, who: who.length ? who : KIDS.slice(), kind: val('qaKind') || 'local',
        notes: val('qaNotes'), local: true
      });
      saveHub();
      toast('Added on this device');
      closeOverlay();
      go('calendar');
      return;
    }
    if (act === 'local-del') {
      hub.localEvents = (hub.localEvents || []).filter(function (ev) { return ev.id !== id; });
      saveHub();
      closeOverlay();
      render();
      return;
    }
    if (act === 'lock-cal') { clearCache(); DATA = null; calMode = 'locked'; toast('Calendar locked on this device'); closeOverlay(); render(); return; }
    if (act === 'open-pin') { pinFlow = { mode: hub.pin ? 'unlock' : 'create' }; go('playroom'); playTab = 'parent'; render(); return; }
    if (act === 'change-pin') {
      if (!parentOn) return;
      pinFlow = { mode: 'change-old' };
      playTab = 'parent';
      go('playroom');
      return;
    }
    if (act === 'export') { if (needParent()) exportHub(); return; }
    if (act === 'restore') {
      if (!parentOn) { needParent(); return; }
      askConfirm('Restore starter meals, chores, and lists? Stars and the PIN stay.', restoreDefaults);
      return;
    }
    if (act === 'meals-pane') {
      mealsPane = id || 'plan';
      if ((mealsPane === 'recipe' || mealsPane === 'cook') && openSlug && !RECIPE_FULL[openSlug]) {
        withRecipe(openSlug, function () { if (page !== 'meals') go('meals'); else render(); });
        return;
      }
      if (page !== 'meals') go('meals');
      else render();
      return;
    }
    if (act === 'open-recipe') {
      openSlug = id;
      withRecipe(id, function (data) {
        serveNow = data.servings || 1;
        cookIndex = 0;
        mealsPane = 'recipe';
        if (page !== 'meals') go('meals');
        else render();
      });
      return;
    }
    if (act === 'recipe-tag') { recipeTag = id || 'All'; render(); return; }
    if (act === 'servings') {
      var currentRecipe = RECIPE_FULL[openSlug];
      var nextServings = (serveNow || 1) + (+id || 0);
      if (nextServings < 1) nextServings = 1;
      serveNow = nextServings;
      if (currentRecipe) render();
      return;
    }
    if (act === 'recipe-aldi') {
      var toList = RECIPE_FULL[openSlug];
      if (!toList) return;
      var added = 0;
      var factor = scaleFactor(toList);
      toList.ingredients.forEach(function (ing) {
        var text = formatIng(ing, factor);
        var exists = (hub.aldi || []).some(function (item) { return !item.done && item.text.toLowerCase() === text.toLowerCase(); });
        if (exists) return;
        hub.aldi.push({ id: uid('a'), text: text, section: ing.section || 'Other', done: false });
        added += 1;
      });
      saveHub();
      toast(added ? 'Added ' + added + ' to the Aldi list' : 'Those ingredients are already on the list');
      mealsPane = 'plan';
      render();
      return;
    }
    if (act === 'recipe-day') {
      var planned = RECIPE_FULL[openSlug];
      if (!planned) return;
      var factorDay = scaleFactor(planned);
      var lines = planned.ingredients.map(function (ing) { return formatIng(ing, factorDay); });
      hub.meals[id] = { title: planned.title, side: (planned.tags && planned.tags[0]) || '', ingredients: lines.join(', '), recipe: planned.slug };
      rememberMeal(hub.meals[id]);
      saveHub();
      toast('On ' + id);
      mealsPane = 'plan';
      render();
      return;
    }
    if (act === 'cook-prev') { if (cookIndex > 0) cookIndex -= 1; render(); return; }
    if (act === 'cook-next') {
      var cooking = RECIPE_FULL[openSlug];
      if (cooking && cookIndex < cooking.steps.length - 1) cookIndex += 1;
      render();
      return;
    }
    if (act === 'cook-timer') {
      var mins = +id || 0;
      if (mins > 0) {
        kitchen.left = mins * 60000;
        kitchen.running = true;
        kitchen.endAt = Date.now() + kitchen.left;
        kitchen.justDone = false;
        kitchenRang = false;
        paintKitchen();
        toast('Timer set for ' + mins + ' min');
      }
      return;
    }
    if (act === 'confirm-yes') {
      var fn = pendingConfirm;
      pendingConfirm = null;
      closeOverlay();
      if (fn) fn();
      render();
      return;
    }
  }
  function onChange(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var act = t.getAttribute('data-act');
    if (act === 'aldi-toggle') {
      (hub.aldi || []).forEach(function (item) { if (item.id === t.getAttribute('data-id')) item.done = t.checked; });
      saveHub();
    } else if (act === 'list-toggle') {
      var list = (hub.lists || []).filter(function (l) { return l.id === t.getAttribute('data-list'); })[0];
      if (!list) return;
      (list.items || []).forEach(function (item) { if (item.id === t.getAttribute('data-id')) item.done = t.checked; });
      saveHub();
    }
  }
  function onFocusOut(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (t.getAttribute('data-act') !== 'chore-label') return;
    var kidName = t.getAttribute('data-kid');
    var group = t.getAttribute('data-group');
    var cid = t.getAttribute('data-id');
    choresOf(kidName, group).forEach(function (task) { if (task.id === cid) task.label = t.value; });
    saveHub();
  }

  function tick() {
    var p = nowParts();
    var mp = morningParts();
    if (!TEST_MORNING && state.date !== p.ymd) {
      ensureToday(p.ymd);
      render();
    } else if ((page === 'home' || page === 'kids') && !overlay && (schoolMorning(mp) !== morningLive || (page === 'kids' && kidsShown !== kidsMode(mp)))) {
      render();
    }
    setText('clockTime', fmtClock(p));
    paintCountdown(mp);
    paintElapsed();
    paintKitchen();
    if (page === 'sleep') paintSleep(p);
    maybeChime(mp);
    maybeReload(p);
  }

  try { localStorage.removeItem('knappUnlocked'); } catch (e) {}
  try { soundOn = localStorage.getItem(SOUND_KEY) === '1'; } catch (e2) {}
  try {
    var savedWx = localStorage.getItem(WX_KEY);
    if (savedWx) WX = JSON.parse(savedWx);
  } catch (e3) {}
  loadState();
  loadHub();
  ensureToday(currentYmd());
  calAnchor = currentYmd();
  page = pageFromHash();
  if (!location.hash && (Q.view === 'morning' || Q.view === 'kids')) page = 'kids';
  render();
  loadToday();
  loadRecipeIndex();
  fetchWeather();
  requestWake();
  setInterval(tick, 1000);
  setInterval(loadToday, 15 * 60 * 1000);
  setInterval(fetchWeather, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { requestWake(); tick(); }
  });
  document.addEventListener('click', onClick);
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || t.id !== 'recipeSearch') return;
    recipeQuery = t.value;
    var grid = document.getElementById('recipeGrid');
    if (grid) grid.innerHTML = recipeCardsHtml();
  });
  document.addEventListener('change', onChange);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form && form.getAttribute && form.getAttribute('data-act') === 'unlock') {
      e.preventDefault();
      unlockWith(val('pw'));
    } else e.preventDefault();
  });
  window.addEventListener('hashchange', function () {
    var next = pageFromHash();
    if (next !== page) { page = next; render(); }
  });
  var swipe = null;
  document.addEventListener('touchstart', function (e) {
    if (soundOn) unlockAudio();
    requestWake();
    if (!e.changedTouches || !e.changedTouches[0]) return;
    swipe = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!swipe || page !== 'calendar' || !e.changedTouches || !e.changedTouches[0]) { swipe = null; return; }
    var dx = e.changedTouches[0].clientX - swipe.x;
    var dy = e.changedTouches[0].clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      shiftAnchor(dx < 0 ? 1 : -1);
      render();
    }
  }, { passive: true });
})();




