import { PrismaClient, type Archetype, type GameResult } from "@prisma/client";

const prisma = new PrismaClient();

const playerNames = ["Selvala", "Najeela", "Tymna", "Kinnan", "Tivit", "Korvold"];

const deckSeeds: Array<{
  player: string;
  name: string;
  archetype: Archetype;
  colorIdentity: string;
  commanders: string[];
  companion?: string | null;
}> = [
  { player: "Selvala", name: "Turbo Selvala", archetype: "Turbo", colorIdentity: "G", commanders: ["Selvala, Heart of the Wilds"] },
  { player: "Najeela", name: "Warrior Queen", archetype: "Midrange", colorIdentity: "WUBRG", commanders: ["Najeela, the Blade-Blossom"] },
  { player: "Tymna", name: "Blue Farm", archetype: "AdNauseam", colorIdentity: "WUB", commanders: ["Tymna the Weaver", "Kraum, Ludevic's Opus"] },
  { player: "Kinnan", name: "Value Engine", archetype: "Combo", colorIdentity: "UG", commanders: ["Kinnan, Bonder Prodigy"], companion: "Lutri, the Spellchaser" },
  { player: "Tivit", name: "Doomsday Bureaucracy", archetype: "Doomsday", colorIdentity: "WUB", commanders: ["Tivit, Seller of Secrets"] },
  { player: "Korvold", name: "Dockside Express", archetype: "Combo", colorIdentity: "BRG", commanders: ["Korvold, Fae-Cursed King"] },
  { player: "Selvala", name: "Stax Selvala", archetype: "Stax", colorIdentity: "GW", commanders: ["Selvala, Explorer Returned"] },
  { player: "Najeela", name: "Tempo Warriors", archetype: "Control", colorIdentity: "WUBRG", commanders: ["Najeela, the Blade-Blossom"] }
];

const tagSeeds = ["Thassa's Oracle", "Underworld Breach", "Dockside loop", "Combat", "Ad Nauseam"];

interface GameSeed {
  startedAt: string;
  durationMinutes: number;
  turnsToWin: number;
  podIndex: number;
  winConditionTags: string[];
  notes?: string;
  players: Array<{
    seat: number;
    player: string;
    deck: string;
    mulligans: number;
    result: GameResult;
    eliminatedBySeat?: number;
    turnEliminated?: number;
  }>;
}

