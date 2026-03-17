import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { requestPermissionsAsync, scheduleDailyReminder, cancelAllReminders } from '../services/notifications';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { clearEntries, reminder, updateReminder } = useStore();
    const { themeType, setTheme, colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all your entries? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: () => {
                        clearEntries();
                        Alert.alert('Success', 'All data has been cleared.');
                    },
                },
            ]
        );
    };

    const handleToggleReminder = async (val: boolean) => {
        if (val) {
            const hasPermission = await requestPermissionsAsync();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
                return;
            }
            await scheduleDailyReminder(reminder.time);
            updateReminder({ enabled: true });
        } else {
            await cancelAllReminders();
            updateReminder({ enabled: false });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Dark Mode</Text>
                        <Switch
                            value={themeType === 'dark'}
                            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={'#f4f3f4'}
                        />
                    </View>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.rowLabel}>Daily Reminder</Text>
                            <Text style={styles.rowSubLabel}>At {reminder.time}</Text>
                        </View>
                        <Switch
                            value={reminder.enabled}
                            onValueChange={handleToggleReminder}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={'#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>

                    <TouchableOpacity style={styles.row} onPress={handleClearData}>
                        <Text style={[styles.rowLabel, styles.dangerText]}>
                            Clear All Data
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>Mood JournalApp v1.0.0</Text>
                    <Text style={styles.aboutText}>Made with 💜</Text>
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
    backButton: {
        color: theme.colors.primary,
        fontSize: 16,
    },
    content: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowLabel: {
        ...theme.typography.body,
        fontSize: 16,
        color: colors.text,
    },
    rowSubLabel: {
        ...theme.typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    dangerText: {
        color: theme.colors.error,
    },
    aboutText: {
        ...theme.typography.body,
        color: colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
});

export default SettingsScreen;
