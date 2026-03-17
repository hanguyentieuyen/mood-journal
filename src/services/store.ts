import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, ThemeType, CustomMood, UserStats, ReminderSettings } from '../types';

interface AppState {
    entries: MoodEntry[];
    tags: string[];
    theme: ThemeType;
    customMoods: CustomMood[];
    stats: UserStats;
    reminder: ReminderSettings;
    addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
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
            tags: ['Work', 'Family', 'Friends', 'Hobby', 'Health', 'Sleep'], // Default tags
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
                    const now = new Date();
                    // Sử dụng định dạng YYYY-MM-DD
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    let newCurrentStreak = state.stats.currentStreak;
                    let newLongestStreak = state.stats.longestStreak;

                    if (state.stats.lastEntryDate !== todayStr) {
                        if (!state.stats.lastEntryDate) {
                            newCurrentStreak = 1;
                        } else {
                            // Tự tính khoảng cách để tránh phụ thuộc múi giờ của toISOString
                            const lastParts = state.stats.lastEntryDate.split('-');
                            const lastDate = new Date(Number(lastParts[0]), Number(lastParts[1]) - 1, Number(lastParts[2]));
                            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const diffDays = Math.round((todayMidnight.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) {
                                newCurrentStreak += 1;
                            } else if (diffDays > 1) {
                                newCurrentStreak = 1;
                            }
                        }
                        if (newCurrentStreak > newLongestStreak) {
                            newLongestStreak = newCurrentStreak;
                        }
                    }

                    return {
                        entries: [
                            {
                                ...entry,
                                id: Math.random().toString(36).substr(2, 9),
                                timestamp: now.getTime(),
                            },
                            ...state.entries,
                        ],
                        stats: {
                            currentStreak: newCurrentStreak,
                            longestStreak: newLongestStreak,
                            lastEntryDate: todayStr,
                        }
                    };
                }),
            updateEntry: (updatedEntry) =>
                set((state) => ({
                    entries: state.entries.map((e) =>
                        e.id === updatedEntry.id ? updatedEntry : e
                    ),
                })),
            deleteEntry: (id) =>
                set((state) => ({
                    entries: state.entries.filter((e) => e.id !== id),
                })),
            clearEntries: () => set({ entries: [] }),
            setTheme: (theme) => set({ theme }),
            addCustomMood: (mood) =>
                set((state) => ({
                    customMoods: [...state.customMoods, { ...mood, id: Math.random().toString(36).substr(2, 9) }],
                })),
            deleteCustomMood: (id) =>
                set((state) => ({
                    customMoods: state.customMoods.filter((m) => m.id !== id),
                })),
            updateCustomMood: (updatedMood) =>
                set((state) => ({
                    customMoods: state.customMoods.map((m) =>
                        m.id === updatedMood.id ? updatedMood : m
                    ),
                })),
            updateReminder: (newReminder) =>
                set((state) => ({
                    reminder: { ...state.reminder, ...newReminder },
                })),
            addTag: (tag) =>
                set((state) => {
                    if (state.tags.includes(tag)) return state;
                    return { tags: [...state.tags, tag] };
                }),
            deleteTag: (tag) =>
                set((state) => ({
                    tags: state.tags.filter((t) => t !== tag),
                    entries: state.entries.map((e) => ({
                        ...e,
                        tags: e.tags ? e.tags.filter((t) => t !== tag) : [],
                    })),
                })),
            updateTag: (oldTag, newTag) =>
                set((state) => {
                    if (state.tags.includes(newTag)) {
                        // If new tag already exists, merge them (effectively deleting oldTag and replacing usages)
                        // This prevents duplicate tags
                        return {
                            tags: state.tags.filter((t) => t !== oldTag),
                            entries: state.entries.map((e) => ({
                                ...e,
                                tags: e.tags
                                    ? Array.from(new Set(e.tags.map((t) => (t === oldTag ? newTag : t))))
                                    : [],
                            })),
                        };
                    }
                    return {
                        tags: state.tags.map((t) => (t === oldTag ? newTag : t)),
                        entries: state.entries.map((e) => ({
                            ...e,
                            tags: e.tags ? e.tags.map((t) => (t === oldTag ? newTag : t)) : [],
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
