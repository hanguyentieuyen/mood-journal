import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface ColorSliderProps {
    colors: string[];
    selectedColor: string;
    onSelect: (color: string) => void;
}

import { useTheme } from '../constants/ThemeContext';

export const ColorSlider: React.FC<ColorSliderProps> = ({
    colors: availableColors,
    selectedColor,
    onSelect,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFD93D', '#6A9BD8', '#B084CC', '#FF6B6B', '#95A99E', '#FF85C0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.gradient}
            />
            {/* Simplified selector for MVP: Preset colors from the gradient */}
            <View style={styles.dotsContainer}>
                {['#FFD93D', '#6A9BD8', '#B084CC', '#FF6B6B', '#95A99E', '#FF85C0'].map(
                    (color) => (
                        <TouchableOpacity
                            key={color}
                            onPress={() => onSelect(color)}
                            style={[
                                styles.dot,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedDot,
                            ]}
                        />
                    )
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: typeof theme.colors.light) => StyleSheet.create({
    container: {
        marginVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },
    gradient: {
        height: 20,
        borderRadius: theme.borderRadius.md,
        opacity: 0.3,
        marginBottom: -10,
        width: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10, // Overlap slightly
    },
    dot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    selectedDot: {
        transform: [{ scale: 1.2 }],
        borderWidth: 2,
        borderColor: colors.text,
    },
});
