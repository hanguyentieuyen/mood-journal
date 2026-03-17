import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { format } from 'date-fns';
import { useTheme } from '../constants/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const { entries, stats, customMoods } = useStore();
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const recentEntries = useMemo(() => {
        return [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    }, [entries]);

    const DayComponent = ({ date, state }: { date?: DateData; state?: string }) => {
        if (!date) return <View />;

        const entry = entries.find(
            (e) => format(e.timestamp, 'yyyy-MM-dd') === date.dateString
        );
        const mood = entry ? [...MOODS, ...customMoods].find((m) => m.id === entry.moodId) : null;

        return (
            <TouchableOpacity
                onPress={() =>
                    entry ? navigation.navigate('EntryDetail', { entryId: entry.id }) : null
                }
                style={[
                    styles.dayContainer,
                    entry && { backgroundColor: entry.color },
                    state === 'today' && { borderColor: colors.primary, borderWidth: 2 },
                ]}
            >
                <Text
                    style={[
                        styles.dayText,
                        entry ? { color: '#FFF' } : { color: colors.text },
                        state === 'disabled' && { color: colors.textSecondary },
                    ]}
                >
                    {date.day}
                </Text>
                {mood && <Text style={styles.dayEmoji}>{mood.emoji}</Text>}
            </TouchableOpacity>
        );
    };

    const renderEntryObj = ({ item }: { item: any }) => {
        const mood = [...MOODS, ...customMoods].find((m) => m.id === item.moodId);
        return (
            <TouchableOpacity
                style={[styles.entryCard, { borderLeftColor: item.color }]}
                onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
            >
                <Text style={styles.entryEmoji}>{mood?.emoji}</Text>
                <View style={styles.entryContent}>
                    <Text style={styles.entryDate}>
                        {format(item.timestamp, 'MMM d, h:mm a')}
                    </Text>
                    {item.note ? (
                        <Text style={styles.entryNote} numberOfLines={1}>
                            {item.note}
                        </Text>
                    ) : null}
                    {/* Show tags if available */}
                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                            {item.tags.map((tag: string) => (
                                <Text key={tag} style={styles.tag}>
                                    #{tag}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mood Journal</Text>
                    {stats?.currentStreak > 0 && (
                        <Text style={styles.streakText}>
                            🔥 {stats.currentStreak} Day{stats.currentStreak > 1 ? 's' : ''} Streak
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
                    <Text style={styles.headerButton}>📊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.headerButton}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                dayComponent={DayComponent}
                theme={{
                    backgroundColor: colors.background,
                    calendarBackground: colors.background,
                    textSectionTitleColor: colors.textSecondary,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.textSecondary, // '#d9e1e8'
                    arrowColor: colors.primary,
                    monthTextColor: colors.text,
                    indicatorColor: colors.primary,
                }}
                style={styles.calendar}
                key={colors.background} // Force re-render on theme change
            />

            <View style={styles.recentContainer}>
                <Text style={styles.sectionTitle}>Recent Entries</Text>
                <FlatList
                    data={recentEntries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEntryObj}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No entries yet. Start tracking!</Text>
                    }
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("AddEntry")}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof theme.colors.light) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        fontSize: 24,
    },
    title: {
        ...theme.typography.h1,
        color: colors.text,
    },
    streakText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff9800',
        marginTop: 2,
    },
    calendar: {
        marginBottom: theme.spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    recentContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.sm,
        color: colors.text,
    },
    listContent: {
        paddingBottom: 80, // Space for FAB
    },
    entryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: colors.card,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 4,
    },
    entryEmoji: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    entryContent: {
        flex: 1,
    },
    entryDate: {
        ...theme.typography.caption,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    entryNote: {
        ...theme.typography.body,
        color: colors.text,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    tag: {
        fontSize: 12,
        color: colors.textSecondary,
        marginRight: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: theme.spacing.xl,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.xl,
        right: theme.spacing.md,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        marginTop: -2,
    },
    dayContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    dayText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    dayEmoji: {
        fontSize: 10,
        position: 'absolute',
        bottom: -4,
        right: -4,
    },
});

export default HomeScreen;