const baseGames: GameSeed[] = [
  {
    startedAt: "2024-03-01T19:00:00.000Z",
    durationMinutes: 45,
    turnsToWin: 5,
    podIndex: 0,
    winConditionTags: ["Thassa's Oracle"],
    notes: "Selvala turboed out Oracle after a clutch Ad Naus.",
    players: [
      { seat: 1, player: "Selvala", deck: "Turbo Selvala", mulligans: 1, result: "Win" },
      { seat: 2, player: "Najeela", deck: "Warrior Queen", mulligans: 0, result: "Lose", eliminatedBySeat: 1, turnEliminated: 5 },
      { seat: 3, player: "Tymna", deck: "Blue Farm", mulligans: 2, result: "Lose", eliminatedBySeat: 1, turnEliminated: 4 },
      { seat: 4, player: "Kinnan", deck: "Value Engine", mulligans: 1, result: "Lose", eliminatedBySeat: 1, turnEliminated: 4 }
    ]
  },
  {
    startedAt: "2024-03-01T20:15:00.000Z",
    durationMinutes: 60,
    turnsToWin: 7,
    podIndex: 0,
    winConditionTags: ["Combat"],
    notes: "Najeela ground out the table with an army of warriors.",
    players: [
      { seat: 1, player: "Selvala", deck: "Stax Selvala", mulligans: 0, result: "Lose", eliminatedBySeat: 2, turnEliminated: 6 },
      { seat: 2, player: "Najeela", deck: "Tempo Warriors", mulligans: 1, result: "Win" },
      { seat: 3, player: "Tymna", deck: "Blue Farm", mulligans: 1, result: "Lose", eliminatedBySeat: 2, turnEliminated: 7 },
      { seat: 4, player: "Kinnan", deck: "Value Engine", mulligans: 2, result: "Lose", eliminatedBySeat: 2, turnEliminated: 7 }
    ]
  },
  {
    startedAt: "2024-03-02T18:00:00.000Z",
    durationMinutes: 55,
    turnsToWin: 6,
    podIndex: 1,
    winConditionTags: ["Dockside loop"],
    players: [
      { seat: 1, player: "Korvold", deck: "Dockside Express", mulligans: 2, result: "Win" },
      { seat: 2, player: "Tymna", deck: "Blue Farm", mulligans: 1, result: "Lose", eliminatedBySeat: 1, turnEliminated: 6 },
      { seat: 3, player: "Tivit", deck: "Doomsday Bureaucracy", mulligans: 0, result: "Lose", eliminatedBySeat: 1, turnEliminated: 5 },
      { seat: 4, player: "Najeela", deck: "Warrior Queen", mulligans: 1, result: "Lose", eliminatedBySeat: 1, turnEliminated: 6 }
    ]
  },
  {
    startedAt: "2024-03-02T19:30:00.000Z",
    durationMinutes: 42,
    turnsToWin: 5,
    podIndex: 1,
    winConditionTags: ["Thassa's Oracle"],
    players: [
      { seat: 1, player: "Korvold", deck: "Dockside Express", mulligans: 2, result: "Lose", eliminatedBySeat: 3, turnEliminated: 5 },
      { seat: 2, player: "Tymna", deck: "Blue Farm", mulligans: 0, result: "Lose", eliminatedBySeat: 3, turnEliminated: 4 },
      { seat: 3, player: "Tivit", deck: "Doomsday Bureaucracy", mulligans: 1, result: "Win" },
      { seat: 4, player: "Najeela", deck: "Tempo Warriors", mulligans: 1, result: "Lose", eliminatedBySeat: 3, turnEliminated: 5 }
    ]
  },
  {
    startedAt: "2024-03-03T18:15:00.000Z",
    durationMinutes: 70,
    turnsToWin: 8,
    podIndex: 2,
    winConditionTags: ["Underworld Breach"],
    notes: "Blue Farm navigated a long stack war to secure Breach.",
    players: [
      { seat: 1, player: "Tymna", deck: "Blue Farm", mulligans: 1, result: "Win" },
      { seat: 2, player: "Korvold", deck: "Dockside Express", mulligans: 3, result: "Lose", eliminatedBySeat: 1, turnEliminated: 8 },
      { seat: 3, player: "Selvala", deck: "Turbo Selvala", mulligans: 0, result: "Lose", eliminatedBySeat: 1, turnEliminated: 7 },
      { seat: 4, player: "Tivit", deck: "Doomsday Bureaucracy", mulligans: 1, result: "Lose", eliminatedBySeat: 1, turnEliminated: 7 }
    ]
  },
  {
    startedAt: "2024-03-04T17:00:00.000Z",
    durationMinutes: 30,
    turnsToWin: 4,
    podIndex: 3,
    winConditionTags: ["Ad Nauseam"],
    players: [
      { seat: 1, player: "Selvala", deck: "Turbo Selvala", mulligans: 0, result: "Lose", eliminatedBySeat: 3, turnEliminated: 4 },
      { seat: 2, player: "Najeela", deck: "Warrior Queen", mulligans: 1, result: "Lose", eliminatedBySeat: 3, turnEliminated: 3 },
      { seat: 3, player: "Tymna", deck: "Blue Farm", mulligans: 0, result: "Win" },
      { seat: 4, player: "Korvold", deck: "Dockside Express", mulligans: 2, result: "Lose", eliminatedBySeat: 3, turnEliminated: 4 }
    ]
  },
  {
    startedAt: "2024-03-04T18:00:00.000Z",
    durationMinutes: 50,
    turnsToWin: 6,
    podIndex: 3,
    winConditionTags: ["Dockside loop"],
    players: [
      { seat: 1, player: "Selvala", deck: "Stax Selvala", mulligans: 1, result: "Lose", eliminatedBySeat: 4, turnEliminated: 6 },
      { seat: 2, player: "Najeela", deck: "Tempo Warriors", mulligans: 2, result: "Lose", eliminatedBySeat: 4, turnEliminated: 5 },
      { seat: 3, player: "Tymna", deck: "Blue Farm", mulligans: 1, result: "Lose", eliminatedBySeat: 4, turnEliminated: 5 },
      { seat: 4, player: "Korvold", deck: "Dockside Express", mulligans: 1, result: "Win" }
    ]
  },
  {
    startedAt: "2024-03-05T19:45:00.000Z",
    durationMinutes: 62,
    turnsToWin: 7,
    podIndex: 4,
    winConditionTags: ["Combat"],
    players: [
      { seat: 1, player: "Selvala", deck: "Stax Selvala", mulligans: 1, result: "Lose", eliminatedBySeat: 2, turnEliminated: 6 },
      { seat: 2, player: "Najeela", deck: "Warrior Queen", mulligans: 0, result: "Win" },
      { seat: 3, player: "Tivit", deck: "Doomsday Bureaucracy", mulligans: 1, result: "Lose", eliminatedBySeat: 2, turnEliminated: 7 },
      { seat: 4, player: "Kinnan", deck: "Value Engine", mulligans: 2, result: "Lose", eliminatedBySeat: 2, turnEliminated: 7 }
    ]
  },
  {
    startedAt: "2024-03-06T18:00:00.000Z",
    durationMinutes: 48,
    turnsToWin: 6,
    podIndex: 4,
    winConditionTags: ["Thassa's Oracle"],
    players: [
      { seat: 1, player: "Selvala", deck: "Turbo Selvala", mulligans: 0, result: "Lose", eliminatedBySeat: 3, turnEliminated: 6 },
      { seat: 2, player: "Korvold", deck: "Dockside Express", mulligans: 1, result: "Lose", eliminatedBySeat: 3, turnEliminated: 6 },
      { seat: 3, player: "Tivit", deck: "Doomsday Bureaucracy", mulligans: 1, result: "Win" },
      { seat: 4, player: "Kinnan", deck: "Value Engine", mulligans: 2, result: "Lose", eliminatedBySeat: 3, turnEliminated: 6 }
    ]
  }
];

