export interface MoodEntry {
    id: string;
    moodId: string;
    color: string;
    intensity: number;
    note: string;
    timestamp: number;
    tags?: string[];
}

export interface CustomMood {
    id: string;
    name: string;
    emoji: string;
    color: string;
}

export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate: string | null;
}

export interface ReminderSettings {
    enabled: boolean;
    time: string;
}

export interface WeeklyReviewHighlight {
    id: string;
    text: string;
}

export interface WeeklyReviewPrompt {
    id: string;
    title: string;
    body: string;
}

export interface WeeklyReviewMoodSummary {
    id: string;
    label: string;
    emoji: string;
    count: number;
    value: number;
}

export interface WeeklyReviewTagSummary {
    tag: string;
    count: number;
}

export interface WeeklyReviewDaySummary {
    shortLabel: string;
    fullLabel: string;
    count: number;
}

export interface WeeklyReviewDeltaSummary {
    periodLabel: string;
    entryCount: number;
    averageMood: number | null;
    entryCountDelta: number;
    averageMoodDelta: number | null;
}

export interface WeeklyReviewSummary {
    periodLabel: string;
    periodStart: number;
    periodEnd: number;
    hasEntries: boolean;
    isLowData: boolean;
    entryCount: number;
    activeDays: number;
    averageMood: number | null;
    mostFrequentMood: WeeklyReviewMoodSummary | null;
    topTags: WeeklyReviewTagSummary[];
    busiestDay: WeeklyReviewDaySummary | null;
    previousWeek: WeeklyReviewDeltaSummary | null;
    highlights: WeeklyReviewHighlight[];
    prompt: WeeklyReviewPrompt;
}

export type ThemeType = 'light' | 'dark' | 'system';

export type RootStackParamList = {
    Home: undefined;
    AddEntry: { entry?: MoodEntry; selectedDate?: string } | undefined;
    DayEntries: { date: string };
    EntryDetail: { entryId: string };
    Stats: undefined;
    WeeklyReview: undefined;
    Settings: undefined;
    ManageMoods: undefined;
};
