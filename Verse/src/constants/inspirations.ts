export interface InspirationItem {
  id: string;
  title: string;
  content: string;
  author?: string;
  source?: string;
  icon: string;
  category: 'biblical' | 'classic' | 'contemporary' | 'nature' | 'spiritual' | 'christian_poets' | 'love' | 'rhymed' | 'motivational';
}

export const TEXTUAL_INSPIRATIONS: InspirationItem[] = [
  // Inspirações Bíblicas
  {
    id: 'psalm23',
    title: 'O Senhor é meu Pastor',
    content: 'O Senhor é meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas...',
    author: 'Rei Davi',
    source: 'Salmo 23',
    icon: 'book',
    category: 'biblical'
  },
  {
    id: 'ecclesiastes',
    title: 'Tempo para Tudo',
    content: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu: Tempo de nascer, e tempo de morrer...',
    author: 'Salomão',
    source: 'Eclesiastes 3:1-2',
    icon: 'time',
    category: 'biblical'
  },
  {
    id: 'corinthians',
    title: 'O Amor é Paciente',
    content: 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece...',
    author: 'Apóstolo Paulo',
    source: '1 Coríntios 13:4',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'isaiah',
    title: 'Como Águia que Voa',
    content: 'Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão...',
    author: 'Profeta Isaías',
    source: 'Isaías 40:31',
    icon: 'airplane',
    category: 'biblical'
  },

  // Escritores Clássicos
  {
    id: 'camoes',
    title: 'Amor é Fogo que Arde',
    content: 'Amor é fogo que arde sem se ver; É ferida que dói e não se sente; É um contentamento descontente...',
    author: 'Luís de Camões',
    source: 'Soneto',
    icon: 'flame',
    category: 'classic'
  },
  {
    id: 'pessoa',
    title: 'Navegar é Preciso',
    content: 'Navegar é preciso; viver não é preciso. Queremos passar além do Bojador. Tem que se passar além da dor...',
    author: 'Fernando Pessoa',
    source: 'Mensagem',
    icon: 'boat',
    category: 'classic'
  },
  {
    id: 'drummond',
    title: 'No Meio do Caminho',
    content: 'No meio do caminho tinha uma pedra tinha uma pedra no meio do caminho tinha uma pedra...',
    author: 'Carlos Drummond de Andrade',
    source: 'Alguma Poesia',
    icon: 'trail-sign',
    category: 'classic'
  },
  {
    id: 'bandeira',
    title: 'Vou-me Embora pra Pasárgada',
    content: 'Vou-me embora pra Pasárgada! Lá sou amigo do rei. Lá tenho a mulher que eu quero na cama que escolherei...',
    author: 'Manuel Bandeira',
    source: 'Libertinagem',
    icon: 'home',
    category: 'classic'
  },

  // Escritores Contemporâneos
  {
    id: 'quintana',
    title: 'Da Felicidade',
    content: 'Felicidade é coisa de momento. É uma rajada de vento. É chuva de verão. É encontrar uma flor no chão...',
    author: 'Mario Quintana',
    source: 'Caderno H',
    icon: 'happy',
    category: 'contemporary'
  },
  {
    id: 'adelia',
    title: 'Com Licença Poética',
    content: 'Quando nasci um anjo esbelto, desses que tocam trombeta, anunciou: vai carregar bandeira...',
    author: 'Adélia Prado',
    source: 'Bagagem',
    icon: 'musical-note',
    category: 'contemporary'
  },
  {
    id: 'gullar',
    title: 'Traduzir-se',
    content: 'Uma parte de mim é todo mundo: outra parte é ninguém: fundo sem fundo. Uma parte de mim é multidão...',
    author: 'Ferreira Gullar',
    source: 'Toda Poesia',
    icon: 'people',
    category: 'contemporary'
  },

  // Inspirações Espirituais
  {
    id: 'rumi',
    title: 'O Amor é a Ponte',
    content: 'O amor é a ponte entre duas almas. É a linguagem que o coração fala quando as palavras não bastam...',
    author: 'Rumi',
    source: 'Poesia Sufi',
    icon: 'heart-circle',
    category: 'spiritual'
  },
  {
    id: 'teresa',
    title: 'Nada Te Turbe',
    content: 'Nada te turbe, nada te espante. Tudo passa, Deus não muda. A paciência tudo alcança...',
    author: 'Santa Teresa de Ávila',
    source: 'Poesias Místicas',
    icon: 'leaf',
    category: 'spiritual'
  },

  // Poetas Cristãos Contemporâneos
  {
    id: 'adelia_christian',
    title: 'Oração',
    content: 'Deus, quando eu morrer, que seja de amor. Que seja num dia claro, de sol bem brilhante, que seja de tarde...',
    author: 'Adélia Prado',
    source: 'Bagagem',
    icon: 'heart-circle',
    category: 'christian_poets'
  },
  {
    id: 'murilo_mendes',
    title: 'Oração pelo Mundo',
    content: 'Senhor, eu vos peço por todos os homens do mundo que têm fome de pão, que têm fome de amor...',
    author: 'Murilo Mendes',
    source: 'Tempo e Eternidade',
    icon: 'globe',
    category: 'christian_poets'
  },
  {
    id: 'cecilia_meireles',
    title: 'Oração da Manhã',
    content: 'Senhor, dai-me força para viver este dia com alegria, mesmo que ele venha carregado de dificuldades...',
    author: 'Cecília Meireles',
    source: 'Viagem',
    icon: 'sunny',
    category: 'christian_poets'
  },
  {
    id: 'jorge_lima',
    title: 'Essa Negra Fulô',
    content: 'Ora, se deu que chegou (isso já faz muito tempo) no bangüê dum meu avô uma negra bonitinha...',
    author: 'Jorge de Lima',
    source: 'Novos Poemas',
    icon: 'flower',
    category: 'christian_poets'
  },

  // Textos de Amor
  {
    id: 'vinicius_amor',
    title: 'Soneto de Fidelidade',
    content: 'De tudo, ao meu amor serei atento antes, e com tal zelo, e sempre, e tanto que mesmo em face do maior encanto...',
    author: 'Vinicius de Moraes',
    source: 'Antologia Poética',
    icon: 'heart',
    category: 'love'
  },
  {
    id: 'florbela_amor',
    title: 'Amar!',
    content: 'Eu quero amar, amar perdidamente! Amar só por amar: Aqui... além... Mais este e aquele, o outro e toda a gente...',
    author: 'Florbela Espanca',
    source: 'Livro de Mágoas',
    icon: 'rose',
    category: 'love'
  },
  {
    id: 'machado_amor',
    title: 'A Carolina',
    content: 'Querida, ao pé do leito derradeiro em que descansas dessa longa vida, aqui venho e virei, pobre querida...',
    author: 'Machado de Assis',
    source: 'Poesias Completas',
    icon: 'heart-outline',
    category: 'love'
  },

  // Textos com Rimas Diversificadas
  {
    id: 'rima_alegria',
    title: 'Alegria do Viver',
    content: 'A vida é bela quando se tem fé, quando se caminha com esperança no pé, quando se acredita que tudo pode ser melhor, quando se planta no coração o amor...',
    author: 'Inspiração Popular',
    icon: 'happy-outline',
    category: 'rhymed'
  },
  {
    id: 'rima_natureza',
    title: 'Canção da Primavera',
    content: 'Chegou a primavera com seu manto de flores, pintando o mundo inteiro com as mais belas cores, os pássaros cantam em doce melodia, celebrando a chegada de mais um novo dia...',
    author: 'Tradição Popular',
    icon: 'flower-outline',
    category: 'rhymed'
  },
  {
    id: 'rima_amizade',
    title: 'Hino à Amizade',
    content: 'Amigo é aquele que na hora da dor, estende a mão com carinho e amor, que divide contigo a alegria e a tristeza, que é tesouro maior que qualquer riqueza...',
    author: 'Sabedoria Popular',
    icon: 'people-outline',
    category: 'rhymed'
  },
  {
    id: 'rima_esperanca',
    title: 'Canção da Esperança',
    content: 'Mesmo quando a noite parece sem fim, e o coração sussurra um triste "não" dentro de mim, eu sei que a aurora há de raiar, e um novo dia vai começar...',
    author: 'Inspiração Coletiva',
    icon: 'star-outline',
    category: 'rhymed'
  },

  // Textos Motivacionais
  {
    id: 'motivacional_sonhos',
    title: 'Persiga Seus Sonhos',
    content: 'Não desista dos seus sonhos, mesmo quando parecem impossíveis. Cada grande conquista começou com um sonho que alguém ousou perseguir...',
    author: 'Reflexão Motivacional',
    icon: 'rocket-outline',
    category: 'motivational'
  },
  {
    id: 'motivacional_forca',
    title: 'A Força Interior',
    content: 'Dentro de você existe uma força maior do que qualquer obstáculo. Você é mais forte do que imagina, mais corajoso do que acredita...',
    author: 'Pensamento Positivo',
    icon: 'fitness-outline',
    category: 'motivational'
  },
  {
    id: 'motivacional_mudanca',
    title: 'Seja a Mudança',
    content: 'Seja a mudança que você quer ver no mundo. Comece pequeno, comece hoje, comece com você mesmo...',
    author: 'Inspiração Gandhi',
    icon: 'refresh-outline',
    category: 'motivational'
  },

  // Mais Inspirações Bíblicas
  {
    id: 'proverbios_sabedoria',
    title: 'O Temor do Senhor',
    content: 'O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo é a prudência...',
    author: 'Rei Salomão',
    source: 'Provérbios 9:10',
    icon: 'school',
    category: 'biblical'
  },
  {
    id: 'jeremias_planos',
    title: 'Planos de Paz',
    content: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal...',
    author: 'Profeta Jeremias',
    source: 'Jeremias 29:11',
    icon: 'peace',
    category: 'biblical'
  },
  {
    id: 'mateus_cuidado',
    title: 'Não Vos Inquieteis',
    content: 'Não vos inquieteis pelo dia de amanhã, pois o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal...',
    author: 'Jesus Cristo',
    source: 'Mateus 6:34',
    icon: 'calendar',
    category: 'biblical'
  },

  // Inspirações da Natureza Expandidas
  {
    id: 'nature_mar',
    title: 'O Canto do Mar',
    content: 'As ondas sussurram segredos antigos na areia dourada da praia, cada marola traz histórias de terras distantes e aventuras...',
    icon: 'water-outline',
    category: 'nature'
  },
  {
    id: 'nature_montanha',
    title: 'A Majestade das Montanhas',
    content: 'Erguem-se altivas contra o céu azul, as montanhas são guardiãs silenciosas do tempo, testemunhas da eternidade...',
    icon: 'triangle-outline',
    category: 'nature'
  },
  {
    id: 'nature_floresta',
    title: 'Segredos da Floresta',
    content: 'Entre as árvores centenárias, a floresta guarda seus mistérios, onde cada folha conta uma história e cada galho aponta para o infinito...',
    icon: 'tree-outline',
    category: 'nature'
  },
  {
    id: 'nature_ceu',
    title: 'A Dança das Estrelas',
    content: 'No manto escuro da noite, as estrelas dançam sua valsa eterna, cada uma um sonho distante brilhando na imensidão...',
    icon: 'star',
    category: 'nature'
  },

  // Clássicos Adicionais
  {
    id: 'goncalves_dias',
    title: 'Canção do Exílio',
    content: 'Minha terra tem palmeiras, onde canta o Sabiá; as aves, que aqui gorjeiam, não gorjeiam como lá...',
    author: 'Gonçalves Dias',
    source: 'Primeiros Cantos',
    icon: 'home-outline',
    category: 'classic'
  },
  {
    id: 'castro_alves',
    title: 'O Navio Negreiro',
    content: 'Stamos em pleno mar... Doudo no espaço brinca o luar — dourada borboleta; e as vagas após ele correm... cansam...',
    author: 'Castro Alves',
    source: 'Os Escravos',
    icon: 'boat-outline',
    category: 'classic'
  },
  {
    id: 'olavo_bilac',
    title: 'Via Láctea',
    content: 'Ora (direis) ouvir estrelas! Certo perdeste o senso! E eu vos direi, no entanto, que, para ouvi-las, muita vez desperto...',
    author: 'Olavo Bilac',
    source: 'Poesias',
    icon: 'star-outline',
    category: 'classic'
  }
];

