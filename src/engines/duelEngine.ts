export type BowlerChoice = 'YORKER' | 'BOUNCER' | 'SLOWER_CUTTER' | 'WIDE_OFF';
export type BatterChoice = 'STEP_OUT_LOFT' | 'HELICOPTER' | 'COMPACT_DEFENSE' | 'RAMP_360';

export interface DuelResult {
  runs: number;
  isWicket: boolean;
  wicketType?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'EDGED_BEHIND';
  isExtra: boolean;
  extraType?: 'WIDE' | 'NO_BALL';
  commentary: string;
}

/**
 * Resolves the 10-second Delivery Mind-Game duel between active Bowler and Batter
 */
export function resolveDeliveryDuel(
  bowlerName: string,
  batterName: string,
  bowlerChoice: BowlerChoice,
  batterChoice: BatterChoice,
  bowlerStats: { pace: number; accuracy: number; swing: number },
  batterStats: { power: number; timing: number; defensiveTech: number }
): DuelResult {
  // Scenario 1: Yorker vs Helicopter (Batter predicted blockhole)
  if (bowlerChoice === 'YORKER' && batterChoice === 'HELICOPTER') {
    return {
      runs: 6,
      isWicket: false,
      isExtra: false,
      commentary: `💥 **MASSIVE SIX!** ${bowlerName} steams in with a toe-crusher yorker, but ${batterName} was sitting deep in the crease and unleashes the iconic **HELICOPTER SHOT**! Up, up, and into the second tier! 104 meters!`
    };
  }

  // Scenario 2: Bouncer vs Step-Out Loft (Bowler set the trap)
  if (bowlerChoice === 'BOUNCER' && batterChoice === 'STEP_OUT_LOFT') {
    return {
      runs: 0,
      isWicket: true,
      wicketType: 'CAUGHT',
      isExtra: false,
      commentary: `❌ **WICKET!** ${bowlerName} digs in a vicious rib-cage bouncer at express pace! ${batterName} charges down the track, gets rushed for pace, and top-edges it sky-high! Settles comfortably into the hands of mid-on!`
    };
  }

  // Scenario 3: Slower Cutter vs Step-Out Loft (Deceived in flight)
  if (bowlerChoice === 'SLOWER_CUTTER' && batterChoice === 'STEP_OUT_LOFT') {
    return {
      runs: 0,
      isWicket: true,
      wicketType: 'BOWLED',
      isExtra: false,
      commentary: `🔥 **TIMBER!** Absolute masterclass deception by ${bowlerName}! Disguised back-of-the-hand slower ball; ${batterName} swings early through the line, completely beaten by lack of pace, and off-stump goes flying!`
    };
  }

  // Scenario 4: Yorker vs Ramp 360 (Dangerous scoop against yorker)
  if (bowlerChoice === 'YORKER' && batterChoice === 'RAMP_360') {
    if (batterStats.timing > 75) {
      return {
        runs: 4,
        isWicket: false,
        isExtra: false,
        commentary: `🤿 **AUDACIOUS FOUR!** ${batterName} drops to one knee, uses the express 145km/h speed, and ramps the yorker over the wicketkeeper's helmet to the fine-leg boundary!`
      };
    } else {
      return {
        runs: 0,
        isWicket: true,
        wicketType: 'LBW',
        isExtra: false,
        commentary: `☝️ **OUT!** ${batterName} attempts the scoop but misses completely! Pinpoint yorker strikes right in front of leg-stump. Loud appeal, and the umpire's finger goes straight up! Plumb LBW!`
      };
    }
  }

  // Scenario 5: Bouncer vs Ramp 360 (Upper cut execution)
  if (bowlerChoice === 'BOUNCER' && batterChoice === 'RAMP_360') {
    return {
      runs: 6,
      isWicket: false,
      isExtra: false,
      commentary: `🚀 **SIX OVER THIRD MAN!** ${bowlerName} bends his back on a short ball, but ${batterName} arches backwards and guides it cleanly over third-man rope with supreme timing!`
    };
  }

  // Scenario 6: Wide Tramline vs Helicopter
  if (bowlerChoice === 'WIDE_OFF' && batterChoice === 'HELICOPTER') {
    return {
      runs: 0,
      isWicket: false,
      isExtra: false,
      commentary: `🎯 **DOT BALL!** Smart bowling by ${bowlerName}! Bowls it wide outside off-stump just inside the tramline. ${batterName} swings the helicopter into thin air!`
    };
  }

  // Scenario 7: Compact Defense (Solid technique)
  if (batterChoice === 'COMPACT_DEFENSE') {
    const singleChance = (batterStats.timing + 30) > bowlerStats.accuracy;
    return {
      runs: singleChance ? 1 : 0,
      isWicket: false,
      isExtra: false,
      commentary: singleChance
        ? `🏃 **QUICK SINGLE!** ${batterName} drops wrists with soft hands into the gully pocket, calls early, and hustles a sharp single!`
        : `🛡️ **SOLID DEFENSE!** ${batterName} meets the ball right under the eyes, dead-bats it into the pitch. No run.`
    };
  }

  // Default fallback calculation based on raw stats
  const scoreFactor = (batterStats.power + batterStats.timing) - (bowlerStats.pace + bowlerStats.accuracy);
  if (scoreFactor > 25) {
    return {
      runs: 4,
      isWicket: false,
      isExtra: false,
      commentary: `🎯 **FOUR RUNS!** Pierced through the covers with immaculate timing by ${batterName}!`
    };
  } else if (scoreFactor < -25) {
    return {
      runs: 0,
      isWicket: true,
      wicketType: 'EDGED_BEHIND',
      isExtra: false,
      commentary: `🧤 **CAUGHT BEHIND!** Jaffa from ${bowlerName}! Extra bounce on fourth stump forces the faint feather edge straight into the keeper's gloves!`
    };
  } else {
    return {
      runs: 2,
      isWicket: false,
      isExtra: false,
      commentary: `⚡ **WORKED AWAY!** Worked off the hips into mid-wicket space; good hustle for a comfortable brace.`
    };
  }
}
