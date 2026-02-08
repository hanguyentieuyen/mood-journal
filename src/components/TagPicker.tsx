import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { useStore } from '../services/store';

interface TagPickerProps {
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
}

export const TagPicker: React.FC<TagPickerProps> = ({ selectedTags, onToggleTag }) => {
    const { colors } = useTheme();
    const { tags, addTag, deleteTag, updateTag } = useStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editingTag, setEditingTag] = useState<string | null>(null);

    const openCreateModal = () => {
        setEditingTag(null);
        setInputValue('');
        setModalVisible(true);
    };

    const openEditModal = (tag: string) => {
        setEditingTag(tag);
        setInputValue(tag);
        setModalVisible(true);
    };

    const handleSave = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        if (editingTag) {
            if (trimmed !== editingTag) {
                updateTag(editingTag, trimmed);
            }
        } else {
            addTag(trimmed);
            onToggleTag(trimmed); // Auto-select new tag
        }
        setModalVisible(false);
        setInputValue('');
        setEditingTag(null);
    };

    const handleLongPress = (tag: string) => {
        Alert.alert(
            'Manage Tag',
            `Choose an action for "${tag}"`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Delete',
                            `Are you sure you want to delete "${tag}"? It will be removed from all entries.`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => deleteTag(tag),
                                },
                            ]
                        );
                    },
                },
                {
                    text: 'Edit',
                    onPress: () => openEditModal(tag),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.tag,
                        styles.addTagButton,
                        { borderColor: colors.primary },
                    ]}
                    onPress={openCreateModal}
                >
                    <Text style={[styles.addTagText, { color: colors.primary }]}>+ Add</Text>
                </TouchableOpacity>

                {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <TouchableOpacity
                            key={tag}
                            style={[
                                styles.tag,
                                {
                                    backgroundColor: isSelected ? colors.primary : colors.card,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => onToggleTag(tag)}
                            onLongPress={() => handleLongPress(tag)}
                            delayLongPress={500}
                        >
                            <Text
                                style={[
                                    styles.tagText,
                                    { color: isSelected ? '#FFFFFF' : colors.text },
                                ]}
                            >
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {editingTag ? 'Edit Tag' : 'New Tag'}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            placeholder="Tag name"
                            placeholderTextColor={colors.textSecondary}
                            value={inputValue}
                            onChangeText={setInputValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            >
                                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={styles.modalButton}
                            >
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                                    {editingTag ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    addTagButton: {
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
    },
    addTagText: {
        fontWeight: '600',
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        padding: 24,
        borderRadius: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
    },
    modalButton: {
        padding: 8,
    },
});
