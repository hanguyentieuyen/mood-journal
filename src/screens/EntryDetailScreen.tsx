import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { resolveMoodForEntry } from '../services/moodResolver';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'EntryDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EntryDetail'>;

const EntryDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<DetailScreenRouteProp>();
    const { entryId } = route.params;
    const { entries, customMoods, deleteEntry } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const entry = entries.find((e) => e.id === entryId);
    const mood = entry ? resolveMoodForEntry(entry, customMoods) : null;

    if (!entry || !mood) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Entry not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteEntry(entryId);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.date}>
                    {format(entry.timestamp, 'MMMM d, yyyy')}
                </Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddEntry', { entry })}
                        style={{ marginRight: 16 }}
                    >
                        <Text style={styles.headerButton}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <Text style={[styles.headerButton, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={mood.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.moodCard}
                >
                    <Text style={styles.emoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                    <Text style={styles.intensity}>Intensity: {entry.intensity}/10</Text>
                </LinearGradient>

                <View style={styles.detailsContainer}>
                    <Text style={styles.timeLabel}>
                        {format(entry.timestamp, 'h:mm a')}
                    </Text>

                    {entry.note ? (
                        <View style={styles.noteContainer}>
                            <Text style={styles.note}>{entry.note}</Text>
                        </View>
                    ) : null}

                    {entry.tags && entry.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {entry.tags.map(tag => (
                                <Text key={tag} style={styles.tag}>#{tag}</Text>
                            ))}
                        </View>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        fontSize: 16,
        color: theme.colors.primary,
    },
    date: {
        ...theme.typography.h2,
        fontSize: 16,
        color: colors.text,
    },
    deleteText: {
        color: theme.colors.error,
    },
    content: {
        padding: theme.spacing.md,
    },
    moodCard: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    emoji: {
        fontSize: 64,
        marginBottom: theme.spacing.sm,
    },
    moodLabel: {
        ...theme.typography.h1,
        color: '#fff',
        marginBottom: theme.spacing.xs,
    },
    intensity: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.9)',
    },
    detailsContainer: {
        marginTop: theme.spacing.md,
    },
    timeLabel: {
        ...theme.typography.caption,
        color: colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    noteContainer: {
        backgroundColor: colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
    },
    note: {
        ...theme.typography.body,
        color: colors.text,
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
    },
    tag: {
        backgroundColor: colors.card,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.round,
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        color: colors.textSecondary,
        fontSize: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    errorText: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.md,
        color: colors.text,
    },
    backButton: {
        color: theme.colors.primary,
        fontSize: 16,
    },
});

export default EntryDetailScreen;
