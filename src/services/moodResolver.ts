import { MOODS } from '../constants/moods';
import { CustomMood, MoodEntry } from '../types';

export interface ResolvedMood {
    id: string;
    label: string;
    emoji: string;
    colors: [string, string];
    defaultIntensity: number;
    value: number;
    isCustom: boolean;
}

const CUSTOM_MOOD_ANALYTICS_VALUE = 3;

const buildCustomMood = (mood: CustomMood): ResolvedMood => ({
    id: mood.id,
    label: mood.name,
    emoji: mood.emoji,
    colors: [mood.color, mood.color],
    defaultIntensity: 5,
    value: CUSTOM_MOOD_ANALYTICS_VALUE,
    isCustom: true,
});

export const createResolvedMoodMap = (customMoods: CustomMood[]) => {
    const moods = new Map<string, ResolvedMood>();

    MOODS.forEach((mood) => {
        moods.set(mood.id, {
            ...mood,
            isCustom: false,
        });
    });

    customMoods.forEach((mood) => {
        moods.set(mood.id, buildCustomMood(mood));
    });

    return moods;
};

export const resolveMoodById = (moodId: string, customMoods: CustomMood[]) =>
    createResolvedMoodMap(customMoods).get(moodId) ?? null;

export const resolveMoodForEntry = (
    entry: MoodEntry,
    customMoods: CustomMood[]
): ResolvedMood => {
    const resolved = resolveMoodById(entry.moodId, customMoods);

    if (resolved) {
        return resolved;
    }

    return {
        id: entry.moodId,
        label: 'Unknown Mood',
        emoji: '?',
        colors: [entry.color, entry.color],
        defaultIntensity: entry.intensity,
        value: CUSTOM_MOOD_ANALYTICS_VALUE,
        isCustom: true,
    };
};
