import { Message, EmbedBuilder } from 'discord.js';

export async function handleHelpCommand(message: Message) {
  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle('🏏 Apex CricVerse: Player Career Manual & Help Center')
    .setDescription(
      `Welcome to **Apex CricVerse**, the living multiplayer cricket career simulation on Discord!\n` +
      `You start as a grassroots rookie and rise to World Cup and Franchise glory.`
    )
    .addFields(
      {
        name: '🧭 Spatial Campus & Travel Engine',
        value: `• \`-locations\` — Inspect all 7 campus facilities.\n• \`-travel <alias>\` — Travel between locations (\`cn\`, \`sl\`, \`gp\`, \`pc\`, \`ps\`, \`cp\`, \`ld\`).\n• \`-showroom\` — View exotic vehicles to slash travel cooldowns from 20m down to 1m.\n• \`-vehiclebuy <alias>\` — Purchase a superbike or supercar for your personal garage.`,
        inline: false
      },
      {
        name: '👤 Player Profile & Development',
        value: `• \`-profile [@user]\` — View 3-tier career profile (BAT, BOWL, FLD ratings & 15 attributes).\n• \`-setdesc <text>\` — Set your personal player bio/quote (max 100 chars).\n• \`-lb [runs|wickets|coins|fans|tp]\` — View global community leaderboards.`,
        inline: false
      },
      {
        name: '🏃 Training & Biomechanics Lab',
        value: `• \`-train\` — Net session at \`#cricket-nets\` to earn Training Points (TP) (30m cooldown).\n• \`-train vip\` — High-performance VIP coaching (+6 TP, 6h cooldown).\n• \`-sptrain <attr>\` — Biomechanical development at \`#sports-lab\` (scales dynamically by server rank).\n• \`-recovery\` — Free stamina restore at \`#physio-clinic\` (+30 to +100 Stamina, 12h cooldown).`,
        inline: false
      },
      {
        name: '📸 Reputation, Brand Deals & Wealth',
        value: `• \`-advert [sponsor]\` — Sign brand contracts (CEAT, Red Bull, Dream11, MRF) at \`#press-center\`.\n• \`-coaching\` — Youth coaching at \`#club-pavilion\` (+50k coins, 2h cooldown).\n• \`-meetgreet\` — Fan autograph session (+50k fans, 2h cooldown).\n• \`-chirp <text>\` — Post in-character tweets (reactions give +100k or -50k fans; 5% daily decay applies).\n• *Wealth Tax:* 5% daily tax collected on wealth exceeding 1,000,000 coins.`,
        inline: false
      },
      {
        name: '🛍️ Pro Shop & Matchday Equipment',
        value: `• \`-buy\` — Inspect pro shop gear catalog at \`#gear-pavilion\`.\n• \`-buy sd\` — Sports Drink (+50 Stamina, 100k coins).\n• \`-buy <bat|spikes|gloves>\` — Equip +10 matchday attribute boosts (500k coins).\n• \`-intel\` — Free daily scouting brief giving opposition weaknesses (+1 to +6 random boost).`,
        inline: false
      },
      {
        name: '⚡ Live Matches, Delivery Duels & DRS',
        value: `• \`-duel [@user]\` — 10-second delivery mind-game duel (Yorker/Bouncer vs Scoop/Helicopter).\n• \`-match [t5|t10]\` — Live over-by-over match with RHB/LHB synergy, pressure meters, and Cricinfo news coverage!\n• \`-drs [lbw|edge] [out|notout]\` — Third Umpire Hawk-Eye & UltraEdge Decision Review System.\n• \`-pitchreport [green|dust|highway]\` — Inspect pitch moisture and dew forecast.\n• \`-toss <heads|tails>\` — Matchday coin flip for batting or bowling first.`,
        inline: false
      },
      {
        name: '🌟 Specialization Trees & Masteries',
        value: `• \`-masteries\` — Inspect signature moves (Helicopter, 360° Ramp, 150km Yorker, Carrom Ball, Knuckle Float).\n• \`-mastery upgrade <move_code>\` — Spend TP & coins to upgrade signature moves from Level 1 to 5 for game-changing duel advantages.`,
        inline: false
      },
      {
        name: '🏆 Franchise Ecosystem & Mega Auctions',
        value: `• \`-auction [start|status]\` — Enter the live Mega Auction room or put a player on the gavel.\n• \`-bid <club_alias> <coins>\` — Place a bid on behalf of your franchise.\n• \`-rtm <club_alias>\` — Slap down a Right-to-Match card to retain your former star at the highest bid price.\n• \`-clubs\` — Inspect franchise teams, remaining purses, and roster lists.`,
        inline: false
      },
      {
        name: '🎮 Spectator Fantasy (Dream XI) & Live Odds',
        value: `• \`-fantasy [create|lb]\` — Build your fantasy lineup with captain/vice-captain multipliers & track manager leaderboard.\n• \`-odds [home] [away]\` — Live in-play bookmaker odds & win probability based on RRR, wickets & dew.\n• \`-predict <team> <coins>\` — Place prediction bets on match outcomes.`,
        inline: false
      },
      {
        name: '🛠️ Server Administration & Campus Setup',
        value: `• \`-setup\` — Automatically create all 7 campus facilities, arena categories, and media channels with rich welcome guides.`,
        inline: false
      },
      {
        name: '🚀 DevOps Hot-Rollback Engine',
        value: `• \`-gitpull [branch]\` — Zero-downtime pull with auto-compilation test & instant rollback on error.\n• \`-gitpullback\` — Emergency one-command rollback to previous verified commit.`,
        inline: false
      }
    )
    .setFooter({ text: 'Apex CricVerse • Connected with LeagueMaster Federation' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
