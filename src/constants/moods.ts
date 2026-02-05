export type MoodOption = {
    id: string;
    label: string;
    emoji: string;
    colors: [string, string]; // Gradient start/end
    defaultIntensity: number;
};

export const MOODS: MoodOption[] = [
    {
        id: 'happy',
        label: 'Happy',
        emoji: '😊',
        colors: ['#FFD93D', '#F6C90E'],
        defaultIntensity: 7,
    },
    {
        id: 'sad',
        label: 'Sad',
        emoji: '😢',
        colors: ['#6A9BD8', '#4A7BA7'],
        defaultIntensity: 4,
    },
    {
        id: 'anxious',
        label: 'Anxious',
        emoji: '😰',
        colors: ['#B084CC', '#9b59b6'],
        defaultIntensity: 5,
    },
    {
        id: 'angry',
        label: 'Angry',
        emoji: '😡',
        colors: ['#FF6B6B', '#EE5A6F'],
        defaultIntensity: 8,
    },
    {
        id: 'tired',
        label: 'Tired',
        emoji: '😴',
        colors: ['#95A99E', '#7B8D8E'],
        defaultIntensity: 3,
    },
    {
        id: 'excited',
        label: 'Excited',
        emoji: '✨',
        colors: ['#FF85C0', '#FC60A8'],
        defaultIntensity: 9,
    },
];
