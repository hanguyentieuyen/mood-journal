import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const { entries } = useStore();
    const navigation = useNavigation<NavigationProp>();

    const markedDates = useMemo(() => {
        const marks: any = {};
        entries.forEach((entry) => {
            const dateStr = format(entry.timestamp, 'yyyy-MM-dd');
            marks[dateStr] = {
                marked: true,
                dotColor: entry.color,
            };
        });
        return marks;
    }, [entries]);

    const recentEntries = useMemo(() => {
        return [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    }, [entries]);

    const renderEntryObj = ({ item }: { item: any }) => {
        const mood = MOODS.find((m) => m.id === item.moodId);
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
                    {item.note && (
                        <Text style={styles.entryNote} numberOfLines={1}>
                            {item.note}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.title}>Mood Journal</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
                    <Text style={styles.headerButton}>📊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.headerButton}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                markedDates={markedDates}
                theme={{
                    backgroundColor: theme.colors.light.background,
                    calendarBackground: theme.colors.light.background,
                    textSectionTitleColor: theme.colors.light.textSecondary,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.light.text,
                    textDisabledColor: '#d9e1e8',
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.light.text,
                    indicatorColor: theme.colors.primary,
                }}
                style={styles.calendar}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.light.background,
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
        borderBottomColor: theme.colors.light.border,
    },
    headerButton: {
        fontSize: 24,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.light.text,
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
        color: theme.colors.light.text,
    },
    listContent: {
        paddingBottom: 80, // Space for FAB
    },
    entryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.light.card,
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
        color: theme.colors.light.textSecondary,
        marginBottom: 2,
    },
    entryNote: {
        ...theme.typography.body,
        color: theme.colors.light.text,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.light.textSecondary,
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
});

export default HomeScreen;
