# The Knapps

A wall display for the living room in Bad Tölz: clock, leave countdown, weather, the week, meals, chores, and the rest of the house. It is one static site. GitHub Pages serves this repository from the root of `main`. There is no framework and no package install.

Open [https://pacetheface.github.io/family-dashboard/](https://pacetheface.github.io/family-dashboard/).

Ryan is Dad. Jessica is Mom. West (born 1 Apr 2016), Jack (born 19 Mar 2018), and June (born 22 Jan 2021) show ages from those dates. Avatars are initials, not photos.

## Pages

The left rail is Home, Calendar, Playroom, Meals, House, Sports, Spice, Date, and Sleep.

- **Home** is the day: a house reminder, the weekend, today’s events, what to bring, homework, each child’s next task, tonight’s dinner, a short quote, and a 7-day forecast. On a school morning the leave countdown and the three ready-timers sit above that.
- **Calendar** is a Monday-first week (plus day and month). Tap an event for the time, who it is for, location, what to bring, and homework. Google events are read-only.
- **Playroom** is chores and stars. Morning / Weekend chores / Bedtime, then Today, Learn, Star Store, My Rewards, Stickers, My Week, and Parent. The side of the page has a joke, an animal, the moon, a kindness jar, and thank-you notes.
- **Meals** is the repeating week of dinners, the family recipe book, an Aldi list with sections, other lists, and a kitchen timer. Recipes live in `recipes/` as public JSON. See `recipes/README.md` to add one.
- **House** is household reminders such as airing the bedrooms.
- **Sports** is a starter list of activities, plus sport events from the calendar once it is unlocked.
- **Spice** is a pantry checklist and a few recipes.
- **Date** is a short list of date-night ideas for Ryan and Jessica.
- **Sleep** is a full-screen clock. Tap anywhere to come back.

The top bar has the family name, the Europe/Berlin clock, today’s high and low, notifications, settings, and Quick add. Quick add uses the microphone only when the browser has speech recognition. Otherwise it is a text field. Anything added there stays on that device.

Times are 24-hour. Temperatures are Celsius. Weather is Open-Meteo for Bad Tölz (latitude 47.76, longitude 11.56), including the 7-day strip.

## Morning routine

This is the same routine as the previous wall.

- West and Jack leave at **7:10**. June leaves at **7:30**. The progress bar starts at **6:30**.
- Before 7:10 the countdown is the boys, with “then June · 7:30” underneath. After 7:10 it switches to June.
- The countdown turns yellow, then orange, then red as the deadline gets close.
- No countdown and no ready-timers on weekends, Bavarian public holidays, or Bavarian school holidays for 2026/27 (including Herbstferien 2–6 Nov 2026, and Sommerferien 2027). An all-day calendar event containing `Ferien`, `schulfrei`, `no school`, or `holiday` also marks that child off.
- Each child checks in, or ticks a task, to start their own timer. It stops when their last morning task is ticked. The goal is ready on time, not a race.
- Finished by **7:05** (boys) or **7:25** (June): the timer turns green with a star, and that child also earns a star in the Playroom.
- The badge `★ 3 of 5 this week` counts on-time school mornings. It starts again each Monday. A short school week shows a smaller total. A missed morning is not called out anywhere else. There are no streaks.
- The morning list lives on the Playroom **Morning** tab and on the Home cards during a school morning. It resets each morning on that device. There is no breakfast item.

Seeded morning tasks, which a parent can edit:

- West and Jack — get dressed, brush teeth, homework done, Brotbox in bag, check the weather.
- Jack also has **Meds taken** first.
- June — get dressed, brush teeth, snack packed, weather clothes on.

Ticking a morning task, a weekend chore, or a bedtime chore gives one star. Unticking it the same day gives the star back, so the buttons cannot be farmed. Stars already earned on an earlier day stay put.

## Stars and parent mode

Stars are for chores and for being ready on time. The Star Store has rewards with prices. A child can ask for one. A parent approves it, and only then are the stars spent. My Week lists stars earned, chores ticked, and mornings that were on time. It does not list misses.

Parent mode is a 4-digit PIN chosen in Settings or on the Parent tab. It is stored in this browser only. It is a soft lock, not the calendar password. Parent mode can add and edit chores, set rewards, approve requests, and add or remove stars. It locks again when someone taps Lock, and a reload locks it too.

The kindness jar is shared. At 20 it pays 2 stars to each child and starts over.

## What stays on this device

Calendar events come from Google and are only shown after the family password. Everything else is local: Quick add, meals, lists, the timer, chores, stars, rewards, stickers, notes, House, Sports, Spice, and Date.

**These do not sync by themselves.** Settings → Export JSON downloads one file. Import JSON on the other screen (the TV, an iPad) replaces that device’s copy. The file includes the parent PIN and the morning checkmarks. It does not include Google Calendar events. Keep the file private.

The Aldi list, dinners, chores, sports, spices, and date ideas start with editable examples so the wall is not empty on the first morning.

## TV setup

- Open the page in the Samsung browser, or in Safari or Chrome, and leave it on the HDMI input you use in the morning.
- Use fullscreen / zoom 100% on a 1920×1080 screen. On an iPad the columns reflow and the targets stay large enough to tap.
- Turn off the TV’s auto power-off, sleep timer, and screensaver (Samsung: Settings → General → System Manager → Auto Power Off → Off). The page asks to stay awake where the browser allows a screen wake lock, and reloads itself once around 03:00 so the new day and the new calendar file show up.
- Tap **Enable sound** once (on the morning card, or in Settings). The TV remembers. At 15, 10, and 5 minutes before each leave time it plays a short chime and, if the browser can talk, says for example “10 minutes until West and Jack leave”. Browsers block sound until that tap.
- **Morning** in the left nav is the original countdown wall: a clock, the big leave time, and the weather across the top, then one column per child with a stopwatch, today’s plans, and the checklist. From 5:30 to 9:30 on a school day the chimes and stars work the same way as Home. At other times it counts down to the next school morning and the lists stay visible but cannot be ticked. Bookmark `?view=morning` on the TV. It works with `?test=morning`.
- Add `?test=morning` to practice that countdown. The morning clock starts at 6:45 on the next school day and then runs at real speed, so the 15, 10, and 5 minute chimes can play. A Test mode badge shows. Stars and on-time mornings are not saved. Leave the parameter off for a normal day.
- Enter the family password once, in Settings. The clock, countdown, weather, holidays, and checklists work even while the calendar is locked.

## Calendar secrets

The morning file is built by the **Today dashboard** action (`.github/workflows/today.yml`). It runs on weekdays at **04:15 and 05:15 UTC**, which is **05:15 and 06:15** Berlin time in winter (CET) and **06:15 and 07:15** in summer (CEST). It also runs when you start it by hand.

The encrypted file holds **Monday of the current week through the following Wednesday** (the week, plus the next few days), with each day’s events, what to bring, and homework. `kids` is still today’s snapshot. Until the action has run once with this version of the script, an older file only contains today, and the calendar says so.

Create the secrets under **Settings → Secrets and variables → Actions → New repository secret**. Names must match exactly:

| Secret | Value |
| --- | --- |
| `ICAL_WEST` | Secret iCal URL for West’s calendar |
| `ICAL_JACK` | Secret iCal URL for Jack’s calendar |
| `ICAL_JUNE` | Secret iCal URL for June’s calendar |
| `ICAL_FAMILY` | Secret iCal URL for the family calendar |
| `DASH_PASSWORD` | Family password. This is what you type on the TV. |

In Google Calendar: open the calendar’s settings → **Integrate calendar** → copy **Secret address in iCal format**. Do not paste those URLs into the repo, the page, or a chat.

If a secret is missing, the action exits quietly and leaves `data/today.json` unchanged. The file in git is ciphertext. Do not commit a plaintext calendar.

If the yellow sample banner is showing, the file is example data and the password is `knapp-sample`. When the action replaces it, that password stops working and the TV asks again.

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

Homework is an event whose title starts with `Hausaufgabe`, `Homework`, `HA:`, `Test`, `Probe`, or `Schulaufgabe`, a task due that day, or text containing “due today” / “fällig heute”.

On the family calendar, an event is shown to the child named in the title or description, or invited by email:

- `westcameronknapp@gmail.com` → West
- `jackmichaelknapp@gmail.com` → Jack
- `junelorraineknapp@gmail.com` → June

If it names nobody, it is shown for all three. “Jacket” does not mean Jack.

An all-day event containing `Ferien`, `schulfrei`, `no school`, or `holiday` turns off that child’s countdown. Put the name in the title (for example `schulfrei for June`) when only one child is off.

Bavarian public holidays and the school-holiday list above are drawn on the calendar even when the file is locked, so a Sunday or Herbstferien does not depend on Google.

## Building the file yourself

`scripts/build-today.mjs` runs on Node 20 with no libraries. From the repo:

```bash
node scripts/build-today.mjs --from plain.json --password "the family password"
node scripts/build-today.mjs --self-test
```

`plain.json` must already be the dashboard payload (`date`, `kids`, and optionally `days`). Add `--sample` only for example data. The script writes encrypted `data/today.json` and does not keep the plaintext. Do not commit `plain.json`.

With the five secrets in the environment and no `--from`, the script fetches the calendars, keeps the Monday-through-next-Wednesday window in Europe/Berlin (including weekly repeating events), encrypts it, and writes the same file. That is what the action runs. It prints counts only. It does not print titles or secret URLs.
