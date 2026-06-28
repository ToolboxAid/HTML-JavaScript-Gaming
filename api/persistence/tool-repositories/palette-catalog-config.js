function swatches(values) {
  return Object.freeze(values.split(/\s+/).filter(Boolean));
}

export const SORT_OPTIONS = Object.freeze([
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "brightness", label: "Brit" },
  { key: "name", label: "Name" },
  { key: "tag", label: "Tag" }
]);

export const PICKER_PREVIEW_SORT_OPTIONS = Object.freeze([
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "brightness", label: "Brit" },
  { key: "default", label: "Default" }
]);

export const SIZE_OPTIONS = Object.freeze([
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" }
]);

export const SUGGESTED_TAGS = Object.freeze([
  "UI",
  "Main Colors",
  "Panel Background",
  "Panel Border",
  "Primary Button",
  "Secondary Button",
  "Warning",
  "Success",
  "Error",
  "Info",
  "Menu",
  "HUD",
  "Health",
  "Mana",
  "Stamina",
  "Score",
  "Timer",
  "Player",
  "Enemy",
  "Boss",
  "NPC",
  "Item",
  "Pickup",
  "Power Up",
  "Terrain",
  "Grass",
  "Dirt",
  "Stone",
  "Metal",
  "Wood",
  "Water",
  "Fire",
  "Ice",
  "Poison",
  "Lightning",
  "Shadow",
  "Highlight",
  "Outline",
  "Sprite",
  "Tile",
  "Background",
  "Foreground",
  "Platform",
  "Door",
  "Key",
  "Trap",
  "Projectile",
  "Particle",
  "Explosion",
  "Winter",
  "Summer",
  "Night",
  "Day",
  "Cave",
  "Castle",
  "Forest",
  "Jungle",
  "Desert",
  "Ocean",
  "Space",
  "Cyberpunk",
  "Retro",
  "8-Bit",
  "16-Bit"
]);

export const PALETTE_GENERATOR_DEFAULTS = Object.freeze({
  contrast: 40,
  stepRange: 50,
  steps: 1,
  saturation: 100,
  hueShift: 0
});

export const PICKER_PREVIEW_DEFAULTS = Object.freeze({
  brightness: 100,
  hue: 0,
  saturation: 100
});

export const PALETTE_VARIANTS = Object.freeze([
  { label: "Full", value: "full" },
  { label: "32 colors", value: "32" },
  { label: "16 colors", value: "16" },
  { label: "8 colors", value: "8" },
  { label: "4 colors", value: "4" },
  { label: "High Contrast", value: "high-contrast" },
  { label: "Color Blind Safe", value: "color-blind-safe" },
  { label: "Grayscale", value: "grayscale" },
  { label: "Print Friendly", value: "print-friendly" },
  { label: "Day", value: "day" },
  { label: "Night", value: "night" },
  { label: "Dawn", value: "dawn" },
  { label: "Dusk", value: "dusk" },
  { label: "Winter", value: "winter" },
  { label: "Summer", value: "summer" }
]);

export const NUMERIC_VARIANT_COUNTS = Object.freeze({
  "32": 32,
  "16": 16,
  "8": 8,
  "4": 4
});


