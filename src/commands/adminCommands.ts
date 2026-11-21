import {
  Message,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  CategoryChannel,
  Role
} from 'discord.js';

/**
 * Hides an entire category from @everyone or a specified role
 * Syntax: -hidecat <category_name> [@role]
 */
export async function handleHideCategoryCommand(message: Message, args: string[]) {
  if (!message.guild || !message.member) return;

  if (!message.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return await message.reply('❌ You need the **Manage Channels** or **Administrator** permission to hide categories.');
  }

  if (args.length === 0) {
    return await message.reply('❌ Please specify a category name. Example: `-hidecat campus` or `-hidecat "CRICVERSE CAMPUS"`');
  }

  const roleTarget = message.mentions.roles.first() || message.guild.roles.everyone;
  // Strip out role mentions from search query
  const query = args.filter(a => !a.startsWith('<@&')).join(' ').trim().toLowerCase();

  const category = message.guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(query)
  ) as CategoryChannel | undefined;

  if (!category) {
    return await message.reply(`❌ Could not find any category matching \`${query}\`. Run \`-locations\` or check your server categories.`);
  }

  try {
    // 1. Edit Category permission overwrite
    await category.permissionOverwrites.edit(roleTarget.id, {
      ViewChannel: false
    });

    // 2. Sync child channels
    let childCount = 0;
    const children = category.children?.cache || [];
    for (const [_, child] of children) {
      await child.permissionOverwrites.edit(roleTarget.id, {
        ViewChannel: false
      }).catch(() => {});
      childCount++;
    }

    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle(`🔒 Category Hidden: ${category.name}`)
      .setDescription(
        `Successfully hidden from **${roleTarget.name}**!\n` +
        `📁 **Channels Synced & Locked:** \`${childCount} channel(s)\`\n\n` +
        `*To reveal this category again, use \`-showcat "${category.name}"\`.*`
      )
      .setFooter({ text: 'Apex CricVerse Server Customization' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err: any) {
    await message.reply(`❌ Failed to hide category: \`${err?.message || err}\``);
  }
}

/**
 * Reveals an entire category for @everyone or a specified role
 * Syntax: -showcat <category_name> [@role]
 */
export async function handleShowCategoryCommand(message: Message, args: string[]) {
  if (!message.guild || !message.member) return;

  if (!message.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return await message.reply('❌ You need the **Manage Channels** or **Administrator** permission to show categories.');
  }

  if (args.length === 0) {
    return await message.reply('❌ Please specify a category name. Example: `-showcat campus` or `-showcat "CRICVERSE CAMPUS"`');
  }

  const roleTarget = message.mentions.roles.first() || message.guild.roles.everyone;
  const query = args.filter(a => !a.startsWith('<@&')).join(' ').trim().toLowerCase();

  const category = message.guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(query)
  ) as CategoryChannel | undefined;

  if (!category) {
    return await message.reply(`❌ Could not find any category matching \`${query}\`.`);
  }

  try {
    await category.permissionOverwrites.edit(roleTarget.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    let childCount = 0;
    const children = category.children?.cache || [];
    for (const [_, child] of children) {
      await child.permissionOverwrites.edit(roleTarget.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }).catch(() => {});
      childCount++;
    }

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle(`🔓 Category Revealed: ${category.name}`)
      .setDescription(
        `Successfully revealed to **${roleTarget.name}**!\n` +
        `📁 **Channels Unlocked:** \`${childCount} channel(s)\`\n\n` +
        `*All members can now view channels in this category.*`
      )
      .setFooter({ text: 'Apex CricVerse Server Customization' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err: any) {
    await message.reply(`❌ Failed to reveal category: \`${err?.message || err}\``);
  }
}

/**
 * Toggles Campus visibility mode between Spatial MMO (hidden until travel) and Open Campus (all visible)
 * Syntax: -campushide <on|off>
 */
export async function handleCampusHideToggle(message: Message, args: string[]) {
  if (!message.guild || !message.member) return;

  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return await message.reply('❌ Administrator permission required to change Campus visibility mode.');
  }

  const mode = args[0]?.toLowerCase();
  if (mode !== 'on' && mode !== 'off') {
    return await message.reply('❌ Please specify `on` or `off`. Example: `-campushide on` (Spatial Mode) or `-campushide off` (Open Mode).');
  }

  const campusCategory = message.guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('campus')
  ) as CategoryChannel | undefined;

  if (!campusCategory) {
    return await message.reply('❌ Could not find `CRICVERSE CAMPUS` category. Run `-setup` first.');
  }

  const isHidden = mode === 'on';

  try {
    // Set category overwrite
    await campusCategory.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      ViewChannel: !isHidden
    });

    const children = campusCategory.children?.cache || [];
    for (const [_, child] of children) {
      const isNets = child.name.toLowerCase().includes('cricket-nets');
      await child.permissionOverwrites.edit(message.guild.roles.everyone.id, {
        // If hidden mode: only nets is visible by default. If open mode: all are visible.
        ViewChannel: isHidden ? isNets : true,
        SendMessages: isHidden ? isNets : true
      }).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor(isHidden ? '#f59e0b' : '#38bdf8')
      .setTitle(`🧭 Campus Mode Updated: ${isHidden ? 'SPATIAL MMO (Hidden)' : 'OPEN CAMPUS (Visible)'}`)
      .setDescription(
        isHidden
          ? `🔒 **Spatial Travel Mode Activated:**\n` +
            `• Campus facilities are hidden from \`@everyone\`.\n` +
            `• Channels dynamically unlock only when players use **\`-travel <alias>\`**!\n` +
            `• Starting facility (\`#cricket-nets\`) remains open for rookies.`
          : `🔓 **Open Campus Mode Activated:**\n` +
            `• All 7 campus facilities are openly visible to all server members.\n` +
            `• Players can browse all facilities without restriction.`
      )
      .setFooter({ text: 'Toggle anytime with -campushide on / -campushide off' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err: any) {
    await message.reply(`❌ Failed to update campus mode: \`${err?.message || err}\``);
  }
}
