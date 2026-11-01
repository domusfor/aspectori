// The classic fixed stars used in Western astrology, with short meanings in our own words.
export interface StarInfo {
  name: string;
  /** Constellation, for the label. */
  in: string;
  meaning: string;
}

export const STARS: StarInfo[] = [
  { name: "Regulus", in: "Leo", meaning: "the royal star: ambition and recognition, kept only by staying generous" },
  { name: "Aldebaran", in: "Taurus", meaning: "the watcher of the east: integrity and courage, success that depends on keeping your word" },
  { name: "Antares", in: "Scorpius", meaning: "the heart of the scorpion: intensity, daring and an all-or-nothing streak" },
  { name: "Fomalhaut", in: "Piscis Austrinus", meaning: "the watcher of the south: idealism and vision that needs a clean motive" },
  { name: "Spica", in: "Virgo", meaning: "the ear of wheat: talent and gifts that seem to arrive unasked" },
  { name: "Arcturus", in: "Boötes", meaning: "the guardian: a pathfinder who takes a different road from the crowd" },
  { name: "Sirius", in: "Canis Major", meaning: "the brightest star: fame, devotion and burning ambition" },
  { name: "Algol", in: "Perseus", meaning: "the demon star: raw intensity and power that has to be faced, not avoided" },
  { name: "Vega", in: "Lyra", meaning: "the harp: charisma, artistry and a gift for performance" },
  { name: "Betelgeuse", in: "Orion", meaning: "Orion's shoulder: lasting success and a strong will" },
  { name: "Rigel", in: "Orion", meaning: "Orion's foot: teaching, skill and the urge to master a craft" },
  { name: "Capella", in: "Auriga", meaning: "the little goat: curiosity, independence and a love of learning" },
  { name: "Pollux", in: "Gemini", meaning: "the boxer twin: courage, competitiveness and a sharp tongue" },
  { name: "Castor", in: "Gemini", meaning: "the scholar twin: intellect, writing and quick wit" },
  { name: "Procyon", in: "Canis Minor", meaning: "the little dog: quick rises and the need to see things through" },
  { name: "Alcyone", in: "the Pleiades", meaning: "the Pleiades: vision and sensitivity, sometimes sorrow turned into insight" },
  { name: "Altair", in: "Aquila", meaning: "the eagle: boldness and sudden opportunities" },
  { name: "Deneb Algedi", in: "Capricornus", meaning: "the goat's tail: justice, law and responsibility" },
  { name: "Achernar", in: "Eridanus", meaning: "the river's end: success through faith, endurance and generosity" },
  { name: "Canopus", in: "Carina", meaning: "the navigator: travel, guidance and finding a way where none is marked" },
];

export const STAR_ORB = 1;