const buildGames = (): GameSeed[] => {
  const clones = Array.from({ length: 11 }).map((_, index) => {
    const base = baseGames[index % baseGames.length];
    return {
      ...base,
      startedAt: new Date(Date.parse(base.startedAt) + (index + 1) * 86400000).toISOString(),
      notes: index % 2 === 0 ? base.notes : undefined
    } satisfies GameSeed;
  });
  return [...baseGames, ...clones];
};

const createGameRecord = async (userId: string, pods: string[], seed: GameSeed) => {
  const podId = pods[seed.podIndex % pods.length];
  const startedAt = new Date(seed.startedAt);
  const endedAt = new Date(startedAt.getTime() + seed.durationMinutes * 60000);

  const game = await prisma.game.create({
    data: {
      userId,
      podId,
      startedAt,
      endedAt,
      turnsToWin: seed.turnsToWin,
      winConditionTags: seed.winConditionTags,
      notes: seed.notes ?? null
    }
  });

  for (const playerSeed of seed.players) {
    const player = await prisma.player.findFirstOrThrow({ where: { userId, displayName: playerSeed.player } });
    const deck = await prisma.deck.findFirstOrThrow({ where: { userId, name: playerSeed.deck } });

    const eliminatedPlayer = playerSeed.eliminatedBySeat
      ? seed.players.find((seat) => seat.seat === playerSeed.eliminatedBySeat)?.player
      : undefined;
    const eliminated = eliminatedPlayer
      ? await prisma.player.findFirst({ where: { userId, displayName: eliminatedPlayer } })
      : null;

    await prisma.gamePlayer.create({
      data: {
        userId,
        gameId: game.id,
        playerId: player.id,
        deckId: deck.id,
        seat: playerSeed.seat,
        mulligans: playerSeed.mulligans,
        result: playerSeed.result,
        eliminatedByPlayerId: eliminated?.id ?? null,
        turnEliminated: playerSeed.turnEliminated ?? null
      }
    });
  }

  for (const tag of seed.winConditionTags) {
    await prisma.tag.upsert({
      where: {
        userId_name: { userId, name: tag }
      },
      update: {},
      create: { userId, name: tag }
    });
  }
};

