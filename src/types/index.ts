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
    lastEntryDate: string | null; // Dạng YYYY-MM-DD để dễ so sánh
}

export interface ReminderSettings {
    enabled: boolean;
    time: string; // Dạng "HH:mm"
}

export type ThemeType = 'light' | 'dark' | 'system';

export type RootStackParamList = {
    Home: undefined;
    AddEntry: { entry?: MoodEntry } | undefined;
    EntryDetail: { entryId: string };
    Stats: undefined;
    Settings: undefined;
    ManageMoods: undefined;
};
