#!/usr/bin/env node
/**
 * Build data/today.json for the Knapp morning wall.
 *
 * Default (GitHub Actions): read ICAL_WEST, ICAL_JACK, ICAL_JUNE, ICAL_FAMILY
 * and DASH_PASSWORD from the environment, fetch those secret iCal URLs, keep
 * today's Europe/Berlin events, and write an AES-GCM encrypted JSON file.
 * If the password or every calendar URL is missing, exit 0 and leave the
 * file alone so the workflow stays quiet.
 *
 *   node scripts/build-today.mjs --from plain.json [--password secret] [--sample]
 *   node scripts/build-today.mjs --self-test
 *
 * Never prints event titles or secret URLs. Never writes plaintext calendars.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ITER = 200000;
const KIDS = ['West', 'Jack', 'June'];
const EMAILS = {
  'westcameronknapp@gmail.com': 'West',
  'jackmichaelknapp@gmail.com': 'Jack',
  'junelorraineknapp@gmail.com': 'June'
};
const HW_PREFIXES = ['hausaufgabe', 'homework', 'ha:', 'test', 'probe', 'schulaufgabe'];
const DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function pad2(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}

function ymdOf(y, mo, d) {
  return y + '-' + pad2(mo) + '-' + pad2(d);
}

function parseYmd(ymd) {
  const p = ymd.split('-');
  return { y: +p[0], m: +p[1], d: +p[2] };
}

function ymdToUtc(ymd) {
  const p = parseYmd(ymd);
  return Date.UTC(p.y, p.m - 1, p.d);
}

function daysBetween(a, b) {
  return Math.round((ymdToUtc(b) - ymdToUtc(a)) / 86400000);
}

function addDays(ymd, n) {
  const dt = new Date(ymdToUtc(ymd));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.getUTCFullYear() + '-' + pad2(dt.getUTCMonth() + 1) + '-' + pad2(dt.getUTCDate());
}

function weekday(ymd) {
  return new Date(ymdToUtc(ymd)).getUTCDay();
}

function mondayOf(ymd) {
  const w = weekday(ymd);
  const delta = w === 0 ? -6 : 1 - w;
  return addDays(ymd, delta);
}

function berlinWallFromDate(date) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  const o = {};
  fmt.formatToParts(date).forEach((p) => { o[p.type] = p.value; });
  if (o.hour === '24') o.hour = '00';
  return { ymd: o.year + '-' + o.month + '-' + o.day, time: o.hour + ':' + o.minute };
}

export function berlinToday(date = new Date()) {
  return berlinWallFromDate(date).ymd;
}

function wallToUtcMs(y, mo, d, h, mi, s, timeZone) {
  const want = Date.UTC(y, mo - 1, d, h, mi, s);
  let utc = want;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  for (let i = 0; i < 4; i++) {
    const parts = {};
    fmt.formatToParts(new Date(utc)).forEach((p) => { parts[p.type] = p.value; });
    if (parts.hour === '24') parts.hour = '00';
    const got = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    if (got === want) return utc;
    utc += want - got;
  }
  return utc;
}

function cleanParam(v) {
  if (!v) return v;
  let s = String(v).trim();
  if (s.charAt(0) === '"') s = s.replace(/^"|"$/g, '');
  return s;
}

function parseIcsDate(value, params) {
  const v = String(value || '').trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const allDay = (params && String(params.VALUE || '').toUpperCase() === 'DATE') || m[4] == null;
  return {
    y: +m[1], mo: +m[2], d: +m[3],
    h: m[4] != null ? +m[4] : 0,
    mi: m[5] != null ? +m[5] : 0,
    s: m[6] != null ? +m[6] : 0,
    z: m[7] === 'Z',
    allDay,
    tzid: params && params.TZID ? cleanParam(params.TZID) : null
  };
}

function toBerlin(dt) {
  if (!dt) return null;
  if (dt.allDay) return { ymd: ymdOf(dt.y, dt.mo, dt.d), time: '', allDay: true };
  const zone = dt.z ? 'UTC' : (dt.tzid || 'Europe/Berlin');
  if (zone === 'Europe/Berlin') {
    return { ymd: ymdOf(dt.y, dt.mo, dt.d), time: pad2(dt.h) + ':' + pad2(dt.mi), allDay: false };
  }
  const ms = wallToUtcMs(dt.y, dt.mo, dt.d, dt.h || 0, dt.mi || 0, dt.s || 0, zone);
  const b = berlinWallFromDate(new Date(ms));
  return { ymd: b.ymd, time: b.time, allDay: false };
}

function unescapeText(s) {
  return String(s)
    .replace(/\\n/gi, '\n')
    .replace(/\\N/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function unfold(text) {
  return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
}

export function parseIcs(text) {
  const lines = unfold(text).split('\n');
  const events = [];
  let cur = null;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!cur && (line === 'BEGIN:VEVENT' || line === 'BEGIN:VTODO')) {
      cur = { type: line.slice(6), props: {} };
      depth = 1;
      continue;
    }
    if (!cur) continue;
    if (line.indexOf('BEGIN:') === 0) { depth += 1; continue; }
    if (line.indexOf('END:') === 0) {
      depth -= 1;
      if (depth <= 0) {
        events.push(normalizeEvent(cur));
        cur = null;
        depth = 0;
      }
      continue;
    }
    if (depth !== 1 || !line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const left = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const bits = left.split(';');
    const name = bits[0].toUpperCase();
    const params = {};
    for (let p = 1; p < bits.length; p++) {
      const eq = bits[p].indexOf('=');
      if (eq > 0) params[bits[p].slice(0, eq).toUpperCase()] = bits[p].slice(eq + 1);
    }
    if (!cur.props[name]) cur.props[name] = [];
    cur.props[name].push({ params, value });
  }
  return events;
}

function firstProp(props, name) {
  const list = props[name];
  return list && list.length ? list[0] : null;
}

function joinedText(props, name) {
  const list = props[name] || [];
  return unescapeText(list.map((x) => x.value).join('\n'));
}

function parseRrule(value) {
  const rule = { freq: '', interval: 1, byday: [], count: null, untilYmd: null };
  String(value || '').split(';').forEach((part) => {
    const eq = part.indexOf('=');
    if (eq < 0) return;
    const k = part.slice(0, eq).toUpperCase();
    const v = part.slice(eq + 1);
    if (k === 'FREQ') rule.freq = v.toUpperCase();
    else if (k === 'INTERVAL') rule.interval = Math.max(1, parseInt(v, 10) || 1);
    else if (k === 'COUNT') rule.count = parseInt(v, 10) || null;
    else if (k === 'BYDAY') {
      rule.byday = v.split(',').map((d) => d.replace(/^[+-]?\d+/, '').trim().toUpperCase()).filter(Boolean);
    } else if (k === 'UNTIL') {
      const dt = parseIcsDate(v, {});
      const b = dt ? toBerlin(dt) : null;
      if (b) rule.untilYmd = b.ymd;
    }
  });
  return rule;
}

function collectYmds(props, name) {
  const out = [];
  const list = props[name] || [];
  for (let i = 0; i < list.length; i++) {
    const parts = String(list[i].value || '').split(',');
    for (let j = 0; j < parts.length; j++) {
      const dt = parseIcsDate(parts[j].trim(), list[i].params);
      const b = dt ? toBerlin(dt) : null;
      if (b) out.push(b.ymd);
    }
  }
  return out;
}

function normalizeEvent(cur) {
  const props = cur.props;
  const startRaw = firstProp(props, 'DTSTART') || firstProp(props, 'DUE');
  const endRaw = firstProp(props, 'DTEND');
  const dueRaw = firstProp(props, 'DUE');
  const start = startRaw ? toBerlin(parseIcsDate(startRaw.value, startRaw.params)) : null;
  const end = endRaw ? toBerlin(parseIcsDate(endRaw.value, endRaw.params)) : null;
  const due = dueRaw ? toBerlin(parseIcsDate(dueRaw.value, dueRaw.params)) : null;
  const rruleRaw = firstProp(props, 'RRULE');
  const attendees = [];
  (props.ATTENDEE || []).forEach((a) => {
    attendees.push(a.value);
    if (a.params && a.params.CN) attendees.push(unescapeText(cleanParam(a.params.CN)));
  });
  const status = firstProp(props, 'STATUS');
  return {
    type: cur.type,
    summary: joinedText(props, 'SUMMARY').trim(),
    description: joinedText(props, 'DESCRIPTION'),
    location: joinedText(props, 'LOCATION'),
    status: status ? String(status.value || '').toUpperCase() : '',
    startYmd: start ? start.ymd : (due ? due.ymd : ''),
    startTime: start && !start.allDay ? start.time : '',
    allDay: start ? start.allDay : true,
    endYmd: end ? end.ymd : '',
    dueYmd: due ? due.ymd : '',
    rrule: rruleRaw ? parseRrule(rruleRaw.value) : null,
    exdates: collectYmds(props, 'EXDATE'),
    attendees
  };
}

function countWeekly(start, today, byday, interval, exdates) {
  const ex = {};
  for (let i = 0; i < exdates.length; i++) ex[exdates[i]] = true;
  let n = 0;
  const origin = mondayOf(start);
  let week = origin;
  const endWeek = mondayOf(today);
  let guard = 0;
  while (week <= endWeek && guard < 2500) {
    guard += 1;
    const weeks = daysBetween(origin, week) / 7;
    if (weeks % interval === 0) {
      for (let d = 0; d < byday.length; d++) {
        const wd = DAY.indexOf(byday[d]);
        if (wd < 0) continue;
        const offset = wd === 0 ? 6 : wd - 1;
        const ymd = addDays(week, offset);
        if (ymd < start || ymd > today) continue;
        if (ex[ymd]) continue;
        n += 1;
      }
    }
    week = addDays(week, 7);
  }
  return n;
}

export function occursOn(ev, today) {
  if (!ev.startYmd) return false;
  if (ev.exdates.indexOf(today) >= 0) return false;
  if (!ev.rrule) {
    if (ev.allDay) {
      let end = ev.endYmd;
      if (!end || end <= ev.startYmd) end = addDays(ev.startYmd, 1);
      return ev.startYmd <= today && today < end;
    }
    return ev.startYmd === today;
  }
  const rule = ev.rrule;
  if (today < ev.startYmd) return false;
  if (rule.untilYmd && today > rule.untilYmd) return false;
  const interval = rule.interval || 1;
  if (rule.freq === 'DAILY') {
    const diff = daysBetween(ev.startYmd, today);
    if (diff < 0 || diff % interval !== 0) return false;
    if (rule.count && Math.floor(diff / interval) + 1 > rule.count) return false;
    return true;
  }
  if (rule.freq === 'WEEKLY') {
    const byday = rule.byday && rule.byday.length ? rule.byday : [DAY[weekday(ev.startYmd)]];
    if (byday.indexOf(DAY[weekday(today)]) < 0) return false;
    const weeks = daysBetween(mondayOf(ev.startYmd), mondayOf(today)) / 7;
    if (weeks % interval !== 0) return false;
    if (rule.count) {
      const n = countWeekly(ev.startYmd, today, byday, interval, ev.exdates);
      if (n > rule.count) return false;
    }
    return true;
  }
  if (rule.freq === 'YEARLY') {
    if (ev.startYmd.slice(5) !== today.slice(5)) return false;
    const years = +today.slice(0, 4) - +ev.startYmd.slice(0, 4);
    if (years < 0 || years % interval !== 0) return false;
    if (rule.count && Math.floor(years / interval) + 1 > rule.count) return false;
    return true;
  }
  return false;
}

function kidsFromText(text) {
  const low = String(text || '').toLowerCase();
  const found = [];
  if (/(^|[^a-z])west([^a-z]|$)/.test(low)) found.push('West');
  if (/(^|[^a-z])jack([^a-z]|$)/.test(low)) found.push('Jack');
  if (/(^|[^a-z])june([^a-z]|$)/.test(low)) found.push('June');
  return found;
}

function emailOf(value) {
  const m = String(value || '').toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+/);
  return m ? m[0] : '';
}

export function kidsForFamilyEvent(ev) {
  const blob = [ev.summary, ev.description, ev.location].concat(ev.attendees || []).join('\n');
  const found = kidsFromText(blob);
  (ev.attendees || []).forEach((a) => {
    const kid = EMAILS[emailOf(a)];
    if (kid && found.indexOf(kid) < 0) found.push(kid);
  });
  return found.length ? found : KIDS.slice();
}

function bringItems(description) {
  const items = [];
  String(description || '').split('\n').forEach((line) => {
    const m = line.match(/^\s*(bring|mitbringen)\s*:\s*(.+)$/i);
    if (!m) return;
    m[2].split(',').forEach((part) => {
      const t = part.trim();
      if (t) items.push(t.slice(0, 80));
    });
  });
  return items;
}

function isHomework(ev, today) {
  const title = String(ev.summary || '').replace(/^\s+/, '');
  const low = title.toLowerCase();
  for (let i = 0; i < HW_PREFIXES.length; i++) {
    if (low.indexOf(HW_PREFIXES[i]) === 0) return true;
  }
  if (ev.dueYmd && ev.dueYmd === today) return true;
  const blob = (title + '\n' + (ev.description || '')).toLowerCase();
  if (blob.indexOf('due today') >= 0) return true;
  if (blob.indexOf('fällig heute') >= 0 || blob.indexOf('faellig heute') >= 0) return true;
  return false;
}

function noSchoolText(ev) {
  if (!ev.allDay) return false;
  const blob = ((ev.summary || '') + '\n' + (ev.description || '')).toLowerCase();
  return blob.indexOf('ferien') >= 0 || blob.indexOf('schulfrei') >= 0 || blob.indexOf('no school') >= 0 || blob.indexOf('holiday') >= 0;
}

function dedupe(list) {
  const seen = {};
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const key = String(list[i]).trim().toLowerCase();
    if (!key || seen[key]) continue;
    seen[key] = true;
    out.push(list[i]);
  }
  return out;
}

function emptyKid() {
  return { noSchool: false, events: [], bring: [], homework: [] };
}

export function buildPayload(calendars, today) {
  const kids = { West: emptyKid(), Jack: emptyKid(), June: emptyKid() };
  (calendars || []).forEach((cal) => {
    if (!cal || !cal.text) return;
    const events = parseIcs(cal.text);
    events.forEach((ev) => {
      if (ev.status === 'CANCELLED') return;
      if (!occursOn(ev, today) && !(ev.dueYmd === today)) return;
      const targets = cal.kid === 'Family' ? kidsForFamilyEvent(ev) : [cal.kid];
      const onDay = occursOn(ev, today);
      const hw = isHomework(ev, today) && (onDay || ev.dueYmd === today);
      const brings = onDay ? bringItems(ev.description) : [];
      const schoolOff = onDay && noSchoolText(ev);
      targets.forEach((name) => {
        if (!kids[name]) return;
        const bucket = kids[name];
        if (schoolOff) bucket.noSchool = true;
        brings.forEach((b) => bucket.bring.push(b));
        if (hw && ev.summary) bucket.homework.push(ev.summary.trim().slice(0, 160));
        if (onDay && ev.summary && !(hw && ev.allDay)) {
          bucket.events.push({
            time: ev.allDay ? '' : (ev.startTime || ''),
            title: ev.summary.trim().slice(0, 140)
          });
        }
      });
    });
  });
  KIDS.forEach((name) => {
    const bucket = kids[name];
    bucket.bring = dedupe(bucket.bring);
    bucket.homework = dedupe(bucket.homework);
    const seen = {};
    bucket.events = bucket.events.filter((ev) => {
      const key = (ev.time || '') + '|' + ev.title.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).sort((a, b) => {
      if (!a.time && b.time) return -1;
      if (a.time && !b.time) return 1;
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
    });
  });
  return {
    date: today,
    generatedAt: new Date().toISOString(),
    kids
  };
}

export function encryptPayload(obj, password, iter) {
  const rounds = iter || ITER;
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(String(password), salt, rounds, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(obj), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iter: rounds,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ct: Buffer.concat([ct, tag]).toString('base64')
  };
}

function argValue(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) return '';
  return args[i + 1];
}

function writeEncrypted(filePath, payload, password, sample) {
  const wrapped = encryptPayload(payload, password);
  if (sample || payload.sample) {
    wrapped.sample = true;
    wrapped.note = 'SAMPLE DATA — example plans, not the real family calendar. The sample password is in the README. Replaced when the Today dashboard action runs with repo secrets.';
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(wrapped, null, 2) + '\n');
  return wrapped;
}

async function fetchCalendar(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'knapp-family-dashboard' }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  if (text.indexOf('BEGIN:VCALENDAR') < 0) throw new Error('not a calendar');
  return text;
}

async function buildFromNetwork(outFile) {
  const password = process.env.DASH_PASSWORD || '';
  const sources = [
    ['West', process.env.ICAL_WEST || ''],
    ['Jack', process.env.ICAL_JACK || ''],
    ['June', process.env.ICAL_JUNE || ''],
    ['Family', process.env.ICAL_FAMILY || '']
  ];
  const anyUrl = sources.some((s) => s[1]);
  if (!password || !anyUrl) {
    console.log('Skipping: ICAL_WEST / ICAL_JACK / ICAL_JUNE / ICAL_FAMILY or DASH_PASSWORD is not configured. data/today.json left unchanged.');
    return;
  }
  const calendars = [];
  let ok = 0;
  for (let i = 0; i < sources.length; i++) {
    const kid = sources[i][0];
    const url = sources[i][1];
    if (!url) {
      console.log(kid + ': no URL set, skipped');
      continue;
    }
    try {
      const text = await fetchCalendar(url);
      calendars.push({ kid, text });
      ok += 1;
      console.log(kid + ': calendar read');
    } catch (err) {
      console.log(kid + ': calendar could not be read (' + (err && err.message ? err.message : 'error') + ')');
    }
  }
  if (!ok) {
    console.log('No calendars could be read; leaving data/today.json unchanged.');
    return;
  }
  const today = berlinToday();
  const payload = buildPayload(calendars, today);
  writeEncrypted(outFile, payload, password, false);
  KIDS.forEach((name) => {
    const k = payload.kids[name];
    console.log(name + ': ' + k.events.length + ' events, ' + k.bring.length + ' bring, ' + k.homework.length + ' homework' + (k.noSchool ? ', no school' : ''));
  });
  console.log('Wrote encrypted ' + outFile + ' for ' + today);
}

function buildFromFile(from, outFile, password, sample) {
  if (!password) {
    console.error('A password is required (--password or DASH_PASSWORD).');
    process.exit(1);
  }
  const raw = fs.readFileSync(from, 'utf8');
  const payload = JSON.parse(raw);
  if (!payload || typeof payload !== 'object' || !payload.kids) {
    console.error('--from JSON must be the dashboard payload ({ date, kids }).');
    process.exit(1);
  }
  writeEncrypted(outFile, payload, password, sample);
  console.log('Wrote encrypted ' + outFile);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function decryptWithSubtle(file, password) {
  const salt = Buffer.from(file.salt, 'base64');
  const iv = Buffer.from(file.iv, 'base64');
  const ct = Buffer.from(file.ct, 'base64');
  const km = await crypto.subtle.importKey('raw', Buffer.from(password, 'utf8'), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: file.iter, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(Buffer.from(plain).toString('utf8'));
}

async function selfTest() {
  const today = '2026-10-29';
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Berlin',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:west-weekly',
    'DTSTART;TZID=Europe/Berlin:20261001T160000',
    'DTEND;TZID=Europe/Berlin:20261001T173000',
    'RRULE:FREQ=WEEKLY;BYDAY=TH',
    'SUMMARY:Football practice',
    'DESCRIPTION:Meet at the pitch.\\nBring: Football boots, shin pads',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:west-monday',
    'DTSTART;TZID=Europe/Berlin:20261005T080000',
    'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO',
    'SUMMARY:Monday choir',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:biweekly',
    'DTSTART;TZID=Europe/Berlin:20261001T090000',
    'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;COUNT=2',
    'SUMMARY:Counted club',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:until',
    'DTSTART;TZID=Europe/Berlin:20261001T100000',
    'RRULE:FREQ=WEEKLY;BYDAY=TH;UNTIL=20261022T100000Z',
    'SUMMARY:Ended club',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:ex',
    'DTSTART;TZID=Europe/Berlin:20261001T110000',
    'RRULE:FREQ=WEEKLY;BYDAY=TH',
    'EXDATE;TZID=Europe/Berlin:20261029T110000',
    'SUMMARY:Skipped today',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:hw',
    'DTSTART;VALUE=DATE:20261029',
    'SUMMARY:Homework English worksheet, due today',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:test',
    'DTSTART;TZID=Europe/Berlin:20261029T095000',
    'SUMMARY:Test: Math, 2nd period',
    'DESCRIPTION:Bring: Calculator',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:jacket',
    'DTSTART;VALUE=DATE:20261029',
    'SUMMARY:Rain jacket needed',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const family = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261102',
    'DTEND;VALUE=DATE:20261107',
    'SUMMARY:Herbstferien',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261029',
    'SUMMARY:Dentist for West and June',
    'DESCRIPTION:Mitbringen: Insurance card',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;TZID=Europe/Berlin:20261029T150000',
    'SUMMARY:Pickup',
    'ATTENDEE;CN=June Knapp:mailto:junelorraineknapp@gmail.com',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;TZID=Europe/Berlin:20261029T180000',
    'SUMMARY:Jack only via email',
    'ATTENDEE:mailto:jackmichaelknapp@gmail.com',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261029',
    'SUMMARY:Family dinner',
    'END:VEVENT',
    'BEGIN:VTODO',
    'DUE;VALUE=DATE:20261029',
    'SUMMARY:Reading log signed',
    'END:VTODO',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261029',
    'SUMMARY:schulfrei for Jack',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const westEvents = parseIcs(ics);
  assert(westEvents.length === 8, 'parsed west events, got ' + westEvents.length);
  const payload = buildPayload([
    { kid: 'West', text: ics },
    { kid: 'Family', text: family }
  ], today);

  const west = payload.kids.West;
  const titles = west.events.map((e) => e.title);
  assert(titles.indexOf('Football practice') >= 0, 'weekly Thursday football');
  assert(titles.indexOf('Monday choir') < 0, 'Monday event skipped on Thursday');
  assert(titles.indexOf('Counted club') < 0, 'COUNT=2 excludes the third Thursday');
  assert(titles.indexOf('Ended club') < 0, 'UNTIL excludes Oct 29');
  assert(titles.indexOf('Skipped today') < 0, 'EXDATE excludes today');
  assert(titles.indexOf('Test: Math, 2nd period') >= 0, 'timed test stays on today list');
  const testEv = west.events.filter((e) => e.title.indexOf('Test:') === 0)[0];
  assert(testEv && testEv.time === '09:50', 'Berlin wall time kept');
  assert(west.homework.indexOf('Homework English worksheet, due today') >= 0, 'homework prefix');
  assert(west.homework.indexOf('Test: Math, 2nd period') >= 0, 'timed test also homework');
  assert(west.bring.indexOf('Football boots') >= 0 && west.bring.indexOf('shin pads') >= 0, 'Bring line');
  assert(west.bring.indexOf('Calculator') >= 0, 'Bring from test');
  assert(west.bring.indexOf('Insurance card') >= 0, 'Mitbringen from family event');
  assert(titles.indexOf('Dentist for West and June') >= 0, 'family event named West');
  assert(titles.indexOf('Rain jacket needed') >= 0, 'jacket is not a kid name, family-less personal event stays');
  assert(west.events.some((e) => e.title === 'Family dinner'), 'unnamed family event goes to all');
  assert(payload.kids.Jack.events.some((e) => e.title === 'Jack only via email'), 'attendee email routes to Jack');
  assert(!payload.kids.West.events.some((e) => e.title === 'Jack only via email'), 'email event not given to West');
  assert(!payload.kids.Jack.events.some((e) => e.title === 'Dentist for West and June'), 'named event stays off Jack');
  assert(payload.kids.June.events.some((e) => e.title === 'Pickup' && e.time === '15:00'), 'June attendee');
  assert(payload.kids.June.homework.indexOf('Reading log signed') >= 0, 'VTODO due today');
  assert(payload.kids.Jack.noSchool === true, 'schulfrei marks Jack');
  assert(payload.kids.West.noSchool === false, 'Jack-only schulfrei does not mark West');

  const ferienDay = buildPayload([{ kid: 'Family', text: family }], '2026-11-04');
  assert(ferienDay.kids.West.noSchool && ferienDay.kids.June.noSchool, 'multi-day Herbstferien is no school');
  assert(ferienDay.kids.West.events.some((e) => e.title === 'Herbstferien'), 'ferien event listed');
  const after = buildPayload([{ kid: 'Family', text: family }], '2026-11-07');
  assert(after.kids.West.noSchool === false, 'DTEND is exclusive');

  const utcIcs = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20261029T050000Z',
    'SUMMARY:UTC morning',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  const utcPayload = buildPayload([{ kid: 'Jack', text: utcIcs }], today);
  assert(utcPayload.kids.Jack.events[0].time === '06:00', 'UTC converted to Berlin CET (UTC+1) on 29 Oct 2026');

  const password = 'knapp-sample';
  const wrapped = encryptPayload({ date: today, kids: payload.kids }, password);
  assert(wrapped.iter >= 200000, 'iterations');
  assert(wrapped.salt && wrapped.iv && wrapped.ct, 'salt iv ct');
  const round = await decryptWithSubtle(wrapped, password);
  assert(round.date === today, 'roundtrip date');
  assert(round.kids.West.bring.indexOf('Calculator') >= 0, 'roundtrip bring');
  let failed = false;
  try {
    await decryptWithSubtle(wrapped, 'nope');
    failed = true;
  } catch (e) { /* expected */ }
  assert(!failed, 'wrong password rejected');

  const early = buildPayload([{
    kid: 'West',
    text: 'BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;TZID=Europe/Berlin:20261105T080000\nRRULE:FREQ=WEEKLY;BYDAY=TH\nSUMMARY:Future club\nEND:VEVENT\nEND:VCALENDAR\n'
  }], '2026-10-29');
  assert(early.kids.West.events.length === 0, 'weekly does not fire before DTSTART');

  const jacket = buildPayload([{
    kid: 'Family',
    text: 'BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:20261029\nSUMMARY:Rain jacket needed\nEND:VEVENT\nEND:VCALENDAR\n'
  }], today);
  assert(jacket.kids.West.events.length === 1 && jacket.kids.Jack.events.length === 1 && jacket.kids.June.events.length === 1, 'the word jacket is not the kid Jack');

  console.log('self-test ok');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--self-test') >= 0) {
    await selfTest();
    return;
  }
  const from = argValue(args, '--from');
  const outFile = path.resolve(argValue(args, '--out') || path.join(process.cwd(), 'data', 'today.json'));
  const sample = args.indexOf('--sample') >= 0;
  if (from) {
    const password = argValue(args, '--password') || process.env.DASH_PASSWORD || '';
    buildFromFile(from, outFile, password, sample);
    return;
  }
  await buildFromNetwork(outFile);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
}
