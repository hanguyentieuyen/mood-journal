import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoodEntry, RootStackParamList } from '../types';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { format } from 'date-fns';
import { useTheme } from '../constants/ThemeContext';
import { formatEntryDateKey } from '../services/entryUtils';
import { resolveMoodForEntry } from '../services/moodResolver';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const { entries, stats, customMoods } = useStore();
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const sortedEntries = useMemo(
        () => [...entries].sort((left, right) => right.timestamp - left.timestamp),
        [entries]
    );
    const recentEntries = useMemo(() => sortedEntries.slice(0, 5), [sortedEntries]);
    const entriesByDate = useMemo(() => {
        const grouped = new Map<string, MoodEntry[]>();

        sortedEntries.forEach((entry) => {
            const key = formatEntryDateKey(entry.timestamp);
            const current = grouped.get(key);

            if (current) {
                current.push(entry);
            } else {
                grouped.set(key, [entry]);
            }
        });

        return grouped;
    }, [sortedEntries]);
    const todayKey = formatEntryDateKey(Date.now());

    const DayComponent = ({ date, state }: { date?: DateData; state?: string }) => {
        if (!date) {
            return <View />;
        }

        const dayEntries = entriesByDate.get(date.dateString) ?? [];
        const latestEntry = dayEntries[0];
        const mood = latestEntry ? resolveMoodForEntry(latestEntry, customMoods) : null;
        const isFuture = date.dateString > todayKey;

        return (
            <TouchableOpacity
                disabled={isFuture}
                onPress={() => navigation.navigate('DayEntries', { date: date.dateString })}
                style={[
                    styles.dayContainer,
                    latestEntry && { backgroundColor: latestEntry.color },
                    state === 'today' && { borderColor: colors.primary, borderWidth: 2 },
                    isFuture && styles.disabledDayContainer,
                ]}
            >
                <Text
                    style={[
                        styles.dayText,
                        latestEntry ? styles.dayTextFilled : { color: colors.text },
                        isFuture && { color: colors.textSecondary },
                    ]}
                >
                    {date.day}
                </Text>
                {mood && <Text style={styles.dayEmoji}>{mood.emoji}</Text>}
                {dayEntries.length > 1 && (
                    <View style={styles.dayCountBadge}>
                        <Text style={styles.dayCountText}>{dayEntries.length}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEntryObj = ({ item }: { item: MoodEntry }) => {
        const mood = resolveMoodForEntry(item, customMoods);

        return (
            <TouchableOpacity
                style={[styles.entryCard, { borderLeftColor: item.color }]}
                onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
            >
                <Text style={styles.entryEmoji}>{mood.emoji}</Text>
                <View style={styles.entryContent}>
                    <Text style={styles.entryDate}>
                        {format(item.timestamp, 'MMM d, h:mm a')}
                    </Text>
                    {item.note ? (
                        <Text style={styles.entryNote} numberOfLines={1}>
                            {item.note}
                        </Text>
                    ) : null}
                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                            {item.tags.map((tag) => (
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
                    {stats.currentStreak > 0 && (
                        <Text style={styles.streakText}>
                            {stats.currentStreak} Day{stats.currentStreak > 1 ? 's' : ''} Streak
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
                    <Text style={styles.headerButton}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.headerButton}>Settings</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                dayComponent={DayComponent}
                maxDate={todayKey}
                theme={{
                    backgroundColor: colors.background,
                    calendarBackground: colors.background,
                    textSectionTitleColor: colors.textSecondary,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.textSecondary,
                    arrowColor: colors.primary,
                    monthTextColor: colors.text,
                    indicatorColor: colors.primary,
                }}
                style={styles.calendar}
                key={colors.background}
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
                onPress={() => navigation.navigate('AddEntry')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof theme.colors.light) =>
    StyleSheet.create({
        safeArea: {
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
            gap: theme.spacing.sm,
        },
        headerButton: {
            fontSize: 14,
            color: theme.colors.primary,
            fontWeight: '700',
        },
        title: {
            ...theme.typography.h1,
            color: colors.text,
        },
        streakText: {
            fontSize: 14,
            fontWeight: '700',
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
            paddingBottom: 80,
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
            width: 34,
            height: 34,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 17,
            position: 'relative',
        },
        disabledDayContainer: {
            opacity: 0.45,
        },
        dayText: {
            fontSize: 14,
            fontWeight: '700',
        },
        dayTextFilled: {
            color: '#FFF',
        },
        dayEmoji: {
            fontSize: 10,
            position: 'absolute',
            bottom: -5,
            right: -3,
        },
        dayCountBadge: {
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 3,
        },
        dayCountText: {
            fontSize: 10,
            fontWeight: '700',
            color: colors.text,
        },
    });

export default HomeScreen;
