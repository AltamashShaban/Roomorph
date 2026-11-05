/**
 * MVP style catalogue — 8 styles. Add / edit styles here and the UI picks
 * them up automatically. The AI prompt for each style lives in
 * supabase/functions/_shared/catalog.ts (shared by the app and the server).
 * `image` is the style's sample photo (same room, redesigned in that style).
 */
import type { ImageSourcePropType } from 'react-native';

export type InteriorStyle = {
  id: string;
  name: string;
  description: string;
  palette: [string, string, string];
  image: ImageSourcePropType; // same room restyled — detail sheet + sample results
  thumb: ImageSourcePropType; // hero sample shown on style cards
  isPremium: boolean;
};

export const STYLES: InteriorStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, neutral tones and sleek pieces with warm hidden lighting.',
    palette: ['#EDE8E1', '#B9AE9F', '#2A2A2A'],
    image: require('../../assets/styles/modern.jpg'),
    thumb: require('../../assets/styles/thumb-modern.jpg'),
    isPremium: false,
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light oak, soft whites and cosy textures. Calm, bright and functional.',
    palette: ['#F4F1EA', '#D8C3A1', '#7F8F76'],
    image: require('../../assets/styles/scandinavian.jpg'),
    thumb: require('../../assets/styles/thumb-scandinavian.jpg'),
    isPremium: false,
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Exposed brick, black metal and worn leather under moody track lights.',
    palette: ['#A3593C', '#6E6862', '#1F1F1F'],
    image: require('../../assets/styles/industrial.jpg'),
    thumb: require('../../assets/styles/thumb-industrial.jpg'),
    isPremium: false,
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Layered textiles, macramé, rattan and plants in warm earthy colours.',
    palette: ['#C2693E', '#E3B75B', '#5E7D5A'],
    image: require('../../assets/styles/bohemian.jpg'),
    thumb: require('../../assets/styles/thumb-bohemian.jpg'),
    isPremium: false,
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'Japanese calm meets Nordic warmth: low wood furniture, linen, paper lanterns.',
    palette: ['#E9E1D4', '#B89F7E', '#5C5347'],
    image: require('../../assets/styles/japandi.jpg'),
    thumb: require('../../assets/styles/thumb-japandi.jpg'),
    isPremium: false,
  },
  {
    id: 'retro',
    name: 'Retro',
    description: '70s warmth: rust velvet, mustard and olive, curved shapes and bold graphic rugs.',
    palette: ['#B5532C', '#D9A441', '#5E6B3A'],
    image: require('../../assets/styles/retro.jpg'),
    thumb: require('../../assets/styles/thumb-retro.jpg'),
    isPremium: false,
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Moody lounge with neon RGB glow, a gaming desk and a big-screen setup.',
    palette: ['#1B1830', '#6C3BD1', '#2DA8F0'],
    image: require('../../assets/styles/gaming.jpg'),
    thumb: require('../../assets/styles/thumb-gaming.jpg'),
    isPremium: false,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Only the essentials. Soft whites, open space and nothing extra.',
    palette: ['#F6F4F0', '#DDD8CF', '#8C857B'],
    image: require('../../assets/styles/minimalist.jpg'),
    thumb: require('../../assets/styles/thumb-minimalist.jpg'),
    isPremium: false,
  },
];

export const getStyle = (id?: string | null) => STYLES.find((st) => st.id === id);

/** The plain "before" room used for demos and the "Use sample room" option. */
export const SAMPLE_ROOM = require('../../assets/styles/sample-room.jpg');
export const SAMPLE_ROOM_URI = 'sample:room';
