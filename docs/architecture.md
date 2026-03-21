# Architecture

## High-Level Design

The app is a client-only React Native application. All user data is stored locally on the device, and all business actions are executed in-process through a persisted Zustand store.

There are four main layers:

1. app bootstrap and navigation
2. screen and component UI
3. local state and persistence
4. device integrations such as notifications

## Runtime Composition

```text
index.ts
  -> App.tsx
     -> ThemeProvider
        -> NavigationContainer
           -> Stack Screens
              -> Screen Components
                 -> Reusable Components
                    -> Zustand Store / Notification Helpers
```

### Bootstrap

- `index.ts` registers the React Native root component through Expo.
- `App.tsx` wraps the app in `ThemeProvider`, builds the navigation theme, and mounts the root stack navigator.

### Navigation

The app uses a native stack navigator with hidden headers and screen-level custom headers.

| Route | Purpose | Notes |
| --- | --- | --- |
| `Home` | Calendar and recent entries | Default landing screen |
| `AddEntry` | Create or edit an entry | Presented as a modal |
| `DayEntries` | Inspect one calendar day | Lists every mood entry for a selected date |
| `EntryDetail` | Inspect one entry | Supports edit and delete |
| `Stats` | Analytics and charts | Uses rolling time windows |
| `WeeklyReview` | End-of-week summary | Read-only review of the most recent completed week |
| `Settings` | Theme, reminder, and data actions | Uses notification helpers |
| `ManageMoods` | Create and delete custom moods | Presented as a modal |

## State Management

### Persisted App Store

`src/services/store.ts` owns the persisted domain state through Zustand + `persist`.

Storage key:

- `mood-journal-storage`

Persisted slices:

- `entries`
- `tags`
- `customMoods`
- `stats`
- `reminder`
- `theme`

Write operations in the store are synchronous state transitions wrapped by Zustand setters. Persistence is handled automatically through AsyncStorage.

### Theme Context

Theme rendering is not driven by the Zustand store. Instead, `src/constants/ThemeContext.tsx`:

- reads the device color scheme on startup
- loads a stored theme from AsyncStorage key `theme`
- exposes `themeType`, `colors`, `toggleTheme`, and `setTheme`
- feeds those colors into the navigation container and all screen/component style factories

This means the codebase currently has two theme sources:

- active UI theme in `ThemeContext`
- unused theme field in the persisted Zustand store

## Screen Responsibilities

### `HomeScreen`

- reads entries, streak stats, and custom moods
- renders the calendar month view
- groups entries by formatted local date
- routes calendar taps into a day-level screen instead of assuming one entry per day
- shows the five most recent entries

### `DayEntriesScreen`

- filters entries for one selected local date
- shows every mood entry for that date in reverse chronological order
- provides the date-aware entry point for adding another mood to that day

### `AddEntryScreen`

- handles both create and edit flows
- owns temporary form state for mood, color, note, intensity, and tags
- accepts an optional selected date for new entries
- calls `addEntry` for new entries and `updateEntry` for existing ones

### `EntryDetailScreen`

- looks up a single entry by `entryId`
- shows the selected mood card, note, time, and tags
- routes to edit mode or dispatches delete

### `AnalyticsScreen`

- filters entries into rolling week, month, and year windows
- computes summary cards, line chart data, and pie chart data in `useMemo`
- calculates streak separately from the persisted `stats` slice
- provides the entry point into the weekly review flow

### `WeeklyReviewScreen`

- reads a pure derived weekly-review summary from local entries and custom moods
- focuses on the most recent completed ISO week in local time
- shows metrics, highlights, previous-week deltas, and one deterministic prompt
- stays read-only and does not write to persisted state

### `SettingsScreen`

- toggles theme via `ThemeContext`
- toggles daily reminders through Expo Notifications helpers
- exposes destructive clear-data action

### `ManageMoodsScreen`

- creates and deletes custom moods
- persists custom moods in the global store
- is reached from the mood picker through the synthetic `add_new` option

## Component Responsibilities

### `MoodPicker`

- combines built-in moods with persisted custom moods
- appends a special item that opens the custom-mood management screen
- animates selected mood scale and opacity with Reanimated

### `TagPicker`

- renders selectable tags from the global store
- supports create, edit, merge, and delete operations
- updates global state and notifies the parent when a newly created tag should be auto-selected

### `ColorSlider`

- renders a fixed set of preset colors
- provides color selection only
- does not use the `colors` prop passed by the parent in the current implementation

## Data Flow

### Create Entry Flow

1. User opens `AddEntry`.
2. Screen collects mood, color, note, and tags.
3. If the user came from a day screen, the entry is stamped onto that selected local date while keeping the current time of day.
4. `addEntry` generates a random id and stores the resulting timestamp.
5. Store prepends the new entry to `entries`.
6. Store recalculates streak stats from the full set of entries.
7. Persist middleware writes the updated store to AsyncStorage.

### Edit Entry Flow

1. User opens `EntryDetail`.
2. User selects edit, which routes back to `AddEntry` with the full entry object.
3. Screen hydrates local form state from the passed entry.
4. `updateEntry` replaces the matching record by id and recalculates stats.

### Day Review Flow

1. User taps a day on the calendar.
2. App opens a day-level list of every mood entry for that date.
3. User can inspect an existing entry or add another mood for the same day.

### Tag Management Flow

1. User opens the tag picker modal to create or edit a tag.
2. Store adds a unique tag or renames an existing one.
3. If a rename targets an existing tag name, tag usage is merged and deduplicated across entries.

### Reminder Flow

1. User enables reminder in settings.
2. App requests notification permission if needed.
3. Existing scheduled notifications are canceled.
4. A new daily notification is scheduled for the persisted reminder time.

## Persistence Model

The app currently persists data in two independent locations:

- Zustand JSON storage for business/domain state
- a dedicated AsyncStorage key for theme preference

There is no migration layer, schema versioning, or remote backup.

## Technical Caveats

The following are architecture-relevant gaps in the current code:

- Theme state is duplicated across `ThemeContext` and the Zustand store.
- Custom mood support is incomplete outside the picker, home screen, analytics, and entry detail fixes that now exist.
- Analytics computes some derived data separately from persisted stats, which can lead to behavior differences.
- Reminder state is persisted, but there is no app-start reconciliation that re-schedules notifications from stored settings.
