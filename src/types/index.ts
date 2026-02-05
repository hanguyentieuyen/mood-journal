export type MoodEntry = {
    id: string;
    moodId: string;
    color: string;
    intensity: number;
    note?: string;
    timestamp: number; // Unix timestamp
    imageUri?: string;
    tags?: string[];
};

export type ThemeType = 'light' | 'dark' | 'system';

export type RootStackParamList = {
    Home: undefined;
    AddEntry: undefined;
    EntryDetail: { entryId: string };
    Stats: undefined;
    Settings: undefined;
};
