import { endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import {
    CustomMood,
    MoodEntry,
    WeeklyReviewDaySummary,
    WeeklyReviewDeltaSummary,
    WeeklyReviewHighlight,
    WeeklyReviewMoodSummary,
    WeeklyReviewPrompt,
    WeeklyReviewSummary,
    WeeklyReviewTagSummary,
} from '../types';
import { createResolvedMoodMap, ResolvedMood } from './moodResolver';

const ISO_WEEK_OPTIONS = { weekStartsOn: 1 as const };

type WeekMetrics = {
    entryCount: number;
    activeDays: number;
    averageMood: number | null;
    mostFrequentMood: WeeklyReviewMoodSummary | null;
    topTags: WeeklyReviewTagSummary[];
    busiestDay: WeeklyReviewDaySummary | null;
};

const formatPeriodLabel = (start: Date, end: Date) => {
    const sameMonth = format(start, 'MMM yyyy') === format(end, 'MMM yyyy');
    const sameYear = format(start, 'yyyy') === format(end, 'yyyy');

    if (sameMonth) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }

    if (sameYear) {
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }

    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
};

const sortByCountThenLabel = <T extends { count: number; label?: string; tag?: string }>(
    left: T,
    right: T
) => {
    if (right.count !== left.count) {
        return right.count - left.count;
    }

    const leftLabel = left.label ?? left.tag ?? '';
    const rightLabel = right.label ?? right.tag ?? '';

    return leftLabel.localeCompare(rightLabel);
};

const buildMoodSummary = (
    moodCounts: Map<string, { mood: ResolvedMood; count: number }>
): WeeklyReviewMoodSummary | null => {
    const rankedMoods = Array.from(moodCounts.values())
        .map(({ mood, count }) => ({
            id: mood.id,
            label: mood.label,
            emoji: mood.emoji,
            count,
            value: mood.value,
        }))
        .sort(sortByCountThenLabel);

    return rankedMoods[0] ?? null;
};

const buildTopTags = (tagCounts: Map<string, number>): WeeklyReviewTagSummary[] =>
    Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort(sortByCountThenLabel)
        .slice(0, 3);

const buildBusiestDay = (
    dayCounts: Map<string, { date: Date; count: number }>
): WeeklyReviewDaySummary | null => {
    const rankedDays = Array.from(dayCounts.values()).sort((left, right) => {
        if (right.count !== left.count) {
            return right.count - left.count;
        }

        return left.date.getTime() - right.date.getTime();
    });

    const busiest = rankedDays[0];

    if (!busiest) {
        return null;
    }

    return {
        shortLabel: format(busiest.date, 'EEE'),
        fullLabel: format(busiest.date, 'EEEE'),
        count: busiest.count,
    };
};

const buildWeekMetrics = (
    entries: MoodEntry[],
    customMoods: CustomMood[]
): WeekMetrics => {
    const resolvedMoods = createResolvedMoodMap(customMoods);
    const moodCounts = new Map<string, { mood: ResolvedMood; count: number }>();
    const tagCounts = new Map<string, number>();
    const dayCounts = new Map<string, { date: Date; count: number }>();
    let totalMoodValue = 0;

    entries.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const dayKey = format(date, 'yyyy-MM-dd');
        const resolvedMood =
            resolvedMoods.get(entry.moodId) ?? {
                id: entry.moodId,
                label: 'Unknown Mood',
                emoji: '?',
                colors: [entry.color, entry.color] as [string, string],
                defaultIntensity: entry.intensity,
                value: 3,
                isCustom: true,
            };

        totalMoodValue += resolvedMood.value;

        const currentMood = moodCounts.get(resolvedMood.id);
        moodCounts.set(resolvedMood.id, {
            mood: resolvedMood,
            count: (currentMood?.count ?? 0) + 1,
        });

        const currentDay = dayCounts.get(dayKey);
        dayCounts.set(dayKey, {
            date,
            count: (currentDay?.count ?? 0) + 1,
        });

        (entry.tags ?? [])
            .map((tag) => tag.trim())
            .filter(Boolean)
            .forEach((tag) => {
                tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
            });
    });

    return {
        entryCount: entries.length,
        activeDays: dayCounts.size,
        averageMood: entries.length > 0 ? totalMoodValue / entries.length : null,
        mostFrequentMood: buildMoodSummary(moodCounts),
        topTags: buildTopTags(tagCounts),
        busiestDay: buildBusiestDay(dayCounts),
    };
};

