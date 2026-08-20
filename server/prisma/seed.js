import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { code: "FIRST_ANALYSIS", title: "First Analysis", description: "Complete your first writing analysis", icon: "search", xpReward: 20 },
  { code: "STREAK_7", title: "7 Day Streak", description: "Keep a 7 day learning streak", icon: "flame", xpReward: 50 },
  { code: "MISTAKES_100", title: "100 Mistakes Corrected", description: "Correct 100 mistakes in review", icon: "check-circle", xpReward: 100 },
  { code: "WORDS_100", title: "100 Words Learned", description: "Learn 100 vocabulary words", icon: "book", xpReward: 100 },
  { code: "GRAMMAR_MASTER", title: "Grammar Master", description: "Master 20 grammar topics", icon: "spell-check", xpReward: 150 },
  { code: "WRITING_MASTER", title: "Writing Master", description: "Get a 90+ writing score 5 times", icon: "pen-line", xpReward: 150 },
  { code: "SPEAKING_STARTER", title: "Speaking Starter", description: "Complete your first speaking session", icon: "mic", xpReward: 30 },
  { code: "PRACTICE_50", title: "Practice Warrior", description: "Complete 50 exercises", icon: "dumbbell", xpReward: 80 },
];

const PLACEMENT_QUESTIONS = [
  // GRAMMAR
  { type: "GRAMMAR", prompt: "She ___ to school every day.", options: ["go", "goes", "going", "went"], correctAnswer: "goes", difficulty: "easy" },
  { type: "GRAMMAR", prompt: "Yesterday I ___ my homework.", options: ["finish", "finished", "finishes", "finishing"], correctAnswer: "finished", difficulty: "easy" },
  { type: "GRAMMAR", prompt: "There ___ many people at the party.", options: ["is", "are", "was", "be"], correctAnswer: "are", difficulty: "easy" },
  { type: "GRAMMAR", prompt: "I have lived here ___ 2015.", options: ["for", "since", "from", "by"], correctAnswer: "since", difficulty: "medium" },
  { type: "GRAMMAR", prompt: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], correctAnswer: "were", difficulty: "medium" },
  { type: "GRAMMAR", prompt: "She said she ___ call me later.", options: ["will", "would", "shall", "can"], correctAnswer: "would", difficulty: "hard" },
  { type: "GRAMMAR", prompt: "The book ___ by many students.", options: ["reads", "is read", "read", "reading"], correctAnswer: "is read", difficulty: "medium" },
  { type: "GRAMMAR", prompt: "Neither of the answers ___ correct.", options: ["is", "are", "were", "be"], correctAnswer: "is", difficulty: "hard" },
  { type: "GRAMMAR", prompt: "By the time we arrived, the film ___.", options: ["started", "had started", "starts", "was starting"], correctAnswer: "had started", difficulty: "hard" },
  { type: "GRAMMAR", prompt: "I'm looking forward to ___ you.", options: ["see", "seeing", "seen", "saw"], correctAnswer: "seeing", difficulty: "medium" },
  // VOCABULARY
  { type: "VOCABULARY", prompt: "Choose the correct meaning of 'ancient':", options: ["very old", "very new", "very big", "very small"], correctAnswer: "very old", difficulty: "easy" },
  { type: "VOCABULARY", prompt: "The opposite of 'generous' is:", options: ["kind", "selfish", "brave", "honest"], correctAnswer: "selfish", difficulty: "medium" },
  { type: "VOCABULARY", prompt: "'Ubiquitous' means:", options: ["rare", "everywhere", "hidden", "expensive"], correctAnswer: "everywhere", difficulty: "hard" },
  { type: "VOCABULARY", prompt: "Choose the correct synonym of 'rapid':", options: ["slow", "fast", "quiet", "loud"], correctAnswer: "fast", difficulty: "easy" },
  { type: "VOCABULARY", prompt: "'Meticulous' describes someone who is:", options: ["careless", "careful and precise", "lazy", "angry"], correctAnswer: "careful and precise", difficulty: "hard" },
  { type: "VOCABULARY", prompt: "A person who studies the stars is an:", options: ["astronaut", "astronomer", "astrologer", "astronautic"], correctAnswer: "astronomer", difficulty: "medium" },
  { type: "VOCABULARY", prompt: "'To postpone' means to:", options: ["cancel", "delay", "finish", "start"], correctAnswer: "delay", difficulty: "medium" },
  { type: "VOCABULARY", prompt: "The word 'fragile' is closest in meaning to:", options: ["strong", "delicate", "flexible", "heavy"], correctAnswer: "delicate", difficulty: "medium" },
  // READING
  { type: "READING", prompt: "Read: 'Maria wakes up at 6 a.m., has breakfast, and leaves for work at 8.' — What does Maria do at 6 a.m.?", options: ["Leaves for work", "Wakes up", "Has breakfast", "Goes to sleep"], correctAnswer: "Wakes up", difficulty: "easy" },
  { type: "READING", prompt: "Read: 'Despite the heavy rain, the football match continued. The players were determined to finish.' — Why did the match continue?", options: ["The rain stopped", "Players were determined", "It was cancelled", "No players came"], correctAnswer: "Players were determined", difficulty: "medium" },
  { type: "READING", prompt: "Read: 'The scientist spent years researching the cure. Her breakthrough finally came after countless failed experiments.' — What does 'breakthrough' mean here?", options: ["A failure", "A major discovery", "A break from work", "An experiment"], correctAnswer: "A major discovery", difficulty: "medium" },
  { type: "READING", prompt: "Read: 'Tom found the lecture boring, so he left early.' — How did Tom feel?", options: ["Excited", "Bored", "Angry", "Happy"], correctAnswer: "Bored", difficulty: "easy" },
  { type: "READING", prompt: "Read: 'The company's profits rose sharply last quarter, surprising even the analysts.' — What happened to profits?", options: ["They fell", "They rose sharply", "They stayed the same", "They disappeared"], correctAnswer: "They rose sharply", difficulty: "easy" },
  { type: "READING", prompt: "Read: 'Although the restaurant was fully booked, the manager managed to find us a table by the window.' — What does this imply?", options: ["The manager was rude", "The manager was helpful", "The restaurant was empty", "They left hungry"], correctAnswer: "The manager was helpful", difficulty: "medium" },
  { type: "READING", prompt: "Read: 'The novel explores themes of identity and belonging, set against the backdrop of post-war Europe.' — The novel is about:", options: ["Cooking", "Identity and belonging", "Space travel", "Sports"], correctAnswer: "Identity and belonging", difficulty: "medium" },
  { type: "READING", prompt: "Read: 'Prices are expected to remain stable throughout the year, barring any unexpected economic shocks.' — What could change prices?", options: ["Nothing ever", "Unexpected economic shocks", "The weather", "New shops"], correctAnswer: "Unexpected economic shocks", difficulty: "hard" },
];

