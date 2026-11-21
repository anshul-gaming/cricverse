import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { CAMPUS_LOCATIONS, VEHICLE_CATALOG } from '../config/constants.js';
import { travelToLocation, getPlayerTravelCooldown } from '../engines/campusEngine.js';

export async function handleTravelCommand(message: Message, args: string[]) {
  if (!message.guild || !message.member) return;

  const targetAlias = args[0];
  if (!targetAlias) {
    const validCodes = Object.keys(CAMPUS_LOCATIONS)
      .map(k => `• \`-travel ${k}\` — **${CAMPUS_LOCATIONS[k].emoji} ${CAMPUS_LOCATIONS[k].name}**`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor('#38bdf8')
      .setTitle('🗺️ Campus Travel Directory')
      .setDescription(`Use \`-travel <alias>\` to move to a campus location.\nOnly one location is accessible to you at a time!\n\n${validCodes}`)
      .setFooter({ text: 'Base travel cooldown: 20m (slashed with vehicles)' });

    return await message.reply({ embeds: [embed] });
  }

  const result = await travelToLocation(message.member, message.guild, targetAlias);
  if (result.embed) {
    return await message.reply({ content: result.message, embeds: [result.embed] });
  }
  return await message.reply(result.message);
}

export async function handleLocationsCommand(message: Message) {
  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  const currentLocId = player?.currentLocation || 'cn';

  const list = Object.keys(CAMPUS_LOCATIONS).map(k => {
    const loc = CAMPUS_LOCATIONS[k];
    const isHere = loc.id === currentLocId ? '📍 **[YOU ARE HERE]**' : '';
    return `${loc.emoji} **${loc.name}** (\`-travel ${k}\`) ${isHere}\n${loc.description}`;
  }).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor('#3498db')
    .setTitle('🌐 Apex CricVerse Campus Locations')
    .setDescription(list)
    .setFooter({ text: 'Travel between locations with -travel <alias>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleShowroomCommand(message: Message) {
  const player = await prisma.player.findUnique({
    where: { id: message.author.id },
    include: { vehicles: true }
  });

  const ownedKeys = new Set(player?.vehicles.map(v => v.vehicleKey) || []);
  const { cooldownMinutes, vehicleName } = await getPlayerTravelCooldown(message.author.id);

  const vehicleList = VEHICLE_CATALOG.map(v => {
    const isOwned = ownedKeys.has(v.key) ? '✅ *(Owned)*' : `🪙 **${Number(v.cost).toLocaleString()}**`;
    return `${v.emoji} **${v.name}** (\`-vehiclebuy ${v.key}\`)\n` +
           `• Travel Cooldown: **${v.cooldownMinutes} min** | Price: ${isOwned}`;
  }).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor('#e67e22')
    .setTitle('🏎️ Luxury Motor Showroom')
    .setDescription(
      `Upgrade your wheels to drastically reduce campus travel cooldowns!\n\n` +
      `Current Active Ride: **${vehicleName}** (Cooldown: **${cooldownMinutes}m**)\n` +
      `Your Wealth: **${player ? Number(player.coins).toLocaleString() : '0'} 🪙**\n\n` +
      `${vehicleList}`
    )
    .setFooter({ text: 'Buy a ride: -vehiclebuy <alias>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleVehicleBuyCommand(message: Message, args: string[]) {
  const vehicleKey = args[0]?.toLowerCase();
  if (!vehicleKey) {
    return await message.reply('❌ Please specify a vehicle to purchase. Run `-showroom` to view options.');
  }

  const vDef = VEHICLE_CATALOG.find(v => v.key.toLowerCase() === vehicleKey);
  if (!vDef) {
    return await message.reply(`❌ Unknown vehicle \`${vehicleKey}\`. Run \`-showroom\` for the catalog.`);
  }

  let player = await prisma.player.findUnique({
    where: { id: message.author.id },
    include: { vehicles: true }
  });

  if (!player) {
    return await message.reply('❌ Player profile not found. Run `-profile` to register.');
  }

  if (player.currentLocation !== 'ld') {
    return await message.reply('❌ You must travel to the **🏎️ Luxury Motor Dealership** (`-travel ld`) to buy vehicles!');
  }

  if (player.vehicles.some(v => v.vehicleKey === vDef.key)) {
    return await message.reply(`ℹ️ You already own the **${vDef.name}**! Check \`-profile\` to view your garage.`);
  }

  if (player.coins < vDef.cost) {
    return await message.reply(
      `💸 **Insufficient Funds:** The **${vDef.name}** costs **${Number(vDef.cost).toLocaleString()} coins** (You have ${Number(player.coins).toLocaleString()} coins).\n` +
      `Earn coins via sponsorships (\`-advert\`) or coaching (\`-coaching\`)!`
    );
  }

  // Deduct coins & add vehicle
  await prisma.player.update({
    where: { id: message.author.id },
    data: {
      coins: { decrement: vDef.cost },
      vehicles: {
        create: {
          vehicleKey: vDef.key,
          name: vDef.name,
          cooldownMinutes: vDef.cooldownMinutes
        }
      }
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle(`🔑 Keys Handed Over: ${vDef.emoji} ${vDef.name}!`)
    .setDescription(
      `Congratulations on your new ride! It has been added to your garage.\n\n` +
      `⏱️ **New Campus Travel Cooldown:** **${vDef.cooldownMinutes} minutes** (Down from 20m base)\n` +
      `🪙 **Cost Paid:** \`${Number(vDef.cost).toLocaleString()} coins\``
    )
    .setFooter({ text: 'Apex CricVerse Vehicle Dealership' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
