import { EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { ENDORSEMENTS, WEALTH_TAX_THRESHOLD, WEALTH_TAX_PERCENTAGE, RELEVANCY_DECAY_PERCENTAGE } from '../config/constants.js';

export interface ActionResult {
  success: boolean;
  message: string;
  embed?: EmbedBuilder;
}

/**
 * Signs a commercial endorsement deal at the Press Center (-advert)
 */
export async function executeEndorsementDeal(playerId: string, dealKey?: string): Promise<ActionResult> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return { success: false, message: '❌ Player not found. Run `-profile` to register.' };

  if (player.currentLocation !== 'pc') {
    return { success: false, message: '❌ You must be at the **📸 Media & Sponsorship Hub** (`-travel pc`) to sign endorsements!' };
  }

  const now = new Date();
  if (player.lastAdvertAt && (now.getTime() - player.lastAdvertAt.getTime()) < 2 * 60 * 60 * 1000) {
    const mins = Math.ceil((2 * 60 * 60 * 1000 - (now.getTime() - player.lastAdvertAt.getTime())) / 60000);
    return { success: false, message: `⏳ Commercial cooldown active. You can sign your next sponsor in **${mins} minutes**.` };
  }

  if (!dealKey) {
    const dealsList = ENDORSEMENTS.map(d => {
      const eligible = player.followers >= d.minFollowers;
      const statusIcon = eligible ? '✅' : '🔒';
      return `${statusIcon} **${d.emoji} ${d.name}** (\`-advert ${d.key}\`)\n` +
             `• Min Fans: **${Number(d.minFollowers).toLocaleString()}** | Stamina: **${d.staminaCost}⚡**\n` +
             `• Payout: **+${Number(d.coinsEarned).toLocaleString()}🪙** | Fan Impact: **${Number(d.followerChange) >= 0 ? '+' : ''}${Number(d.followerChange).toLocaleString()}**`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('📸 Brand Endorsement Catalog')
      .setDescription(`Current Followers: **${Number(player.followers).toLocaleString()} 👥**\n\n${dealsList}`)
      .setFooter({ text: 'Usage: -advert <ceat|redbull|dream11|mrf>' })
      .setTimestamp();

    return { success: true, message: 'Sponsor deals list', embed };
  }

  const deal = ENDORSEMENTS.find(d => d.key.toLowerCase() === dealKey.toLowerCase());
  if (!deal) {
    return { success: false, message: `❌ Unknown sponsor \`${dealKey}\`. Options: \`ceat\`, \`redbull\`, \`dream11\`, \`mrf\`.` };
  }

  if (player.followers < deal.minFollowers) {
    return {
      success: false,
      message: `🔒 **Follower Requirement Not Met:** **${deal.name}** requires at least **${Number(deal.minFollowers).toLocaleString()} followers** (You currently have ${Number(player.followers).toLocaleString()}).`
    };
  }

  if (player.stamina < deal.staminaCost) {
    return {
      success: false,
      message: `⚠️ **Not Enough Stamina:** This commercial shoot requires **${deal.staminaCost} Stamina** (You have ${player.stamina}/100).`
    };
  }

  // Calculate new balances
  const newCoins = player.coins + deal.coinsEarned;
  const newFollowers = BigInt(Math.max(100, Number(player.followers) + Number(deal.followerChange)));

  await prisma.player.update({
    where: { id: playerId },
    data: {
      coins: newCoins,
      followers: newFollowers,
      stamina: { decrement: deal.staminaCost },
      lastAdvertAt: now
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle(`${deal.emoji} Endorsement Contract Signed: ${deal.name}`)
    .setDescription(`Global marketing campaign launched across billboards, television, and social media!\n\n` +
      `🪙 **Match Fee Received:** \`+${Number(deal.coinsEarned).toLocaleString()} coins\`\n` +
      `👥 **Fan Impact:** \`${Number(deal.followerChange) >= 0 ? '+' : ''}${Number(deal.followerChange).toLocaleString()} followers\`\n` +
      `⚡ **Energy Spent:** \`-${deal.staminaCost} stamina\``)
    .setFooter({ text: 'Next endorsement available in 2 hours' })
    .setTimestamp();

  return { success: true, message: 'Deal signed!', embed };
}

/**
 * Handles Physio and Cryo clinic recovery session (-recovery)
 */
export async function executePhysioRecovery(playerId: string): Promise<ActionResult> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return { success: false, message: '❌ Player not found. Run `-profile` to register.' };

  if (player.currentLocation !== 'ps') {
    return { success: false, message: '❌ You must travel to the **❄️ Physio & Cryo Clinic** (`-travel ps`) for recovery treatment!' };
  }

  const now = new Date();
  if (player.lastRecoveryAt && (now.getTime() - player.lastRecoveryAt.getTime()) < 12 * 60 * 60 * 1000) {
    const hours = Math.ceil((12 * 60 * 60 * 1000 - (now.getTime() - player.lastRecoveryAt.getTime())) / (60 * 60 * 1000));
    return { success: false, message: `⏳ Physio tables are occupied. Next session available in **${hours} hours**.` };
  }

  const restoreAmount = player.vipTier >= 1 ? (100 - player.stamina) : Math.min(30, 100 - player.stamina);
  if (player.stamina >= 100) {
    return { success: false, message: '⚡ Your stamina is already at **100% full fitness**!' };
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      stamina: { increment: restoreAmount },
      lastRecoveryAt: now
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#00cec9')
    .setTitle('❄️ Cryotherapy & Physiotherapy Session Complete')
    .setDescription(`Ice bath, deep-tissue massage, and kinematic alignment complete.\n\n⚡ **+${restoreAmount} Stamina Restored!**\nCurrent Fitness: **${updatedPlayer.stamina}/100**`)
    .setFooter({ text: 'Next free recovery session available in 12 hours' })
    .setTimestamp();

  return { success: true, message: 'Stamina restored!', embed };
}

/**
 * Applies overnight wealth tax (5% above 1M coins) and lost relevancy decay (5% followers)
 */
export async function processDailyResets(playerId: string): Promise<{ taxDeducted: bigint; followersLost: bigint } | null> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return null;

  let taxDeducted = 0n;
  if (player.coins > WEALTH_TAX_THRESHOLD) {
    taxDeducted = BigInt(Math.floor(Number(player.coins) * WEALTH_TAX_PERCENTAGE));
  }

  const followersLost = BigInt(Math.floor(Number(player.followers) * RELEVANCY_DECAY_PERCENTAGE));

  await prisma.player.update({
    where: { id: playerId },
    data: {
      coins: { decrement: taxDeducted },
      followers: { decrement: followersLost },
      stamina: { increment: Math.min(20, 100 - player.stamina) } // +20 daily baseline stamina
    }
  });

  return { taxDeducted, followersLost };
}
