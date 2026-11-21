import { prisma } from '../database/prisma.js';
import { MatchTelemetryPayload } from '../services/leagueMasterBridge.js';

export interface LiveMatchOdds {
  homeTeamName: string;
  awayTeamName: string;
  homeWinProbability: number;
  awayWinProbability: number;
  homeOdds: number;
  awayOdds: number;
  tacticalSummary: string;
}

/**
 * Calculates in-play dynamic win probability & decimal odds over-by-over
 */
export function calculateLiveOdds(
  homeTeamName: string,
  awayTeamName: string,
  target: number,
  currentRuns: number,
  wicketsLost: number,
  ballsRemaining: number,
  pitchType: string = 'HIGHWAY',
  dewActive: boolean = true
): LiveMatchOdds {
  const runsNeeded = Math.max(0, target - currentRuns);

  if (runsNeeded === 0) {
    return {
      homeTeamName,
      awayTeamName,
      homeWinProbability: 0,
      awayWinProbability: 100,
      homeOdds: 10.0,
      awayOdds: 1.01,
      tacticalSummary: `${awayTeamName} has reached the target!`
    };
  }

  if (ballsRemaining <= 0 || wicketsLost >= 10) {
    return {
      homeTeamName,
      awayTeamName,
      homeWinProbability: 100,
      awayWinProbability: 0,
      homeOdds: 1.01,
      awayOdds: 10.0,
      tacticalSummary: `${homeTeamName} successfully defended the total!`
    };
  }

  const rrr = (runsNeeded / ballsRemaining) * 6; // Required Run Rate per over
  const wicketsInHand = 10 - wicketsLost;

  // Base chasing win probability
  let chasingWinProb = 50.0;

  // RRR pressure
  if (rrr > 14) chasingWinProb -= 35;
  else if (rrr > 11) chasingWinProb -= 20;
  else if (rrr > 9) chasingWinProb -= 10;
  else if (rrr < 6) chasingWinProb += 25;
  else if (rrr < 8) chasingWinProb += 15;

  // Wickets impact
  if (wicketsInHand <= 2) chasingWinProb -= 30;
  else if (wicketsInHand <= 4) chasingWinProb -= 15;
  else if (wicketsInHand >= 7) chasingWinProb += 15;

  // Pitch and dew modifier
  if (dewActive) chasingWinProb += 8; // Outfield dew helps chasing batters
  if (pitchType === 'DUST_BOWL') chasingWinProb -= 6; // Chasing on dry turners is harder

  // Clamp probability between 5% and 95%
  chasingWinProb = Math.max(5, Math.min(95, chasingWinProb));
  const defendingWinProb = 100 - chasingWinProb;

  // Convert to European decimal odds with 5% bookmaker margin
  const homeOdds = Math.round((100 / defendingWinProb) * 0.95 * 100) / 100;
  const awayOdds = Math.round((100 / chasingWinProb) * 0.95 * 100) / 100;

  let summary = '';
  if (rrr > 12) summary = `⚠️ High pressure chase! RRR climbs to **${rrr.toFixed(1)} rpo** with ${wicketsInHand} wickets in hand.`;
  else if (chasingWinProb > 60) summary = `🔥 ${awayTeamName} is in command! Chasing smoothly with ${dewActive ? 'dew advantage' : 'steady run rate'}.`;
  else summary = `⚖️ Balanced thriller! Match hanging on a knife edge.`;

  return {
    homeTeamName,
    awayTeamName,
    homeWinProbability: Math.round(defendingWinProb),
    awayWinProbability: Math.round(chasingWinProb),
    homeOdds: Math.max(1.05, homeOdds),
    awayOdds: Math.max(1.05, awayOdds),
    tacticalSummary: summary
  };
}

/**
 * Places a coin prediction/bet on a match outcome
 */
export async function placeMatchPrediction(
  userId: string,
  matchId: string,
  predictedTeam: string,
  stake: bigint,
  odds: number
): Promise<{ success: boolean; message: string }> {
  const player = await prisma.player.findUnique({
    where: { id: userId }
  });

  if (!player) {
    return { success: false, message: '❌ Player profile not found. Run `-profile` first.' };
  }

  if (player.coins < stake) {
    return {
      success: false,
      message: `❌ Insufficient coins! You need **${stake.toLocaleString()} coins** (You have: ${Number(player.coins).toLocaleString()} coins).`
    };
  }

  // Deduct stake
  await prisma.player.update({
    where: { id: userId },
    data: { coins: { decrement: stake } }
  });

  await prisma.matchPrediction.create({
    data: {
      userId,
      matchId,
      predictedTeam,
      stake,
      odds
    }
  });

  const potentialPayout = BigInt(Math.round(Number(stake) * odds));

  return {
    success: true,
    message: `🎰 **PREDICTION LOCKED!** You staked **${stake.toLocaleString()} coins** on **${predictedTeam}** at odds **${odds}x**!\n` +
      `💰 *Potential Return:* **${potentialPayout.toLocaleString()} coins** if ${predictedTeam} wins!`
  };
}

/**
 * Settles predictions after match completion
 */
export async function settleMatchPredictions(matchId: string, winnerTeam: string): Promise<number> {
  const predictions = await prisma.matchPrediction.findMany({
    where: { matchId, settled: false }
  });

  let settledCount = 0;

  for (const pred of predictions) {
    const won = pred.predictedTeam.toLowerCase() === winnerTeam.toLowerCase();
    const payout = won ? BigInt(Math.round(Number(pred.stake) * pred.odds)) : BigInt(0);

    if (won && payout > BigInt(0)) {
      await prisma.player.update({
        where: { id: pred.userId },
        data: { coins: { increment: payout } }
      }).catch(() => {});
    }

    await prisma.matchPrediction.update({
      where: { id: pred.id },
      data: {
        settled: true,
        won,
        payout
      }
    });

    settledCount++;
  }

  return settledCount;
}

/**
 * Creates or updates a fantasy team
 */
export async function saveFantasyTeam(
  userId: string,
  guildId: string,
  teamName: string,
  selectedPlayerIds: string[],
  captainId?: string,
  viceCaptainId?: string
) {
  return await prisma.fantasyTeam.upsert({
    where: {
      userId_guildId: { userId, guildId }
    },
    update: {
      teamName,
      selectedPlayerIds: selectedPlayerIds.join(','),
      captainId,
      viceCaptainId
    },
    create: {
      userId,
      guildId,
      teamName,
      selectedPlayerIds: selectedPlayerIds.join(','),
      captainId,
      viceCaptainId
    }
  });
}
