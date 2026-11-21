import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { prisma } from '../database/prisma.js';
import {
  seedFranchiseClubs,
  getActiveAuctionLot,
  placeAuctionBid,
  exerciseRtmCard
} from '../engines/auctionEngine.js';

export async function handleAuctionCommand(message: Message, args: string[]) {
  await seedFranchiseClubs();

  const sub = args[0]?.toLowerCase();

  if (sub === 'start') {
    const target = message.mentions.users.first() || message.author;
    const basePrice = BigInt(args[1] ? parseInt(args[1]) * 1000000 : 2000000);

    // Cancel existing active lots
    await prisma.auctionLot.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'UNSOLD' }
    });

    const player = await prisma.player.findUnique({
      where: { id: target.id },
      include: { club: true }
    });

    if (!player) {
      return await message.reply('❌ Player not registered. Run `-profile` first.');
    }

    const lot = await prisma.auctionLot.create({
      data: {
        guildId: message.guildId || 'global',
        playerId: player.id,
        previousClubId: player.clubId,
        basePrice,
        currentBid: basePrice,
        status: 'ACTIVE'
      },
      include: { player: true, previousClub: true }
    });

    const embed = new EmbedBuilder()
      .setColor('#f59e0b')
      .setTitle(`🔨 MEGA AUCTION ROOM: ${player.username} ON THE GAVEL!`)
      .setDescription(
        `⭐ **Player:** <@${player.id}>\n` +
        `🏏 **Base Price:** \`${basePrice.toLocaleString()} coins\`\n` +
        `🛡️ **Original Franchise:** **${lot.previousClub?.name || 'Unsigned'}** ${lot.previousClub ? '(RTM Eligible 🃏)' : ''}\n\n` +
        `*Franchise captains & owners: Place your bids using \`-bid <club_alias> <increment_coins>\` or the buttons below!*`
      )
      .addFields(
        { name: '💰 Current Highest Bid', value: `\`${basePrice.toLocaleString()} coins\` (Base Price)`, inline: true },
        { name: '👑 Leader', value: 'None yet', inline: true }
      )
      .setFooter({ text: 'Commands: -bid <alias> 500000 | -rtm <alias>' })
      .setTimestamp();

    return await message.reply({ embeds: [embed] });
  }

  // View status of active lot
  const activeLot = await getActiveAuctionLot();
  if (!activeLot) {
    return await message.reply('ℹ️ No active player is currently on the auction block. Start one with `-auction start [@player] [base_millions]`.');
  }

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`🔨 Current Auction Lot: ${activeLot.player.username}`)
    .setDescription(
      `🏏 **Base Price:** \`${activeLot.basePrice.toLocaleString()} coins\`\n` +
      `💰 **Current Bid:** \`${activeLot.currentBid.toLocaleString()} coins\`\n` +
      `👑 **Leading Bidder:** **${activeLot.winningClub?.name || 'No bids placed yet'}**\n` +
      `🛡️ **Original Franchise:** **${activeLot.previousClub?.name || 'None'}**\n\n` +
      `Use **\`-bid <club_alias> <coins>\`** to raise the stakes, or **\`-rtm <club_alias>\`** to match!`
    )
    .setFooter({ text: 'Apex Mega Franchise Auction Engine' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleBidCommand(message: Message, args: string[]) {
  const clubAlias = args[0]?.toLowerCase();
  const amountArg = args[1] ? parseInt(args[1]) : 500000;

  if (!clubAlias) {
    return await message.reply('❌ Please specify your club alias and bid increment. Example: `-bid csk 1000000` or `-bid mm 500000`');
  }

  const activeLot = await getActiveAuctionLot();
  if (!activeLot) {
    return await message.reply('❌ There is no active auction lot open for bidding.');
  }

  const result = await placeAuctionBid(activeLot.id, clubAlias, BigInt(amountArg));

  const embed = new EmbedBuilder()
    .setColor(result.success ? '#2ecc71' : '#e74c3c')
    .setTitle(result.success ? '🔨 Bid Accepted' : '❌ Bid Rejected')
    .setDescription(result.message)
    .setFooter({ text: 'Apex CricVerse Mega Auction' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleRtmCommand(message: Message, args: string[]) {
  const clubAlias = args[0]?.toLowerCase();
  if (!clubAlias) {
    return await message.reply('❌ Please provide your club alias. Example: `-rtm csk`');
  }

  const activeLot = await getActiveAuctionLot();
  if (!activeLot) {
    return await message.reply('❌ There is no active auction lot to match.');
  }

  const result = await exerciseRtmCard(activeLot.id, clubAlias);

  const embed = new EmbedBuilder()
    .setColor(result.success ? '#eab308' : '#e74c3c')
    .setTitle(result.success ? '⚡ RIGHT-TO-MATCH EXERCISED!' : '❌ RTM Card Failed')
    .setDescription(result.message)
    .setFooter({ text: 'Franchise Retention & RTM Engine' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleClubsCommand(message: Message) {
  await seedFranchiseClubs();

  const clubs = await prisma.franchiseClub.findMany({
    include: { players: true }
  });

  const fields = clubs.map(c => ({
    name: `${c.emoji} ${c.name} (\`${c.alias}\`)`,
    value: `💰 **Purse:** \`${c.budget.toLocaleString()} coins\`\n` +
      `🃏 **RTM Cards:** \`${c.rtmCards}\` remaining\n` +
      `👥 **Roster (${c.players.length}):** ${c.players.map(p => p.username).slice(0, 5).join(', ') || '*No players signed*'}`,
    inline: true
  }));

  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle('🏆 Apex Premier League Franchises & Purses')
    .setDescription('Official clubs participating in the Mega Auction and LeagueMaster tournaments.')
    .addFields(fields)
    .setFooter({ text: 'Use -auction to bid on stars' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
