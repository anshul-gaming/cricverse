import { prisma } from '../database/prisma.js';

export interface MatchTelemetryPayload {
  matchId: string;
  competition: string;
  format: string; // T10, T20
  pitchType: string;
  dewActive: boolean;
  homeTeam: {
    name: string;
    score: number;
    wickets: number;
    overs: number;
  };
  awayTeam: {
    name: string;
    score: number;
    wickets: number;
    overs: number;
  };
  winner: string;
  margin: string;
  potm: {
    userId: string;
    username: string;
    rating: number;
    statUpgrade: {
      attribute: string;
      boost: number;
    };
  };
  keyMoments: Array<{
    over: number;
    ball: number;
    type: 'SIX' | 'WICKET' | 'RUNOUT' | 'MILESTONE';
    description: string;
  }>;
}

/**
 * Dispatches finished match telemetry to shared PostgreSQL / LeagueMaster queue
 */
export async function dispatchMatchTelemetry(payload: MatchTelemetryPayload): Promise<void> {
  // Store full match record in DB
  await prisma.matchRecord.create({
    data: {
      guildId: 'global',
      format: payload.format,
      competitionType: payload.competition,
      pitchType: payload.pitchType,
      dewActive: payload.dewActive,
      homeTeamName: payload.homeTeam.name,
      awayTeamName: payload.awayTeam.name,
      homeScore: payload.homeTeam.score,
      homeWickets: payload.homeTeam.wickets,
      homeOvers: payload.homeTeam.overs,
      awayScore: payload.awayTeam.score,
      awayWickets: payload.awayTeam.wickets,
      awayOvers: payload.awayTeam.overs,
      winnerTeam: payload.winner,
      winMargin: payload.margin,
      potmUserId: payload.potm.userId,
      telemetryJson: JSON.stringify(payload)
    }
  });

  // Apply POTM permanent +2 attribute boost to player
  await prisma.player.update({
    where: { id: payload.potm.userId },
    data: {
      [payload.potm.statUpgrade.attribute]: { increment: payload.potm.statUpgrade.boost },
      potmCount: { increment: 1 }
    }
  }).catch(() => {});
}
