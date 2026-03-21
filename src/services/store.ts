import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, ThemeType, CustomMood, UserStats, ReminderSettings } from '../types';
import { calculateStatsFromEntries } from './entryUtils';

interface AppState {
    entries: MoodEntry[];
    tags: string[];
    theme: ThemeType;
    customMoods: CustomMood[];
    stats: UserStats;
    reminder: ReminderSettings;
    addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'> & { timestamp?: number }) => void;
    updateEntry: (entry: MoodEntry) => void;
    deleteEntry: (id: string) => void;
    clearEntries: () => void;
    setTheme: (theme: ThemeType) => void;
    addTag: (tag: string) => void;
    deleteTag: (tag: string) => void;
    updateTag: (oldTag: string, newTag: string) => void;
    addCustomMood: (mood: Omit<CustomMood, 'id'>) => void;
    deleteCustomMood: (id: string) => void;
    updateCustomMood: (mood: CustomMood) => void;
    updateReminder: (reminder: Partial<ReminderSettings>) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            entries: [],
            tags: ['Work', 'Family', 'Friends', 'Hobby', 'Health', 'Sleep'],
            theme: 'system',
            customMoods: [],
            stats: {
                currentStreak: 0,
                longestStreak: 0,
                lastEntryDate: null,
            },
            reminder: {
                enabled: false,
                time: '20:00',
            },
            addEntry: (entry) =>
                set((state) => {
                    const nextEntries = [
                        {
                            ...entry,
                            id: Math.random().toString(36).substr(2, 9),
                            timestamp: entry.timestamp ?? Date.now(),
                        },
                        ...state.entries,
                    ];

                    return {
                        entries: nextEntries,
                        stats: calculateStatsFromEntries(nextEntries),
                    };
                }),
            updateEntry: (updatedEntry) =>
                set((state) => {
                    const nextEntries = state.entries.map((entry) =>
                        entry.id === updatedEntry.id ? updatedEntry : entry
                    );

                    return {
                        entries: nextEntries,
                        stats: calculateStatsFromEntries(nextEntries),
                    };
                }),
            deleteEntry: (id) =>
                set((state) => {
                    const nextEntries = state.entries.filter((entry) => entry.id !== id);

                    return {
                        entries: nextEntries,
                        stats: calculateStatsFromEntries(nextEntries),
                    };
                }),
            clearEntries: () =>
                set({
                    entries: [],
                    stats: calculateStatsFromEntries([]),
                }),
            setTheme: (theme) => set({ theme }),
            addCustomMood: (mood) =>
                set((state) => ({
                    customMoods: [
                        ...state.customMoods,
                        { ...mood, id: Math.random().toString(36).substr(2, 9) },
                    ],
                })),
            deleteCustomMood: (id) =>
                set((state) => ({
                    customMoods: state.customMoods.filter((mood) => mood.id !== id),
                })),
            updateCustomMood: (updatedMood) =>
                set((state) => ({
                    customMoods: state.customMoods.map((mood) =>
                        mood.id === updatedMood.id ? updatedMood : mood
                    ),
                })),
            updateReminder: (newReminder) =>
                set((state) => ({
                    reminder: { ...state.reminder, ...newReminder },
                })),
            addTag: (tag) =>
                set((state) => {
                    if (state.tags.includes(tag)) {
                        return state;
                    }

                    return { tags: [...state.tags, tag] };
                }),
            deleteTag: (tag) =>
                set((state) => ({
                    tags: state.tags.filter((item) => item !== tag),
                    entries: state.entries.map((entry) => ({
                        ...entry,
                        tags: entry.tags ? entry.tags.filter((item) => item !== tag) : [],
                    })),
                })),
            updateTag: (oldTag, newTag) =>
                set((state) => {
                    if (state.tags.includes(newTag)) {
                        return {
                            tags: state.tags.filter((tag) => tag !== oldTag),
                            entries: state.entries.map((entry) => ({
                                ...entry,
                                tags: entry.tags
                                    ? Array.from(
                                          new Set(
                                              entry.tags.map((tag) =>
                                                  tag === oldTag ? newTag : tag
                                              )
                                          )
                                      )
                                    : [],
                            })),
                        };
                    }

                    return {
                        tags: state.tags.map((tag) => (tag === oldTag ? newTag : tag)),
                        entries: state.entries.map((entry) => ({
                            ...entry,
                            tags: entry.tags
                                ? entry.tags.map((tag) => (tag === oldTag ? newTag : tag))
                                : [],
                        })),
                    };
                }),
        }),
        {
            name: 'mood-journal-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