const seedUserData = async (userId: string) => {
  await prisma.gamePlayer.deleteMany({ where: { userId } });
  await prisma.game.deleteMany({ where: { userId } });
  await prisma.pod.deleteMany({ where: { userId } });
  await prisma.event.deleteMany({ where: { userId } });
  await prisma.deck.deleteMany({ where: { userId } });
  await prisma.player.deleteMany({ where: { userId } });
  await prisma.tag.deleteMany({ where: { userId } });

  for (const name of playerNames) {
    await prisma.player.upsert({
      where: { userId_displayName: { userId, displayName: name } },
      update: {},
      create: { userId, displayName: name }
    });
  }

  for (const deck of deckSeeds) {
    const player = await prisma.player.findFirstOrThrow({ where: { userId, displayName: deck.player } });
    await prisma.deck.upsert({
      where: { playerId_name: { playerId: player.id, name: deck.name } },
      update: {
        archetype: deck.archetype,
        colorIdentity: deck.colorIdentity,
        commanders: deck.commanders,
        companion: deck.companion ?? null,
        moxfieldUrl: `https://www.moxfield.com/decks/${deck.name.replace(/\s+/g, "-").toLowerCase()}`,
        isActive: true
      },
      create: {
        userId,
        playerId: player.id,
        name: deck.name,
        archetype: deck.archetype,
        colorIdentity: deck.colorIdentity,
        commanders: deck.commanders,
        companion: deck.companion ?? null,
        moxfieldUrl: `https://www.moxfield.com/decks/${deck.name.replace(/\s+/g, "-").toLowerCase()}`
      }
    });
  }

  for (const name of tagSeeds) {
    await prisma.tag.upsert({
      where: { userId_name: { userId, name } },
      update: {},
      create: { userId, name }
    });
  }

  const events = await Promise.all([
    prisma.event.create({
      data: {
        userId,
        name: "Spring Showdown",
        location: "Local LGS",
        date: new Date("2024-03-01T10:00:00.000Z")
      }
    }),
    prisma.event.create({
      data: {
        userId,
        name: "Summer Slam",
        location: "Monthly Meetup",
        date: new Date("2024-04-01T10:00:00.000Z")
      }
    })
  ]);

  const pods = await Promise.all(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.pod.create({
        data: {
          userId,
          eventId: index < 3 ? events[0].id : events[1].id
        }
      })
    )
  );

  const gameSeeds = buildGames();
  for (const seed of gameSeeds) {
    await createGameRecord(userId, pods.map((pod) => pod.id), seed);
  }
};

const main = async () => {
  const demo = await prisma.user.upsert({
    where: { email: "demo@cedh.local" },
    update: {},
    create: { email: "demo@cedh.local", name: "Demo User" }
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@cedh.local" },
    update: {},
    create: { email: "guest@cedh.local", name: "Guest" }
  });

  await seedUserData(demo.id);
  await seedUserData(guest.id);
};

main()
  .then(() => {
    console.log("Seed data created");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
