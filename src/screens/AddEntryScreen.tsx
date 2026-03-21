import React, { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { MoodPicker } from '../components/MoodPicker';
import { ColorSlider } from '../components/ColorSlider';
import { TagPicker } from '../components/TagPicker';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { RootStackParamList } from '../types';
import { useTheme } from '../constants/ThemeContext';
import { buildTimestampForDate } from '../services/entryUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddEntry'>;

const parseDateString = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const AddEntryScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { addEntry, updateEntry } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const entryToEdit = route.params?.entry;
    const selectedDate = route.params?.selectedDate;
    const isEditing = !!entryToEdit;
    const targetDate =
        entryToEdit ? format(entryToEdit.timestamp, 'yyyy-MM-dd') : selectedDate;
    const targetDateLabel = targetDate
        ? format(parseDateString(targetDate), 'EEEE, MMMM d, yyyy')
        : null;

    const [selectedMoodId, setSelectedMoodId] = useState<string>('happy');
    const [color, setColor] = useState<string>(MOODS[0].colors[0]);
    const [note, setNote] = useState('');
    const [intensity, setIntensity] = useState(7);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (entryToEdit) {
            setSelectedMoodId(entryToEdit.moodId);
            setColor(entryToEdit.color);
            setNote(entryToEdit.note);
            setIntensity(entryToEdit.intensity);
            setSelectedTags(entryToEdit.tags || []);
        }
    }, [entryToEdit]);

    const handleMoodSelect = (mood: typeof MOODS[0]) => {
        setSelectedMoodId(mood.id);
        setColor(mood.colors[0]);
        setIntensity(mood.defaultIntensity);
    };

    const handleToggleTag = (tag: string) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                return prev.filter((item) => item !== tag);
            }

            return [...prev, tag];
        });
    };

    const handleSave = () => {
        if (isEditing && entryToEdit) {
            updateEntry({
                ...entryToEdit,
                moodId: selectedMoodId,
                color,
                intensity,
                note,
                tags: selectedTags,
            });
        } else {
            addEntry({
                moodId: selectedMoodId,
                color,
                intensity,
                note,
                tags: selectedTags,
                ...(targetDate ? { timestamp: buildTimestampForDate(targetDate) } : {}),
            });
        }

        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'New Entry'}</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveText}>{isEditing ? 'Update' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>

                    {!isEditing && targetDateLabel && (
                        <View style={styles.dateBanner}>
                            <Text style={styles.dateBannerLabel}>Logging for</Text>
                            <Text style={styles.dateBannerValue}>{targetDateLabel}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>How are you feeling?</Text>
                    <MoodPicker selectedMoodId={selectedMoodId} onSelect={handleMoodSelect} />

                    <Text style={styles.label}>Pick your color</Text>
                    <ColorSlider
                        colors={[]}
                        selectedColor={color}
                        onSelect={setColor}
                    />

                    <Text style={styles.label}>Tags</Text>
                    <TagPicker selectedTags={selectedTags} onToggleTag={handleToggleTag} />

                    <Text style={styles.label}>What's on your mind?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write about your day..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        value={note}
                        onChangeText={setNote}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof theme.colors.light) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: theme.spacing.xl,
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
        cancelText: {
            ...theme.typography.body,
            color: colors.textSecondary,
        },
        saveText: {
            ...theme.typography.h2,
            fontSize: 16,
            color: theme.colors.primary,
        },
        dateBanner: {
            marginHorizontal: theme.spacing.md,
            marginTop: theme.spacing.md,
            backgroundColor: colors.card,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
        },
        dateBannerLabel: {
            ...theme.typography.caption,
            color: colors.textSecondary,
            marginBottom: 2,
            textTransform: 'uppercase',
        },
        dateBannerValue: {
            ...theme.typography.body,
            color: colors.text,
            fontWeight: '700',
        },
        label: {
            ...theme.typography.h2,
            fontSize: 18,
            marginTop: theme.spacing.lg,
            marginLeft: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            color: colors.text,
        },
        input: {
            backgroundColor: colors.card,
            margin: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            minHeight: 120,
            textAlignVertical: 'top',
            ...theme.typography.body,
            color: colors.text,
        },
    });

export default AddEntryScreen;
