export type MoodOption = {
    id: string;
    label: string;
    emoji: string;
    colors: [string, string]; // Gradient start/end
    defaultIntensity: number;
    value: number; // 1-6 scale for chart/analytics
};

export const MOODS: MoodOption[] = [
    {
        id: 'excited',
        label: 'Excited',
        emoji: '✨',
        colors: ['#FF85C0', '#FC60A8'],
        defaultIntensity: 9,
        value: 6,
    },
    {
        id: 'happy',
        label: 'Happy',
        emoji: '😊',
        colors: ['#FFD93D', '#F6C90E'],
        defaultIntensity: 7,
        value: 5,
    },
    {
        id: 'tired',
        label: 'Tired',
        emoji: '😴',
        colors: ['#95A99E', '#7B8D8E'],
        defaultIntensity: 3,
        value: 3,
    },
    {
        id: 'anxious',
        label: 'Anxious',
        emoji: '😰',
        colors: ['#B084CC', '#9b59b6'],
        defaultIntensity: 5,
        value: 2,
    },
    {
        id: 'sad',
        label: 'Sad',
        emoji: '😢',
        colors: ['#6A9BD8', '#4A7BA7'],
        defaultIntensity: 4,
        value: 1,
    },
    {
        id: 'angry',
        label: 'Angry',
        emoji: '😡',
        colors: ['#FF6B6B', '#EE5A6F'],
        defaultIntensity: 8,
        value: 1,
    },
];
