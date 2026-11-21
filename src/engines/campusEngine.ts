import { Guild, GuildMember, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { CAMPUS_LOCATIONS, BASE_TRAVEL_COOLDOWN_MINUTES, VEHICLE_CATALOG } from '../config/constants.js';

export interface TravelResult {
  success: boolean;
  message: string;
  embed?: EmbedBuilder;
  remainingCooldownSeconds?: number;
}

/**
 * Calculates the fastest travel cooldown in minutes for a given player based on owned vehicles
 */
export async function getPlayerTravelCooldown(playerId: string): Promise<{ cooldownMinutes: number; vehicleName: string }> {
  const vehicles = await prisma.playerVehicle.findMany({ where: { playerId } });
  if (vehicles.length === 0) {
    return { cooldownMinutes: BASE_TRAVEL_COOLDOWN_MINUTES, vehicleName: 'Walking / Public Transit' };
  }

  // Find the vehicle with the lowest cooldown minutes
  let fastest = vehicles[0];
  for (const v of vehicles) {
    if (v.cooldownMinutes < fastest.cooldownMinutes) {
      fastest = v;
    }
  }

  return { cooldownMinutes: fastest.cooldownMinutes, vehicleName: fastest.name };
}

/**
 * Executes dynamic channel permission overwrites and relocates a player to a new campus location
 */
export async function travelToLocation(
  member: GuildMember,
  guild: Guild,
  targetAlias: string
): Promise<TravelResult> {
  const targetLoc = CAMPUS_LOCATIONS[targetAlias.toLowerCase()];
  if (!targetLoc) {
    const validCodes = Object.keys(CAMPUS_LOCATIONS).map(k => `\`${k}\` (${CAMPUS_LOCATIONS[k].name})`).join('\n');
    return {
      success: false,
      message: `❌ Invalid location alias \`${targetAlias}\`.\n\n**Available Locations:**\n${validCodes}`
    };
  }

  let player = await prisma.player.findUnique({
    where: { id: member.id },
    include: { vehicles: true }
  });

  if (!player) {
    // Auto-register rookie player if not existing
    player = await prisma.player.create({
      data: {
        id: member.id,
        username: member.user.username,
        discriminator: member.user.discriminator !== '0' ? member.user.discriminator : null,
        avatar: member.user.displayAvatarURL(),
        currentLocation: 'cn'
      },
      include: { vehicles: true }
    });
  }

  // Check if player is already in this location
  if (player.currentLocation === targetLoc.id) {
    return {
      success: false,
      message: `ℹ️ You are already at **${targetLoc.emoji} ${targetLoc.name}**!`
    };
  }

  // Cooldown Verification
  const now = new Date();
  if (player.travelUntil && player.travelUntil > now) {
    const diffSeconds = Math.ceil((player.travelUntil.getTime() - now.getTime()) / 1000);
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return {
      success: false,
      message: `⏳ **Travel in progress / Resting:** You must wait **${mins}m ${secs}s** before traveling again.`,
      remainingCooldownSeconds: diffSeconds
    };
  }

  // Calculate travel duration
  const { cooldownMinutes, vehicleName } = await getPlayerTravelCooldown(member.id);
  const nextTravelTime = new Date(now.getTime() + cooldownMinutes * 60 * 1000);

  // Update Database state
  const prevLoc = CAMPUS_LOCATIONS[player.currentLocation] || CAMPUS_LOCATIONS.cn;
  await prisma.player.update({
    where: { id: member.id },
    data: {
      currentLocation: targetLoc.id,
      travelUntil: nextTravelTime
    }
  });

  // Dynamic Discord Channel Permission Overwrites
  try {
    const channels = await guild.channels.fetch();

    // 1. Find previous location channel and hide it
    const oldChannel = channels.find(c => c && c.name.toLowerCase().includes(prevLoc.channelName.toLowerCase()) && c.isTextBased());
    if (oldChannel) {
      await (oldChannel as any).permissionOverwrites.edit(member.id, {
        [PermissionFlagsBits.ViewChannel.toString()]: false
      }).catch(() => {});
    }

    // 2. Find target location channel and reveal it
    const newChannel = channels.find(c => c && c.name.toLowerCase().includes(targetLoc.channelName.toLowerCase()) && c.isTextBased());
    if (newChannel) {
      await (newChannel as any).permissionOverwrites.edit(member.id, {
        [PermissionFlagsBits.ViewChannel.toString()]: true,
        [PermissionFlagsBits.SendMessages.toString()]: true,
        [PermissionFlagsBits.ReadMessageHistory.toString()]: true
      }).catch(() => {});
    }
  } catch (permErr) {
    // If bot lacks permission manage channels, still complete logical travel
    console.error('Permission overwrite warning:', permErr);
  }

  const arrivalEmbed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`${targetLoc.emoji} Arrived at ${targetLoc.name}!`)
    .setDescription(targetLoc.description)
    .addFields(
      { name: '🚗 Transport Used', value: `*${vehicleName}*`, inline: true },
      { name: '⏱️ Next Travel Ready', value: `<t:${Math.floor(nextTravelTime.getTime() / 1000)}:R>`, inline: true },
      { name: '📋 Local Activities', value: targetLoc.activities.map(a => `• \`${a}\``).join('\n') }
    )
    .setFooter({ text: 'Apex CricVerse Spatial Campus Engine' })
    .setTimestamp();

  return {
    success: true,
    message: `🛫 Traveled to **${targetLoc.name}**!`,
    embed: arrivalEmbed
  };
}
