import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, isAfter, subDays } from 'date-fns';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { RootStackParamList } from '../types';
import { createResolvedMoodMap } from '../services/moodResolver';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'week' | 'month' | 'year';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stats'>;

const AnalyticsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { entries, customMoods } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const moodMap = useMemo(() => createResolvedMoodMap(customMoods), [customMoods]);

    const filteredEntries = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'week':
                startDate = subDays(now, 7);
                break;
            case 'month':
                startDate = subDays(now, 30);
                break;
            case 'year':
                startDate = subDays(now, 365);
                break;
        }

        return entries.filter((entry) => isAfter(entry.timestamp, startDate.getTime()));
    }, [entries, timeRange]);

    const stats = useMemo(() => {
        if (filteredEntries.length === 0) {
            return {
                averageMood: '0.0',
                mostFrequent: 'None',
                streak: 0,
                total: 0,
            };
        }

        const totalValue = filteredEntries.reduce((sum, entry) => {
            const mood = moodMap.get(entry.moodId);
            return sum + (mood?.value ?? 3);
        }, 0);
        const avg = totalValue / filteredEntries.length;

        const moodCounts = new Map<string, number>();
        filteredEntries.forEach((entry) => {
            moodCounts.set(entry.moodId, (moodCounts.get(entry.moodId) ?? 0) + 1);
        });

        const mostFrequentId = Array.from(moodCounts.entries()).sort((left, right) => {
            if (right[1] !== left[1]) {
                return right[1] - left[1];
            }

            const leftLabel = moodMap.get(left[0])?.label ?? left[0];
            const rightLabel = moodMap.get(right[0])?.label ?? right[0];
            return leftLabel.localeCompare(rightLabel);
        })[0]?.[0];

        const entryDates = new Set(entries.map((entry) => format(entry.timestamp, 'yyyy-MM-dd')));
        let currentStreak = 0;
        let checkDate = new Date();
        let streakActive = true;
        let daysChecked = 0;
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        if (entryDates.has(todayStr)) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else {
            const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            if (!entryDates.has(yesterdayStr)) {
                streakActive = false;
            } else {
                checkDate = subDays(checkDate, 1);
            }
        }

        while (streakActive && daysChecked < 365) {
            const dateStr = format(checkDate, 'yyyy-MM-dd');
            if (entryDates.has(dateStr)) {
                currentStreak++;
                checkDate = subDays(checkDate, 1);
            } else {
                streakActive = false;
            }
            daysChecked++;
        }

        return {
            averageMood: avg.toFixed(1),
            mostFrequent: mostFrequentId
                ? moodMap.get(mostFrequentId)?.label ?? 'Unknown Mood'
                : 'None',
            streak: currentStreak,
            total: filteredEntries.length,
        };
    }, [entries, filteredEntries, moodMap]);

    const pieData = useMemo(() => {
        const moodCounts = new Map<string, number>();
        filteredEntries.forEach((entry) => {
            moodCounts.set(entry.moodId, (moodCounts.get(entry.moodId) ?? 0) + 1);
        });

        return Array.from(moodCounts.entries())
            .map(([moodId, count]) => {
                const mood = moodMap.get(moodId);
                return {
                    name: mood?.label ?? 'Unknown Mood',
                    population: count,
                    color: mood?.colors[1] ?? theme.colors.primary,
                    legendFontColor: colors.textSecondary,
                    legendFontSize: 12,
                };
            })
            .sort((left, right) => right.population - left.population);
    }, [filteredEntries, moodMap, colors.textSecondary]);

    const lineChartData = useMemo(() => {
        if (filteredEntries.length === 0) {
            return null;
        }

        const grouped = new Map<string, { sum: number; count: number }>();
        const sortedEntries = [...filteredEntries].sort((a, b) => a.timestamp - b.timestamp);

        sortedEntries.forEach((entry) => {
            const dateKey = format(entry.timestamp, 'MM/dd');
            const mood = moodMap.get(entry.moodId);
            const current = grouped.get(dateKey) ?? { sum: 0, count: 0 };
            grouped.set(dateKey, {
                sum: current.sum + (mood?.value ?? 3),
                count: current.count + 1,
            });
        });

        const points = Array.from(grouped.entries()).map(([label, value], index, array) => {
            const interval = array.length > 7 ? Math.ceil(array.length / 7) : 1;
            return {
                label: index % interval === 0 ? label : '',
                value: value.sum / value.count,
            };
        });

        return {
            labels: points.map((point) => point.label),
            datasets: [
                {
                    data: points.map((point) => point.value),
                    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
                    strokeWidth: 2,
                },
            ],
            legend: ['Mood Trend'],
        };
    }, [filteredEntries, moodMap]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.rangeSelector}>
                {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.rangeButton,
                            timeRange === range && styles.rangeButtonActive,
                        ]}
                        onPress={() => setTimeRange(range)}
                    >
                        <Text
                            style={[
                                styles.rangeText,
                                timeRange === range && styles.rangeTextActive,
                            ]}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity
                    style={styles.reviewCard}
                    onPress={() => navigation.navigate('WeeklyReview')}
                >
                    <View style={styles.reviewCardCopy}>
                        <Text style={styles.reviewEyebrow}>New</Text>
                        <Text style={styles.reviewTitle}>Weekly Review</Text>
                        <Text style={styles.reviewBody}>
                            Open a read-only summary of your most recent completed week.
                        </Text>
                    </View>
                    <Text style={styles.reviewAction}>Open</Text>
                </TouchableOpacity>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Entries</Text>
                        <Text style={styles.statValue}>{stats.total}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current Streak</Text>
                        <Text style={styles.statValue}>{stats.streak}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg Mood</Text>
                        <Text style={styles.statValue}>{stats.averageMood}/6</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Most Frequent</Text>
                        <Text style={styles.statValue}>{stats.mostFrequent}</Text>
                    </View>
                </View>

                {lineChartData && lineChartData.datasets[0].data.length > 0 && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Mood Trend</Text>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                backgroundColor: colors.card,
                                backgroundGradientFrom: colors.card,
                                backgroundGradientTo: colors.card,
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
                                labelColor: () => colors.textSecondary,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: colors.primary,
                                },
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </View>
                )}

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Mood Distribution</Text>
                    {pieData.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={screenWidth - 32}
                            height={220}
                            chartConfig={{
                                color: () => colors.text,
                            }}
                            accessor={'population'}
                            backgroundColor={'transparent'}
                            paddingLeft={'15'}
                            center={[10, 0]}
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyText}>No data for this period.</Text>
                    )}
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
        title: {
            ...theme.typography.h2,
            fontSize: 18,
            color: colors.text,
        },
        backButton: {
            color: theme.colors.primary,
            fontSize: 16,
        },
        rangeSelector: {
            flexDirection: 'row',
            padding: theme.spacing.md,
            justifyContent: 'center',
            gap: 10,
        },
        rangeButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: colors.card,
        },
        rangeButtonActive: {
            backgroundColor: theme.colors.primary,
        },
        rangeText: {
            color: colors.textSecondary,
            fontWeight: '600',
        },
        rangeTextActive: {
            color: '#FFF',
        },
        content: {
            padding: theme.spacing.md,
        },
        reviewCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        reviewCardCopy: {
            flex: 1,
            paddingRight: theme.spacing.md,
        },
        reviewEyebrow: {
            ...theme.typography.caption,
            color: theme.colors.primary,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        reviewTitle: {
            ...theme.typography.h2,
            fontSize: 18,
            color: colors.text,
            marginBottom: 4,
        },
        reviewBody: {
            ...theme.typography.body,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        reviewAction: {
            color: theme.colors.primary,
            fontWeight: '700',
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: theme.spacing.lg,
        },
        statCard: {
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            width: '48%',
            alignItems: 'center',
        },
        statLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        statValue: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.primary,
            textAlign: 'center',
        },
        chartContainer: {
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            alignItems: 'center',
        },
        chartTitle: {
            ...theme.typography.h2,
            marginBottom: theme.spacing.md,
            color: colors.text,
        },
        emptyText: {
            ...theme.typography.body,
            color: colors.textSecondary,
            marginVertical: theme.spacing.xl,
        },
    });

export default AnalyticsScreen;
