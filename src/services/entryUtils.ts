import { format, subDays } from 'date-fns';
import { MoodEntry, UserStats } from '../types';

export const formatEntryDateKey = (timestamp: number) =>
    format(timestamp, 'yyyy-MM-dd');

export const buildTimestampForDate = (
    dateString: string,
    timeSource: Date = new Date()
) => {
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(
        year,
        month - 1,
        day,
        timeSource.getHours(),
        timeSource.getMinutes(),
        timeSource.getSeconds(),
        timeSource.getMilliseconds()
    ).getTime();
};

const getConsecutiveStreakEndingAt = (uniqueDateSet: Set<string>, endDate: Date) => {
    let streak = 0;
    let cursor = endDate;

    while (uniqueDateSet.has(formatEntryDateKey(cursor.getTime()))) {
        streak += 1;
        cursor = subDays(cursor, 1);
    }

    return streak;
};

export const calculateStatsFromEntries = (entries: MoodEntry[]): UserStats => {
    if (entries.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastEntryDate: null,
        };
    }

    const uniqueDates = Array.from(
        new Set(entries.map((entry) => formatEntryDateKey(entry.timestamp)))
    ).sort();
    const uniqueDateSet = new Set(uniqueDates);
    const lastEntryDate = uniqueDates[uniqueDates.length - 1] ?? null;
    let longestStreak = 0;
    let currentRun = 0;
    let previousDate: Date | null = null;

    uniqueDates.forEach((dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const currentDate = new Date(year, month - 1, day);

        if (!previousDate) {
            currentRun = 1;
        } else {
            const diffDays = Math.round(
                (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            currentRun = diffDays === 1 ? currentRun + 1 : 1;
        }

        if (currentRun > longestStreak) {
            longestStreak = currentRun;
        }

        previousDate = currentDate;
    });

    const today = new Date();
    const todayKey = formatEntryDateKey(today.getTime());
    const yesterday = subDays(today, 1);
    const yesterdayKey = formatEntryDateKey(yesterday.getTime());
    let currentStreak = 0;

    if (uniqueDateSet.has(todayKey)) {
        currentStreak = getConsecutiveStreakEndingAt(uniqueDateSet, today);
    } else if (uniqueDateSet.has(yesterdayKey)) {
        currentStreak = getConsecutiveStreakEndingAt(uniqueDateSet, yesterday);
    }

    return {
        currentStreak,
        longestStreak,
        lastEntryDate,
    };
};
