import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    themeType: ThemeType;
    colors: typeof theme.colors.light & {
        primary: string;
        error: string;
        success: string;
    };
    toggleTheme: () => void;
    setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>(systemScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('theme');
                if (storedTheme) {
                    setThemeType(storedTheme as ThemeType);
                } else if (systemScheme) {
                    setThemeType(systemScheme as ThemeType); // Fallback to system if no stored preference
                }
            } catch (error) {
                console.error('Failed to load theme', error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = themeType === 'light' ? 'dark' : 'light';
        setThemeType(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const setTheme = async (type: ThemeType) => {
        setThemeType(type);
        try {
            await AsyncStorage.setItem('theme', type);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const colors = {
        ...theme.colors[themeType],
        primary: theme.colors.primary,
        error: theme.colors.error,
        success: theme.colors.success,
    };

    return (
        <ThemeContext.Provider value={{ themeType, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
