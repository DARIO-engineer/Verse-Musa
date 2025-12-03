import { Colors } from '../styles/DesignSystem';

export interface PoemTemplate {
  id: string;
  name: string;
  description: string;
  structure?: string;
  example?: string;
  icon?: string;
  gradient?: string[];
}

export const POEM_TEMPLATES: PoemTemplate[] = [
  {
    id: 'free_verse',
    name: 'Verso Livre',
    description: 'Forma livre de expressão poética sem regras rígidas',
    structure: 'Sem estrutura fixa - deixe sua criatividade fluir',
    example: 'Como o vento que dança...\nEntre as folhas do outono...',
    icon: 'create-outline',
    gradient: Colors.gradientPrimary,
  },
  {
    id: 'sonnet',
    name: 'Soneto',
    description: 'Forma clássica com 14 versos e estrutura definida',
    structure: '14 versos: 2 quartetos + 2 tercetos\nEsquema: ABBA ABBA CDC DCD',
    example: 'Amor é fogo que arde sem se ver...\nÉ ferida que dói e não se sente...',
    icon: 'library-outline',
    gradient: Colors.gradientAccent,
  },
  {
    id: 'jogral',
    name: 'Jogral',
    description: 'Declamação em grupo ou alternada',
    structure: 'Versos pensados para declamação em coro',
    example: 'Ouçam! O vento traz o clamor...\nE a multidão responde...',
    icon: 'people-outline',
    gradient: Colors.gradientPrimary,
  },
];

export const TEXTUAL_INSPIRATIONS: string[] = [
  '"Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará"',
  '"O Senhor é minha luz e minha salvação; de quem me temerei?"',
  '"Posso todas as coisas naquele que me fortalece"',
  '"Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus"',
  '"Ainda que a figueira não floresça, todavia eu me alegrarei no Senhor"',
];

export const POWERFUL_THEMES: string[] = [
  'O Poder da Cruz',
  'Deus ainda é Deus',
  'O Nome que está acima de todo nome',
  'Quando Deus silencia',
  'O rugido do Leão de Judá',
  'Sangue precioso',
  'A força do perdão',
  'Fogo consumidor',
  'Águas profundas',
  'O trono eterno',
];

export const INSPIRATION_CATEGORIES = [
  { name: 'Inspirações Textuais', prompts: TEXTUAL_INSPIRATIONS, icon: 'quote', color: Colors.primary },
  { name: 'Temas Poderosos', prompts: POWERFUL_THEMES, icon: 'flame', color: Colors.accent },
];

export default POEM_TEMPLATES;
