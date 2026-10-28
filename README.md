# Knapp family morning wall

A single static page for the living-room TV (and phones): clock, leave countdown, Bad Tölz weather, and a column each for West, Jack and June. Calendar details are encrypted in `data/today.json`. There is no build step and no framework. GitHub Pages serves this repository from the `main` branch.

Open [https://pacetheface.github.io/family-dashboard/](https://pacetheface.github.io/family-dashboard/).

## Sample data

Until the GitHub Action has run with real secrets, `data/today.json` is **sample data** (example plans, not the real day). The page shows a yellow sample banner.

Sample password: `knapp-sample`

Type it once on each device. It is remembered in that browser so the TV stays unlocked. When real secrets replace the file, the sample password stops working and the TV asks again.

## What the wall shows

- West and Jack leave at **7:10**. June leaves at **7:30**. Wake-up for the progress bar is **6:30**.
- Before 7:10 the big countdown is the boys, with “then June · 7:30” underneath. After 7:10 it switches to June.
- The countdown turns yellow, then orange, then red as the deadline gets close.
- No countdown and no ready-timers on weekends, Bavarian public holidays, or Bavarian school holidays for 2026/27 (including Herbstferien 2–6 Nov 2026, and Sommerferien 2027). An all-day calendar event containing `Ferien`, `schulfrei`, `no school` or `holiday` also marks that child off.
- Each child checks in (or ticks a task) to start their own timer. It stops when their last task is ticked. The goal is ready on time, not a race.
- Finished by **7:05** (boys) or **7:25** (June): the timer turns green with a star.
- The badge `★ 3 of 5` is on-time school mornings this week. It starts again each Monday.
- Checklists reset each morning on that device. There is no breakfast item.

Tasks: West and Jack — get dressed, brush teeth, homework done, Brotbox in bag, check the weather. Jack also has “Meds taken” first. June — get dressed, brush teeth, snack packed, weather clothes on.

## TV setup

- Open the page in the Samsung browser, or in Safari or Chrome, and leave it on the HDMI input you use in the morning.
- Use fullscreen / zoom 100% so the three columns fill a 1920×1080 screen. On a phone the columns stack and the lists stay tappable.
- Turn off the TV’s auto power-off, sleep timer and screensaver (Samsung: Settings → General → System Manager → Auto Power Off → Off). The page asks to stay awake where the browser allows it, and reloads itself once around 03:00 so the new day and the new calendar file show up.
- Tap **Enable sound** once with the remote. The TV remembers. At 15, 10 and 5 minutes before each leave time it plays a short chime and, if the browser can talk, says for example “10 minutes until West and Jack leave”. Browsers block sound until that tap.
- Enter the family password once. Clock, countdown, weather and checklists work even if the calendar is still locked.

## Calendar secrets

The morning file is built by the **Today dashboard** action (`.github/workflows/today.yml`). It runs automatically at **04:15 and 05:15 UTC** on weekdays, which is **05:15 and 06:15** Berlin time in winter (CET) and **06:15 and 07:15** in summer (CEST). It also runs when you start it by hand.

Create the secrets under **Settings → Secrets and variables → Actions → New repository secret**. Names must match exactly:

| Secret | Value |
| --- | --- |
| `ICAL_WEST` | Secret iCal URL for West’s calendar |
| `ICAL_JACK` | Secret iCal URL for Jack’s calendar |
| `ICAL_JUNE` | Secret iCal URL for June’s calendar |
| `ICAL_FAMILY` | Secret iCal URL for the family calendar |
| `DASH_PASSWORD` | Family password. This replaces the old 4-digit PIN. |

In Google Calendar: open the calendar’s settings → **Integrate calendar** → copy **Secret address in iCal format**. Do not paste those URLs into the repo, the page, or a chat. They are the only thing standing between the public site and the calendars.

`DASH_PASSWORD` is the password you type on the TV. Pick a real one before relying on the wall; the sample password is only for the example file.

If a secret is missing, the action exits quietly and leaves `data/today.json` unchanged.

### Run it by hand

1. Open the **Actions** tab.
2. Choose **Today dashboard**.
3. **Run workflow** on `main`.

A minute or two later the page picks up the new file (it refetches every 15 minutes; a reload is faster). The first time after the password changes, enter the new password on the TV.

## Bring and homework

In an event description, items to pack go on their own line, comma-separated:

```text
Bring: Calculator, Football boots
Mitbringen: Hausschuhe, Brotzeit
```

Homework is an event whose title starts with `Hausaufgabe`, `Homework`, `HA:`, `Test`, `Probe` or `Schulaufgabe`, a task due today, or text containing “due today” / “fällig heute”.

On the family calendar, an event is shown to the child named in the title or description, or invited by email:

- `westcameronknapp@gmail.com` → West
- `jackmichaelknapp@gmail.com` → Jack
- `junelorraineknapp@gmail.com` → June

If it names nobody, it is shown on all three columns. “Jacket” does not mean Jack.

An all-day event containing `Ferien`, `schulfrei`, `no school` or `holiday` turns off that child’s countdown. Put the name in the title (for example `schulfrei for June`) when only one child is off.

## Building the file yourself

`scripts/build-today.mjs` runs on Node 20 with no libraries. From the repo:

```bash
node scripts/build-today.mjs --from plain.json --password "the family password"
```

`plain.json` must already be the dashboard payload (`date`, `kids.West|Jack|June` with `events`, `bring`, `homework`, `noSchool`). Add `--sample` only for example data. The script writes encrypted `data/today.json` and does not keep the plaintext. Do not commit `plain.json`.

With the five secrets in the environment and no `--from`, the script fetches the calendars, keeps today’s Europe/Berlin events (including weekly repeating events), encrypts them, and writes the same file. That is what the action runs.
