import { BookOpenIcon, ListMusicIcon, MusicIcon } from '@/Components/AppIcons';

const accents = {
    crimson: {
        border: 'border-[rgba(224,86,108,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.16),transparent_60%)]',
        tile: 'bg-[rgba(224,86,108,0.14)] text-[#F07A8D]',
    },
    plum: {
        border: 'border-[rgba(162,120,224,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]',
        tile: 'bg-[rgba(162,120,224,0.14)] text-[#BFA0F0]',
    },
    amber: {
        border: 'border-[rgba(242,185,75,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]',
        tile: 'bg-[rgba(242,185,75,0.12)] text-[#F2B94B]',
    },
};

// Accent and icon per course; courses not listed here cycle through the accents by id
const courseStyles = {
    'Formation Musicale et Auditive': { accent: 'crimson', Icon: MusicIcon },
    'Histoire de la Musique': { accent: 'plum', Icon: ListMusicIcon },
    'Littérature Musicale': { accent: 'amber', Icon: BookOpenIcon },
};
const fallbackAccents = ['crimson', 'plum', 'amber'];

export const courseStyle = (name, id) => {
    const style = courseStyles[name] ?? { accent: fallbackAccents[Number(id) % fallbackAccents.length], Icon: MusicIcon };
    return { ...accents[style.accent], Icon: style.Icon };
};
