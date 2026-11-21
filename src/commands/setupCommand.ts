import {
  Message,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  TextChannel
} from 'discord.js';

interface ChannelSpec {
  name: string;
  topic: string;
  title: string;
  description: string;
  commands: string[];
}

const CAMPUS_CHANNELS: ChannelSpec[] = [
  {
    name: 'cricket-nets',
    topic: '🏏 High-intensity batting and bowling practice nets with automated machines.',
    title: '🏏 The Cricket Nets: Practice Facility',
    description: 'Welcome to the training nets! Hit the nets to gain Training Points (TP) to develop your player.',
    commands: [
      '• `-train` — Standard net training session (30m cooldown)',
      '• `-train vip` — High-performance VIP coaching (+6 TP, 6h cooldown)',
      '• `-train noeffort` — Casual hit out (+2 TP, 15m cooldown)'
    ]
  },
  {
    name: 'sports-lab',
    topic: '🔬 State-of-the-art sports science and biomechanical attribute upgrade lab.',
    title: '🔬 Sports Science & Biomechanics Lab',
    description: 'Upgrade your 15 granular attributes and signature masteries. Upgrade costs scale dynamically with your ranking on the server leaderboard!',
    commands: [
      '• `-sptrain <attr>` — Upgrade attribute (e.g. `-sptrain power`, `-sptrain pace`)',
      '• `-masteries` — Inspect your signature technique specialization tree',
      '• `-mastery upgrade <move>` — Upgrade signature moves (Helicopter, Dilscoop Ramp, 150km Yorker, Carrom Ball)'
    ]
  },
  {
    name: 'gear-pavilion',
    topic: '🛍️ Official pro shop for willow bats, bowling spikes, keeping gloves, and drinks.',
    title: '🛍️ Gear Pavilion & Pro Shop',
    description: 'Equip top-tier professional gear to gain matchday attribute boosts and replenish stamina.',
    commands: [
      '• `-buy` — Inspect full equipment catalog & pricing',
      '• `-buy sd` — Sports Energy Drink (+50 Stamina, 100k coins)',
      '• `-buy bat` — Pro Grade English Willow (+10 Batting Power)',
      '• `-buy spikes` — High-Grip Bowling Spikes (+10 Bowling Pace)',
      '• `-buy gloves` — Padded Keeping Gloves (+10 Keeping / Fielding)',
      '• `-intel` — Free daily scouting brief on opposition weaknesses (+1 to +6 boost)'
    ]
  },
  {
    name: 'press-center',
    topic: '📸 Media and sponsorship hub for signing lucrative brand contracts.',
    title: '📸 Media & Sponsorship Hub',
    description: 'Sign multi-match endorsement deals with global brands to generate passive coin revenues.',
    commands: [
      '• `-advert` — Inspect all available brand sponsorship deals',
      '• `-advert <ceat|redbull|dream11|mrf>` — Sign a commercial sponsorship contract'
    ]
  },
  {
    name: 'physio-clinic',
    topic: '❄️ Cryotherapy and physiotherapy clinic for free stamina restoration.',
    title: '❄️ Physio & Cryo Clinic',
    description: 'Sore muscles after hard matches? Use cryotherapy chambers to fully restore your stamina.',
    commands: [
      '• `-recovery` — Free cryotherapy stamina restore (+30 to +100 Stamina, 12h cooldown)'
    ]
  },
  {
    name: 'club-pavilion',
    topic: '🏟️ Grassroots club ground for coaching rookies and autograph sessions.',
    title: '🏟️ Local Club Pavilion',
    description: 'Earn extra matchday revenue through community coaching and build your fan base.',
    commands: [
      '• `-coaching` — Coach academy rookies (+50,000 coins, 2h cooldown)',
      '• `-meetgreet` — Fan autograph and photo session (+50,000 followers, 2h cooldown)'
    ]
  },
  {
    name: 'dealership',
    topic: '🏎️ Exotic vehicle dealership to purchase rides that slash travel cooldowns.',
    title: '🏎️ Luxury Motor Dealership',
    description: 'Tired of walking? Buy superbikes, sports sedans, and hypercars to slash your campus travel cooldowns from 20 minutes down to 1 minute!',
    commands: [
      '• `-showroom` — Inspect all exotic vehicles, prices, and cooldown reductions',
      '• `-vehiclebuy <alias>` — Purchase a ride (e.g. `-vehiclebuy ninja`, `-vehiclebuy r8`, `-vehiclebuy chiron`)'
    ]
  }
];

