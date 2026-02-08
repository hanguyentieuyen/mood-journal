import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { useTheme } from '../constants/ThemeContext';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter, isSameDay } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'week' | 'month' | 'year';

const AnalyticsScreen = () => {
    const navigation = useNavigation();
    const { entries } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [timeRange, setTimeRange] = useState<TimeRange>('week');

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
                averageMood: 0,
                mostFrequent: 'None',
                streak: 0,
                total: 0,
            };
        }

        // Calculate Average Mood Value
        const totalValue = filteredEntries.reduce((sum, entry) => {
            const mood = MOODS.find((m) => m.id === entry.moodId);
            return sum + (mood?.value || 3);
        }, 0);
        const avg = totalValue / filteredEntries.length;

        // Calculate Most Frequent
        const counts: { [key: string]: number } = {};
        filteredEntries.forEach((e) => {
            counts[e.moodId] = (counts[e.moodId] || 0) + 1;
        });
        const mostFrequentId = Object.keys(counts).reduce((a, b) =>
            counts[a] > counts[b] ? a : b
        );
        const mostFrequentLabel = MOODS.find((m) => m.id === mostFrequentId)?.label || 'None';

        // Calculate Streak (Current Streak based on ALL entries, not just filtered)
        // Sort entries by date desc
        const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
        let currentStreak = 0;
        let checkDate = new Date(); // Start checking from today

        // Use a Set of unique dates with entries (formatted as YYYY-MM-DD)
        const entryDates = new Set(
            sortedEntries.map((e) => format(e.timestamp, 'yyyy-MM-dd'))
        );

        // Check back day by day
        // Allow streak to continue if today has no entry yet but yesterday did?
        // Usually, streak includes today if completed, or yesterday.
        // Let's verify consecutive days.
        let streakActive = true;
        let daysChecked = 0;

        // Simple approach: Check today, if no, check yesterday. If no, streak broken.
        // If yes, count 1, go back 1 day.

        // Normalize today
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (entryDates.has(todayStr)) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else {
            // If no entry today, check if entry exists for yesterday to keep streak alive
            const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            if (!entryDates.has(yesterdayStr)) {
                streakActive = false; // No entry today or yesterday -> Streak 0
            } else {
                checkDate = subDays(checkDate, 1); // Start counting from yesterday
            }
        }

        while (streakActive && daysChecked < 365) { // Limit to 1 year to prevent infinite loops logic error
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
            mostFrequent: mostFrequentLabel,
            streak: currentStreak,
            total: filteredEntries.length,
        };
    }, [filteredEntries, entries]);

    const pieData = useMemo(() => {
        const moodCounts: { [key: string]: number } = {};
        filteredEntries.forEach((entry) => {
            moodCounts[entry.moodId] = (moodCounts[entry.moodId] || 0) + 1;
        });

        return MOODS.map((mood) => {
            const count = moodCounts[mood.id] || 0;
            return {
                name: mood.label,
                population: count,
                color: mood.colors[1],
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
            };
        }).filter((item) => item.population > 0);
    }, [filteredEntries, colors]);

    const lineChartData = useMemo(() => {
        if (filteredEntries.length === 0) return null;

        // Group by date, take average value per date
        const grouped: { [key: string]: { sum: number; count: number } } = {};

        // Initialize last 7 days (for week view) or appropriate points
        // For simplicity, just use the days present in the range or last N points

        const sorted = [...filteredEntries].sort((a, b) => a.timestamp - b.timestamp);

        sorted.forEach(entry => {
            const dateStr = format(entry.timestamp, 'MM/dd');
            const mood = MOODS.find(m => m.id === entry.moodId);
            if (!grouped[dateStr]) grouped[dateStr] = { sum: 0, count: 0 };
            grouped[dateStr].sum += (mood?.value || 0);
            grouped[dateStr].count += 1;
        });

        const labels = Object.keys(grouped);
        const data = Object.values(grouped).map(g => g.sum / g.count);

        // Limit labels for readibility if too many
        // If > 7 points, pick every Nth point to show label? 
        // chart-kit handles layout reasonably well but labels can overlap.

        return {
            labels: labels.length > 7 ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0) : labels,
            datasets: [
                {
                    data: data,
                    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`, // primary color
                    strokeWidth: 2
                }
            ],
            legend: ["Mood Trend"]
        };

    }, [filteredEntries]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <View style={{ width: 40 }} />
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

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Entries</Text>
                        <Text style={styles.statValue}>{stats.total}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current Streak</Text>
                        <Text style={styles.statValue}>{stats.streak} 🔥</Text>
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
                                labelColor: (opacity = 1) => colors.textSecondary,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: colors.primary
                                }
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
                                color: (opacity = 1) => colors.text,
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

const createStyles = (colors: typeof theme.colors.light) => StyleSheet.create({
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
        width: '48%', // Approx 2 columns
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
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
