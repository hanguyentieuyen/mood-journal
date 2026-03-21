import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStore } from '../services/store';
import { buildWeeklyReview } from '../services/weeklyReview';
import { useTheme } from '../constants/ThemeContext';
import { theme } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WeeklyReview'>;

const formatAverageMood = (value: number | null) =>
    value === null ? 'N/A' : `${value.toFixed(1)}/6`;

const formatDelta = (value: number, digits = 0) => {
    const fixedValue = digits === 0 ? value.toString() : value.toFixed(digits);
    return `${value > 0 ? '+' : ''}${fixedValue}`;
};

const WeeklyReviewScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { entries, customMoods } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const review = useMemo(
        () => buildWeeklyReview(entries, customMoods),
        [entries, customMoods]
    );

    if (!review.hasEntries) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Weekly Review</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.emptyState}>
                    <Text style={styles.emptyEyebrow}>Most Recent Completed Week</Text>
                    <Text style={styles.emptyTitle}>{review.periodLabel}</Text>
                    <Text style={styles.emptyText}>
                        There were no entries in this completed week. Keep journaling and
                        come back after a few check-ins.
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.primaryButtonText}>Back to Analytics</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Weekly Review</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroEyebrow}>Most Recent Completed Week</Text>
                    <Text style={styles.heroTitle}>{review.periodLabel}</Text>
                    <Text style={styles.heroBody}>
                        A read-only summary of your last full week, built from local entries
                        only.
                    </Text>
                </View>

                {review.isLowData && (
                    <View style={styles.noticeCard}>
                        <Text style={styles.noticeTitle}>Light Review</Text>
                        <Text style={styles.noticeText}>
                            These insights are based on fewer than 3 entries, so they stay
                            intentionally cautious.
                        </Text>
                    </View>
                )}

                <View style={styles.summaryGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Entries</Text>
                        <Text style={styles.statValue}>{review.entryCount}</Text>
                        <Text style={styles.statSubValue}>
                            {review.activeDays} active day{review.activeDays === 1 ? '' : 's'}
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg Mood</Text>
                        <Text style={styles.statValue}>
                            {formatAverageMood(review.averageMood)}
                        </Text>
                        <Text style={styles.statSubValue}>Based on stored mood values</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Top Mood</Text>
                        <Text style={styles.statValue}>
                            {review.mostFrequentMood
                                ? `${review.mostFrequentMood.emoji} ${review.mostFrequentMood.label}`
                                : 'N/A'}
                        </Text>
                        <Text style={styles.statSubValue}>
                            {review.mostFrequentMood
                                ? `${review.mostFrequentMood.count} check-ins`
                                : 'No dominant mood'}
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Busiest Day</Text>
                        <Text style={styles.statValue}>
                            {review.busiestDay?.fullLabel ?? 'N/A'}
                        </Text>
                        <Text style={styles.statSubValue}>
                            {review.busiestDay
                                ? `${review.busiestDay.count} check-ins`
                                : 'No day data'}
                        </Text>
                    </View>
                </View>

                {review.previousWeek && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Compared With {review.previousWeek.periodLabel}</Text>

                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Entry Count</Text>
                            <Text style={styles.comparisonValue}>
                                {formatDelta(review.previousWeek.entryCountDelta)}
                            </Text>
                        </View>

                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Average Mood</Text>
                            <Text style={styles.comparisonValue}>
                                {review.previousWeek.averageMoodDelta === null
                                    ? 'N/A'
                                    : formatDelta(review.previousWeek.averageMoodDelta, 1)}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Top Tags</Text>
                    {review.topTags.length > 0 ? (
                        <View style={styles.tagsRow}>
                            {review.topTags.map((tag) => (
                                <View key={tag.tag} style={styles.tagPill}>
                                    <Text style={styles.tagText}>
                                        #{tag.tag} ({tag.count})
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.sectionBody}>
                            No tags were used in the review week.
                        </Text>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Highlights</Text>
                    {review.highlights.map((highlight) => (
                        <Text key={highlight.id} style={styles.highlightText}>
                            - {highlight.text}
                        </Text>
                    ))}
                </View>

                <View style={styles.promptCard}>
                    <Text style={styles.promptTitle}>{review.prompt.title}</Text>
                    <Text style={styles.promptBody}>{review.prompt.body}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof theme.colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerSpacer: {
            width: 40,
        },
        backButton: {
            color: theme.colors.primary,
            fontSize: 16,
        },
        title: {
            ...theme.typography.h2,
            fontSize: 18,
            color: colors.text,
        },
        content: {
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.xxl,
        },
        heroCard: {
            backgroundColor: colors.card,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.md,
        },
        heroEyebrow: {
            ...theme.typography.caption,
            color: colors.textSecondary,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
        },
        heroTitle: {
            ...theme.typography.h2,
            color: colors.text,
            marginBottom: theme.spacing.xs,
        },
        heroBody: {
            ...theme.typography.body,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        noticeCard: {
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        noticeTitle: {
            ...theme.typography.h2,
            fontSize: 16,
            color: colors.text,
            marginBottom: theme.spacing.xs,
        },
        noticeText: {
            ...theme.typography.body,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        summaryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: theme.spacing.md,
        },
        statCard: {
            width: '48%',
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
        },
        statLabel: {
            ...theme.typography.caption,
            color: colors.textSecondary,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
        },
        statValue: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
        },
        statSubValue: {
            ...theme.typography.caption,
            color: colors.textSecondary,
        },
        sectionCard: {
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
        },
        sectionTitle: {
            ...theme.typography.h2,
            fontSize: 18,
            color: colors.text,
            marginBottom: theme.spacing.sm,
        },
        sectionBody: {
            ...theme.typography.body,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        comparisonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        comparisonLabel: {
            ...theme.typography.body,
            color: colors.text,
        },
        comparisonValue: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.primary,
        },
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        tagPill: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.borderRadius.round,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
        },
        tagText: {
            ...theme.typography.caption,
            color: colors.textSecondary,
        },
        highlightText: {
            ...theme.typography.body,
            color: colors.text,
            lineHeight: 24,
            marginBottom: theme.spacing.sm,
        },
        promptCard: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
        },
        promptTitle: {
            ...theme.typography.h2,
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: theme.spacing.sm,
        },
        promptBody: {
            ...theme.typography.body,
            color: '#FFFFFF',
            lineHeight: 24,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.xl,
        },
        emptyEyebrow: {
            ...theme.typography.caption,
            color: colors.textSecondary,
            marginBottom: theme.spacing.sm,
            textTransform: 'uppercase',
        },
        emptyTitle: {
            ...theme.typography.h1,
            color: colors.text,
            marginBottom: theme.spacing.md,
        },
        emptyText: {
            ...theme.typography.body,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: theme.spacing.lg,
        },
        primaryButton: {
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
        },
        primaryButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
        },
    });

export default WeeklyReviewScreen;
