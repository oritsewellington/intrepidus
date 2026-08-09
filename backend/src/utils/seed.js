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
    password: "tasa2031",
    role: "admin",
  },
  {
    name: "tasa Staff 1",
    email: "tasa1@gmail.com",
    password: "tasa2031",
    role: "staff",
  },
  {
    name: "tasa Staff 2",
    email: "tasa2@gmail.com",
    password: "tasa2031",
    role: "staff",
  },
];

// Updated to reflect the real organization behind these awards — the
// previous "Class of TASA" categories were a generic class-awards
// template, not specific to Theatre Arts. This seed replaces them with
// the department's actual award categories.
const ORGANIZATION_NAME = "Theatre Arts Student Association (TASA)";
const PRICE_PER_VOTE_KOBO = 10000;

const SEED_CATEGORIES = [
  {
    name: "Best Actor (Male)",
    group: "Creative",
    emoji: "🎭",
    description:
      "Honors the performer whose command of character, voice, and stage presence brought a role fully to life this season.",
  },
  {
    name: "Best Actor (Female)",
    group: "Creative",
    emoji: "🎭",
    description:
      "Honors the performer whose command of character, voice, and stage presence brought a role fully to life this season.",
  },
  {
    name: "Best Dancer (Male)",
    group: "Creative",
    emoji: "💃",
    description:
      "Celebrates the mover whose discipline, rhythm, and expression turned choreography into genuine storytelling.",
  },
  {
    name: "Best Dancer (Female)",
    group: "Creative",
    emoji: "💃",
    description:
      "Celebrates the mover whose discipline, rhythm, and expression turned choreography into genuine storytelling.",
  },
  {
    name: "Best Director (Male)",
    group: "Creative",
    emoji: "🎬",
    description:
      "Recognizes the vision behind the production — the eye that shaped performances, pacing, and staging into a unified whole.",
  },
  {
    name: "Best Director (Female)",
    group: "Creative",
    emoji: "🎬",
    description:
      "Recognizes the vision behind the production — the eye that shaped performances, pacing, and staging into a unified whole.",
  },
  {
    name: "Best Costumier (Male)",
    group: "Fashion",
    emoji: "🧵",
    description:
      "Honors the craftsperson whose costume design gave every character their silhouette, era, and identity on stage.",
  },
  {
    name: "Best Costumier (Female)",
    group: "Fashion",
    emoji: "🧵",
    description:
      "Honors the craftsperson whose costume design gave every character their silhouette, era, and identity on stage.",
  },
  {
    name: "Political Guru (Male)",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Celebrates the student whose grasp of governance, persuasion, and campus advocacy sets them apart as a natural strategist.",
  },
  {
    name: "Political Guru (Female)",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Celebrates the student whose grasp of governance, persuasion, and campus advocacy sets them apart as a natural strategist.",
  },
  {
    name: "Sportsman of the Year (Male)",
    group: "Sports",
    emoji: "🏅",
    description:
      "Recognizes outstanding athletic achievement and the discipline it took to get there.",
  },
  {
    name: "Sportsman of the Year (Female)",
    group: "Sports",
    emoji: "🏅",
    description:
      "Recognizes outstanding athletic achievement and the discipline it took to get there.",
  },
  {
    name: "Most Influential (Male)",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the student whose voice and actions genuinely shape opinion and set the tone for those around them.",
  },
  {
    name: "Most Influential (Female)",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the student whose voice and actions genuinely shape opinion and set the tone for those around them.",
  },
  {
    name: "Best Set Designer",
    group: "Creative",
    emoji: "🖌️",
    description:
      "Celebrates the eye that builds a world from nothing — the sets, spaces, and visual storytelling behind every production.",
  },
  {
    name: "Best Supporting Actor (Male)",
    group: "Creative",
    emoji: "🎗️",
    description:
      "Honors the performer whose supporting role elevated every scene they were part of, often without asking for the spotlight.",
  },
  {
    name: "Best Supporting Actor (Female)",
    group: "Creative",
    emoji: "🎗️",
    description:
      "Honors the performer whose supporting role elevated every scene they were part of, often without asking for the spotlight.",
  },
  {
    name: "Thespian of the Year",
    group: "Creative",
    emoji: "🌟",
    description:
      "The department's highest individual honor — recognizing complete command of the craft, discipline, and dedication to theatre.",
  },
  {
    name: "Best Stage Manager",
    group: "Business",
    emoji: "🎛️",
    description:
      "Recognizes the steady hand behind the scenes — the coordination, timing, and calm that keep a production running.",
  },
  {
    name: "Entrepreneur of the Year",
    group: "Business",
    emoji: "⚡",
    description:
      "Honors the student turning ideas into real ventures — resourcefulness and hustle beyond the classroom.",
  },
  {
    name: "Best Content Creator",
    group: "Creative",
    emoji: "📱",
    description:
      "Celebrates the storyteller building an audience online — consistent, creative, and impossible to scroll past.",
  },
  {
    name: "Best Drummer",
    group: "Creative",
    emoji: "🥁",
    description:
      "Recognizes rhythm, timing, and the drive behind every beat that carried a performance.",
  },
  {
    name: "Music Artist of the Year",
    group: "Creative",
    emoji: "🎤",
    description:
      "Honors the standout voice and sound of the year — a musical talent shaping the department's soundtrack.",
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