export const INSPIRATION_CATEGORIES = {
  biblical: {
    name: 'Textos Bíblicos',
    description: 'Inspirações extraídas das Sagradas Escrituras',
    color: '#8B4513',
    icon: 'book'
  },
  christian_poets: {
    name: 'Poetas Cristãos',
    description: 'Grandes vozes da poesia cristã brasileira',
    color: '#CD853F',
    icon: 'heart-circle'
  },
  classic: {
    name: 'Clássicos da Literatura',
    description: 'Grandes mestres da poesia lusófona',
    color: '#4A90E2',
    icon: 'library'
  },
  contemporary: {
    name: 'Contemporâneos',
    description: 'Vozes modernas da poesia brasileira',
    color: '#7B68EE',
    icon: 'create'
  },
  love: {
    name: 'Poesia de Amor',
    description: 'Versos que celebram o amor em todas as formas',
    color: '#FF69B4',
    icon: 'heart'
  },
  rhymed: {
    name: 'Versos Rimados',
    description: 'Poesias com rimas tradicionais e populares',
    color: '#32CD32',
    icon: 'musical-notes'
  },
  motivational: {
    name: 'Motivacional',
    description: 'Textos que inspiram e motivam',
    color: '#FF6347',
    icon: 'rocket'
  },
  spiritual: {
    name: 'Espiritualidade',
    description: 'Reflexões místicas e espirituais',
    color: '#9370DB',
    icon: 'flower'
  },
  nature: {
    name: 'Natureza',
    description: 'A beleza do mundo natural como inspiração',
    color: '#228B22',
    icon: 'leaf'
  }
};
