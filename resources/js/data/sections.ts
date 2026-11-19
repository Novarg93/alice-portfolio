import { isProject, projects } from './projects';
import type { ProjectId } from './projects';

export type Section = ProjectId | 'about' | 'projects' | 'hard-skills' | 'soft-skills' | 'tools' | 'experience';
export type FolderId = Exclude<Section, 'projects' | 'soft-skills'>;

export const menuItems = [
    ['about', 'Обо мне'],
    ['projects', 'Проекты'],
    ['hard-skills', 'Навыки'],
    ['tools', 'Стек'],
    ['experience', 'Опыт'],
] as const;

export const folders = {
    about: { name: 'Обо мне', rotation: -1.6, anchor: [0.233, 0.64], side: 'left' },
    'photo-guide': { name: 'Проект 1', tip: '«Фото-гид»', rotation: -2.8, anchor: [0.76, 0.44], side: 'right' },
    boosting: { name: 'Проект 2', tip: '«Boosting WoW»', rotation: 3.2, anchor: [0.91, 0.14], side: 'right' },
    mare: { name: 'Проект 3', tip: '«MARÉ Seafood»', rotation: 2.0, anchor: [0.9, 0.8], side: 'right' },
    'hard-skills': { name: 'Skills', rotation: -0.8, anchor: [0.3, 0.215], side: 'left' },
    experience: { name: 'Опыт', rotation: 2.4, anchor: [0.806, 0.425], side: 'left' },
    tools: { name: 'Стек', rotation: 1.2, anchor: [0.855, 0.847], side: 'left' },
} satisfies Record<
    FolderId,
    { name: string; tip?: string; rotation: number; anchor: [number, number]; side: 'left' | 'right' }
>;

const sectionLabels = {
    about: 'Обо мне',
    projects: 'Проекты',
    'hard-skills': 'Hard & Soft skills',
    'soft-skills': 'Soft skills',
    tools: 'Стек',
    experience: 'Опыт работы',
};

export function sectionLabel(section: Section): string {
    return isProject(section) ? projects[section].label : sectionLabels[section];
}

export function readSection(hash: string): Section | null {
    const value = hash.slice(1);
    if (isProject(value)) return value;
    return (
        (Object.keys(sectionLabels).find((key) => key === value) as keyof typeof sectionLabels | undefined) ?? null
    );
}
