import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, ThemeType } from '../types';

interface AppState {
    entries: MoodEntry[];
    theme: ThemeType;
    addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
    deleteEntry: (id: string) => void;
    clearEntries: () => void;
    setTheme: (theme: ThemeType) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            entries: [],
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
            deleteEntry: (id) =>
                set((state) => ({
                    entries: state.entries.filter((e) => e.id !== id),
                })),
            clearEntries: () => set({ entries: [] }),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'mood-journal-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
