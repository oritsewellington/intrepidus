// constants/awardCategories.js

export const AWARD_CATEGORIES = [
  {
    id: 1,
    name: "Most Creative Student",
    group: "Creative",
    emoji: "🎨",
    description:
      "Awarded to the student whose imagination and originality consistently stand out — from bold ideas to fearless artistic expression that pushes the class forward.",
  },
  {
    id: 2,
    name: "Most Influential Student",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the student whose voice and actions carry real weight — someone whose opinions shape conversations and whose lead others are quick to follow.",
  },
  {
    id: 3,
    name: "Class Icon",
    group: "Popularity",
    emoji: "⭐",
    description:
      "The class's defining personality — the student whose presence, charm, and energy make them instantly recognizable and impossible to forget.",
  },
  {
    id: 4,
    name: "Best Dressed Male",
    group: "Fashion",
    emoji: "👔",
    description:
      "Celebrates the male student whose style is sharp, deliberate, and always on point — setting the standard the rest of the class watches closely.",
  },
  {
    id: 5,
    name: "Best Dressed Female",
    group: "Fashion",
    emoji: "👗",
    description:
      "Celebrates the female student whose fashion sense is effortless yet unmistakable — a signature style that turns heads every time.",
  },
  {
    id: 6,
    name: "Most Social Student",
    group: "Social",
    emoji: "🤝",
    description:
      "Recognizes the student who's always in the mix — warm, connected, and at the center of nearly every gathering, conversation, and plan.",
  },
  {
    id: 7,
    name: "Most Enterprising Student",
    group: "Business",
    emoji: "⚡",
    description:
      "Honors the student building something real — a hustler with vision, drive, and the resourcefulness to turn ideas into opportunity.",
  },
  {
    id: 8,
    name: "Most Talented Student",
    group: "Creative",
    emoji: "🎤",
    description:
      "Awarded to the all-round performer whose skill — on stage, on paper, or off the cuff — consistently leaves an impression.",
  },
  {
    id: 9,
    name: "Miss INTREPIDUS",
    group: "Popularity",
    emoji: "👸",
    description:
      "The class's highest honor for a female student — recognizing the complete package of confidence, grace, and undeniable presence.",
  },
  {
    id: 10,
    name: "Mr INTREPIDUS",
    group: "Popularity",
    emoji: "🤵",
    description:
      "The class's highest honor for a male student — recognizing the complete package of character, drive, and undeniable presence.",
  },
  {
    id: 11,
    name: "Best Student Politician",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Recognizes the student whose leadership in governance and advocacy has shown genuine vision, integrity, and measurable impact.",
  },
  {
    id: 12,
    name: "Most Charismatic Student",
    group: "Popularity",
    emoji: "✨",
    description:
      "Honors the student with the natural magnetism to light up any room — effortlessly likable, quotable, and impossible to ignore.",
  },
  {
    id: 13,
    name: "Award for Academic Excellence",
    group: "Academic",
    emoji: "📖",
    description:
      "Celebrates the student whose consistent academic performance sets the bar — proof that brilliance and discipline go hand in hand.",
  },
];

export const CATEGORY_GROUPS = [
  ...new Set(AWARD_CATEGORIES.map((c) => c.group)),
];

export const getCategoryById = (id) =>
  AWARD_CATEGORIES.find((c) => c.id === id);

export const getCategoryByName = (name) =>
  AWARD_CATEGORIES.find((c) => c.name === name);
