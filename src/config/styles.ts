/**
 * Style catalogue. Add / edit styles here — the UI picks them up automatically.
 * `prompt` is what the AI receives. In production this file moves server-side
 * (the app will only send `id`), so users can't tamper with prompts.
 * `palette` drives the placeholder thumbnails until real images exist.
 */

export type StyleCategory =
  | 'Modern'
  | 'Classic'
  | 'Natural & Rustic'
  | 'Urban & Bold'
  | 'Cultural'
  | 'Luxury'
  | 'Trending';

export type InteriorStyle = {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  prompt: string;
  palette: [string, string, string];
  thumbnail?: number; // require('...') once real images exist
  isPremium: boolean;
};

export const STYLE_CATEGORIES: StyleCategory[] = [
  'Modern',
  'Classic',
  'Natural & Rustic',
  'Urban & Bold',
  'Cultural',
  'Luxury',
  'Trending',
];

const s = (
  id: string,
  name: string,
  category: StyleCategory,
  description: string,
  prompt: string,
  palette: [string, string, string],
  isPremium = false,
): InteriorStyle => ({ id, name, category, description, prompt, palette, isPremium });

export const STYLES: InteriorStyle[] = [
  // Modern
  s('modern', 'Modern', 'Modern', 'Clean lines, neutral tones and sleek, minimal pieces.', 'clean lines, neutral palette, sleek furniture, minimal ornament, glass and metal accents', ['#E8E6E1', '#9C9A96', '#2F2F2F']),
  s('contemporary', 'Contemporary', 'Modern', 'Soft curves and mixed textures with bold accents.', 'current trends, soft curves, mixed textures, neutral base with bold accent pieces', ['#EDE8E1', '#C2B8A8', '#3F5A6B']),
  s('minimalist', 'Minimalist', 'Modern', 'Only the essentials. Calm, monochrome and airy.', 'extremely uncluttered, monochrome palette, hidden storage, few essential pieces, lots of negative space', ['#F4F3F0', '#D8D6D1', '#5E5D5A']),
  s('mid-century', 'Mid-Century Modern', 'Modern', 'Warm teak, tapered legs and retro mustard accents.', '1950s–60s furniture, teak and walnut wood, tapered legs, mustard and teal accents, organic shapes', ['#C98B4E', '#D9A441', '#2E6E6A']),
  s('scandinavian', 'Scandinavian', 'Modern', 'Light oak, soft greys and cosy, functional hygge.', 'light oak wood, white walls, cozy textiles, hygge, soft greys, functional simple furniture, plants', ['#F2EFEA', '#D9C7A8', '#9AA3A0']),
  s('japandi', 'Japandi', 'Modern', 'Japanese calm meets Nordic warmth. Low, natural, zen.', 'Japanese-Scandinavian fusion, low furniture, natural wood, linen, muted earthy tones, calm and zen', ['#E9E1D4', '#B89F7E', '#5C5347']),
  // Classic
  s('traditional', 'Traditional', 'Classic', 'Rich wood, symmetry and timeless patterned rugs.', 'classic furniture, rich wood, symmetrical layout, patterned rugs, crown molding, warm colors', ['#7A4A2E', '#C9A77C', '#8B2E2E']),
  s('transitional', 'Transitional', 'Classic', 'Classic comfort with clean, understated lines.', 'blend of traditional and modern, neutral tones, clean-lined classic furniture, understated elegance', ['#EAE4DA', '#B7A99A', '#6B6259']),
  s('neoclassical', 'Neoclassical', 'Classic', 'Columns, marble and soft whites with gold.', 'Greek and Roman inspired details, columns, symmetry, marble, soft whites and gold accents', ['#F5F2EC', '#D6CFC4', '#B8964E']),
  s('french-country', 'French Country', 'Classic', 'Rustic elegance in soft blues and creams.', 'rustic elegance, distressed wood, toile fabrics, soft blues and creams, wrought iron', ['#F1EADB', '#9FB3C8', '#8A7560']),
  s('victorian', 'Victorian', 'Classic', 'Ornate carving, jewel tones and heavy drapes.', 'ornate carved furniture, deep jewel tones, heavy drapes, patterned wallpaper, antique decor', ['#4B1E2F', '#2E4A3F', '#B08D57']),
  s('art-deco', 'Art Deco', 'Classic', 'Geometric glamour in emerald, black and brass.', 'geometric patterns, bold glamour, velvet, brass and gold, black and emerald, mirrored surfaces', ['#0F3D34', '#1A1A1A', '#C9A24B']),
  s('hollywood-regency', 'Hollywood Regency', 'Classic', 'High-gloss, bold colour and statement lighting.', 'glamorous, high-gloss, bold colors, lacquered furniture, statement lighting, luxe fabrics', ['#E7B7C2', '#1C1C1C', '#D4AF37'], true),
  // Natural & Rustic
  s('rustic', 'Rustic', 'Natural & Rustic', 'Reclaimed wood, stone and exposed beams.', 'raw reclaimed wood, stone, exposed beams, warm earthy tones, handcrafted pieces', ['#8B6B4A', '#B5A48B', '#4E3B2A']),
  s('farmhouse', 'Farmhouse', 'Natural & Rustic', 'Shiplap, barn doors and cosy vintage charm.', 'shiplap walls, barn doors, white and wood tones, vintage accents, cozy and practical', ['#F4F1EA', '#C4A57F', '#5B5B5B']),
  s('modern-farmhouse', 'Modern Farmhouse', 'Natural & Rustic', 'Farmhouse warmth with crisp black accents.', 'farmhouse warmth with clean modern lines, black metal fixtures, white and natural wood', ['#F7F5F0', '#C8AE8A', '#222222']),
  s('cottagecore', 'Cottagecore', 'Natural & Rustic', 'Florals, pastels and countryside charm.', 'floral fabrics, vintage furniture, soft pastels, dried flowers, cozy countryside charm', ['#F3E6E3', '#B9C9A8', '#D9A6A0']),
  s('coastal', 'Coastal', 'Natural & Rustic', 'Light and airy whites with ocean blues.', 'light and airy, whites and ocean blues, natural fibers, driftwood, linen, beachy feel', ['#F5F7F6', '#A9C6D6', '#D8C7A8']),
  s('mediterranean', 'Mediterranean', 'Natural & Rustic', 'Terracotta, arches and whitewashed walls.', 'terracotta, whitewashed walls, arches, blue accents, wrought iron, mosaic tiles', ['#F4EEE4', '#C8704A', '#2F5D8A']),
  s('tropical', 'Tropical', 'Natural & Rustic', 'Rattan, bamboo and lush leafy greens.', 'lush plants, rattan and bamboo, bold leafy prints, bright greens, airy and vibrant', ['#EAE3CF', '#3F7D4E', '#C9A66B']),
  s('biophilic', 'Biophilic', 'Natural & Rustic', 'Living plants, daylight and natural textures.', 'abundant living plants, natural light, organic materials, green walls, nature-connected', ['#E8EDE3', '#6E8C5A', '#A88B67']),
  s('wabi-sabi', 'Wabi-Sabi', 'Natural & Rustic', 'Imperfect, handmade and quietly serene.', 'imperfect handmade objects, raw textures, earthy muted tones, aged materials, serene', ['#DCD3C6', '#A59784', '#6B5E50']),
  // Urban & Bold
  s('industrial', 'Industrial', 'Urban & Bold', 'Brick, concrete, black metal and leather.', 'exposed brick, concrete, black metal, Edison bulbs, raw ductwork, leather and wood', ['#8E8A85', '#A3593C', '#2B2B2B']),
  s('loft', 'Loft', 'Urban & Bold', 'Open plan, high ceilings, big windows.', 'open plan, high ceilings, industrial bones, large windows, modern furniture', ['#D9D6D0', '#7F7A73', '#3B3835']),
  s('bohemian', 'Bohemian', 'Urban & Bold', 'Layered textiles, macramé and warm global finds.', 'layered patterns and textiles, rugs, macramé, plants, warm eclectic colors, global decor', ['#C2693E', '#E3B75B', '#5E7D5A']),
  s('eclectic', 'Eclectic', 'Urban & Bold', 'A curated mix of eras, colour and art.', 'curated mix of eras and styles, bold color, art-filled walls, unexpected pairings', ['#2F5D62', '#D9824B', '#E8D5B0']),
  s('maximalist', 'Maximalist', 'Urban & Bold', 'More is more: pattern, colour, gallery walls.', 'more is more, bold patterns, saturated colors, gallery walls, layered decor', ['#7B2D5B', '#1F6F5C', '#E3A93C'], true),
  s('memphis', 'Memphis', 'Urban & Bold', 'Playful 80s shapes in clashing brights.', '1980s postmodern, bright clashing colors, squiggles, geometric shapes, playful furniture', ['#F27CA0', '#3EC1D3', '#F6D55C']),
  s('futuristic', 'Futuristic', 'Urban & Bold', 'Curved forms, high-gloss white and ambient LED.', 'sleek curved forms, high-gloss white, LED ambient lighting, metallic accents, tech-forward', ['#F4F6F8', '#A8B3BF', '#5A7BFF']),
  s('cyberpunk', 'Cyberpunk', 'Urban & Bold', 'Neon pink and blue on moody dark surfaces.', 'neon pink and blue lighting, dark surfaces, high-tech gadgets, moody atmosphere', ['#14121F', '#FF3EA5', '#2DE2E6']),
  // Cultural
  s('moroccan', 'Moroccan', 'Cultural', 'Zellige tiles, lanterns and jewel tones.', 'rich jewel tones, zellige tiles, carved wood, lanterns, poufs, layered rugs', ['#1F5E7A', '#C0663A', '#D9B25F']),
  s('mughal-desi', 'Mughal / Desi', 'Cultural', 'Carved arches, rich reds and golds, block prints.', 'Mughal arches, jharokha details, rich reds and golds, hand-carved wood, block-print textiles, brass', ['#8E1F2B', '#C9973B', '#5A3A24']),
  s('japanese-zen', 'Japanese Zen', 'Cultural', 'Tatami, shoji screens and tranquil simplicity.', 'tatami, shoji screens, low seating, natural wood, minimal, tranquil', ['#EDE6D6', '#B79E78', '#4A4A3F']),
  s('chinese-traditional', 'Chinese Traditional', 'Cultural', 'Red lacquer, rosewood, silk and porcelain.', 'lacquered red and black, carved rosewood, silk, porcelain, symmetry', ['#9E1B1B', '#1C1917', '#E6D3A3']),
  s('spanish-colonial', 'Spanish Colonial', 'Cultural', 'Terracotta floors, dark beams, warm plaster.', 'terracotta floors, dark wood beams, wrought iron, arched doorways, warm plaster', ['#EADBC4', '#B25D35', '#3E2A1E']),
  s('african-modern', 'African Modern', 'Cultural', 'Mudcloth, carved wood and woven textures.', 'mudcloth and kente textiles, carved wood, earthy tones, woven baskets, modern forms', ['#E3D2B8', '#8A5A33', '#1E1B18']),
  // Luxury
  s('luxury-modern', 'Luxury Modern', 'Luxury', 'Marble, gold accents and dramatic lighting.', 'marble, high-end finishes, designer furniture, gold accents, dramatic lighting', ['#F1EEEA', '#B8A27A', '#1E1E1E'], true),
  s('quiet-luxury', 'Quiet Luxury', 'Luxury', 'Bouclé, cashmere and warm, understated neutrals.', 'understated premium materials, cashmere and bouclé, warm neutrals, bespoke furniture', ['#EFE9E1', '#CDBEA9', '#8C7B68']),
  s('parisian-chic', 'Parisian Chic', 'Luxury', 'Herringbone, ornate mouldings and vintage mirrors.', 'herringbone floors, ornate moldings, marble fireplace, vintage mirrors, elegant mix', ['#F4F0EA', '#C9B28F', '#6E7F73']),
  // Trending
  s('dark-academia', 'Dark Academia', 'Trending', 'Library shelves, leather and moody greens.', 'dark wood, library shelves, leather, moody greens and browns, vintage books', ['#2E3B2F', '#5B3A29', '#B08D57']),
  s('organic-modern', 'Organic Modern', 'Trending', 'Soft curves, travertine and warm whites.', 'soft curves, natural materials, travertine, warm whites, sculptural decor', ['#F2ECE3', '#D6C3A5', '#9C8468']),
  s('retro-70s', 'Retro 70s', 'Trending', 'Burnt orange, shag rugs and groovy curves.', 'earthy oranges and browns, shag rugs, wood paneling, curved sofas, groovy patterns', ['#C8641E', '#8A5A2B', '#E0B04A']),
  s('y2k', 'Y2K', 'Trending', 'Chrome, translucent plastic and pastel play.', 'chrome, translucent plastics, pastel and silver, bubble furniture, playful', ['#D9D4F2', '#BFE3F0', '#C7C9CC']),
];

export const getStyle = (id?: string | null) => STYLES.find((st) => st.id === id);

export const FEATURED_STYLE_IDS = ['japandi', 'organic-modern', 'quiet-luxury', 'mughal-desi', 'scandinavian', 'dark-academia'];
