export interface Scene {
  label: string;
  keywords: string[];
  prompt: string;
}

export interface Genre {
  id: string;
  name: string;
  nameEn: string;
  accentColor: string;
  borderColor: string;
  defaultPrompt: string;
  scenes: Scene[];
}

export const GENRES: Genre[] = [
  {
    id: "mystery",
    name: "ミステリー",
    nameEn: "Mystery",
    accentColor: "text-blue-300",
    borderColor: "border-blue-800",
    defaultPrompt: "dark mysterious Victorian scene, foggy, cinematic, atmospheric",
    scenes: [
      {
        label: "洋館",
        keywords: ["洋館", "邸宅", "屋敷"],
        prompt: "dark Victorian mansion exterior at night, fog, ominous atmosphere, candlelit windows, gothic architecture",
      },
      {
        label: "洋館内部",
        keywords: ["中に入", "玄関ホール", "玄関", "廊下", "ホール", "館内", "内部"],
        prompt: "dark Victorian mansion interior entrance hall, grand staircase, old portraits on walls, flickering candlelight, eerie shadows, dusty atmosphere",
      },
      {
        label: "書斎",
        keywords: ["書斎", "図書室", "書庫"],
        prompt: "dimly lit Victorian study room, bookshelves full of old books, candlelight, mysterious atmosphere, dark wood",
      },
      {
        label: "地下室",
        keywords: ["地下室", "地下", "地下道"],
        prompt: "dark stone basement corridor, flickering torchlight, eerie shadows, damp stone walls, mysterious",
      },
      {
        label: "廃墟",
        keywords: ["廃墟", "廃屋", "廃村"],
        prompt: "abandoned ruined Victorian building overgrown with vines, broken windows, desolate, overcast sky",
      },
      {
        label: "霧の街",
        keywords: ["街", "路地", "霧"],
        prompt: "foggy Victorian city street at night, gas lamps glowing, cobblestones, noir atmosphere, dense fog",
      },
      {
        label: "森",
        keywords: ["森", "林", "木立"],
        prompt: "dark misty forest with bare trees, eerie atmosphere, fog between trees, moonlight filtering through, mysterious",
      },
    ],
  },
  {
    id: "fantasy",
    name: "ファンタジー",
    nameEn: "Fantasy",
    accentColor: "text-amber-300",
    borderColor: "border-amber-700",
    defaultPrompt: "epic fantasy landscape, dramatic sky, magical atmosphere, cinematic",
    scenes: [
      {
        label: "城",
        keywords: ["城", "王城", "城壁", "城塞"],
        prompt: "majestic fantasy castle on a clifftop, dramatic stormy sky, epic scale, medieval architecture, magical",
      },
      {
        label: "魔法の森",
        keywords: ["魔法の森", "幻の森", "森", "精霊の森"],
        prompt: "enchanted glowing forest with magical light particles, bioluminescent plants, mystical atmosphere, vibrant colors",
      },
      {
        label: "洞窟",
        keywords: ["洞窟", "鍾乳洞", "地底"],
        prompt: "fantasy cave interior with glowing crystals, underground lake, stalactites, magical blue lighting",
      },
      {
        label: "村",
        keywords: ["村", "町", "街道"],
        prompt: "cozy medieval fantasy village, thatched roof cottages, warm lantern light, cobblestone streets, evening",
      },
      {
        label: "草原",
        keywords: ["草原", "平原", "荒野"],
        prompt: "vast green grassland with rolling hills, dramatic clouds, fantasy landscape, epic scale, golden hour",
      },
      {
        label: "山岳",
        keywords: ["山", "峰", "山岳", "山脈"],
        prompt: "dramatic fantasy mountain range with snow-capped peaks, epic vista, misty valleys, cinematic sky",
      },
    ],
  },
  {
    id: "scifi",
    name: "SF",
    nameEn: "Sci-Fi",
    accentColor: "text-cyan-300",
    borderColor: "border-cyan-800",
    defaultPrompt: "futuristic sci-fi scene, advanced technology, cinematic, atmospheric",
    scenes: [
      {
        label: "宇宙",
        keywords: ["宇宙", "星雲", "銀河"],
        prompt: "deep space nebula with colorful gas clouds and stars, galaxies in background, cosmic scale, stunning",
      },
      {
        label: "宇宙船",
        keywords: ["宇宙船", "艦橋", "船内"],
        prompt: "sci-fi spaceship bridge interior, holographic displays, panoramic window showing space, futuristic technology",
      },
      {
        label: "未来都市",
        keywords: ["都市", "未来", "メガシティ"],
        prompt: "cyberpunk futuristic megacity at night, neon lights reflecting on wet streets, towering skyscrapers, rain",
      },
      {
        label: "研究所",
        keywords: ["研究所", "ラボ", "実験室"],
        prompt: "high-tech science laboratory interior, glowing equipment, holographic data displays, clean sci-fi aesthetic",
      },
      {
        label: "惑星",
        keywords: ["惑星", "異星", "星"],
        prompt: "alien planet surface with strange rock formations, two moons in dramatic sky, otherworldly landscape, sci-fi",
      },
      {
        label: "廃工場",
        keywords: ["廃工場", "工場", "廃墟"],
        prompt: "abandoned futuristic industrial factory interior, rusted machinery, dramatic shafts of light, post-apocalyptic",
      },
    ],
  },
  {
    id: "western",
    name: "ウエスタン",
    nameEn: "Western",
    accentColor: "text-orange-300",
    borderColor: "border-orange-800",
    defaultPrompt: "American old west landscape, cinematic, dramatic, classic western",
    scenes: [
      {
        label: "荒野",
        keywords: ["荒野", "平原", "草原"],
        prompt: "American old west wilderness at sunset, vast dusty plains, dramatic orange sky, cacti silhouettes",
      },
      {
        label: "砂漠",
        keywords: ["砂漠", "砂丘", "乾燥地"],
        prompt: "desert landscape with red rock formations, harsh sunlight, western USA, mesa buttes, heat haze",
      },
      {
        label: "峡谷",
        keywords: ["峡谷", "渓谷", "谷"],
        prompt: "dramatic red rock canyon walls, narrow gorge, western landscape, golden light streaming down, cinematic",
      },
      {
        label: "酒場",
        keywords: ["酒場", "バー", "サルーン"],
        prompt: "old west saloon interior, wooden bar counter, warm oil lamp lighting, rustic wooden walls, dusty",
      },
      {
        label: "牧場",
        keywords: ["牧場", "農場", "ranch"],
        prompt: "ranch with wooden barn and horses, golden hour sunlight, western countryside, rolling hills, fence posts",
      },
      {
        label: "山道",
        keywords: ["山道", "山", "丘"],
        prompt: "rugged mountain trail in the old west, rocky terrain, pine trees, dramatic sky, cinematic western landscape",
      },
    ],
  },
  {
    id: "horror",
    name: "ホラー",
    nameEn: "Horror",
    accentColor: "text-red-400",
    borderColor: "border-red-900",
    defaultPrompt: "dark horror scene, eerie atmosphere, ominous, unsettling, cinematic",
    scenes: [
      {
        label: "墓地",
        keywords: ["墓地", "墓場", "墓"],
        prompt: "foggy graveyard at night, old weathered tombstones, moonlight breaking through clouds, dead trees, eerie",
      },
      {
        label: "廃病院",
        keywords: ["病院", "廃病院", "療養所"],
        prompt: "abandoned hospital corridor at night, flickering lights, peeling paint, overturned equipment, horror atmosphere",
      },
      {
        label: "暗い森",
        keywords: ["暗い森", "霧の森", "深い森"],
        prompt: "dark sinister forest at night, twisted gnarled trees, thick fog, pale moonlight, horror atmosphere, shadows",
      },
      {
        label: "廃屋",
        keywords: ["廃屋", "幽霊屋敷", "お化け屋敷"],
        prompt: "haunted abandoned house exterior at night, broken windows glowing, overgrown garden, lightning, gothic horror",
      },
      {
        label: "沼",
        keywords: ["沼", "湿地", "沼地"],
        prompt: "dark misty swamp at night, murky water, gnarled cypress trees, will-o-wisps, eerie green glow, horror",
      },
      {
        label: "古い教会",
        keywords: ["教会", "礼拝堂", "修道院"],
        prompt: "old gothic church interior in ruins, broken stained glass, moonlight through holes in roof, dark horror",
      },
    ],
  },
  {
    id: "cthulhu",
    name: "クトゥルフ",
    nameEn: "Cthulhu",
    accentColor: "text-purple-400",
    borderColor: "border-purple-900",
    defaultPrompt: "Lovecraftian cosmic horror scene, eldritch atmosphere, dark and unsettling, cinematic",
    scenes: [
      {
        label: "深海",
        keywords: ["深海", "海底", "海"],
        prompt: "abyssal deep ocean, bioluminescent eldritch creatures in darkness, sunken ruins, cosmic horror, Lovecraftian",
      },
      {
        label: "狂気の図書館",
        keywords: ["図書館", "書庫", "禁書"],
        prompt: "ancient library filled with forbidden tomes, non-euclidean geometry shelves, candles, eldritch symbols, Lovecraftian horror",
      },
      {
        label: "廃教会",
        keywords: ["教会", "礼拝堂", "祭壇"],
        prompt: "abandoned cult church with strange tentacle murals, blasphemous altar, candlelight, Lovecraftian dread, dark",
      },
      {
        label: "霧の港町",
        keywords: ["港", "港町", "船"],
        prompt: "foggy eldritch New England harbor town at night, Innsmouth style, decrepit buildings, sinister atmosphere, Lovecraftian",
      },
      {
        label: "異次元",
        keywords: ["異次元", "次元", "宇宙"],
        prompt: "Lovecraftian outer dimension, impossible geometry, swirling cosmic void, eldritch colors beyond human perception, terrifying",
      },
      {
        label: "遺跡",
        keywords: ["遺跡", "神殿", "石碑"],
        prompt: "ancient pre-human cyclopean ruins in jungle, strange eldritch carvings, mist, cosmic horror, Lovecraftian architecture",
      },
      {
        label: "精神病院",
        keywords: ["病院", "精神", "療養"],
        prompt: "decrepit 1920s psychiatric asylum corridor, flickering lights, disturbing drawings on walls, dark horror atmosphere",
      },
      {
        label: "夢の世界",
        keywords: ["夢", "夢幻", "幻"],
        prompt: "Lovecraftian dreamlands, surreal impossible landscape, floating islands, strange moons, eerie beauty mixed with dread",
      },
    ],
  },
  {
    id: "historical",
    name: "時代劇",
    nameEn: "Historical",
    accentColor: "text-green-300",
    borderColor: "border-green-800",
    defaultPrompt: "feudal Japan scene, Edo period, cinematic, atmospheric, traditional Japanese",
    scenes: [
      {
        label: "江戸の街",
        keywords: ["江戸", "城下町", "宿場"],
        prompt: "Edo period Japanese town street at dusk, wooden merchant buildings, paper lanterns lit, people in kimono",
      },
      {
        label: "神社",
        keywords: ["神社", "社", "鳥居"],
        prompt: "Japanese Shinto shrine with vermillion torii gate, stone lanterns along forested path, misty morning, serene",
      },
      {
        label: "竹林",
        keywords: ["竹林", "竹", "竹藪"],
        prompt: "tall bamboo forest in Japan, green light filtering through dense bamboo, peaceful, misty, traditional Japan",
      },
      {
        label: "お城",
        keywords: ["城", "天守閣", "お城"],
        prompt: "Japanese feudal castle with white walls and curved roofs, cherry blossom trees, dramatic sky, samurai era",
      },
      {
        label: "戦場",
        keywords: ["戦場", "合戦", "戦"],
        prompt: "feudal Japanese battlefield, smoke and chaos, samurai banners, dramatic sky, Sengoku period warfare",
      },
      {
        label: "山寺",
        keywords: ["寺", "山寺", "仏閣"],
        prompt: "mountain Buddhist temple in Japan, stone steps winding through forest, misty atmosphere, moss-covered lanterns",
      },
    ],
  },
];

export function findScene(genre: Genre, keyword: string): Scene | undefined {
  return genre.scenes.find((scene) =>
    scene.keywords.some((k) => keyword.includes(k))
  );
}
