import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { dispatchMatchTelemetry, MatchTelemetryPayload } from '../services/leagueMasterBridge.js';
import { resolveDeliveryDuel, BowlerChoice, BatterChoice } from './duelEngine.js';

export type PitchType = 'GREEN_MAMBA' | 'DUST_BOWL' | 'HIGHWAY';

export interface MatchConfig {
  format: 'T5' | 'T10' | 'T20';
  totalOvers: number;
  pitchType: PitchType;
  isNightMatch: boolean;
  dewActive: boolean;
  homeTeamName: string;
  awayTeamName: string;
}

export interface PlayerMatchStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string;
  bowledBalls: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  catches: number;
}

/**
 * Computes fair Player of the Match (POTM) impact points
 */
export function calculateMatchImpact(stats: PlayerMatchStats): number {
  let impact = 0;
  // Batting impact
  impact += stats.runs * 1.0;
  impact += stats.sixes * 3.0;
  impact += stats.fours * 1.5;
  if (stats.balls > 0) {
    const sr = (stats.runs / stats.balls) * 100;
    impact += sr / 20;
  }
  if (!stats.isOut && stats.runs >= 20) impact += 10;

  // Bowling impact
  impact += stats.wickets * 25.0;
  impact += stats.maidens * 15.0;
  if (stats.bowledBalls >= 6) {
    const econ = (stats.runsConceded / (stats.bowledBalls / 6));
    if (econ < 6.0) impact += 15;
    else if (econ > 11.0) impact -= 10;
  }

  // Fielding impact
  impact += stats.catches * 12.0;

  return Math.round(impact * 10) / 10;
}

/**
 * Generates dynamic pitch report description
 */
export function getPitchReport(pitch: PitchType, dewActive: boolean): { title: string; desc: string; icon: string } {
  switch (pitch) {
    case 'GREEN_MAMBA':
      return {
        title: '🌿 Green Mamba Seam Deck',
        desc: 'Overcast moisture, rich green grass. Expect fierce lateral seam movement and vicious bounce in early overs.',
        icon: '🌿'
      };
    case 'DUST_BOWL':
      return {
        title: '🏜️ Dry Rank Turner',
        desc: 'Cracked, baking subcontinent surface. Fast bowlers will get reverse swing; spinners will grip, drift, and turn square.',
        icon: '🏜️'
      };
    case 'HIGHWAY':
    default:
      return {
        title: '🛣️ Flat Highway Deck',
        desc: `True bounce, lightning outfield. A batters paradise built for 200+ run chases.${dewActive ? ' ⚠️ Heavy night dew expected in the 2nd innings!' : ''}`,
        icon: '🛣️'
      };
  }
}

/**
 * Simulates a dynamic ball delivery with pitch conditions, pressure, partnership synergy, and commentary
 */
