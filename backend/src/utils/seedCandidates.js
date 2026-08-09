import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";
import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

dotenv.config();

const CANDIDATES_BY_CATEGORY = {
  "Best Dressed Male": [
    { name: "Destiny bills", department: "" },
    { name: "Gilbert", department: "" },
    { name: "Osayi", department: "" },
    { name: "Micheal", department: "" },
  ],

  "Best Dressed Female": [
    { name: "Rukky", department: "" },
    { name: "Doyin", department: "" },
    { name: "Ehis", department: "" },
    { name: "Steph", department: "" },
    { name: "pretty momo", department: "" },
    { name: "Christoper Ella", department: "" },
    { name: "Daniella", department: "" },
    { name: "Peace", department: "" },
  ],

  "Most Social Student": [
    { name: "Ifeoma", department: "" },
    { name: "Ayomide boy", department: "" },
    { name: "Otto", department: "" },
    { name: "Prima", department: "" },
  ],

  "Class Icon": [
    { name: "Noragbon", department: "" },
    { name: "Black osas", department: "" },
    { name: "loveth", department: "" },
    { name: "Josh", department: "" },
    { name: "Emilia", department: "" },
    { name: "prima", department: "" },
  ],

  "Mr TASA": [
    { name: "Chima", department: "" },
    { name: "Samz beat", department: "" },
    { name: "Destiny bills", department: "" },
    { name: "Jason", department: "" },
    { name: "Osayi", department: "" },
    { name: "Micheal", department: "" },
  ],

  "Best Student Politician": [
    { name: "Isreal", department: "" },
    { name: "De ambassador", department: "" },
    { name: "pretty momo", department: "" },
    { name: "Paul", department: "" },
    { name: "Hussein", department: "" },
  ],

  "Most Talented Student": [
    { name: "Dominic", department: "" },
    { name: "Abundance", department: "" },
    { name: "Godsent", department: "" },
    { name: "Otto", department: "" },
    { name: "Comrade", department: "" },
  ],

  "Most Creative Student": [
    { name: "Precious ewomazino", department: "" },
    { name: "Ifeoma", department: "" },
    { name: "Noragbon", department: "" },
    { name: "Paulina", department: "" },
    { name: "osas black", department: "" },
  ],

  "Most Influential Student": [
    { name: "Ifeoma", department: "" },
    { name: "Black", department: "" },
    { name: "Otto", department: "" },
    { name: "Gt", department: "" },
    { name: "Favourite", department: "" },
    { name: "Jason", department: "" },
    { name: "Ayo boy", department: "" },
  ],

  "Most Charismatic Student": [
    { name: "ifeoma", department: "" },
    { name: "Isoken", department: "" },
    { name: "Gilbert", department: "" },
    { name: "Comrade", department: "" },
    { name: "Kim", department: "" },
    { name: "Sharon", department: "" },
  ],

  "Most Enterprising Student": [
    { name: "Nancy", department: "" },
    { name: "Noragbon", department: "" },
    { name: "Essence respire", department: "" },
    { name: "Loveth", department: "" },
    { name: "Mark", department: "" },
  ],

  "Miss TASA": [
    { name: "Rukky", department: "" },
    { name: "Bolaji", department: "" },
    { name: "Somto", department: "" },
    { name: "Ehis", department: "" },
    { name: "Steph", department: "" },
    { name: "Susan", department: "" },
    { name: "Tega", department: "" },
  ],

  "Award for Academic Excellence": [
    { name: "pearl", department: "" },
    { name: "Paul", department: "" },
    { name: "Destiny bills", department: "" },
    { name: "IGHOMWONYI PRAISE OFURE", department: "" },
  ],
};

async function seedCandidatesForCategory(categoryName, nominees) {
  const category = await Category.findOne({ name: categoryName }).collation({
    locale: "en",
    strength: 2,
  });

  if (!category) {
    console.log(`  ⚠ Skipped "${categoryName}" — no matching category found.`);
    return { created: 0, skipped: 0, missing: true };
  }

  const event = await Event.findOne({ categoryId: category._id });
  if (!event) {
    console.log(
      `  ⚠ Skipped "${categoryName}" — category exists but has no event.`,
    );
    return { created: 0, skipped: 0, missing: true };
  }

  // Existing names under this event — case-insensitive, trimmed — so
  // rerunning with more pasted batches never creates duplicates.
  const existing = await Candidate.find({ event: event._id }, "name");
  const existingNames = new Set(
    existing.map((c) => c.name.trim().toLowerCase()),
  );

  // Highest candidateNumber already used under this event, so new
  // candidates continue the sequence instead of colliding with the
  // schema's unique { event, candidateNumber } index on a rerun.
  const lastCandidate = await Candidate.findOne({ event: event._id })
    .sort({ candidateNumber: -1 })
    .select("candidateNumber");
  let nextNumber = (lastCandidate?.candidateNumber || 0) + 1;

  let created = 0,
    skipped = 0;

  for (const nominee of nominees) {
    const key = nominee.name.trim().toLowerCase();
    if (existingNames.has(key)) {
      skipped++;
      continue;
    }

    await Candidate.create({
      name: nominee.name.trim(),
      department: nominee.department?.trim() || "",
      level: "",
      photo: "",
      candidateNumber: nextNumber,
      event: event._id,
      totalVotes: 0,
    });

    existingNames.add(key);
    nextNumber++;
    created++;
  }

  console.log(
    `  ✓ ${categoryName}: ${created} created, ${skipped} already existed.`,
  );
  return { created, skipped, missing: false };
}

async function seedCandidates() {
  await connectDB();

  console.log("Seeding candidates...\n");

  let totalCreated = 0,
    totalSkipped = 0;
  const missingCategories = [];

  for (const [categoryName, nominees] of Object.entries(
    CANDIDATES_BY_CATEGORY,
  )) {
    const result = await seedCandidatesForCategory(categoryName, nominees);
    totalCreated += result.created;
    totalSkipped += result.skipped;
    if (result.missing) missingCategories.push(categoryName);
  }

  console.log(
    `\nDone — ${totalCreated} candidates created, ${totalSkipped} already existed.`,
  );

  if (missingCategories.length) {
    console.log(
      `\n⚠ These category names didn't match any seeded category/event — check spelling:\n  ${missingCategories.join("\n  ")}`,
    );
  }

  process.exit(0);
}

seedCandidates().catch((err) => {
  console.error("Candidate seed failed:", err);
  process.exit(1);
});
