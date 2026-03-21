import React, { useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList, MoodEntry } from '../types';
import { useStore } from '../services/store';
import { useTheme } from '../constants/ThemeContext';
import { theme } from '../constants/theme';
import { formatEntryDateKey } from '../services/entryUtils';
import { resolveMoodForEntry } from '../services/moodResolver';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DayEntries'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'DayEntries'>;

const parseDateString = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const DayEntriesScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { date } = route.params;
    const { entries, customMoods } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const dayDate = useMemo(() => parseDateString(date), [date]);
    const dateLabel = useMemo(() => format(dayDate, 'MMMM d, yyyy'), [dayDate]);

    const dayEntries = useMemo(
        () =>
            [...entries]
                .filter((entry) => formatEntryDateKey(entry.timestamp) === date)
                .sort((left, right) => right.timestamp - left.timestamp),
        [date, entries]
    );

    const renderItem = ({ item }: { item: MoodEntry }) => {
        const mood = resolveMoodForEntry(item, customMoods);

        return (
            <TouchableOpacity
                style={[styles.entryCard, { borderLeftColor: item.color }]}
                onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
            >
                <Text style={styles.entryEmoji}>{mood.emoji}</Text>
                <View style={styles.entryContent}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryMood}>{mood.label}</Text>
                        <Text style={styles.entryTime}>{format(item.timestamp, 'h:mm a')}</Text>
                    </View>
                    {item.note ? (
                        <Text style={styles.entryNote} numberOfLines={2}>
                            {item.note}
                        </Text>
                    ) : (
                        <Text style={styles.entryPlaceholder}>No note added</Text>
                    )}
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerButton}>Back</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.title}>{dateLabel}</Text>
                    <Text style={styles.subtitle}>
                        {dayEntries.length} mood{dayEntries.length === 1 ? '' : 's'} logged
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddEntry', { selectedDate: date })}
                >
                    <Text style={styles.headerButton}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={dayEntries}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No moods logged yet</Text>
                        <Text style={styles.emptyText}>
                            Add one or more mood entries for this day to build a fuller journal.
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() =>
                                navigation.navigate('AddEntry', { selectedDate: date })
                            }
                        >
                            <Text style={styles.primaryButtonText}>Add Mood</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerCenter: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: theme.spacing.sm,
        },
        headerButton: {
            minWidth: 40,
            fontSize: 16,
            color: theme.colors.primary,
            textAlign: 'center',
        },
        title: {
            ...theme.typography.h2,
            fontSize: 18,
            color: colors.text,
            textAlign: 'center',
        },
        subtitle: {
            ...theme.typography.caption,
            color: colors.textSecondary,
            marginTop: 2,
        },
        listContent: {
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.xxl,
            flexGrow: 1,
        },
        entryCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: theme.spacing.md,
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.sm,
            borderLeftWidth: 4,
        },
        entryEmoji: {
            fontSize: 28,
            marginRight: theme.spacing.md,
            marginTop: 2,
        },
        entryContent: {
            flex: 1,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
            gap: theme.spacing.sm,
        },
        entryMood: {
            ...theme.typography.body,
            fontWeight: '700',
            color: colors.text,
            flex: 1,
        },
        entryTime: {
            ...theme.typography.caption,
            color: colors.textSecondary,
        },
        entryNote: {
            ...theme.typography.body,
            color: colors.text,
            lineHeight: 22,
        },
        entryPlaceholder: {
            ...theme.typography.body,
            color: colors.textSecondary,
            fontStyle: 'italic',
        },
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.sm,
        },
        tag: {
            fontSize: 12,
            color: colors.textSecondary,
            marginRight: 8,
            marginBottom: 4,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xxl,
            paddingHorizontal: theme.spacing.lg,
        },
        emptyTitle: {
            ...theme.typography.h2,
            color: colors.text,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        emptyText: {
            ...theme.typography.body,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: theme.spacing.lg,
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
        },
        primaryButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
        },
    });

export default DayEntriesScreen;
