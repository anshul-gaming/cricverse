import { prisma } from '../database/prisma.js';

export interface SignatureMoveDefinition {
  id: string;
  name: string;
  type: 'BATTING' | 'BOWLING';
  emoji: string;
  description: string;
  counterDescription: string;
  baseTpCost: number;
  maxLevel: number;
}

export const SIGNATURE_MOVES: Record<string, SignatureMoveDefinition> = {
  // Batting Masteries
  HELICOPTER: {
    id: 'HELICOPTER',
    name: 'Helicopter Release',
    type: 'BATTING',
    emoji: '🚁',
    description: 'Unleashes devastating bottom-hand wrist whip to dig out pinpoint yorkers and send them flying into the upper stands.',
    counterDescription: 'Turns lethal yorkers into 100m+ maximums.',
    baseTpCost: 20,
    maxLevel: 5
  },
  RAMP_360: {
    id: 'RAMP_360',
    name: '360° Dilscoop Ramp',
    type: 'BATTING',
    emoji: '🤿',
    description: 'Drops to one knee and uses express bowling pace against the bowler, scooping short and rising balls fine of the wicketkeeper.',
    counterDescription: 'Dominates express short-pitched bouncers.',
    baseTpCost: 25,
    maxLevel: 5
  },
  COVER_DRIVE: {
    id: 'COVER_DRIVE',
    name: 'Classical Cover Drive',
    type: 'BATTING',
    emoji: '🎯',
    description: 'Textbook high-elbow presentation through extra cover off full-length deliveries. Supreme boundary accuracy with low risk.',
    counterDescription: 'Punches full deliveries through off-side field gaps.',
    baseTpCost: 15,
    maxLevel: 5
  },
  SWITCH_HIT: {
    id: 'SWITCH_HIT',
    name: '180° Switch Hit',
    type: 'BATTING',
    emoji: '🔄',
    description: 'Reverses grip and stance mid-runup, converting into an opposite-handed batter to target undefended third-man boundaries.',
    counterDescription: 'Confounds spin bowlers and renders field settings obsolete.',
    baseTpCost: 30,
    maxLevel: 5
  },

  // Bowling Masteries
  YORKER_150: {
    id: 'YORKER_150',
    name: '150 km/h Sandshoe Crusher',
    type: 'BOWLING',
    emoji: '⚡',
    description: 'Lethal late-swinging blockhole thunderbolt delivered at express speeds targeting the base of leg or middle stump.',
    counterDescription: 'Shatters standard defensive stances and forces LBW/Bowled.',
    baseTpCost: 25,
    maxLevel: 5
  },
  CARROM_BALL: {
    id: 'CARROM_BALL',
    name: 'Mystery Carrom Ball',
    type: 'BOWLING',
    emoji: '🌀',
    description: 'Flicked between thumb and bent middle finger; drifts into the right-hander before exploding outwards away from the bat.',
    counterDescription: 'Induces outside edges and caught-behind dismissals.',
    baseTpCost: 20,
    maxLevel: 5
  },
  HEAVY_BOUNCER: {
    id: 'HEAVY_BOUNCER',
    name: 'Heavy Rib-Cage Bouncer',
    type: 'BOWLING',
    emoji: '🚀',
    description: 'Digs into the turf with heavy shoulder effort, climbing steeply towards the batsman throat and chest.',
    counterDescription: 'Forces hurried pull shots and sky-high top edges.',
    baseTpCost: 20,
    maxLevel: 5
  },
  KNUCKLE_BALL: {
    id: 'KNUCKLE_BALL',
    name: 'Knuckle Ball Float',
    type: 'BOWLING',
    emoji: '🪄',
    description: 'Ball held on fingernails; released without seam rotation to drop speed by 25 km/h while maintaining full bowling action.',
    counterDescription: 'Deceives aggressive power hitters into mistimed early swings.',
    baseTpCost: 25,
    maxLevel: 5
  }
};

/**
 * Retrieves player masteries or seeds defaults
 */
export async function getPlayerMasteries(playerId: string) {
  let masteries = await prisma.playerMastery.findMany({
    where: { playerId }
  });

  if (masteries.length === 0) {
    // Seed starter mastery (Cover Drive for batting, Heavy Bouncer for bowling)
    await prisma.playerMastery.createMany({
      data: [
        { playerId, masteryKey: 'COVER_DRIVE', level: 1 },
        { playerId, masteryKey: 'HEAVY_BOUNCER', level: 1 }
      ],
      skipDuplicates: true
    });

    masteries = await prisma.playerMastery.findMany({
      where: { playerId }
    });
  }

  return masteries;
}

/**
 * Upgrades a player mastery
 */
export async function upgradePlayerMastery(playerId: string, moveId: string): Promise<{ success: boolean; message: string; newLevel?: number }> {
  const move = SIGNATURE_MOVES[moveId.toUpperCase()];
  if (!move) {
    return {
      success: false,
      message: `❌ Unknown signature move: \`${moveId}\`. Available moves: \`${Object.keys(SIGNATURE_MOVES).join(', ')}\``
    };
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    return { success: false, message: '❌ Player profile not found. Run `-profile` first.' };
  }

  const existing = await prisma.playerMastery.findUnique({
    where: {
      playerId_masteryKey: { playerId, masteryKey: move.id }
    }
  });

  const currentLevel = existing ? existing.level : 0;
  if (currentLevel >= move.maxLevel) {
    return {
      success: false,
      message: `⭐ **${move.name}** is already at maximum level (**Level ${move.maxLevel} Mastery**)!`
    };
  }

  const requiredTp = (currentLevel + 1) * move.baseTpCost;
  const requiredCoins = (currentLevel + 1) * 2000;

  if (player.trainingPoints < requiredTp) {
    return {
      success: false,
      message: `❌ Insufficient Training Points! You need **${requiredTp} TP** (You have: ${player.trainingPoints} TP). Run \`-train\` to earn TP.`
    };
  }

  if (Number(player.coins) < requiredCoins) {
    return {
      success: false,
      message: `❌ Insufficient Coins! You need **${requiredCoins.toLocaleString()} coins** (You have: ${Number(player.coins).toLocaleString()} coins).`
    };
  }

  // Deduct resources & upgrade
  await prisma.player.update({
    where: { id: playerId },
    data: {
      trainingPoints: { decrement: requiredTp },
      coins: { decrement: requiredCoins }
    }
  });

  const nextLevel = currentLevel + 1;
  await prisma.playerMastery.upsert({
    where: {
      playerId_masteryKey: { playerId, masteryKey: move.id }
    },
    update: {
      level: nextLevel
    },
    create: {
      playerId,
      masteryKey: move.id,
      level: 1
    }
  });

  return {
    success: true,
    newLevel: nextLevel,
    message: `🎉 **Mastery Upgraded!** You unlocked **${move.emoji} ${move.name} Level ${nextLevel}**!\n` +
      `⚡ *Effect:* ${move.counterDescription}\n` +
      `💰 Cost: **${requiredTp} TP** & **${requiredCoins.toLocaleString()} coins**.`
  };
}
