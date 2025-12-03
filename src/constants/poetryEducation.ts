// src/constants/poetryEducation.ts
export interface PoetryForm {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  structure: string;
  example: string;
  author?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  origin: string;
  tips: string[];
}

export interface LiteraryDevice {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  usage: string;
  category: 'sound' | 'meaning' | 'structure' | 'style';
}

export interface PoetryHistory {
  id: string;
  period: string;
  timeframe: string;
  characteristics: string[];
  mainAuthors: string[];
  importantWorks: string[];
  context: string;
}

export const POETRY_FORMS: PoetryForm[] = [
  {
    id: 'soneto',
    name: 'Soneto',
    description: 'Forma poética fixa composta por 14 versos, tradicionalmente divididos em dois quartetos e dois tercetos.',
    characteristics: [
      '14 versos no total',
      'Dividido em 4 estrofes (2 quartetos + 2 tercetos)',
      'Rima tradicionalmente ABBA ABBA CDC DCD',
      'Versos decassílabos (10 sílabas)',
      'Tema geralmente amoroso ou reflexivo'
    ],
    structure: 'ABBA ABBA CDC DCD (esquema de rimas clássico)',
    example: `Amor é fogo que arde sem se ver; (A)
É ferida que dói e não se sente; (B)
É um contentamento descontente; (B)
É dor que desatina sem doer; (A)

É um não querer mais que bem querer; (A)
É solitário andar por entre a gente; (B)
É um não contentar-se de contente; (B)
É cuidar que se ganha em se perder; (A)

É um estar-se preso por vontade; (C)
É servir a quem vence, o vencedor; (D)
É um ter com quem nos mata lealdade; (C)

Mas como causar pode seu favor (D)
Nos corações humanos amizade, (C)
Se tão contrário a si é o mesmo Amor? (D)`,
    author: 'Luís de Camões',
    difficulty: 'advanced',
    origin: 'Itália (século XIII), popularizado por Petrarca',
    tips: [
      'Comece com o tema nos quartetos',
      'Use os tercetos para desenvolver ou concluir',
      'Mantenha a métrica regular',
      'Pratique primeiro com rimas simples'
    ]
  },
  {
    id: 'jogral',
    name: 'Jogral',
    description: 'Poesia popular de origem medieval, caracterizada por versos simples e narrativos, muitas vezes com refrão.',
    characteristics: [
      'Origem na tradição oral',
      'Versos simples e narrativos',
      'Frequentemente com refrão',
      'Linguagem popular e acessível',
      'Temas do cotidiano e folclore'
    ],
    structure: 'Estrofes variadas, geralmente com refrão',
    example: `Lá vai uma, lá vão duas,
Lá vão três pela estrada,
Lá se vai a minha vida,
Lá se vai e não volta nada.

(Refrão)
Ô de casa, ô de fora,
Quem me dera ser cantiga,
Para andar de boca em boca,
Para ser sempre repetida.

Lá vai uma, lá vão duas,
Lá vão três pela estrada...`,
    difficulty: 'beginner',
    origin: 'Tradição medieval ibérica',
    tips: [
      'Use linguagem simples e direta',
      'Crie refrões marcantes',
      'Conte uma história',
      'Mantenha o ritmo constante'
    ]
  },
  {
    id: 'verso_livre',
    name: 'Verso Livre',
    description: 'Forma poética moderna que dispensa rima e métrica fixa, priorizando o ritmo natural da linguagem.',
    characteristics: [
      'Sem métrica fixa',
      'Sem esquema de rimas obrigatório',
      'Ritmo baseado na linguagem natural',
      'Liberdade de expressão',
      'Foco no conteúdo e imagens'
    ],
    structure: 'Livre, sem regras fixas',
    example: `Eu não quero mais ser poeta.
Quero ser árvore,
crescer devagar,
sentir o vento
nos meus galhos,
dar sombra
para quem precisa
descansar.

Ser árvore
é mais simples
que ser poeta:
não precisa
de palavras,
só de raízes
profundas
e folhas
que dançam
com o tempo.`,
    difficulty: 'intermediate',
    origin: 'Movimento modernista (século XX)',
    tips: [
      'Foque nas imagens e sensações',
      'Use quebras de linha estratégicas',
      'Mantenha um ritmo interno',
      'Seja autêntico na expressão'
    ]
  },
  {
    id: 'haicai',
    name: 'Haicai',
    description: 'Forma poética japonesa de três versos, tradicionalmente com 5-7-5 sílabas, focando em imagens da natureza.',
    characteristics: [
      'Três versos apenas',
      'Métrica 5-7-5 sílabas (tradicional)',
      'Tema ligado à natureza',
      'Momento presente',
      'Simplicidade e objetividade'
    ],
    structure: '5 sílabas / 7 sílabas / 5 sílabas',
    example: `Flor de cerejeira (5)
Cai lentamente ao chão frio (7)
Primavera vai (5)

---

Gota de orvalho (5)
Reflete o mundo inteiro (7)
Na folha verde (5)`,
    difficulty: 'intermediate',
    origin: 'Japão (século XVII)',
    tips: [
      'Capture um momento específico',
      'Use imagens sensoriais',
      'Evite explicações',
      'Conecte-se com a natureza'
    ]
  },
  {
    id: 'cordel',
    name: 'Literatura de Cordel',
    description: 'Poesia popular nordestina, tradicionalmente impressa em folhetos e vendida em feiras.',
    characteristics: [
      'Estrofes de 6 versos (sextilhas)',
      'Rima ABCBDB',
      'Linguagem popular',
      'Narrativa épica ou cômica',
      'Métrica heptassílaba (7 sílabas)'
    ],
    structure: 'Sextilhas com rima ABCBDB',
    example: `Vou contar uma história (A)
De um homem muito valente (B)
Que morava no sertão (C)
E era conhecido da gente (B)
Por sua grande coragem (D)
E coração de serpente (B)

Ele montava a cavalo (A)
Como ninguém já montou (B)
Enfrentava cangaceiro (C)
E de nenhum se esquivou (B)
Era o terror da caatinga (D)
Aonde quer que chegou (B)`,
    difficulty: 'intermediate',
    origin: 'Nordeste brasileiro (tradição oral)',
    tips: [
      'Conte uma história envolvente',
      'Use linguagem regional',
      'Mantenha o ritmo das sete sílabas',
      'Crie personagens marcantes'
    ]
  },
  {
    id: 'redondilha',
    name: 'Redondilha',
    description: 'Verso tradicional português de 5 ou 7 sílabas, muito usado na poesia popular e erudita.',
    characteristics: [
      'Redondilha menor: 5 sílabas',
      'Redondilha maior: 7 sílabas',
      'Ritmo musical',
      'Tradição ibérica',
      'Versatilidade temática'
    ],
    structure: 'Versos de 5 ou 7 sílabas',
    example: `Redondilha Menor (5 sílabas):
Que saudades (5)
Do meu bem! (4+1)
Que vontade (5)
De vê-lo (3+1)
Outra vez! (3+1)

Redondilha Maior (7 sílabas):
No meio do caminho tinha (7)
Uma pedra muito grande (7)
Que me fez tropeçar (6+1)
E no chão me derrubar (7)
Mas levantei para andar (7)`,
    difficulty: 'beginner',
    origin: 'Tradição ibérica medieval',
    tips: [
      'Conte as sílabas cuidadosamente',
      'Use ritmo natural da fala',
      'Pratique com temas simples',
      'Mantenha a musicalidade'
    ]
  }
];

export const LITERARY_DEVICES: LiteraryDevice[] = [
  {
    id: 'metafora',
    name: 'Metáfora',
    definition: 'Comparação implícita entre dois elementos sem usar conectivos.',
    examples: [
      'Meus olhos são dois oceanos de lágrimas',
      'A vida é uma viagem',
      'Seu coração é de pedra'
    ],
    usage: 'Use para criar imagens poéticas e dar força expressiva ao texto.',
    category: 'meaning'
  },
  {
    id: 'aliteracao',
    name: 'Aliteração',
    definition: 'Repetição de sons consonantais no início ou meio das palavras.',
    examples: [
      'O rato roeu a roupa do rei de Roma',
      'Três tigres tristes',
      'Vozes veladas, veludosas vozes'
    ],
    usage: 'Cria musicalidade e ritmo, enfatiza ideias.',
    category: 'sound'
  },
  {
    id: 'anafora',
    name: 'Anáfora',
    definition: 'Repetição de palavras ou expressões no início de versos ou frases.',
    examples: [
      'Amor é fogo que arde... / Amor é ferida que dói...',
      'Era uma vez... / Era uma vez...',
      'Não vou... / Não posso... / Não quero...'
    ],
    usage: 'Enfatiza ideias e cria ritmo marcante.',
    category: 'structure'
  },
  {
    id: 'personificacao',
    name: 'Personificação',
    definition: 'Atribuição de características humanas a seres inanimados.',
    examples: [
      'O vento sussurra segredos',
      'As flores dançam no jardim',
      'A lua sorri para nós'
    ],
    usage: 'Torna a descrição mais viva e emotiva.',
    category: 'meaning'
  },
  {
    id: 'hiperbole',
    name: 'Hipérbole',
    definition: 'Exagero intencional para dar ênfase à expressão.',
    examples: [
      'Chorei rios de lágrimas',
      'Morri de saudades',
      'Esperei uma eternidade'
    ],
    usage: 'Intensifica sentimentos e cria impacto emocional.',
    category: 'meaning'
  },
  {
    id: 'assonancia',
    name: 'Assonância',
    definition: 'Repetição de sons vocálicos em palavras próximas.',
    examples: [
      'Sou Ana, da cama, da cana, vidana, bacana',
      'O poeta é um fingidor',
      'Sino de Belém, pelos que amo'
    ],
    usage: 'Cria efeito sonoro suave e musical.',
    category: 'sound'
  }
];

