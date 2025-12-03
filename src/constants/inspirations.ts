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
  },

  // === INSPIRAÇÕES CRISTOCÊNTRICAS EXPANDIDAS ===
  
  // Mais Textos Bíblicos Inspiradores
  {
    id: 'filipenses_alegria',
    title: 'Alegrai-vos Sempre',
    content: 'Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos. Seja a vossa equidade notória a todos os homens. Perto está o Senhor...',
    author: 'Apóstolo Paulo',
    source: 'Filipenses 4:4-5',
    icon: 'happy',
    category: 'biblical'
  },
  {
    id: 'romanos_amor',
    title: 'Nada Nos Separará',
    content: 'Porque estou certo de que, nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir... nos poderá separar do amor de Deus...',
    author: 'Apóstolo Paulo',
    source: 'Romanos 8:38-39',
    icon: 'shield-checkmark',
    category: 'biblical'
  },
  {
    id: 'joao_luz',
    title: 'Eu Sou a Luz',
    content: 'Falou-lhes, pois, Jesus outra vez, dizendo: Eu sou a luz do mundo; quem me segue não andará em trevas, mas terá a luz da vida...',
    author: 'Jesus Cristo',
    source: 'João 8:12',
    icon: 'sunny',
    category: 'biblical'
  },
  {
    id: 'genesis_criacao',
    title: 'No Princípio',
    content: 'No princípio criou Deus os céus e a terra. E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas...',
    author: 'Moisés',
    source: 'Gênesis 1:1-2',
    icon: 'planet',
    category: 'biblical'
  },
  {
    id: 'apocalipse_novo',
    title: 'Eis que Faço Novas',
    content: 'E aquele que estava assentado sobre o trono disse: Eis que faço novas todas as coisas. E disse-me: Escreve; porque estas palavras são verdadeiras e fiéis...',
    author: 'Jesus Cristo',
    source: 'Apocalipse 21:5',
    icon: 'refresh',
    category: 'biblical'
  },

  // Poetas Cristãos Brasileiros Expandidos
  {
    id: 'adelia_deus_familia',
    title: 'Deus de Perto',
    content: 'Deus de perto é calado. Deus de longe é que canta. Deus de dentro é que fala, Deus de fora é que espanta...',
    author: 'Adélia Prado',
    source: 'Terra de Santa Cruz',
    icon: 'heart-circle',
    category: 'christian_poets'
  },
  {
    id: 'murilo_tempo',
    title: 'Tempo e Eternidade',
    content: 'O tempo é a imagem móvel da eternidade imóvel. Nós somos o tempo, Deus é a eternidade. Entre o tempo e a eternidade há Jesus Cristo...',
    author: 'Murilo Mendes',
    source: 'Tempo e Eternidade',
    icon: 'time',
    category: 'christian_poets'
  },
  {
    id: 'cecilia_oração_tarde',
    title: 'Oração da Tarde',
    content: 'Senhor, a tarde desce devagar sobre a cidade cansada. Acende em cada coração uma pequena luz de esperança...',
    author: 'Cecília Meireles',
    source: 'Viagem',
    icon: 'bulb',
    category: 'christian_poets'
  },
  {
    id: 'jorge_anunciacao',
    title: 'Anunciação',
    content: 'Ave, cheia de graça, o Senhor é contigo! Bendita és tu entre as mulheres, e bendito é o fruto do teu ventre...',
    author: 'Jorge de Lima',
    source: 'Anunciação e Encontro de Mira-Celi',
    icon: 'flower',
    category: 'christian_poets'
  },
  {
    id: 'augusto_santos',
    title: 'Oração aos Santos',
    content: 'Santos do céu, intercedei por nós que caminhamos ainda nesta terra de exílio, buscando a pátria celestial...',
    author: 'Augusto dos Anjos',
    source: 'Eu e Outras Poesias',
    icon: 'star',
    category: 'christian_poets'
  },

  // Inspirações Cristãs Contemporâneas
  {
    id: 'cristo_amigo',
    title: 'Cristo, Meu Amigo',
    content: 'Cristo é o amigo que nunca falha, o irmão que sempre compreende, o pai que sempre perdoa, a mãe que sempre acolhe...',
    author: 'Inspiração Cristã',
    icon: 'people',
    category: 'christian_poets'
  },
  {
    id: 'cruz_vitoria',
    title: 'A Cruz da Vitória',
    content: 'Na cruz se encontram a justiça e a misericórdia, o amor e a verdade, o céu e a terra, Deus e o homem...',
    author: 'Reflexão Cristã',
    icon: 'add',
    category: 'christian_poets'
  },
  {
    id: 'ressurreicao_vida',
    title: 'Ressurreição e Vida',
    content: 'Porque Ele vive, posso crer no amanhã. Porque Ele vive, todo medo se vai. Sei que a vida vale a pena só porque Ele vive...',
    author: 'Cântico Cristão',
    icon: 'sunny',
    category: 'christian_poets'
  },

  // Orações Poéticas
  {
    id: 'pai_nosso_poetico',
    title: 'Pai Nosso Poético',
    content: 'Pai nosso que estás nos céus, santificado seja o vosso nome. Venha a nós o vosso reino, seja feita a vossa vontade, assim na terra como no céu...',
    author: 'Jesus Cristo',
    source: 'Mateus 6:9-11',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'ave_maria_poetica',
    title: 'Ave Maria Poética',
    content: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus...',
    author: 'Oração Tradicional',
    source: 'Lucas 1:28',
    icon: 'rose',
    category: 'christian_poets'
  },
  {
    id: 'gloria_poetico',
    title: 'Glória Poético',
    content: 'Glória a Deus nas alturas, e paz na terra aos homens de boa vontade. Louvamos-vos, bendizemos-vos, adoramos-vos, glorificamos-vos...',
    author: 'Liturgia Cristã',
    source: 'Lucas 2:14',
    icon: 'musical-notes',
    category: 'christian_poets'
  },

  // Hinos e Cânticos Poéticos
  {
    id: 'amazing_grace_pt',
    title: 'Sublime Graça',
    content: 'Sublime graça do Senhor que um infeliz salvou! Perdido andei e me achou, cego era e me curou...',
    author: 'John Newton (Tradução)',
    source: 'Amazing Grace',
    icon: 'eye',
    category: 'christian_poets'
  },
  {
    id: 'quao_grande_es_tu',
    title: 'Quão Grande És Tu',
    content: 'Senhor meu Deus, quando eu maravilhado fico pensando nas obras de tuas mãos, no céu azul de estrelas pontilhado...',
    author: 'Carl Boberg (Tradução)',
    source: 'How Great Thou Art',
    icon: 'star',
    category: 'christian_poets'
  },
  {
    id: 'rocha_eterna',
    title: 'Rocha Eterna',
    content: 'Rocha eterna, caro abrigo, do meu ser o Salvador! Neste mundo de perigo, sê meu forte protetor...',
    author: 'Augustus Toplady (Tradução)',
    source: 'Rock of Ages',
    icon: 'shield',
    category: 'christian_poets'
  },

  // Salmos Poéticos Expandidos
  {
    id: 'salmo_1',
    title: 'Bem-aventurado o Varão',
    content: 'Bem-aventurado o varão que não anda segundo o conselho dos ímpios, nem se detém no caminho dos pecadores, nem se assenta na roda dos escarnecedores...',
    author: 'Rei Davi',
    source: 'Salmo 1:1',
    icon: 'tree',
    category: 'biblical'
  },
  {
    id: 'salmo_91',
    title: 'Aquele que Habita',
    content: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza...',
    author: 'Rei Davi',
    source: 'Salmo 91:1-2',
    icon: 'shield-checkmark',
    category: 'biblical'
  },
  {
    id: 'salmo_139',
    title: 'Senhor, Tu Me Sondaste',
    content: 'Senhor, tu me sondaste, e me conheces. Tu conheces o meu assentar e o meu levantar; de longe entendes o meu pensamento...',
    author: 'Rei Davi',
    source: 'Salmo 139:1-2',
    icon: 'eye',
    category: 'biblical'
  },

  // Provérbios Poéticos
  {
    id: 'proverbios_31_mulher',
    title: 'Mulher Virtuosa',
    content: 'Mulher virtuosa quem a achará? O seu valor muito excede ao de rubis. O coração do seu marido está nela confiado...',
    author: 'Rei Lemuel',
    source: 'Provérbios 31:10-11',
    icon: 'diamond',
    category: 'biblical'
  },
  {
    id: 'proverbios_confianca',
    title: 'Confia no Senhor',
    content: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos...',
    author: 'Rei Salomão',
    source: 'Provérbios 3:5-6',
    icon: 'heart-circle',
    category: 'biblical'
  },

  // Cântico dos Cânticos Poético
  {
    id: 'canticos_amor',
    title: 'Cântico de Amor',
    content: 'Eu sou a rosa de Sarom, e o lírio dos vales. Como o lírio entre os espinhos, assim é a minha amada entre as filhas...',
    author: 'Rei Salomão',
    source: 'Cânticos 2:1-2',
    icon: 'rose',
    category: 'biblical'
  },

  // Inspirações Marianas
  {
    id: 'magnificat',
    title: 'Magnificat',
    content: 'A minha alma engrandece ao Senhor, e o meu espírito se alegra em Deus meu Salvador; porque atentou na baixeza de sua serva...',
    author: 'Santa Maria',
    source: 'Lucas 1:46-48',
    icon: 'heart-circle',
    category: 'biblical'
  },

  // Santos e Místicos
  {
    id: 'francisco_assis',
    title: 'Oração de São Francisco',
    content: 'Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão...',
    author: 'São Francisco de Assis',
    source: 'Oração pela Paz',
    icon: 'leaf',
    category: 'christian_poets'
  },
  {
    id: 'teresa_avila_castelo',
    title: 'Castelo Interior',
    content: 'A alma é como um castelo feito de um só diamante ou de muito claro cristal, onde há muitos aposentos...',
    author: 'Santa Teresa de Ávila',
    source: 'Castelo Interior',
    icon: 'diamond',
    category: 'christian_poets'
  },
  {
    id: 'joao_cruz',
    title: 'Noite Escura',
    content: 'Em uma noite escura, com ansiedades, em amores inflamada, oh ditosa sorte! saí sem ser notada...',
    author: 'São João da Cruz',
    source: 'Noite Escura da Alma',
    icon: 'moon',
    category: 'christian_poets'
  },

  // === EXPANSÃO MASSIVA DE TEXTOS BÍBLICOS ===

  // Mais Salmos Inspiradores
  {
    id: 'salmo_8',
    title: 'Ó Senhor, Senhor Nosso',
    content: 'Ó Senhor, Senhor nosso, quão admirável é o teu nome em toda a terra! Pois puseste a tua glória sobre os céus. Quando vejo os teus céus, obra dos teus dedos...',
    author: 'Rei Davi',
    source: 'Salmo 8:1,3',
    icon: 'star',
    category: 'biblical'
  },
  {
    id: 'salmo_19',
    title: 'Os Céus Declaram',
    content: 'Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos. Um dia faz declaração a outro dia, e uma noite mostra sabedoria a outra noite...',
    author: 'Rei Davi',
    source: 'Salmo 19:1-2',
    icon: 'sunny',
    category: 'biblical'
  },
  {
    id: 'salmo_27',
    title: 'O Senhor é Minha Luz',
    content: 'O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?',
    author: 'Rei Davi',
    source: 'Salmo 27:1',
    icon: 'flashlight',
    category: 'biblical'
  },
  {
    id: 'salmo_46',
    title: 'Deus é Nosso Refúgio',
    content: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia. Portanto não temeremos, ainda que a terra se mude...',
    author: 'Filhos de Coré',
    source: 'Salmo 46:1-2',
    icon: 'shield',
    category: 'biblical'
  },
  {
    id: 'salmo_51',
    title: 'Coração Puro',
    content: 'Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto. Não me lances fora da tua presença, e não retires de mim o teu Espírito Santo...',
    author: 'Rei Davi',
    source: 'Salmo 51:10-11',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'salmo_84',
    title: 'Quão Amáveis São',
    content: 'Quão amáveis são os teus tabernáculos, Senhor dos Exércitos! A minha alma está sedenta e desfalece pelos átrios do Senhor...',
    author: 'Filhos de Coré',
    source: 'Salmo 84:1-2',
    icon: 'home',
    category: 'biblical'
  },
  {
    id: 'salmo_100',
    title: 'Celebrai com Júbilo',
    content: 'Celebrai com júbilo ao Senhor, todas as terras. Servi ao Senhor com alegria; apresentai-vos a ele com canto...',
    author: 'Salmista',
    source: 'Salmo 100:1-2',
    icon: 'musical-notes',
    category: 'biblical'
  },
  {
    id: 'salmo_103',
    title: 'Bendize, Ó Minha Alma',
    content: 'Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga ao seu santo nome. Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios...',
    author: 'Rei Davi',
    source: 'Salmo 103:1-2',
    icon: 'heart-circle',
    category: 'biblical'
  },
  {
    id: 'salmo_121',
    title: 'Elevo os Olhos',
    content: 'Elevo os meus olhos para os montes, de onde vem o meu socorro. O meu socorro vem do Senhor que fez o céu e a terra...',
    author: 'Salmista',
    source: 'Salmo 121:1-2',
    icon: 'eye',
    category: 'biblical'
  },
  {
    id: 'salmo_150',
    title: 'Louvai ao Senhor',
    content: 'Louvai ao Senhor. Louvai a Deus no seu santuário; louvai-o na expansão do seu poder. Louvai-o pelos seus atos poderosos...',
    author: 'Salmista',
    source: 'Salmo 150:1-2',
    icon: 'musical-note',
    category: 'biblical'
  },

  // Palavras de Jesus Expandidas
  {
    id: 'joao_14_paz',
    title: 'Deixo-vos a Paz',
    content: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize...',
    author: 'Jesus Cristo',
    source: 'João 14:27',
    icon: 'heart-circle',
    category: 'biblical'
  },
  {
    id: 'joao_15_videira',
    title: 'Eu Sou a Videira',
    content: 'Eu sou a videira verdadeira, e meu Pai é o lavrador. Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto...',
    author: 'Jesus Cristo',
    source: 'João 15:1,5',
    icon: 'leaf',
    category: 'biblical'
  },
  {
    id: 'joao_11_ressurreicao',
    title: 'Eu Sou a Ressurreição',
    content: 'Disse-lhe Jesus: Eu sou a ressurreição e a vida; quem crê em mim, ainda que esteja morto, viverá; E todo aquele que vive, e crê em mim, nunca morrerá...',
    author: 'Jesus Cristo',
    source: 'João 11:25-26',
    icon: 'sunny',
    category: 'biblical'
  },
  {
    id: 'mateus_5_bem_aventurados',
    title: 'Bem-aventurados',
    content: 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus. Bem-aventurados os que choram, porque eles serão consolados...',
    author: 'Jesus Cristo',
    source: 'Mateus 5:3-4',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'mateus_11_cansados',
    title: 'Vinde a Mim',
    content: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim...',
    author: 'Jesus Cristo',
    source: 'Mateus 11:28-29',
    icon: 'hand-right',
    category: 'biblical'
  },
  {
    id: 'lucas_23_perdao',
    title: 'Pai, Perdoa-lhes',
    content: 'E dizia Jesus: Pai, perdoa-lhes, porque não sabem o que fazem. E, repartindo as suas vestes, lançaram sortes...',
    author: 'Jesus Cristo',
    source: 'Lucas 23:34',
    icon: 'heart-circle',
    category: 'biblical'
  },

  // Cartas Apostólicas Expandidas
  {
    id: 'efesios_armadura',
    title: 'Armadura de Deus',
    content: 'Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo. Cingi os vossos lombos com a verdade...',
    author: 'Apóstolo Paulo',
    source: 'Efésios 6:11,14',
    icon: 'shield',
    category: 'biblical'
  },
  {
    id: 'colosenses_3_amor',
    title: 'Sobre Todas as Coisas',
    content: 'E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição. E a paz de Deus, para a qual também fostes chamados...',
    author: 'Apóstolo Paulo',
    source: 'Colossenses 3:14-15',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'galatas_fruto',
    title: 'Fruto do Espírito',
    content: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança...',
    author: 'Apóstolo Paulo',
    source: 'Gálatas 5:22-23',
    icon: 'leaf',
    category: 'biblical'
  },
  {
    id: 'hebreus_fe',
    title: 'A Fé é o Firme Fundamento',
    content: 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem. Porque por ela os antigos alcançaram testemunho...',
    author: 'Autor de Hebreus',
    source: 'Hebreus 11:1-2',
    icon: 'construct',
    category: 'biblical'
  },
  {
    id: 'tiago_sabedoria',
    title: 'Se Alguém Tem Falta de Sabedoria',
    content: 'E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada...',
    author: 'Tiago',
    source: 'Tiago 1:5',
    icon: 'bulb',
    category: 'biblical'
  },
  {
    id: 'pedro_esperanca',
    title: 'Esperança Viva',
    content: 'Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo que, segundo a sua grande misericórdia, nos gerou de novo para uma viva esperança...',
    author: 'Apóstolo Pedro',
    source: '1 Pedro 1:3',
    icon: 'star',
    category: 'biblical'
  },

  // Livros Proféticos
  {
    id: 'isaias_40_erva',
    title: 'A Erva Seca',
    content: 'Seca-se a erva, e cai a flor, mas a palavra de nosso Deus subsiste eternamente. Toda a carne é erva, e toda a sua beleza como as flores do campo...',
    author: 'Profeta Isaías',
    source: 'Isaías 40:8,6',
    icon: 'leaf',
    category: 'biblical'
  },
  {
    id: 'isaias_53_cordeiro',
    title: 'Como Cordeiro',
    content: 'Ele foi oprimido, mas não abriu a sua boca; como um cordeiro foi levado ao matadouro, e como a ovelha muda perante os seus tosquiadores...',
    author: 'Profeta Isaías',
    source: 'Isaías 53:7',
    icon: 'heart',
    category: 'biblical'
  },
  {
    id: 'ezequiel_coracao',
    title: 'Coração Novo',
    content: 'E dar-vos-ei um coração novo, e porei dentro de vós um espírito novo; e tirarei da vossa carne o coração de pedra, e vos darei um coração de carne...',
    author: 'Profeta Ezequiel',
    source: 'Ezequiel 36:26',
    icon: 'heart-circle',
    category: 'biblical'
  },
  {
    id: 'joel_espirito',
    title: 'Derramarei o Meu Espírito',
    content: 'E há de ser que, depois derramarei o meu Espírito sobre toda a carne, e vossos filhos e vossas filhas profetizarão...',
    author: 'Profeta Joel',
    source: 'Joel 2:28',
    icon: 'water',
    category: 'biblical'
  },

  // === EXPANSÃO MASSIVA DE POETAS CRISTÃOS ===

  // Mais Adélia Prado
  {
    id: 'adelia_bagagem',
    title: 'Bagagem',
    content: 'Minha bagagem é pequena. Cabe numa mão só. Mas pesa como se fosse o mundo inteiro. É feita de lágrimas e risos, de orações e blasfêmias...',
    author: 'Adélia Prado',
    source: 'Bagagem',
    icon: 'briefcase',
    category: 'christian_poets'
  },
  {
    id: 'adelia_mulher_macho',
    title: 'Mulher Macho',
    content: 'Deus me fez mulher, mas eu me sinto macho quando preciso ser forte. Deus me fez frágil, mas eu me torno rocha quando alguém precisa de apoio...',
    author: 'Adélia Prado',
    source: 'Terra de Santa Cruz',
    icon: 'woman',
    category: 'christian_poets'
  },
  {
    id: 'adelia_ave_palavra',
    title: 'Ave, Palavra',
    content: 'Ave, palavra, que vieste de Deus e a Deus retornas. Ave, Verbo eterno, que se fez carne e habitou entre nós. Ave, silêncio que fala mais alto que o grito...',
    author: 'Adélia Prado',
    source: 'Ave, Palavra',
    icon: 'chatbubble',
    category: 'christian_poets'
  },

  // Mais Murilo Mendes
  {
    id: 'murilo_eternidade',
    title: 'A Eternidade',
    content: 'A eternidade não é o tempo que não acaba, mas o instante que não passa. É o agora de Deus, o sempre do amor, o nunca da morte...',
    author: 'Murilo Mendes',
    source: 'Tempo e Eternidade',
    icon: 'infinite',
    category: 'christian_poets'
  },
  {
    id: 'murilo_anjo',
    title: 'O Anjo',
    content: 'O anjo desceu do céu com uma escada de luz. Subiu comigo até as nuvens e me mostrou o rosto de Deus. Era um rosto de criança, de mãe, de amigo...',
    author: 'Murilo Mendes',
    source: 'Os Quatro Elementos',
    icon: 'star',
    category: 'christian_poets'
  },
  {
    id: 'murilo_historia',
    title: 'História do Brasil',
    content: 'O Brasil foi descoberto por Deus num domingo de Páscoa. As caravelas eram anjos disfarçados, os marinheiros eram profetas sem saber...',
    author: 'Murilo Mendes',
    source: 'História do Brasil',
    icon: 'boat',
    category: 'christian_poets'
  },

  // Mais Cecília Meireles
  {
    id: 'cecilia_vento',
    title: 'O Vento',
    content: 'O vento é o Espírito de Deus que sopra onde quer. Não sabemos de onde vem nem para onde vai, mas ouvimos a sua voz nas folhas, nas águas, no coração...',
    author: 'Cecília Meireles',
    source: 'Viagem',
    icon: 'leaf',
    category: 'christian_poets'
  },
  {
    id: 'cecilia_tempo',
    title: 'O Tempo',
    content: 'O tempo é a sombra de Deus que passa sobre a terra. É o relógio do céu que marca as horas da eternidade. É a música do universo que dança no infinito...',
    author: 'Cecília Meireles',
    source: 'Vaga Música',
    icon: 'time',
    category: 'christian_poets'
  },
  {
    id: 'cecilia_mar',
    title: 'O Mar e a Oração',
    content: 'O mar é como uma oração infinita que Deus faz a si mesmo. Cada onda é uma palavra, cada espuma é um suspiro, cada maré é um amém...',
    author: 'Cecília Meireles',
    source: 'Mar Absoluto',
    icon: 'water',
    category: 'christian_poets'
  },

  // Mais Jorge de Lima
  {
    id: 'jorge_invencao_orfeu',
    title: 'Invenção de Orfeu',
    content: 'Orfeu, meu Orfeu, que desceste aos infernos da poesia para buscar a Eurídice perdida da palavra. Tua lira é a cruz, teu canto é a ressurreição...',
    author: 'Jorge de Lima',
    source: 'Invenção de Orfeu',
    icon: 'musical-note',
    category: 'christian_poets'
  },
  {
    id: 'jorge_mulher_obscura',
    title: 'A Mulher Obscura',
    content: 'A mulher obscura que habita em mim é a própria alma em busca de Deus. É Maria que diz sim, é Eva que chora, é Madalena que ama...',
    author: 'Jorge de Lima',
    source: 'A Túnica Inconsútil',
    icon: 'woman',
    category: 'christian_poets'
  },

  // Vinícius de Moraes (lado cristão)
  {
    id: 'vinicius_arca',
    title: 'A Arca de Noé',
    content: 'A arca de Noé era o coração de Deus navegando sobre as águas do dilúvio. Cada animal era uma oração, cada dia era uma esperança de terra firme...',
    author: 'Vinícius de Moraes',
    source: 'A Arca de Noé',
    icon: 'boat',
    category: 'christian_poets'
  },
  {
    id: 'vinicius_natal',
    title: 'Natal',
    content: 'É Natal. O menino Deus nasceu na manjedoura do meu coração. Os anjos cantam no meu peito, os pastores adoram na minha alma...',
    author: 'Vinícius de Moraes',
    source: 'Para Viver um Grande Amor',
    icon: 'star',
    category: 'christian_poets'
  },

  // Carlos Drummond (lado espiritual)
  {
    id: 'drummond_deus',
    title: 'Procura da Poesia',
    content: 'Não faças versos sobre acontecimentos. Não há criação nem morte perante a poesia. Diante dela, a vida é um sol estático, não aquece nem ilumina...',
    author: 'Carlos Drummond de Andrade',
    source: 'A Rosa do Povo',
    icon: 'rose',
    category: 'christian_poets'
  },

  // Mário Quintana (lado místico)
  {
    id: 'quintana_anjos',
    title: 'Os Anjos',
    content: 'Os anjos existem. Eu os vejo todos os dias nas ruas, disfarçados de gente comum. São aqueles que sorriem sem motivo, que ajudam sem interesse...',
    author: 'Mário Quintana',
    source: 'Caderno H',
    icon: 'star',
    category: 'christian_poets'
  },
  {
    id: 'quintana_deus_detalhes',
    title: 'Deus nos Detalhes',
    content: 'Deus mora nos detalhes. Está na gota de orvalho, no sorriso da criança, no abraço da mãe, na lágrima de alegria, no pão de cada dia...',
    author: 'Mário Quintana',
    source: 'Baú de Espantos',
    icon: 'eye',
    category: 'christian_poets'
  },

  // Poetas Cristãos Contemporâneos Brasileiros
  {
    id: 'frei_betto',
    title: 'Oração do Tempo',
    content: 'Senhor, dai-me tempo para amar, tempo para servir, tempo para orar. Que eu não desperdice os minutos que são eternidades disfarçadas...',
    author: 'Frei Betto',
    source: 'Cartas da Prisão',
    icon: 'time',
    category: 'christian_poets'
  },
  {
    id: 'leonardo_boff',
    title: 'A Águia e a Galinha',
    content: 'Somos águias que se acostumaram a viver como galinhas. Deus nos criou para voar, mas aprendemos a ciscar. É hora de lembrar quem somos...',
    author: 'Leonardo Boff',
    source: 'A Águia e a Galinha',
    icon: 'airplane',
    category: 'christian_poets'
  },
  {
    id: 'rubem_alves',
    title: 'O Deus que Habita em Nós',
    content: 'Deus não mora num templo feito por mãos humanas. Ele habita no coração que ama, na mão que ajuda, no olho que chora com quem sofre...',
    author: 'Rubem Alves',
    source: 'O Deus que Habita em Nós',
    icon: 'heart-circle',
    category: 'christian_poets'
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