export const CURATED_PALETTE_COLLECTIONS = Object.freeze([
  {
    name: "Nature",
    types: Object.freeze([
      { name: "Forest", swatches: swatches("#102A17 #1F4D25 #346B35 #5D8A3E #8FA653 #C0B36F #6F4B2E #24351F") },
      { name: "Jungle", swatches: swatches("#0E2F1D #136B38 #1F9651 #45B35F #8BCF55 #D5DA4E #F29E3D #2B6F64") },
      { name: "Desert", swatches: swatches("#4A2B1A #7A4A24 #A66D32 #D09A55 #E6C27A #F1DFA8 #B86F4B #5D4D42") },
      { name: "Mountain", swatches: swatches("#1E2930 #34434A #58666A #7F8D89 #A9B2A0 #D1C7A0 #7C6B55 #2F3B45") },
      { name: "Arctic", swatches: swatches("#183040 #2D5366 #4D7D8F #79AFC2 #B5DCE5 #E6F4F6 #9EAEB9 #3E4E63") },
      { name: "Swamp", swatches: swatches("#1B2414 #33401C #59612E #77733F #8C7F4E #4F6B47 #2E5A4C #614126") },
      { name: "Ocean", swatches: swatches("#061D34 #083A5B #0E6387 #168FA8 #37BBC1 #8EE0D1 #D4F2E6 #28517E") },
      { name: "Tropical", swatches: swatches("#006C70 #00A39B #32C56F #9FD356 #F4D35E #F29E4C #E85D75 #7F4AC8") }
    ])
  },
  {
    name: "ROYGBIV",
    types: Object.freeze([
      {
        name: "ROYGBIV",
        names: Object.freeze(["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"]),
        swatches: swatches("#FF0000 #FFA500 #FFFF00 #008000 #0000FF #4B0082 #EE82EE")
      }
    ])
  },
  {
    name: "Floral",
    types: Object.freeze([
      { name: "Rose Garden", swatches: swatches("#3A1020 #76223A #B9375E #E56B8A #F2A0A8 #FFD3C9 #446B3F #8FAE5D") },
      { name: "Spring Bloom", swatches: swatches("#6AA84F #93C47D #B6D7A8 #F9CB9C #F6B26B #EA9999 #C27BA0 #8E7CC3") },
      { name: "Wildflowers", swatches: swatches("#31572C #4F772D #90A955 #F9C74F #F9844A #F94144 #577590 #9B5DE5") },
      { name: "Lavender Field", swatches: swatches("#2E2245 #51406F #7561A8 #A38DCC #D1BCE3 #F0E4F5 #6E8B57 #B6B866") },
      { name: "Autumn Harvest", swatches: swatches("#3B1F12 #7A2E18 #B94E1F #D9822B #E9B44C #8A7F39 #5F6F2E #A4423D") }
    ])
  },
  {
    name: "Water",
    types: Object.freeze([
      { name: "Deep Ocean", swatches: swatches("#03111F #062B45 #0B4E73 #126D91 #1A8DA8 #5BB8C0 #A7D9D3 #1E3F68") },
      { name: "Tropical Reef", swatches: swatches("#004D61 #008F9A #00B8A9 #6BD6B5 #C8E675 #F9D56E #F08A5D #7B4E9D") },
      { name: "River", swatches: swatches("#20333A #31545E #4D7580 #70949A #A7B7AE #C9C7A6 #7F8C5C #4D5A3D") },
      { name: "Lake", swatches: swatches("#0B2636 #1A4B61 #3D7387 #6999A3 #A6C4C3 #D9E0D2 #6A7E64 #364A3D") },
      { name: "Storm Sea", swatches: swatches("#101820 #23313D #3B4A56 #65727B #8B969B #B7B7AC #31566D #1F2B3B") },
      { name: "Frozen Water", swatches: swatches("#153040 #2D5B70 #5A91A8 #8DC7D6 #C7EDF1 #F2FBFA #A8B8C8 #5B6D86") }
    ])
  },
  {
    name: "Elements",
    types: Object.freeze([
      { name: "Fire", swatches: swatches("#250505 #5A0F0F #9C1B16 #D94A1E #F47C20 #FFB238 #FFE06E #4A1F12") },
      { name: "Ice", swatches: swatches("#0C2735 #1B5268 #3F8FA8 #76C4D5 #BDEDF2 #F2FFFF #9CB7D3 #485E82") },
      { name: "Earth", swatches: swatches("#25170E #4B321F #74502E #9A7042 #BE955B #D7BF82 #5C6B38 #32482D") },
      { name: "Air", swatches: swatches("#D7F1F2 #A8DADC #7BC6D3 #5AA7C7 #8AB6E0 #E7D8A7 #F6F2D4 #6F8BA3") },
      { name: "Lightning", swatches: swatches("#1C1633 #3D2B6F #5F4BB6 #2EC4F1 #7FE7F5 #FFE66D #FFF3A3 #F9A620") },
      { name: "Poison", swatches: swatches("#1C1026 #3B1F5A #6A2D8F #8F3FB3 #A7C957 #6A994E #386641 #D6E681") },
      { name: "Crystal", swatches: swatches("#251A3D #4D3B78 #7F6EB2 #A997DF #D8C8FF #BDE0FE #74C0FC #3A86FF") }
    ])
  },
  {
    name: "Fantasy",
    types: Object.freeze([
      { name: "Medieval", swatches: swatches("#1F1B16 #4B3621 #7A542E #A67C45 #C7A76C #354F35 #5E7041 #7B2D26") },
      { name: "Dwarven", swatches: swatches("#1A1512 #3A2A22 #6E4D35 #9A6B3F #C58C47 #D8B45C #77706A #B23A24") },
      { name: "Elven", swatches: swatches("#12251D #25543E #4C8C63 #85B87A #C1D88A #E8DFA6 #89B6A6 #A789C5") },
      { name: "Dark Kingdom", swatches: swatches("#08070B #1E1A2B #3A2E4F #5E3F65 #7B2D3D #A63D40 #C9A45C #4A4A4A") },
      { name: "Magic", swatches: swatches("#17113A #332A78 #5946B2 #8B5FD3 #C77DFF #FF7AD9 #FFD166 #59C3C3") },
      { name: "Dragon", swatches: swatches("#1C1110 #4A1E18 #8A2F1D #C84C2A #E17A36 #F0B65A #2F5D46 #0E2A2B") }
    ])
  },
  {
    name: "Sci-Fi",
    types: Object.freeze([
      { name: "Space", swatches: swatches("#050814 #111A33 #243B6B #3D64A8 #6EA8FE #BFD7FF #F2E9E4 #7B4EAB") },
      { name: "Cyberpunk", swatches: swatches("#0A0614 #1B0C3B #4A148C #D000FF #00D9FF #00FF88 #FFE600 #FF2D75") },
      { name: "Alien World", swatches: swatches("#141522 #2B2D5C #5260A8 #5EC4A8 #8AD95E #D8F56E #FF8F5E #A24EA8") },
      { name: "Futuristic City", swatches: swatches("#11151C #263241 #405A6B #6E8AA0 #9DB6C7 #C9D6DF #FFB703 #00B4D8") },
      { name: "Robot Factory", swatches: swatches("#15191E #2B333D #4E5965 #7B8794 #AEB6BF #D8DEE4 #E76F51 #2A9D8F") }
    ])
  },
  {
    name: "Horror",
    types: Object.freeze([
      { name: "Haunted House", swatches: swatches("#0B0A0C #1C1A22 #332C3A #4D3A4F #6B4B3F #8C6D4F #B8A36A #3A4A35") },
      { name: "Gothic", swatches: swatches("#07070A #1B1720 #2E2636 #46384F #6F516C #8E6F88 #B7A28C #7C1D2A") },
      { name: "Blood Moon", swatches: swatches("#110509 #3A0B12 #6E1119 #A01821 #D13A2F #F06B3D #291A28 #5C4A5F") },
      { name: "Undead", swatches: swatches("#111510 #263026 #465642 #6F7C5E #9BA881 #C8C9A4 #5B4C5A #2C2E3A") },
      { name: "Lovecraft", swatches: swatches("#071315 #122D31 #1D555B #32807A #59A58E #9CC8A5 #47375D #2A1C3A") }
    ])
  },
  {
    name: "Human",
    types: Object.freeze([
      {
        name: "Skin Tones",
        names: Object.freeze(["Deep Umber", "Rich Brown", "Warm Chestnut", "Golden Brown", "Olive Tan", "Warm Beige", "Peach Fair", "Porcelain"]),
        swatches: swatches("#3A2118 #5A3224 #7A4B35 #9D6B4D #B88661 #D0A37A #E4BF9D #F3D8C4")
      },
      {
        name: "Hair Tones",
        names: Object.freeze(["Black", "Soft Black", "Dark Brown", "Chestnut", "Auburn", "Copper", "Dark Blonde", "Silver Gray"]),
        swatches: swatches("#0D0A08 #1B1410 #352217 #5A3823 #7B3F25 #A75B2C #C8A260 #D1D1C8")
      },
      {
        name: "Eye Tones",
        names: Object.freeze(["Deep Brown", "Amber", "Hazel", "Olive Green", "Green", "Blue Gray", "Blue", "Violet Gray"]),
        swatches: swatches("#2B160F #704214 #8A6B2F #5F6F3A #3E7552 #5B7A91 #3B6EA5 #6B5B85")
      },
      {
        name: "Clothing Support",
        names: Object.freeze(["Canvas", "Linen", "Denim", "Navy", "Charcoal", "Burgundy", "Olive", "Leather"]),
        swatches: swatches("#E6D8C3 #C7B79C #4E6A86 #1F2F4A #2C2F33 #7A2535 #5B6336 #6B3F26")
      },
      {
        name: "Shadow Highlight Support",
        names: Object.freeze(["Deep Shadow", "Warm Shadow", "Cool Shadow", "Soft Shadow", "Neutral Mid", "Warm Highlight", "Cool Highlight", "Specular"]),
        swatches: swatches("#1B1210 #3A2922 #28323A #6F6258 #9B8B7F #D9BFA4 #D7E1EA #FFF1DC")
      },
      {
        name: "Human",
        names: Object.freeze([
          "Deep Skin",
          "Dark Skin",
          "Medium Skin",
          "Olive Skin",
          "Light Skin",
          "Pale Skin",
          "Warm Highlight",
          "Cool Shadow",
          "Black Hair",
          "Brown Hair",
          "Auburn Hair",
          "Blonde Hair",
          "Gray Hair",
          "Eye Blue",
          "Eye Green",
          "Eye Brown",
          "Cloth Navy",
          "Cloth Red",
          "Cloth Green",
          "Cloth Neutral"
        ]),
        swatches: swatches("#3A2118 #5A3224 #8A5A3D #9A7B4F #D7A982 #F0D1BA #FFE0C2 #2A2E38 #0D0A08 #4B2C1A #8A3E24 #C6A15D #B8B8B2 #3B6EA5 #3F7A52 #5A321E #273D5F #8F2F3D #4F6B45 #B2A08A")
      }
    ])
  },
  {
    name: "Modern",
    types: Object.freeze([
      { name: "City", swatches: swatches("#15191E #2E3740 #52616B #7B8794 #AEB6BF #E0E4E7 #DDA15E #3A86FF") },
      { name: "Industrial", swatches: swatches("#191716 #34312D #5B5650 #837B72 #A8A096 #D0C8BC #B35B31 #546A76") },
      { name: "Military", swatches: swatches("#151A13 #2E3A21 #4D5D2E #6C7A42 #8F955C #B8B585 #5B5141 #2F3E46") },
      { name: "Construction", swatches: swatches("#22160A #5A3510 #A96013 #E69520 #FFC857 #30343F #6C757D #E0E1DD") },
      { name: "Sports", swatches: swatches("#0B132B #1C2541 #3A506B #5BC0BE #F2F5EA #F4D35E #EE964B #F95738") }
    ])
  },
  {
    name: "Arcade",
    types: Object.freeze([
      { name: "Arcade 1978", swatches: swatches("#000000 #1B1B1B #FF0000 #FF7F00 #FFFF00 #00FF00 #00A2FF #FFFFFF") },
      { name: "Arcade 1980", swatches: swatches("#000000 #222034 #45283C #D95763 #D77BBA #8F974A #8A6F30 #E0F8CF") },
      { name: "Arcade 1985", swatches: swatches("#0F0F1B #29294A #3D6FB6 #38B6E8 #4FD65F #F9E858 #F08A38 #E84855") },
      { name: "Arcade 1990", swatches: swatches("#120D1F #2C1E4A #572C82 #B13EBA #FF4FB8 #00C2FF #00E676 #FFE15A") }
    ])
  },
  {
    name: "8-Bit",
    types: Object.freeze([
      { name: "NES Inspired", swatches: swatches("#0F0F0F #545454 #A80020 #F83800 #F8A800 #00A800 #0078F8 #FCFCFC") },
      { name: "Master System Inspired", swatches: swatches("#000000 #555555 #AA0000 #FF5500 #FFFF55 #00AA00 #5555FF #FFFFFF") },
      { name: "ZX Spectrum Inspired", swatches: swatches("#000000 #0000D7 #D70000 #D700D7 #00D700 #00D7D7 #D7D700 #FFFFFF") },
      { name: "Commodore 64 Inspired", swatches: swatches("#000000 #626262 #813338 #8E3C97 #553A9B #2C5D9F #56AC4D #B8C76F") },
      { name: "Game Boy Inspired", swatches: swatches("#0F380F #306230 #8BAC0F #9BBC0F #CBDC76 #E0F8D0 #5C7C1D #1E4A1E") }
    ])
  },
  {
    name: "16-Bit",
    types: Object.freeze([
      { name: "SNES Inspired", swatches: swatches("#0F0F2D #3C2A78 #6B4AB8 #A06CD5 #F2C14E #F78154 #4CB944 #E8F1F2") },
      { name: "Genesis Inspired", swatches: swatches("#050505 #1B1B3A #3A0CA3 #4361EE #4CC9F0 #F72585 #F8961E #F9F871") },
      { name: "TurboGrafx Inspired", swatches: swatches("#111111 #333366 #3F88C5 #44BBA4 #E94F37 #F6AE2D #F5F749 #F0F0F0") },
      { name: "Neo Geo Inspired", swatches: swatches("#080808 #27213C #5A189A #9D4EDD #F72585 #FF9E00 #70E000 #FFFFFF") }
    ])
  },
  {
    name: "32/64-Bit",
    types: Object.freeze([
      { name: "PlayStation Inspired", swatches: swatches("#101014 #2D2D35 #4A4E69 #6C757D #ADB5BD #E9ECEF #2F80ED #EB5757") },
      { name: "Nintendo 64 Inspired", swatches: swatches("#0B0B0B #3A3A3A #E63946 #F1C40F #2ECC71 #3498DB #9B59B6 #F7F7F7") },
      { name: "Saturn Inspired", swatches: swatches("#0D0D16 #252545 #4B4E8A #6979B8 #9AA7D9 #D2D8F0 #F2A65A #D94F70") }
    ])
  },
  {
    name: "Computer",
    types: Object.freeze([
      { name: "DOS VGA", swatches: swatches("#000000 #0000AA #00AA00 #00AAAA #AA0000 #AA00AA #AA5500 #FFFFFF") },
      { name: "EGA", swatches: swatches("#000000 #0000AA #00AA00 #00AAAA #AA0000 #AA00AA #AA5500 #AAAAAA") },
      { name: "CGA", swatches: swatches("#000000 #00AAAA #AA00AA #AAAAAA #0000AA #00AA00 #AA0000 #FFFFFF") },
      { name: "Amiga", swatches: swatches("#000000 #222244 #444488 #6C71C4 #B58900 #CB4B16 #859900 #FDF6E3") }
    ])
  }
]);


export const PALETTE_CATALOG_CONFIG = Object.freeze({
  SORT_OPTIONS,
  PICKER_PREVIEW_SORT_OPTIONS,
  SIZE_OPTIONS,
  SUGGESTED_TAGS,
  PALETTE_GENERATOR_DEFAULTS,
  PICKER_PREVIEW_DEFAULTS,
  PALETTE_VARIANTS,
  NUMERIC_VARIANT_COUNTS,
  CURATED_PALETTE_COLLECTIONS
});
