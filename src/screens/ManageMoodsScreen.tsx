import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../services/store';
import { useTheme } from '../constants/ThemeContext';
import { theme } from '../constants/theme';
import { CustomMood } from '../types';

const ManageMoodsScreen = () => {
    const { customMoods, addCustomMood, deleteCustomMood } = useStore();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [newMoodName, setNewMoodName] = useState('');
    const [newMoodEmoji, setNewMoodEmoji] = useState('🙂');
    const [newMoodColor, setNewMoodColor] = useState('#888888'); // Could add a color picker later

    const handleAddMood = () => {
        if (!newMoodName.trim() || !newMoodEmoji.trim()) return;

        addCustomMood({
            name: newMoodName.trim(),
            emoji: newMoodEmoji.trim(),
            color: newMoodColor,
        });

        setNewMoodName('');
        setNewMoodEmoji('🙂');
    };

    const renderItem = ({ item }: { item: CustomMood }) => (
        <View style={styles.moodItemContainer}>
            <View style={[styles.moodCircle, { backgroundColor: item.color }]}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteCustomMood(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Done</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Manage Moods</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Create New Mood</Text>
                    
                    <View style={styles.inputRow}>
                        <View style={styles.emojiInputContainer}>
                            <Text style={styles.inputLabel}>Emoji</Text>
                            <TextInput
                                style={styles.emojiInput}
                                value={newMoodEmoji}
                                onChangeText={(text) => setNewMoodEmoji(text.slice(-2))} // Keep it short
                            />
                        </View>
                        
                        <View style={styles.nameInputContainer}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.nameInput}
                                value={newMoodName}
                                onChangeText={setNewMoodName}
                                placeholder="e.g. Excited"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.addButton, !newMoodName && styles.addButtonDisabled]} 
                        onPress={handleAddMood}
                        disabled={!newMoodName}
                    >
                        <Text style={styles.addButtonText}>Add Mood</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Your Custom Moods</Text>
                    <FlatList
                        data={customMoods}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>You haven't added any custom moods yet.</Text>
                        }
                    />
                </View>
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
    backText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: theme.spacing.md,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 16,
        marginBottom: theme.spacing.md,
        color: colors.text,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    emojiInputContainer: {
        width: 60,
        marginRight: theme.spacing.md,
    },
    nameInputContainer: {
        flex: 1,
    },
    inputLabel: {
        ...theme.typography.caption,
        color: colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    emojiInput: {
        backgroundColor: colors.background,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        fontSize: 24,
        textAlign: 'center',
        color: colors.text,
    },
    nameInput: {
        backgroundColor: colors.background,
        padding: theme.spacing.sm,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.sm,
        ...theme.typography.body,
        color: colors.text,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: colors.border,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    listSection: {
        flex: 1,
        padding: theme.spacing.md,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
    moodItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    moodCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    itemEmoji: {
        fontSize: 20,
    },
    itemName: {
        flex: 1,
        ...theme.typography.body,
        color: colors.text,
    },
    deleteButton: {
        padding: theme.spacing.sm,
    },
    deleteText: {
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: theme.spacing.xl,
    },
});

export default ManageMoodsScreen;