const buildDeltaSummary = (
    previousPeriodLabel: string,
    currentMetrics: WeekMetrics,
    previousMetrics: WeekMetrics
): WeeklyReviewDeltaSummary | null => {
    if (previousMetrics.entryCount === 0) {
        return null;
    }

    return {
        periodLabel: previousPeriodLabel,
        entryCount: previousMetrics.entryCount,
        averageMood: previousMetrics.averageMood,
        entryCountDelta: currentMetrics.entryCount - previousMetrics.entryCount,
        averageMoodDelta:
            currentMetrics.averageMood !== null && previousMetrics.averageMood !== null
                ? currentMetrics.averageMood - previousMetrics.averageMood
                : null,
    };
};

const buildLowDataHighlights = (
    periodLabel: string,
    metrics: WeekMetrics
): WeeklyReviewHighlight[] => {
    const highlights: WeeklyReviewHighlight[] = [
        {
            id: 'check-ins',
            text: `You checked in ${metrics.entryCount} time${metrics.entryCount === 1 ? '' : 's'} during ${periodLabel}.`,
        },
        {
            id: 'active-days',
            text: `Those entries were spread across ${metrics.activeDays} day${metrics.activeDays === 1 ? '' : 's'}.`,
        },
    ];

    if (metrics.mostFrequentMood) {
        highlights.push({
            id: 'top-mood',
            text: `${metrics.mostFrequentMood.emoji} ${metrics.mostFrequentMood.label} showed up most often.`,
        });
    }

    if (metrics.topTags[0]) {
        highlights.push({
            id: 'top-tag',
            text: `#${metrics.topTags[0].tag} was the tag that appeared most.`,
        });
    }

    if (metrics.busiestDay?.count && metrics.busiestDay.count > 1) {
        highlights.push({
            id: 'busiest-day',
            text: `${metrics.busiestDay.fullLabel} had the highest number of check-ins.`,
        });
    }

    return highlights.slice(0, 3);
};

const buildHighlights = (
    periodLabel: string,
    metrics: WeekMetrics,
    previousWeek: WeeklyReviewDeltaSummary | null
): WeeklyReviewHighlight[] => {
    if (metrics.entryCount < 3) {
        return buildLowDataHighlights(periodLabel, metrics);
    }

    const highlights: WeeklyReviewHighlight[] = [
        {
            id: 'active-days',
            text: `You logged ${metrics.entryCount} entries across ${metrics.activeDays} of the 7 days in ${periodLabel}.`,
        },
    ];

    if (metrics.mostFrequentMood) {
        highlights.push({
            id: 'dominant-mood',
            text: `${metrics.mostFrequentMood.emoji} ${metrics.mostFrequentMood.label} led the week with ${metrics.mostFrequentMood.count} check-ins.`,
        });
    }

    if (previousWeek) {
        if (previousWeek.entryCountDelta > 0) {
            highlights.push({
                id: 'entry-up',
                text: `That was ${previousWeek.entryCountDelta} more entr${previousWeek.entryCountDelta === 1 ? 'y' : 'ies'} than ${previousWeek.periodLabel}.`,
            });
        } else if (previousWeek.entryCountDelta < 0) {
            const drop = Math.abs(previousWeek.entryCountDelta);
            highlights.push({
                id: 'entry-down',
                text: `That was ${drop} fewer entr${drop === 1 ? 'y' : 'ies'} than ${previousWeek.periodLabel}.`,
            });
        }

        if (previousWeek.averageMoodDelta !== null) {
            if (previousWeek.averageMoodDelta >= 0.25) {
                highlights.push({
                    id: 'mood-up',
                    text: `Average mood was up ${previousWeek.averageMoodDelta.toFixed(1)} points from the previous week.`,
                });
            } else if (previousWeek.averageMoodDelta <= -0.25) {
                highlights.push({
                    id: 'mood-down',
                    text: `Average mood was down ${Math.abs(previousWeek.averageMoodDelta).toFixed(1)} points from the previous week.`,
                });
            }
        }
    } else if (metrics.averageMood !== null) {
        highlights.push({
            id: 'average-mood',
            text: `Your average mood landed at ${metrics.averageMood.toFixed(1)} out of 6.`,
        });
    }

    if (metrics.topTags[0]) {
        highlights.push({
            id: 'top-tag',
            text: `#${metrics.topTags[0].tag} appeared ${metrics.topTags[0].count} time${metrics.topTags[0].count === 1 ? '' : 's'}.`,
        });
    }

    if (metrics.busiestDay) {
        highlights.push({
            id: 'busiest-day',
            text: `${metrics.busiestDay.fullLabel} was your busiest day with ${metrics.busiestDay.count} check-ins.`,
        });
    }

    return highlights.slice(0, 4);
};

