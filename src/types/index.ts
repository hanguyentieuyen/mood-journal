export interface MoodEntry {
    id: string;
    moodId: string;
    color: string;
    intensity: number;
    note: string;
    timestamp: number;
    tags?: string[];
}

export type ThemeType = 'light' | 'dark' | 'system';

export type RootStackParamList = {
    Home: undefined;
    AddEntry: { entry?: MoodEntry };
    EntryDetail: { entryId: string };
    Stats: undefined;
    Settings: undefined;
};
