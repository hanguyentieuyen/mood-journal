export const theme = {
    colors: {
        light: {
            background: '#FFFFFF',
            text: '#2D3436',
            textSecondary: '#636E72',
            card: '#F5F6FA',
            border: '#DFE6E9',
        },
        dark: {
            background: '#1A1A2E',
            text: '#FFFFFF',
            textSecondary: '#B2BEC3',
            card: '#16213E',
            border: '#2D3436',
        },
        primary: '#6C5CE7',
        error: '#FF6B6B',
        success: '#00B894',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 20,
        xl: 30,
        round: 999,
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700' as const },
        h2: { fontSize: 24, fontWeight: '700' as const },
        body: { fontSize: 16, fontWeight: '400' as const },
        caption: { fontSize: 14, fontWeight: '400' as const },
    },
};
