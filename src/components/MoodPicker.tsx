import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { MOODS, MoodOption } from '../constants/moods';
import { theme } from '../constants/theme';

interface MoodPickerProps {
    selectedMoodId?: string;
    onSelect: (mood: MoodOption) => void;
}

const MoodItem = ({
    item,
    isSelected,
    onPress,
    styles,
}: {
    item: MoodOption;
    isSelected: boolean;
    onPress: () => void;
    styles: any;
}) => {
    const scale = useSharedValue(isSelected ? 1.2 : 1);
    const opacity = useSharedValue(isSelected ? 1 : 0.6);

    useEffect(() => {
        scale.value = withSpring(isSelected ? 1.3 : 1);
        opacity.value = withSpring(isSelected ? 1 : 0.5);
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
            <Animated.View style={[styles.moodCircle, animatedStyle]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </Animated.View>
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );
};

export const MoodPicker: React.FC<MoodPickerProps> = ({
    selectedMoodId,
    onSelect,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <FlatList
                data={MOODS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MoodItem
                        item={item}
                        isSelected={item.id === selectedMoodId}
                        onPress={() => onSelect(item)}
                        styles={styles}
                    />
                )}
            />
        </View>
    );
};

const createStyles = (colors: typeof theme.colors.light) => StyleSheet.create({
    container: {
        height: 120,
        marginVertical: theme.spacing.md,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.md,
        alignItems: 'center',
    },
    itemContainer: {
        alignItems: 'center',
        marginHorizontal: theme.spacing.sm,
        width: 60,
    },
    moodCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emoji: {
        fontSize: 32,
    },
    label: {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    selectedLabel: {
        color: colors.text,
        fontWeight: 'bold',
    },
});
