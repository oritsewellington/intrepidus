import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";
import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";
import User from "../models/User.model.js";

dotenv.config();

const SEED_USERS = [
  {
    name: "Zondo",
    email: "zondo@gmail.com",
    password: "intrepidus2031",
    role: "admin",
  },
  {
    name: "Intrepidus Staff 1",
    email: "intrepidus1@gmail.com",
    password: "intrepidus2031",
    role: "staff",
  },
  {
    name: "Intrepidus Staff 2",
    email: "intrepidus2@gmail.com",
    password: "intrepidus2031",
    role: "staff",
  },
];

const ORGANIZATION_NAME = "Class of INTREPIDUS";
const PRICE_PER_VOTE_KOBO = 10000;

const SEED_CATEGORIES = [
  {
    name: "Most Creative Student",
    group: "Creative",
    emoji: "🎨",
    description:
      "Awarded to the student whose imagination and originality consistently stand out — from bold ideas to fearless artistic expression that pushes the class forward.",
  },
  {
    name: "Most Influential Student",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the student whose voice and actions carry real weight — someone whose opinions shape conversations and whose lead others are quick to follow.",
  },
  {
    name: "Class Icon",
    group: "Popularity",
    emoji: "⭐",
    description:
      "The class's defining personality — the student whose presence, charm, and energy make them instantly recognizable and impossible to forget.",
  },
  {
    name: "Best Dressed Male",
    group: "Fashion",
    emoji: "👔",
    description:
      "Celebrates the male student whose style is sharp, deliberate, and always on point — setting the standard the rest of the class watches closely.",
  },
  {
    name: "Best Dressed Female",
    group: "Fashion",
    emoji: "👗",
    description:
      "Celebrates the female student whose fashion sense is effortless yet unmistakable — a signature style that turns heads every time.",
  },
  {
    name: "Most Social Student",
    group: "Social",
    emoji: "🤝",
    description:
      "Recognizes the student who's always in the mix — warm, connected, and at the center of nearly every gathering, conversation, and plan.",
  },
  {
    name: "Most Enterprising Student",
    group: "Business",
    emoji: "⚡",
    description:
      "Honors the student building something real — a hustler with vision, drive, and the resourcefulness to turn ideas into opportunity.",
  },
  {
    name: "Most Talented Student",
    group: "Creative",
    emoji: "🎤",
    description:
      "Awarded to the all-round performer whose skill — on stage, on paper, or off the cuff — consistently leaves an impression.",
  },
  {
    name: "Miss INTREPIDUS",
    group: "Popularity",
    emoji: "👸",
    description:
      "The class's highest honor for a female student — recognizing the complete package of confidence, grace, and undeniable presence.",
  },
  {
    name: "Mr INTREPIDUS",
    group: "Popularity",
    emoji: "🤵",
    description:
      "The class's highest honor for a male student — recognizing the complete package of character, drive, and undeniable presence.",
  },
  {
    name: "Best Student Politician",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Recognizes the student whose leadership in governance and advocacy has shown genuine vision, integrity, and measurable impact.",
  },
  {
    name: "Most Charismatic Student",
    group: "Popularity",
    emoji: "✨",
    description:
      "Honors the student with the natural magnetism to light up any room — effortlessly likable, quotable, and impossible to ignore.",
  },
  {
    name: "Award for Academic Excellence",
    group: "Academic",
    emoji: "📖",
    description:
      "Celebrates the student whose consistent academic performance sets the bar — proof that brilliance and discipline go hand in hand.",
  },
];

async function seedUsers() {
  let created = 0,
    skipped = 0;
  const usersByEmail = {};

  for (const u of SEED_USERS) {
    let user = await User.findOne({ email: u.email });
    if (user) {
      skipped++;
    } else {
      user = await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
      });
      created++;
    }
    usersByEmail[u.email] = user;
  }

  console.log(`Users — ${created} created, ${skipped} already existed.`);
  return usersByEmail;
}

async function seedCategoriesAndEvents(admin) {
  const startDate = new Date("2026-07-06T00:00:00");
  const endDate = new Date("2026-08-17T23:59:59");

  let catsCreated = 0,
    catsSkipped = 0,
    eventsCreated = 0,
    eventsSkipped = 0;

  for (const cat of SEED_CATEGORIES) {
    let category = await Category.findOne({ name: cat.name }).collation({
      locale: "en",
      strength: 2,
    });

    if (category) {
      catsSkipped++;
      if (!category.description && cat.description) {
        category.description = cat.description;
        await category.save();
      }
    } else {
      category = await Category.create({ ...cat, createdBy: admin?._id });
      catsCreated++;
    }

    const existingEvent = await Event.findOne({ categoryId: category._id });
    if (existingEvent) {
      eventsSkipped++;
      continue;
    }

    await Event.create({
      title: category.name,
      description: category.description,
      organization: ORGANIZATION_NAME,
      category: category.name,
      categoryId: category._id,
      startDate,
      endDate,
      isOpen: true,
      pricePerVote: PRICE_PER_VOTE_KOBO,
      createdBy: admin?._id,
    });
    eventsCreated++;
  }

  console.log(
    `Categories — ${catsCreated} created, ${catsSkipped} already existed.`,
  );
  console.log(
    `Events — ${eventsCreated} created, ${eventsSkipped} already had an event.`,
  );
}

async function seed() {
  await connectDB();

  const usersByEmail = await seedUsers();
  const admin = usersByEmail["zondo@gmail.com"];

  await seedCategoriesAndEvents(admin);

  console.log("\nLogins:");
  SEED_USERS.forEach((u) =>
    console.log(`  ${u.role.padEnd(6)} — ${u.email} / ${u.password}`),
  );

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