async function main() {
  console.log("Seeding database...");

  const languages = await prisma.$transaction([
    prisma.language.create({ data: { code: "en", name: "English", flag: "🇬🇧" } }),
    prisma.language.create({ data: { code: "ru", name: "Russian", flag: "🇷🇺" } }),
    prisma.language.create({ data: { code: "uz", name: "Uzbek", flag: "🇺🇿" } }),
    prisma.language.create({ data: { code: "es", name: "Spanish", flag: "🇪🇸" } }),
    prisma.language.create({ data: { code: "fr", name: "French", flag: "🇫🇷" } }),
    prisma.language.create({ data: { code: "de", name: "German", flag: "🇩🇪" } }),
  ]);
  console.log(`Created ${languages.length} languages`);

  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }
  console.log(`Created ${ACHIEVEMENTS.length} achievements`);

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
  const demoPassword = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@languagedetective.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@languagedetective.app",
      password: adminPassword,
      nativeLanguage: "English",
      learningLanguage: "English",
      role: "ADMIN",
      level: "C2",
      xp: 1000,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@languagedetective.app" },
    update: {},
    create: {
      name: "Demo Learner",
      email: "demo@languagedetective.app",
      password: demoPassword,
      nativeLanguage: "Uzbek",
      learningLanguage: "English",
      role: "USER",
      level: "B1",
      xp: 250,
    },
  });
  console.log(`Users: admin=${admin.email} demo=${demo.email}`);

  const test = await prisma.placementTest.upsert({
    where: { id: "placement-en-1" },
    update: {},
    create: {
      id: "placement-en-1",
      title: "English Placement Test",
      language: "English",
    },
  });

  const count = await prisma.placementQuestion.count({ where: { testId: test.id } });
  if (count === 0) {
    await prisma.placementQuestion.createMany({
      data: PLACEMENT_QUESTIONS.map((q) => ({ ...q, testId: test.id })),
    });
  }
  console.log(`Placement test ready (${PLACEMENT_QUESTIONS.length} questions)`);

  const sampleMistakes = [
    { originalText: "go", correctedText: "went", explanation: "\"Yesterday\" signals past time, so \"go\" must become its past form \"went\".", category: "TENSE", topic: "Past Simple", severity: "medium", source: "writing" },
    { originalText: "I don't like the music.", correctedText: "I don't like music.", explanation: "No article needed when speaking about music in general.", category: "ARTICLE", topic: "Articles", severity: "low", source: "chat" },
    { originalText: "She is good in math.", correctedText: "She is good at math.", explanation: "The adjective \"good\" takes the preposition \"at\", not \"in\".", category: "PREPOSITION", topic: "Prepositions", severity: "medium", source: "writing" },
    { originalText: "He do his work.", correctedText: "He does his work.", explanation: "Third person singular takes \"does\" in present simple.", category: "GRAMMAR", topic: "Present Simple", severity: "medium", source: "practice" },
  ];

  for (const m of sampleMistakes) {
    const existing = await prisma.mistake.findFirst({ where: { userId: demo.id, originalText: m.originalText } });
    if (!existing) {
      await prisma.mistake.create({
        data: {
          userId: demo.id,
          originalText: m.originalText,
          correctedText: m.correctedText,
          explanation: m.explanation,
          category: m.category,
          topic: m.topic,
          severity: m.severity,
          source: m.source,
          masteryScore: 30,
          nextReviewAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      });
    }
  }
  console.log("Sample mistakes seeded");

  const vocabWords = [
    { word: "ubiquitous", translation: "hamma joyda uchraydigan", definition: "Present, appearing, or found everywhere.", example: "Smartphones are ubiquitous these days.", difficulty: "hard" },
    { word: "meticulous", translation: "juda sinchkov", definition: "Showing great attention to detail.", example: "She is meticulous about her work.", difficulty: "hard" },
    { word: "breakthrough", translation: "yutuq, kashfiyot", definition: "An important discovery or development.", example: "The vaccine was a major breakthrough.", difficulty: "medium" },
    { word: "postpone", translation: "keyinga qoldirmoq", definition: "To delay an event to a later time.", example: "We had to postpone the meeting.", difficulty: "medium" },
  ];
  for (const v of vocabWords) {
    await prisma.vocabulary.upsert({
      where: { userId_word: { userId: demo.id, word: v.word } },
      update: {},
      create: { userId: demo.id, ...v, masteryScore: 40 },
    });
  }
  console.log("Sample vocabulary seeded");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyChallenge.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      prompt: "Correct this sentence: She don't like coffee.",
      correctAnswer: "She doesn't like coffee.",
      explanation: "Third person singular (she) requires \"doesn't\", not \"don't\".",
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });