# Business Logic

## Domain Concepts

### Mood Entry

A mood entry represents one journaling event recorded at a specific timestamp.

Fields:

- `id`: generated on create
- `moodId`: selected built-in or custom mood
- `color`: selected visual accent
- `intensity`: stored numeric intensity
- `note`: free-text reflection
- `timestamp`: creation time in milliseconds
- `tags`: optional list of reusable labels

### Mood

The app has two mood sources:

- built-in moods from `src/constants/moods.ts`
- custom moods created by the user and stored in the app store

Built-in moods carry richer metadata:

- display label
- emoji
- gradient colors
- default intensity
- numeric value used by analytics

### Tag

Tags are reusable labels shared across entries. They are global, not entry-specific definitions.

### Reminder

Reminder settings represent whether a daily notification is enabled and what time it should fire.

### Theme

Theme represents the visual mode used by the UI. The current live implementation supports light and dark modes only.

## Entry Rules

### Create

When a new entry is saved:

- the store generates an id with `Math.random().toString(36).substr(2, 9)`
- the store stamps the entry with either the current time or a selected local date plus current time-of-day
- the entry is inserted at the front of the `entries` array
- the app explicitly allows multiple entries on the same local day

### Edit

When an entry is updated:

- the existing record is replaced by id
- `id` and `timestamp` are preserved
- streak and aggregate stats are recalculated from the full entry set

### Delete

When an entry is deleted:

- the matching item is removed from `entries`
- streak and aggregate stats are recalculated from the full entry set

### Clear All Data

The current clear action only does this:

- sets `entries` to an empty array
- resets persisted streak stats to zero as a consequence of empty entries

It does not currently reset:

- `stats`
- `tags`
- `customMoods`
- `reminder`
- theme preference

## Streak Rules

Persisted streak logic is derived from the full entry set, not only from the newest write.

Rules:

- streak comparison is based on local dates formatted as `YYYY-MM-DD`
- multiple entries on the same day still count as one streak day
- `currentStreak` counts backward from today if today has entries, otherwise from yesterday if yesterday has entries
- if neither today nor yesterday has entries, `currentStreak` is `0`
- `longestStreak` is the longest run of consecutive local dates with at least one entry
- `lastEntryDate` is the most recent local date that has at least one entry

## Multi-Mood Day Rules

Day-level behavior:

- one local date can contain any number of mood entries
- calendar cells can represent multiple entries for the same date
- tapping a date opens a day-level list, not a single-entry view
- users can add another mood directly from the selected day screen
- each mood entry inside the day remains independently editable and deletable through entry detail

Important distinction:

- `HomeScreen` shows persisted streak from the store
- `AnalyticsScreen` computes a separate current streak from raw entries

Those two views are not derived from a single shared selector.

## Tag Rules

Default tags at first launch:

- `Work`
- `Family`
- `Friends`
- `Hobby`
- `Health`
- `Sleep`

Behavior:

- adding a new tag is ignored if the same name already exists
- a newly created tag is auto-selected in the entry form
- deleting a tag removes it from the global tag list and from every entry that references it
- renaming a tag updates every entry that references that tag
- renaming a tag to an already existing tag name merges the two and deduplicates the result

## Custom Mood Rules

Custom moods can be created and deleted from the manage-moods screen.

Behavior:

- a custom mood requires a non-empty name and emoji
- custom moods are appended to the picker after built-in moods
- picker-specific custom mood options are normalized into the built-in mood shape
- custom moods use a flat color for both gradient endpoints
- custom moods default to intensity `5` in the picker-generated option
- custom moods default to analytics value `3` when represented in the picker

Current limitation:

- detail and analytics flows do not fully resolve custom moods the same way home and picker flows do

## Analytics Rules

### Time Ranges

The analytics ranges are rolling windows, not calendar boundaries:

- `week`: last 7 days
- `month`: last 30 days
- `year`: last 365 days

### Summary Cards

- `Total Entries`: count of filtered entries in the selected window
- `Current Streak`: recomputed from all entries, not from the filtered window
- `Avg Mood`: average of built-in mood numeric values
- `Most Frequent`: mood id with highest count in the filtered window

### Line Chart

- entries are sorted ascending by timestamp
- entries are grouped by formatted `MM/dd`
- the chart uses average mood value per displayed date
- labels are thinned when there are more than seven points

### Pie Chart

- only built-in moods are mapped into chart slices
- moods with zero count are removed from the chart data

Current limitation:

- custom moods are not handled consistently in analytics lookups, labels, and chart datasets

## Weekly Review Rules

Weekly Review behavior:

- the review always targets the most recent completed ISO week in local time
- the current partial week is never used for the review summary
- the review is derived only from local entries and custom moods
- the feature is read-only and does not persist any new data
- previous-week deltas are shown only when the prior completed week has entries

Summary output includes:

- review period label
- total entries
- active days
- average mood value
- most frequent mood
- top 3 tags
- busiest day
- 2-4 highlight statements
- 1 deterministic reflection prompt

Low-data behavior:

- fewer than 3 entries still renders the review
- stronger pattern claims are intentionally softened
- the prompt switches to a gentler reflection style

Empty-week behavior:

- if the most recent completed week has no entries, the review screen shows an empty state
- the user is routed back toward Analytics rather than seeing a fabricated summary

## Reminder Rules

Reminder behavior in settings:

- enabling the reminder first requests notification permission
- if permission is denied, the reminder remains disabled
- if permission is granted, all scheduled notifications are canceled before scheduling the daily reminder
- disabling the reminder cancels all scheduled notifications

Current behavior constraints:

- reminder time is persisted as `20:00` by default
- the current UI does not let the user change reminder time
- persisted reminder state does not automatically re-schedule notifications on app startup

## Theme Rules

Theme behavior:

- the app loads stored theme preference from AsyncStorage key `theme`
- if no stored theme exists, it falls back to the system color scheme
- settings exposes a light/dark toggle only
- there is no active `system` option in the UI flow even though the type/store model includes it

## Practical Implications For Future Work

The current business logic is good enough for a single-device journaling MVP, but future changes should account for:

- recalculating stats after edit, delete, and clear actions
- unifying streak logic between home and analytics
- completing custom mood support across detail and analytics views
- consolidating theme state into one source of truth
