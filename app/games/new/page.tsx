import { QuickRecordWizard } from "@/components/quick-record/quick-record-wizard";
import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";

const QuickRecordPage = async () => {
  const userId = await getActiveUserId();

  const [players, decks, tags, pods] = await Promise.all([
    prisma.player.findMany({ where: { userId }, orderBy: { displayName: "asc" } }),
    prisma.deck.findMany({ where: { userId, isActive: true } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.pod.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <QuickRecordWizard
      resources={{
        players: players.map((player) => ({ id: player.id, displayName: player.displayName })),
        decks: decks.map((deck) => ({
          id: deck.id,
          name: deck.name,
          playerId: deck.playerId,
          archetype: deck.archetype,
          colorIdentity: deck.colorIdentity,
          commanders: deck.commanders,
          companion: deck.companion,
          moxfieldUrl: deck.moxfieldUrl
        })),
        tags: tags.map((tag) => ({ id: tag.id, name: tag.name })),
        pods: pods.map((pod) => ({
          id: pod.id,
          createdAt: pod.createdAt,
          eventName: pod.event?.name ?? null
        }))
      }}
    />
  );
};

export default QuickRecordPage;
