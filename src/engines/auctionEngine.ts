import { prisma } from '../database/prisma.js';

export interface AuctionBidResult {
  success: boolean;
  message: string;
  currentBid?: bigint;
  winningClubName?: string;
  rtmAvailable?: boolean;
}

/**
 * Initializes default franchise clubs if they do not exist
 */
export async function seedFranchiseClubs(guildId: string = 'global') {
  const defaults = [
    { name: 'Mumbai Monarchs', alias: 'mm', emoji: '👑', budget: BigInt(60000000) },
    { name: 'Chennai Super Kings', alias: 'csk', emoji: '🦁', budget: BigInt(60000000) },
    { name: 'Bangalore Blasters', alias: 'rcb', emoji: '⚡', budget: BigInt(55000000) },
    { name: 'Kolkata Knights', alias: 'kkr', emoji: '⚔️', budget: BigInt(55000000) }
  ];

  for (const def of defaults) {
    await prisma.franchiseClub.upsert({
      where: { alias: def.alias },
      update: {},
      create: {
        guildId,
        name: def.name,
        alias: def.alias,
        emoji: def.emoji,
        budget: def.budget,
        rtmCards: 2
      }
    });
  }
}

/**
 * Creates or retrieves the active auction lot
 */
export async function getActiveAuctionLot() {
  return await prisma.auctionLot.findFirst({
    where: {
      status: { in: ['ACTIVE', 'RTM_WINDOW'] }
    },
    include: {
      player: true,
      previousClub: true,
      winningClub: true
    }
  });
}

/**
 * Places a bid on an active auction lot
 */
export async function placeAuctionBid(
  lotId: string,
  clubAlias: string,
  bidIncrement: bigint
): Promise<AuctionBidResult> {
  const lot = await prisma.auctionLot.findUnique({
    where: { id: lotId },
    include: { player: true, previousClub: true, winningClub: true }
  });

  if (!lot || lot.status !== 'ACTIVE') {
    return { success: false, message: '❌ No active auction lot is open for bidding.' };
  }

  const club = await prisma.franchiseClub.findUnique({
    where: { alias: clubAlias.toLowerCase() }
  });

  if (!club) {
    return { success: false, message: `❌ Club with alias \`${clubAlias}\` not found.` };
  }

  const newBid = lot.currentBid + bidIncrement;

  if (club.budget < newBid) {
    return {
      success: false,
      message: `❌ **${club.name}** cannot afford bid of ${newBid.toLocaleString()} coins (Purse: ${club.budget.toLocaleString()} coins)!`
    };
  }

  // Update lot with new highest bidder
  await prisma.auctionLot.update({
    where: { id: lotId },
    data: {
      currentBid: newBid,
      winningClubId: club.id
    }
  });

  return {
    success: true,
    message: `🔨 **BID PLACED!** ${club.emoji} **${club.name}** bids **${newBid.toLocaleString()} coins** for **${lot.player.username}**!`,
    currentBid: newBid,
    winningClubName: club.name,
    rtmAvailable: !!lot.previousClubId && lot.previousClubId !== club.id
  };
}

/**
 * Executes a Right-to-Match (RTM) card
 */
export async function exerciseRtmCard(
  lotId: string,
  previousClubAlias: string
): Promise<{ success: boolean; message: string }> {
  const lot = await prisma.auctionLot.findUnique({
    where: { id: lotId },
    include: { player: true, previousClub: true, winningClub: true }
  });

  if (!lot) {
    return { success: false, message: '❌ Auction lot not found.' };
  }

  const prevClub = await prisma.franchiseClub.findUnique({
    where: { alias: previousClubAlias.toLowerCase() }
  });

  if (!prevClub || lot.previousClubId !== prevClub.id) {
    return { success: false, message: `❌ **${previousClubAlias}** is not the original club for ${lot.player.username}.` };
  }

  if (prevClub.rtmCards <= 0) {
    return { success: false, message: `❌ **${prevClub.name}** has 0 RTM cards remaining this season!` };
  }

  if (prevClub.budget < lot.currentBid) {
    return {
      success: false,
      message: `❌ Insufficient budget to match the winning bid of ${lot.currentBid.toLocaleString()} coins!`
    };
  }

  // Deduct budget & RTM card, assign player
  await prisma.franchiseClub.update({
    where: { id: prevClub.id },
    data: {
      budget: { decrement: lot.currentBid },
      rtmCards: { decrement: 1 }
    }
  });

  await prisma.player.update({
    where: { id: lot.playerId },
    data: { clubId: prevClub.id }
  });

  await prisma.auctionLot.update({
    where: { id: lotId },
    data: {
      winningClubId: prevClub.id,
      rtmExercised: true,
      isSold: true,
      status: 'SOLD'
    }
  });

  return {
    success: true,
    message: `⚡ **RIGHT-TO-MATCH (RTM) CARD EXERCISED!**\n` +
      `${prevClub.emoji} **${prevClub.name}** matches the bid of **${lot.currentBid.toLocaleString()} coins** and retains **${lot.player.username}**!\n` +
      `🃏 *Remaining RTM Cards for ${prevClub.name}:* **${prevClub.rtmCards - 1}**`
  };
}