const buildPrompt = (
    summary: Pick<
        WeeklyReviewSummary,
        'entryCount' | 'isLowData' | 'mostFrequentMood' | 'topTags' | 'busiestDay' | 'previousWeek'
    >
): WeeklyReviewPrompt => {
    if (summary.entryCount === 0 || summary.isLowData) {
        return {
            id: 'soft-reflection',
            title: 'Light Reflection',
            body: 'What moment from last week feels most worth remembering, even from a small set of check-ins?',
        };
    }

    if (summary.topTags[0] && summary.topTags[0].count >= 2) {
        return {
            id: 'tag-pattern',
            title: `Look at ${summary.topTags[0].tag}`,
            body: `#${summary.topTags[0].tag} showed up repeatedly. What about that part of the week had the strongest effect on your mood?`,
        };
    }

    if (
        summary.previousWeek?.averageMoodDelta !== null &&
        summary.previousWeek?.averageMoodDelta !== undefined
    ) {
        if (summary.previousWeek.averageMoodDelta >= 0.75) {
            return {
                id: 'positive-shift',
                title: 'Carry It Forward',
                body: 'Your average mood improved from the previous week. What helped, and how could you repeat one piece of it next week?',
            };
        }

        if (summary.previousWeek.averageMoodDelta <= -0.75) {
            return {
                id: 'reset',
                title: 'Reset for Next Week',
                body: 'This week felt heavier than the one before. What support, boundary, or routine would make next week easier?',
            };
        }
    }

    if (summary.busiestDay && summary.busiestDay.count >= 2) {
        return {
            id: 'busiest-day',
            title: `Focus on ${summary.busiestDay.fullLabel}`,
            body: `${summary.busiestDay.fullLabel} concentrated the most check-ins. What was happening that day, and what would you want to repeat or change?`,
        };
    }

    return {
        id: 'dominant-mood',
        title: 'Notice the Pattern',
        body: `${summary.mostFrequentMood?.label ?? 'Your most common mood'} showed up most often last week. What kept pulling you toward that feeling?`,
    };
};

export const buildWeeklyReview = (
    entries: MoodEntry[],
    customMoods: CustomMood[],
    now: Date = new Date()
): WeeklyReviewSummary => {
    const currentWeekStart = startOfWeek(now, ISO_WEEK_OPTIONS);
    const reviewWeekStart = subWeeks(currentWeekStart, 1);
    const reviewWeekEnd = endOfWeek(reviewWeekStart, ISO_WEEK_OPTIONS);
    const previousWeekStart = subWeeks(reviewWeekStart, 1);
    const previousWeekEnd = endOfWeek(previousWeekStart, ISO_WEEK_OPTIONS);
    const reviewPeriodLabel = formatPeriodLabel(reviewWeekStart, reviewWeekEnd);
    const previousPeriodLabel = formatPeriodLabel(previousWeekStart, previousWeekEnd);
    const reviewStartMs = reviewWeekStart.getTime();
    const reviewEndMs = reviewWeekEnd.getTime();
    const previousStartMs = previousWeekStart.getTime();
    const previousEndMs = previousWeekEnd.getTime();

    const reviewEntries = entries.filter(
        (entry) => entry.timestamp >= reviewStartMs && entry.timestamp <= reviewEndMs
    );
    const previousEntries = entries.filter(
        (entry) => entry.timestamp >= previousStartMs && entry.timestamp <= previousEndMs
    );

    const metrics = buildWeekMetrics(reviewEntries, customMoods);
    const previousMetrics = buildWeekMetrics(previousEntries, customMoods);
    const previousWeek = buildDeltaSummary(previousPeriodLabel, metrics, previousMetrics);

    const baseSummary: WeeklyReviewSummary = {
        periodLabel: reviewPeriodLabel,
        periodStart: reviewStartMs,
        periodEnd: reviewEndMs,
        hasEntries: metrics.entryCount > 0,
        isLowData: metrics.entryCount > 0 && metrics.entryCount < 3,
        entryCount: metrics.entryCount,
        activeDays: metrics.activeDays,
        averageMood: metrics.averageMood,
        mostFrequentMood: metrics.mostFrequentMood,
        topTags: metrics.topTags,
        busiestDay: metrics.busiestDay,
        previousWeek,
        highlights: [],
        prompt: {
            id: 'empty',
            title: 'No Review Yet',
            body: 'There are no entries from the most recent completed week.',
        },
    };

    baseSummary.highlights = buildHighlights(reviewPeriodLabel, metrics, previousWeek);
    baseSummary.prompt = buildPrompt(baseSummary);

    return baseSummary;
};
