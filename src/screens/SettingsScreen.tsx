import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../services/store';
import { theme } from '../constants/theme';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme: currentTheme, setTheme, clearEntries } = useStore();

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
                        <Text style={styles.rowLabel}>Dark Mode (System)</Text>
                        <Switch
                            value={currentTheme === 'dark'}
                            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>

                    <TouchableOpacity style={styles.row} onPress={handleClearData}>
                        <Text style={[styles.rowLabel, styles.dangerText]}>Clear All Data</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.light.background,
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
        color: theme.colors.light.textSecondary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.light.border,
    },
    rowLabel: {
        ...theme.typography.body,
        fontSize: 16,
    },
    dangerText: {
        color: theme.colors.error,
    },
    aboutText: {
        ...theme.typography.body,
        color: theme.colors.light.textSecondary,
        marginBottom: theme.spacing.xs,
    },
});

export default SettingsScreen;
