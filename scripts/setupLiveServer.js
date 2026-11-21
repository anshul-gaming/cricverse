import dotenv from 'dotenv';
dotenv.config();

import {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel
} from 'discord.js';

const GUILD_ID = '1546880116125077546';

const CAMPUS_CHANNELS = [
  {
    name: 'cricket-nets',
    topic: '🏏 High-intensity batting and bowling training nets with automated bowling machines.',
    title: '🏏 The Cricket Nets: Training Facility',
    description: 'Welcome to the training nets! Train your player to earn Training Points (TP) and develop your career.',
    commands: [
      '• `-train` — Standard net training session (30m cooldown)',
      '• `-train vip` — High-performance VIP coaching (+6 TP, 6h cooldown)',
      '• `-train noeffort` — Casual net session (+2 TP, 15m cooldown)'
    ]
  },
  {
    name: 'sports-lab',
    topic: '🔬 State-of-the-art sports science and biomechanical attribute upgrade lab.',
    title: '🔬 Sports Science & Biomechanics Lab',
    description: 'Upgrade your 15 granular attributes and signature masteries. Upgrade costs scale dynamically with your ranking on the server leaderboard!',
    commands: [
      '• `-sptrain <attr>` — Biomechanical upgrade (e.g. `-sptrain power`, `-sptrain pace`)',
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

const TOURNAMENT_CHANNELS = [
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
    description: 'Automated sports newspaper coverage! After every match, official journalists post box scores, highlights, and player quotes here.',
    commands: [
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

const CRICVERSE_ROLES = [
  { name: '👑 Franchise Owner', color: '#f59e0b', hoist: true, mentionable: true },
  { name: '⭐ International Superstar', color: '#8b5cf6', hoist: true, mentionable: false },
  { name: '🏏 First-Class Professional', color: '#0284c7', hoist: true, mentionable: false },
  { name: '🧢 Academy Rookie', color: '#10b981', hoist: true, mentionable: false },
  { name: '🌟 VIP Booster', color: '#ec4899', hoist: true, mentionable: true },
  { name: '📰 News Ping', color: '#e0e7ff', hoist: false, mentionable: true },
  { name: '🎙️ Cricinfo Media', color: '#f97316', hoist: true, mentionable: false }
];

async function run() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    console.log('🤖 Connected as:', client.user.tag);
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Guild not found:', GUILD_ID);
      process.exit(1);
    }

    console.log(`🏟️ Setting up Official Server: ${guild.name} (${guild.id})`);

    // 1. Create CricVerse Roles
    console.log('--- Step 1: Creating & Verifying Roles ---');
    for (const rDef of CRICVERSE_ROLES) {
      const existing = guild.roles.cache.find(r => r.name.toLowerCase() === rDef.name.toLowerCase());
      if (!existing) {
        const createdRole = await guild.roles.create({
          name: rDef.name,
          color: rDef.color,
          hoist: rDef.hoist,
          mentionable: rDef.mentionable,
          reason: 'Apex CricVerse Role Setup'
        });
        console.log(`✅ Created Role: ${createdRole.name}`);
      } else {
        console.log(`ℹ️ Role already exists: ${existing.name}`);
      }
    }

    // 2. Create Categories
    console.log('--- Step 2: Creating Categories ---');
    let campusCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('campus')
    );
    if (!campusCategory) {
      campusCategory = await guild.channels.create({
        name: '🏟️ CRICVERSE CAMPUS',
        type: ChannelType.GuildCategory,
        position: 1
      });
      console.log('✅ Created Category: 🏟️ CRICVERSE CAMPUS');
    } else {
      console.log('ℹ️ Category exists: 🏟️ CRICVERSE CAMPUS');
    }

    let tournamentCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase().includes('tournament') || c.name.toLowerCase().includes('arena'))
    );
    if (!tournamentCategory) {
      tournamentCategory = await guild.channels.create({
        name: '🏆 TOURNAMENTS & ARENA',
        type: ChannelType.GuildCategory,
        position: 2
      });
      console.log('✅ Created Category: 🏆 TOURNAMENTS & ARENA');
    } else {
      console.log('ℹ️ Category exists: 🏆 TOURNAMENTS & ARENA');
    }

    // 3. Create Campus Channels & Send Guides
    console.log('--- Step 3: Creating Campus Channels ---');
    for (const spec of CAMPUS_CHANNELS) {
      let ch = guild.channels.cache.find(
        c => c.isTextBased() && c.name.toLowerCase() === spec.name.toLowerCase()
      );

      if (!ch) {
        ch = await guild.channels.create({
          name: spec.name,
          type: ChannelType.GuildText,
          parent: campusCategory.id,
          topic: spec.topic
        });
        console.log(`✅ Created Campus Channel: #${spec.name}`);

        const embed = new EmbedBuilder()
          .setColor('#38bdf8')
          .setTitle(spec.title)
          .setDescription(`${spec.description}\n\n**Commands You Can Use Here:**\n${spec.commands.join('\n')}`)
          .setFooter({ text: 'Apex CricVerse Campus Facility' })
          .setTimestamp();

        await ch.send({ embeds: [embed] }).catch(() => {});
      } else {
        console.log(`ℹ️ Campus Channel exists: #${spec.name}`);
      }
    }

    // 4. Create Tournament Channels & Send Guides
    console.log('--- Step 4: Creating Tournament Channels ---');
    for (const spec of TOURNAMENT_CHANNELS) {
      let ch = guild.channels.cache.find(
        c => c.isTextBased() && c.name.toLowerCase() === spec.name.toLowerCase()
      );

      if (!ch) {
        ch = await guild.channels.create({
          name: spec.name,
          type: ChannelType.GuildText,
          parent: tournamentCategory.id,
          topic: spec.topic
        });
        console.log(`✅ Created Tournament Channel: #${spec.name}`);

        const embed = new EmbedBuilder()
          .setColor('#0284c7')
          .setTitle(spec.title)
          .setDescription(`${spec.description}\n\n**Commands You Can Use Here:**\n${spec.commands.join('\n')}`)
          .setFooter({ text: 'Apex CricVerse Tournament Hub' })
          .setTimestamp();

        await ch.send({ embeds: [embed] }).catch(() => {});
      } else {
        console.log(`ℹ️ Tournament Channel exists: #${spec.name}`);
      }
    }

    // 5. Post Grand Opening Announcement
    console.log('--- Step 5: Posting Grand Launch Announcement ---');
    const newsChannel = guild.channels.cache.find(c => c.isTextBased() && c.name.includes('announcement')) ||
                        guild.channels.cache.find(c => c.isTextBased() && c.name === 'cricket-news');

    if (newsChannel && 'send' in newsChannel) {
      const launchEmbed = new EmbedBuilder()
        .setColor('#f59e0b')
        .setTitle('🏏 WELCOME TO APEX CRICVERSE: THE CRICKET CAREER MMORPG! 🌟')
        .setDescription(
          `**The server has been upgraded into the official world of Apex CricVerse!**\n\n` +
          `Starting as a grassroots rookie, you can now build a complete cricket career right here on Discord:\n\n` +
          `🏟️ **Explore the Campus:**\n` +
          `• Head to <#${guild.channels.cache.find(c => c.name === 'cricket-nets')?.id}> to hit the nets with \`-train\`\n` +
          `• Upgrade 15 granular attributes at <#${guild.channels.cache.find(c => c.name === 'sports-lab')?.id}> with \`-sptrain\`\n` +
          `• Gear up with willow bats and energy drinks at <#${guild.channels.cache.find(c => c.name === 'gear-pavilion')?.id}> with \`-buy\`\n` +
          `• Sign brand contracts at <#${guild.channels.cache.find(c => c.name === 'press-center')?.id}> with \`-advert\`\n` +
          `• Buy superbikes & supercars at <#${guild.channels.cache.find(c => c.name === 'dealership')?.id}> to cut travel cooldowns\n\n` +
          `⚔️ **Battle in the Arena:**\n` +
          `• Challenge your server rivals in <#${guild.channels.cache.find(c => c.name === 'match-arena')?.id}> to 10-second button duels (\`-duel\`) and full matches (\`-match\`)\n` +
          `• Third Umpire Hawk-Eye DRS reviews with \`-drs\`\n` +
          `• Compete in the Franchise Mega-Auction with RTM cards in <#${guild.channels.cache.find(c => c.name === 'auction-room')?.id}>\n\n` +
          `🚀 **Get Started Now:** Type **\`-profile\`** anywhere to unlock your career card, and **\`-help\`** for the full player manual!`
        )
        .setFooter({ text: 'Apex CricVerse • Official Federation Server' })
        .setTimestamp();

      await newsChannel.send({ embeds: [launchEmbed] }).catch(() => {});
      console.log('✅ Grand Opening announcement posted to:', newsChannel.name);
    }

    console.log('🎉 Server setup completed with 100% success!');
    process.exit(0);
  });

  client.login(process.env.CRICVERSE_TOKEN || process.env.DISCORD_TOKEN);
}

run().catch(err => {
  console.error('Fatal error during setup:', err);
  process.exit(1);
});
