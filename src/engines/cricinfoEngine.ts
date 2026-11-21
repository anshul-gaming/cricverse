import { MatchTelemetryPayload } from '../services/leagueMasterBridge.js';

export interface NewsArticle {
  headline: string;
  subHeadline: string;
  body: string;
  markdownContent: string;
}

/**
 * Generates an authentic, high-voltage Cricinfo newspaper sports report
 */
export function generateMatchNewsArticle(telemetry: MatchTelemetryPayload): NewsArticle {
  const isClose = telemetry.margin.toLowerCase().includes('run') && parseInt(telemetry.margin) <= 15;
  const isSuperOver = telemetry.winner === 'TIE';

  const headline = isSuperOver
    ? `📰 CRICVERSE PREMIER LEAGUE: SUPER OVER HEART-STOPPER AT THE METROPOLIS! 📰`
    : `📰 CRICVERSE PREMIER LEAGUE: ${telemetry.winner.toUpperCase()} CONQUER IN THRILLING ${telemetry.format} CLASH! 📰`;

  const subHeadline = `⚡ ${telemetry.potm.username.toUpperCase()} DELIVERS ICE-COLD MASTERCLASS TO CLINCH ${telemetry.margin.toUpperCase()}!`;

  const quotePool = [
    `"When the pressure was peaking and the dot-ball squeeze was on, we just backed our instincts. Pure belief."`,
    `"The conditions were tricky with the pitch changing character, but we kept our composure. This one is for the fans."`,
    `"We executed our gameplan to perfection. Credit to the entire squad for stepping up in the crunch moments."`
  ];
  const quote = quotePool[Math.floor(Math.random() * quotePool.length)];

  const markdownContent =
`${headline}

${subHeadline}

When the stakes were highest, ${telemetry.potm.username} produced a signature performance that will be remembered all season long.

━━━━━━━━━━━━━━━━━━━━
🏟️ **MATCH SCORECARD**
**${telemetry.homeTeam.name}** \`${telemetry.homeTeam.score}/${telemetry.homeTeam.wickets}\` (${telemetry.homeTeam.overs}.0 ov)
**${telemetry.awayTeam.name}** \`${telemetry.awayTeam.score}/${telemetry.awayTeam.wickets}\` (${telemetry.awayTeam.overs}.0 ov)
🏆 **Result:** **${telemetry.winner}** won **${telemetry.margin}**!

━━━━━━━━━━━━━━━━━━━━
👑 **PLAYER OF THE MATCH (POTM)**
⭐ **${telemetry.potm.username}** (Match Impact Rating: **${telemetry.potm.rating}**)
✨ **Reward:** Permanent **+${telemetry.potm.statUpgrade.boost} upgrade** to **${telemetry.potm.statUpgrade.attribute.toUpperCase()}**!

💬 **Post-Match Quote from ${telemetry.potm.username}:**
*${quote}*

━━━━━━━━━━━━━━━━━━━━
🌿 **VENUE TELEMETRY & TACTICAL ANALYSIS**
• **Surface:** \`${telemetry.pitchType}\`
• **Night Dew Factor:** \`${telemetry.dewActive ? 'Heavy Outfield Dew (Favoring Chasers)' : 'Dry Conditions'}\`
• **Competition:** \`${telemetry.competition}\`

@News Ping`;

  return {
    headline,
    subHeadline,
    body: quote,
    markdownContent
  };
}
