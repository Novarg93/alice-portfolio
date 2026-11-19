export const toolGroups = [
    {
        id: 'img',
        name: 'AI для изображений',
        description: 'Генерация визуала',
        color: '#ff9f43',
        items: [
            {
                label: 'Midjourney',
                icon: 'mj',
                tag: '',
            },
            {
                label: 'Recraft',
                icon: 'rc',
                tag: '',
            },
            {
                label: 'Krea',
                icon: 'kr',
                tag: '',
            },
            {
                label: 'Nano Banana',
                icon: 'nb',
                tag: '',
            },
        ],
    },
    {
        id: 'txt',
        name: 'AI для текста',
        description: 'Тексты и структура',
        color: '#a78bfa',
        items: [
            {
                label: 'ChatGPT / Codex',
                icon: 'gpt',
                tag: '',
            },
            {
                label: 'Claude',
                icon: 'cl',
                tag: '',
            },
            {
                label: 'Gemini',
                icon: 'gm',
                tag: '',
            },
            {
                label: 'Hermes',
                icon: 'he',
                tag: 'агент',
            },
        ],
    },
    {
        id: 'adobe',
        name: 'Adobe',
        description: 'Фото, графика и моушн',
        color: '#ff6b6b',
        items: [
            {
                label: 'Photoshop',
                icon: 'ps',
                tag: '',
            },
            {
                label: 'Illustrator',
                icon: 'ai',
                tag: '',
            },
            {
                label: 'After Effects',
                icon: 'ae',
                tag: '',
            },
        ],
    },
    {
        id: 'ui',
        name: 'Дизайн и сборка',
        description: 'Макеты и сайты',
        color: '#0077ff',
        items: [
            {
                label: 'Figma',
                icon: 'fi',
                tag: '',
            },
            {
                label: 'Framer',
                icon: 'fr',
                tag: '',
            },
            {
                label: 'Tilda',
                icon: 'ti',
                tag: '',
            },
            {
                label: 'Яндекс Метрика',
                icon: 'ym',
                tag: '',
            },
            {
                label: 'HTML (базовый)',
                icon: 'html',
                tag: '',
            },
        ],
    },
    {
        id: 'team',
        name: 'Работа в команде',
        description: 'Работа с командой',
        color: '#2eb67d',
        items: [
            {
                label: 'Jira',
                icon: 'ji',
                tag: '',
            },
            {
                label: 'Notion',
                icon: 'no',
                tag: '',
            },
            {
                label: 'Miro',
                icon: 'mi',
                tag: '',
            },
            {
                label: 'Slack',
                icon: 'sl',
                tag: '',
            },
        ],
    },
] as const;
