import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
    const navigation = useNavigation();
    const { entries } = useStore();

    const data = useMemo(() => {
        const moodCounts: { [key: string]: number } = {};
        entries.forEach((entry) => {
            moodCounts[entry.moodId] = (moodCounts[entry.moodId] || 0) + 1;
        });

        return MOODS.map((mood) => {
            const count = moodCounts[mood.id] || 0;
            return {
                name: mood.label,
                population: count,
                color: mood.colors[0],
                legendFontColor: theme.colors.light.textSecondary,
                legendFontSize: 12,
            };
        }).filter((item) => item.population > 0);
    }, [entries]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Mood Distribution</Text>
                    {data.length > 0 ? (
                        <PieChart
                            data={data}
                            width={screenWidth - 32}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={'population'}
                            backgroundColor={'transparent'}
                            paddingLeft={'15'}
                            center={[10, 0]}
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyText}>No data to display yet.</Text>
                    )}
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.statTitle}>Total Entries</Text>
                    <Text style={styles.statValue}>{entries.length}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.light.border,
    },
    title: {
        ...theme.typography.h2,
        fontSize: 18,
    },
    backButton: {
        color: theme.colors.primary,
        fontSize: 16,
    },
    content: {
        padding: theme.spacing.md,
    },
    chartContainer: {
        backgroundColor: theme.colors.light.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    chartTitle: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.light.textSecondary,
        marginVertical: theme.spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.light.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    statTitle: {
        ...theme.typography.body,
        fontWeight: 'bold',
    },
    statValue: {
        ...theme.typography.h1,
        color: theme.colors.primary,
    },
});

export default AnalyticsScreen;
