import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoodPicker } from '../components/MoodPicker';
import { ColorSlider } from '../components/ColorSlider';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { MOODS } from '../constants/moods';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;

const AddEntryScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const addEntry = useStore((state) => state.addEntry);

    const [selectedMoodId, setSelectedMoodId] = useState<string>('happy');
    const [color, setColor] = useState<string>(MOODS[0].colors[0]);
    const [note, setNote] = useState('');
    const [intensity, setIntensity] = useState(7);

    const handleMoodSelect = (mood: typeof MOODS[0]) => {
        setSelectedMoodId(mood.id);
        setColor(mood.colors[0]); // Reset color to mood default
        setIntensity(mood.defaultIntensity);
    };

    const handleSave = () => {
        addEntry({
            moodId: selectedMoodId,
            color,
            intensity,
            note,
        });
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
                        <Text style={styles.title}>New Entry</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
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

                    <Text style={styles.label}>What's on your mind?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write about your day..."
                        multiline
                        value={note}
                        onChangeText={setNote}
                        placeholderTextColor={theme.colors.light.textSecondary}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        paddingBottom: theme.spacing.xl,
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
    cancelText: {
        ...theme.typography.body,
        color: theme.colors.light.textSecondary,
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
    },
    input: {
        backgroundColor: theme.colors.light.card,
        margin: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        minHeight: 120,
        textAlignVertical: 'top',
        ...theme.typography.body,
    },
});

export default AddEntryScreen;