const TOURNAMENT_CHANNELS: ChannelSpec[] = [
  {
    name: 'match-arena',
    topic: '⚔️ Live matches, delivery mind-game duels, coin tosses, and pitch telemetry.',
    title: '⚔️ Colosseum Match Arena',
    description: 'The center stage of Apex CricVerse! Play matches and challenge server rivals to live delivery duels.',
    commands: [
      '• `-duel [@user]` — 10-second interactive delivery mind-game duel with Discord buttons',
      '• `-match [t5|t10]` — Live over-by-over match with POTM permanent +2 upgrades',
      '• `-pitchreport [green|dust|highway]` — Inspect pitch moisture and dew forecast',
      '• `-toss <heads|tails>` — Matchday coin flip for batting or bowling first',
      '• `-drs [lbw|edge] [out|notout]` — Third Umpire Hawk-Eye & Snicko decision review'
    ]
  },
  {
    name: 'cricket-news',
    topic: '📢 Official Cricinfo wire and sports newspaper match recaps.',
    title: '📢 Apex Cricinfo Wire',
    description: 'Automated sports newspaper coverage! After every match, official journalists post box scores, highlights, and player quotes here.'
    , commands: [
      '• Autonomous match recaps post here after `-match`!'
    ]
  },
  {
    name: 'crictwit-feed',
    topic: '💬 Official community social media feed for chirps, tweets, and banter.',
    title: '💬 CricTwit Social Feed',
    description: 'Post in-character player tweets! Upvotes boost your follower count (+100k); downvotes trigger fan backlashes (-50k).',
    commands: [
      '• `-chirp <text>` — Post a chirp on the public feed (e.g. `-chirp Ready to dominate the death overs tonight!`)'
    ]
  },
  {
    name: 'auction-room',
    topic: '🔨 Franchise mega auction room with Right-to-Match (RTM) cards.',
    title: '🔨 Franchise Mega Auction Room',
    description: 'Bidding wars for cricket superstars! Franchise owners use purse budgets to bid and RTM cards to match rival bids.',
    commands: [
      '• `-auction start [@player] [base_millions]` — Put a player on the auction block',
      '• `-bid <club_alias> <coins>` — Place a bid on behalf of your franchise',
      '• `-rtm <club_alias>` — Exercise a Right-to-Match card to retain your former star',
      '• `-clubs` — View official franchise clubs, purses, and rosters'
    ]
  },
  {
    name: 'spectator-fantasy',
    topic: '🎮 Dream XI fantasy lineups, live odds, and prediction bets.',
    title: '🎮 Spectator Fantasy & Live Odds Hub',
    description: 'Spectators and fans: Pick your Dream XI fantasy lineup and predict live match winners!',
    commands: [
      '• `-fantasy create @p1 @p2 @p3` — Build your fantasy team with 2x Captain and 1.5x Vice-Captain',
      '• `-fantasy lb` — View the global fantasy manager standings',
      '• `-odds` — Live in-play win probabilities and bookmaker odds',
      '• `-predict <team> <coins>` — Place coin predictions on match winners'
    ]
  }
];

export async function handleSetupCommand(message: Message) {
  if (!message.guild) {
    return await message.reply('❌ This command can only be run in a Discord server.');
  }

  // Check administrator permission
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return await message.reply('❌ You need the **Administrator** permission to set up the CricVerse server channels.');
  }

  const statusMsg = await message.reply('🏟️ **Setting up Apex CricVerse channels and campus facilities...** Please wait a moment.');

  try {
    // 1. Create or Find Campus Category
    let campusCategory = message.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('campus')
    );

    if (!campusCategory) {
      campusCategory = await message.guild.channels.create({
        name: '🏟️ CRICVERSE CAMPUS',
        type: ChannelType.GuildCategory
      });
    }

    // 2. Create or Find Tournament Category
    let tournamentCategory = message.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase().includes('tournament') || c.name.toLowerCase().includes('arena'))
    );

    if (!tournamentCategory) {
      tournamentCategory = await message.guild.channels.create({
        name: '🏆 TOURNAMENTS & ARENA',
        type: ChannelType.GuildCategory
      });
    }

    // 3. Create Campus Channels
    let createdCount = 0;
    for (const spec of CAMPUS_CHANNELS) {
      let channel = message.guild.channels.cache.find(
        c => c.isTextBased() && c.name.toLowerCase() === spec.name.toLowerCase()
      ) as TextChannel | undefined;

      if (!channel) {
        channel = await message.guild.channels.create({
          name: spec.name,
          type: ChannelType.GuildText,
          parent: campusCategory.id,
          topic: spec.topic
        });
        createdCount++;

        // Send Welcome & Guide Embed in the new channel
        const guideEmbed = new EmbedBuilder()
          .setColor('#38bdf8')
          .setTitle(spec.title)
          .setDescription(`${spec.description}\n\n**Available Commands Here:**\n${spec.commands.join('\n')}`)
          .setFooter({ text: 'Apex CricVerse Campus Facility' })
          .setTimestamp();

        await channel.send({ embeds: [guideEmbed] }).catch(() => {});
      }
    }

    // 4. Create Tournament Channels
    for (const spec of TOURNAMENT_CHANNELS) {
      let channel = message.guild.channels.cache.find(
        c => c.isTextBased() && c.name.toLowerCase() === spec.name.toLowerCase()
      ) as TextChannel | undefined;

      if (!channel) {
        channel = await message.guild.channels.create({
          name: spec.name,
          type: ChannelType.GuildText,
          parent: tournamentCategory.id,
          topic: spec.topic
        });
        createdCount++;

        const guideEmbed = new EmbedBuilder()
          .setColor('#0284c7')
          .setTitle(spec.title)
          .setDescription(`${spec.description}\n\n**Available Commands Here:**\n${spec.commands.join('\n')}`)
          .setFooter({ text: 'Apex CricVerse Tournament Hub' })
          .setTimestamp();

        await channel.send({ embeds: [guideEmbed] }).catch(() => {});
      }
    }

    const successEmbed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🎉 Apex CricVerse Server Setup Complete!')
      .setDescription(
        `All campus facilities, tournament arenas, media feeds, and auction rooms have been organized!\n\n` +
        `🏟️ **Campus Category:** \`🏟️ CRICVERSE CAMPUS\` (7 facilities)\n` +
        `🏆 **Arena Category:** \`🏆 TOURNAMENTS & ARENA\` (5 hubs)\n` +
        `✨ **Channels Created / Verified:** **${createdCount} new channels**\n\n` +
        `*Players can now type \`-profile\` to initialize their player card, and use \`-locations\` to begin exploring!*`
      )
      .setFooter({ text: 'Apex CricVerse • Connected with LeagueMaster Helper' })
      .setTimestamp();

    await statusMsg.edit({ content: null, embeds: [successEmbed] });
  } catch (err: any) {
    await statusMsg.edit(`❌ Error setting up channels: \`${err?.message || err}\`. Please ensure the bot has the **Administrator** or **Manage Channels** permission.`);
  }
}
