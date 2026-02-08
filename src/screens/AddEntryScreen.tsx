import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoodPicker } from '../components/MoodPicker';
import { ColorSlider } from '../components/ColorSlider';
import { TagPicker } from '../components/TagPicker';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { RootStackParamList } from '../types';
import { useTheme } from '../constants/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddEntry'>;

const AddEntryScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { addEntry, updateEntry } = useStore();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const entryToEdit = route.params?.entry;
    const isEditing = !!entryToEdit;

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
        // Only reset color if we are NOT in initial load of edit mode 
        // (but useEffect handles initial load, so here user interaction should probably reset color to mood default?)
        // Yes, usually picking a new mood should reset the color/intensity defaults unless user customized it?
        // Let's stick to resetting color to mood default when mood changes.
        setColor(mood.colors[0]);
        setIntensity(mood.defaultIntensity);
    };

    const handleToggleTag = (tag: string) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                return prev.filter((t) => t !== tag);
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

                    <Text style={styles.label}>How are you feeling?</Text>
                    <MoodPicker selectedMoodId={selectedMoodId} onSelect={handleMoodSelect} />

                    <Text style={styles.label}>Pick your color</Text>
                    <ColorSlider
                        colors={[]} // Using internal presets for now
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

const createStyles = (colors: typeof theme.colors.light) => StyleSheet.create({
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
        ...theme.typography.h2, // Bold
        fontSize: 16,
        color: theme.colors.primary,
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