export function simulateDelivery(
  pitch: PitchType,
  dewActive: boolean,
  isSecondInnings: boolean,
  currentOver: number,
  dotStreak: number,
  bowlerName: string,
  batterName: string,
  partnershipRuns: number = 0,
  isRhbLhbSynergy: boolean = false
): {
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  commentary: string;
  wicketType?: string;
  isZoneActive: boolean;
  pressurePercent: number;
} {
  const isPowerplay = currentOver < 3;
  const isZoneActive = partnershipRuns >= 40; // The Zone momentum boost
  const pressurePercent = Math.min(100, dotStreak * 25);
  const rand = Math.random();

  // Pitch modifiers
  let swingMod = pitch === 'GREEN_MAMBA' && isPowerplay ? 0.08 : 0;
  let spinMod = pitch === 'DUST_BOWL' && currentOver >= 3 ? 0.07 : 0;
  let dewDebuff = dewActive && isSecondInnings ? 0.06 : 0; // Wet ball helps batters
  let synergyDebuff = isRhbLhbSynergy ? 0.04 : 0; // RHB/LHB pairing frustrates bowler lines

  // Pressure factor: consecutive dot balls increase chance of rash shot wicket
  let pressureWicketChance = (pressurePercent >= 50 ? 0.08 : 0) + swingMod + spinMod - dewDebuff - synergyDebuff;

  // If in the zone, wicket chance drops and boundary chance rises
  if (isZoneActive) {
    pressureWicketChance -= 0.05;
  }

  // Wicket chance
  if (rand < Math.max(0.03, 0.05 + pressureWicketChance)) {
    const types = ['BOWLED', 'CAUGHT_DEEP', 'LBW', 'EDGED_BEHIND'];
    const wType = types[Math.floor(Math.random() * types.length)];

    let comm = `❌ **WICKET!** `;
    if (pressurePercent >= 75) {
      comm += `💥 **PRESSURE SQUEEZE!** ${batterName} buckles under ${pressurePercent}% pressure after consecutive dot balls! Attempts an extravagant hoick and ${wType === 'BOWLED' ? 'off-stump goes cartwheeling' : 'top edges straight to the fielder'}!`;
    } else if (wType === 'BOWLED') {
      comm += `${bowlerName} breaches the defense with an absolute jaffa! Off-stump knocked out of the ground! ${batterName} is gone!`;
    } else if (wType === 'EDGED_BEHIND') {
      comm += `${bowlerName} extracts steep bounce off fourth stump; faint nick into the keeper's gloves! ${batterName} departs!`;
    } else if (wType === 'LBW') {
      comm += `Thud into the pads! Pinpoint inswinger by ${bowlerName}. Roaring appeal, finger goes straight up! ${batterName} is out LBW!`;
    } else {
      comm += `${batterName} takes on the long-on boundary, mistimes the loft, and it settles comfortably into the deep fielder's hands!`;
    }

    return {
      runs: 0,
      isWicket: true,
      isBoundary: false,
      commentary: comm,
      wicketType: wType,
      isZoneActive,
      pressurePercent
    };
  }

  // Boundary 6
  let sixThreshold = 0.88 - (pitch === 'HIGHWAY' ? 0.05 : 0) - (isZoneActive ? 0.06 : 0);
  if (rand > sixThreshold) {
    const sixShots = [
      `💥 **SIX!** ${batterName} skips down the track and hammers ${bowlerName} over long-off into the upper tier! 98 meters!`,
      `🚀 **HUGE MAXIMUM!** Short ball punished! ${batterName} rocks back and pulls it with disdain over deep square leg!`,
      `🚁 **ICONIC HELICOPTER!** Right in the slot, ${batterName} whips the wrists and launches it 105 meters over cow corner!`,
      `🤿 **360° RAMP SIX!** Uses the express pace, scooping it with disdain over the third man rope!`
    ];
    let comm = sixShots[Math.floor(Math.random() * sixShots.length)];
    if (isZoneActive) comm = `🔥 **[IN THE ZONE]** ` + comm;

    return {
      runs: 6,
      isWicket: false,
      isBoundary: true,
      commentary: comm,
      isZoneActive,
      pressurePercent: 0
    };
  }

  // Boundary 4
  let fourThreshold = 0.72 - (pitch === 'HIGHWAY' ? 0.04 : 0) - (isZoneActive ? 0.05 : 0);
  if (rand > fourThreshold) {
    const fourShots = [
      `🎯 **FOUR!** Leans into the classical cover drive with surgical elegance! Pierces the extra-cover gap to perfection!`,
      `⚡ **FOUR RUNS!** Deft glance off the pads, races away past fine leg to the boundary rope!`,
      `🏏 **CRACKING FOUR!** Short and wide outside off, ${batterName} cuts it fiercely behind backward point!`
    ];
    let comm = fourShots[Math.floor(Math.random() * fourShots.length)];
    if (isRhbLhbSynergy) comm += ` *(RHB/LHB combo forced bowler field readjustment!)*`;

    return {
      runs: 4,
      isWicket: false,
      isBoundary: true,
      commentary: comm,
      isZoneActive,
      pressurePercent: 0
    };
  }

  // Dot ball
  if (rand < 0.36 + swingMod + spinMod - (isZoneActive ? 0.10 : 0)) {
    const dots = [
      `🛡️ Solid front-foot block from ${batterName} straight back to ${bowlerName}. Dot ball.`,
      `🌀 Play and miss! Beaten by sharp drift outside off-stump! Dot ball.`,
      `🛑 Direct hit at non-striker's end, batters decide against the risky single. No run.`
    ];
    return {
      runs: 0,
      isWicket: false,
      isBoundary: false,
      commentary: dots[Math.floor(Math.random() * dots.length)],
      isZoneActive,
      pressurePercent
    };
  }

  // 1 or 2 runs (Strike rotation)
  const isTwo = rand > 0.58;
  const runs = isTwo ? 2 : 1;
  return {
    runs,
    isWicket: false,
    isBoundary: false,
    commentary: isTwo
      ? `🏃 Dropped softly into wide mid-on; excellent running between the wickets pushes for two!`
      : `👟 Pushed down to long-on for a brisk, comfortable single. Strike rotated!`,
    isZoneActive,
    pressurePercent: 0
  };
}
