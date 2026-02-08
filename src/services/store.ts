import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, ThemeType } from '../types';

interface AppState {
    entries: MoodEntry[];
    tags: string[];
    theme: ThemeType;
    addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
    updateEntry: (entry: MoodEntry) => void;
    deleteEntry: (id: string) => void;
    clearEntries: () => void;
    setTheme: (theme: ThemeType) => void;
    addTag: (tag: string) => void;
    deleteTag: (tag: string) => void;
    updateTag: (oldTag: string, newTag: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            entries: [],
            tags: ['Work', 'Family', 'Friends', 'Hobby', 'Health', 'Sleep'], // Default tags
            theme: 'system',
            addEntry: (entry) =>
                set((state) => ({
                    entries: [
                        {
                            ...entry,
                            id: Math.random().toString(36).substr(2, 9),
                            timestamp: Date.now(),
                        },
                        ...state.entries,
                    ],
                })),
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
