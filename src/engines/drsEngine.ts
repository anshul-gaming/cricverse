export type AppealType = 'LBW' | 'CAUGHT_BEHIND';
export type OnFieldDecision = 'OUT' | 'NOT_OUT';

export interface DrsResult {
  appealType: AppealType;
  onFieldDecision: OnFieldDecision;
  finalDecision: 'OUT' | 'NOT_OUT';
  reviewRetained: boolean;
  snickoSpike: boolean;
  pitching: 'IN_LINE' | 'OUTSIDE_OFF' | 'OUTSIDE_LEG';
  impact: 'IN_LINE' | 'UMPIRES_CALL' | 'OUTSIDE_OFF';
  wickets: 'HITTING' | 'UMPIRES_CALL' | 'MISSING';
  headline: string;
  commentary: string;
  graphicBox: string;
}

/**
 * Simulates a realistic high-drama DRS Review sequence
 */
export function simulateDrsReview(
  appealType: AppealType,
  onFieldDecision: OnFieldDecision,
  bowlerName: string,
  batterName: string
): DrsResult {
  if (appealType === 'CAUGHT_BEHIND') {
    // 50% chance of faint tickle
    const edge = Math.random() < 0.5;
    const finalDecision: 'OUT' | 'NOT_OUT' = edge ? 'OUT' : 'NOT_OUT';
    const overturned = finalDecision !== onFieldDecision;
    const reviewRetained = overturned;

    const snickoArt = edge
      ? 'UltraEdge: ━━━━━/\\━━━━━ [SPIKE DETECTED AS BALL PASSES BAT]'
      : 'UltraEdge: ━━━━━━━━━━━━━ [FLAT LINE - NO BAT INVOLVED]';

    const graphicBox =
      `╔══════════════════════════════════════════════════════════╗\n` +
      `║             📡 THIRD UMPIRE DECISION REVIEW              ║\n` +
      `╠══════════════════════════════════════════════════════════╣\n` +
      `║ ${snickoArt}║\n` +
      `║ Gap Between Bat & Ball: ${edge ? 'NONE (Deflection)' : 'CLEAR DAYLIGHT'}                       ║\n` +
      `║ On-Field Call:          ${onFieldDecision === 'OUT' ? 'OUT' : 'NOT OUT'}                                    ║\n` +
      `║ Third Umpire Verdict:   ${finalDecision === 'OUT' ? '🔴 OUT' : '🟢 NOT OUT'}                                ║\n` +
      `╚══════════════════════════════════════════════════════════╝`;

    return {
      appealType,
      onFieldDecision,
      finalDecision,
      reviewRetained,
      snickoSpike: edge,
      pitching: 'IN_LINE',
      impact: 'IN_LINE',
      wickets: edge ? 'HITTING' : 'MISSING',
      headline: overturned ? '⚡ DECISION OVERTURNED BY THIRD UMPIRE!' : '🔒 ON-FIELD DECISION STANDS!',
      commentary: edge
        ? `🎙️ *"Rock and roll that please... Yes, there is a distinct spike on UltraEdge when ball is adjacent to the inside edge. Stay with your original decision, you need to change your call to OUT!"*`
        : `🎙️ *"Clear gap between bat and ball. Flat line on UltraEdge as it passes the splice. Roll it through to the keeper... Clean take. The batsman is NOT OUT!"*`,
      graphicBox
    };
  }

  // LBW Review: Hawk-Eye Ball Tracking
  const rand = Math.random();
  let pitching: 'IN_LINE' | 'OUTSIDE_OFF' | 'OUTSIDE_LEG' = 'IN_LINE';
  let impact: 'IN_LINE' | 'UMPIRES_CALL' | 'OUTSIDE_OFF' = 'IN_LINE';
  let wickets: 'HITTING' | 'UMPIRES_CALL' | 'MISSING' = 'HITTING';

  // Pitching outside leg is automatic NOT OUT
  if (rand < 0.2) {
    pitching = 'OUTSIDE_LEG';
  } else if (rand < 0.4) {
    wickets = 'UMPIRES_CALL';
  } else if (rand < 0.6) {
    wickets = 'MISSING';
  }

  let finalDecision: 'OUT' | 'NOT_OUT';
  let reviewRetained = false;

  if (pitching === 'OUTSIDE_LEG') {
    finalDecision = 'NOT_OUT';
    reviewRetained = (onFieldDecision === 'NOT_OUT');
  } else if (wickets === 'MISSING') {
    finalDecision = 'NOT_OUT';
    reviewRetained = false;
  } else if (wickets === 'UMPIRES_CALL') {
    finalDecision = onFieldDecision;
    reviewRetained = true; // Umpire's call retains review
  } else {
    // Hitting
    finalDecision = 'OUT';
    reviewRetained = (onFieldDecision === 'OUT');
  }

  const overturned = finalDecision !== onFieldDecision;
  if (overturned) reviewRetained = true;

  const graphicBox =
    `╔══════════════════════════════════════════════════════════╗\n` +
    `║               🌐 HAWK-EYE BALL TRACKING                  ║\n` +
    `╠══════════════════════════════════════════════════════════╣\n` +
    `║ 1. UltraEdge:      ━━━━━━━━━━━━━ (No Bat Involved)        ║\n` +
    `║ 2. Pitching:       ${pitching.padEnd(16)} (In-Line required)      ║\n` +
    `║ 3. Impact Zone:    ${impact.padEnd(16)} (Between Stumps)       ║\n` +
    `║ 4. Wickets:        ${wickets.padEnd(16)} (Leg/Middle/Off)       ║\n` +
    `╠══════════════════════════════════════════════════════════╣\n` +
    `║ On-Field Call:     ${onFieldDecision === 'OUT' ? 'OUT' : 'NOT OUT'}                                   ║\n` +
    `║ Final DRS Verdict: ${finalDecision === 'OUT' ? '🔴 OUT' : '🟢 NOT OUT'}                               ║\n` +
    `╚══════════════════════════════════════════════════════════╝`;

  const commentary = overturned
    ? `🎙️ *"Tracking is up on screen now... Pitching ${pitching.replace('_', ' ')}, Impact ${impact.replace('_', ' ')}, and Wickets ${wickets.replace('_', ' ')}! You are on screen with the reverse signal now!"*`
    : `🎙️ *"The on-field decision is confirmed. ${wickets === 'UMPIRES_CALL' ? "It is Umpire's Call clipping the bails; the review is retained." : 'Ball tracking confirms original verdict.'}"*`;

  return {
    appealType,
    onFieldDecision,
    finalDecision,
    reviewRetained,
    snickoSpike: false,
    pitching,
    impact,
    wickets,
    headline: overturned ? '⚡ ON-FIELD CALL OVERTURNED!' : `🔒 ${wickets === 'UMPIRES_CALL' ? "UMPIRE'S CALL STANDS!" : 'DECISION CONFIRMED!'}`,
    commentary,
    graphicBox
  };
}