export const POETRY_HISTORY: PoetryHistory[] = [
  {
    id: 'trovadorismo',
    period: 'Trovadorismo',
    timeframe: 'Século XII ao XV',
    characteristics: [
      'Poesia cantada',
      'Amor cortês',
      'Temática religiosa',
      'Linguagem galego-portuguesa'
    ],
    mainAuthors: ['Dom Dinis', 'João Garcia de Guilhade', 'Martim Codax'],
    importantWorks: ['Cantigas de Amor', 'Cantigas de Amigo', 'Cantigas de Escárnio'],
    context: 'Período medieval, influência da cultura árabe e francesa.'
  },
  {
    id: 'classicismo',
    period: 'Classicismo',
    timeframe: 'Século XVI',
    characteristics: [
      'Influência greco-latina',
      'Medida nova (sonetos)',
      'Mitologia clássica',
      'Racionalismo'
    ],
    mainAuthors: ['Luís de Camões', 'Sá de Miranda'],
    importantWorks: ['Os Lusíadas', 'Rimas'],
    context: 'Renascimento, descobrimentos marítimos.'
  },
  {
    id: 'barroco',
    period: 'Barroco',
    timeframe: 'Século XVII',
    characteristics: [
      'Conflito entre fé e razão',
      'Linguagem rebuscada',
      'Antíteses e paradoxos',
      'Pessimismo'
    ],
    mainAuthors: ['Gregório de Matos', 'Padre Antônio Vieira'],
    importantWorks: ['Poemas satíricos', 'Sermões'],
    context: 'Contra-Reforma, colonização do Brasil.'
  },
  {
    id: 'romantismo',
    period: 'Romantismo',
    timeframe: 'Século XIX',
    characteristics: [
      'Subjetivismo',
      'Nacionalismo',
      'Indianismo',
      'Sentimentalismo'
    ],
    mainAuthors: ['Gonçalves Dias', 'Castro Alves', 'Álvares de Azevedo'],
    importantWorks: ['Canção do Exílio', 'O Navio Negreiro', 'Lira dos Vinte Anos'],
    context: 'Independência do Brasil, formação da identidade nacional.'
  },
  {
    id: 'parnasianismo',
    period: 'Parnasianismo',
    timeframe: 'Final do século XIX',
    characteristics: [
      'Arte pela arte',
      'Perfeição formal',
      'Objetividade',
      'Temas clássicos'
    ],
    mainAuthors: ['Olavo Bilac', 'Alberto de Oliveira', 'Raimundo Correia'],
    importantWorks: ['Via Láctea', 'Meridionais'],
    context: 'Belle Époque, influência francesa.'
  },
  {
    id: 'modernismo',
    period: 'Modernismo',
    timeframe: 'Século XX',
    characteristics: [
      'Ruptura com o passado',
      'Verso livre',
      'Linguagem coloquial',
      'Nacionalismo crítico'
    ],
    mainAuthors: ['Mário de Andrade', 'Oswald de Andrade', 'Manuel Bandeira'],
    importantWorks: ['Paulicéia Desvairada', 'Libertinagem'],
    context: 'Semana de Arte Moderna de 1922, industrialização.'
  }
];

export const POETRY_TIPS = {
  beginner: [
    'Comece com formas simples como verso livre',
    'Leia muito poesia para desenvolver o ouvido',
    'Escreva sobre experiências pessoais',
    'Não se preocupe com perfeição no início',
    'Pratique diariamente, mesmo que pouco'
  ],
  intermediate: [
    'Experimente diferentes formas poéticas',
    'Estude figuras de linguagem',
    'Participe de grupos de poesia',
    'Revise e reescreva seus poemas',
    'Explore temas variados'
  ],
  advanced: [
    'Desenvolva sua voz poética única',
    'Estude a tradição poética profundamente',
    'Experimente inovações formais',
    'Publique e compartilhe seu trabalho',
    'Mentore outros poetas iniciantes'
  ]
};
