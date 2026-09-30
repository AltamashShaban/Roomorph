/**
 * MVP style catalogue — 8 styles. Add / edit styles here and the UI picks
 * them up automatically. `prompt` is what the AI receives; in production this
 * moves server-side (the app only sends `id`).
 * `image` is the style's sample photo (same room, redesigned in that style).
 */
import type { ImageSourcePropType } from 'react-native';

export type InteriorStyle = {
  id: string;
  name: string;
  description: string;
  prompt: string;
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
    prompt:
      'clean lines, neutral palette, sleek low-profile furniture, dark stone or marble accents, minimal ornament, warm concealed LED strip lighting',
    palette: ['#EDE8E1', '#B9AE9F', '#2A2A2A'],
    image: require('../../assets/styles/modern.jpg'),
    thumb: require('../../assets/styles/thumb-modern.jpg'),
    isPremium: false,
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light oak, soft whites and cosy textures. Calm, bright and functional.',
    prompt:
      'light oak wood, white walls, cozy knitted textiles, soft greys and sage green, sheer curtains, functional simple furniture, plants, hygge',
    palette: ['#F4F1EA', '#D8C3A1', '#7F8F76'],
    image: require('../../assets/styles/scandinavian.jpg'),
    thumb: require('../../assets/styles/thumb-scandinavian.jpg'),
    isPremium: false,
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Exposed brick, black metal and worn leather under moody track lights.',
    prompt:
      'exposed red brick wall, concrete surfaces, black metal frames and shelving, cognac leather sofa, reclaimed wood, black track lighting, black and white city prints',
    palette: ['#A3593C', '#6E6862', '#1F1F1F'],
    image: require('../../assets/styles/industrial.jpg'),
    thumb: require('../../assets/styles/thumb-industrial.jpg'),
    isPremium: false,
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Layered textiles, macramé, rattan and plants in warm earthy colours.',
    prompt:
      'layered patterned rugs and cushions, macramé wall hangings, rattan pendant light, woven poufs, rustic wood, lots of plants, warm terracotta and mustard tones, global decor',
    palette: ['#C2693E', '#E3B75B', '#5E7D5A'],
    image: require('../../assets/styles/bohemian.jpg'),
    thumb: require('../../assets/styles/thumb-bohemian.jpg'),
    isPremium: false,
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'Japanese calm meets Nordic warmth: low wood furniture, linen, paper lanterns.',
    prompt:
      'Japanese-Scandinavian fusion, low natural wood furniture, linen upholstery, paper lantern, wooden slat wall, muted earthy tones, minimal Japanese art, calm and zen',
    palette: ['#E9E1D4', '#B89F7E', '#5C5347'],
    image: require('../../assets/styles/japandi.jpg'),
    thumb: require('../../assets/styles/thumb-japandi.jpg'),
    isPremium: false,
  },
  {
    id: 'retro',
    name: 'Retro',
    description: '70s warmth: rust velvet, mustard and olive, curved shapes and bold graphic rugs.',
    prompt:
      '1970s retro, rust velvet sofa, mustard and olive green, walnut mid-century furniture with tapered legs, mushroom lamps, bold geometric rug, rainbow arch art, record player',
    palette: ['#B5532C', '#D9A441', '#5E6B3A'],
    image: require('../../assets/styles/retro.jpg'),
    thumb: require('../../assets/styles/thumb-retro.jpg'),
    isPremium: false,
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Moody lounge with neon RGB glow, a gaming desk and a big-screen setup.',
    prompt:
      'gaming lounge, purple and blue RGB LED ambient lighting, neon cove ceiling light, dark velvet sofa, gaming desk with monitor and PC, large wall-mounted TV, collectible shelves, moody atmosphere',
    palette: ['#1B1830', '#6C3BD1', '#2DA8F0'],
    image: require('../../assets/styles/gaming.jpg'),
    thumb: require('../../assets/styles/thumb-gaming.jpg'),
    isPremium: false,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Only the essentials. Soft whites, open space and nothing extra.',
    prompt:
      'extremely uncluttered, all-white and warm-white palette, low modular sofa, hidden storage, few essential pieces, lots of negative space, soft recessed lighting',
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
