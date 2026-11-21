import { EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { ATTRIBUTE_LIST } from '../config/constants.js';

export interface TrainingResult {
  success: boolean;
  message: string;
  embed?: EmbedBuilder;
}

/**
 * Calculates dynamic Training Point (TP) cost based on server attribute ranking
 */
export async function calculateDynamicTpCost(attributeCode: string, playerVal: number): Promise<number> {
  const allValues = await prisma.player.findMany({
    select: { [attributeCode]: true }
  });

  if (allValues.length <= 1) return 3;

  const vals = allValues.map((p: any) => p[attributeCode] as number).sort((a, b) => a - b);
  const minVal = vals[0];
  const maxVal = vals[vals.length - 1];

  if (maxVal === minVal) return 3;

  const ratio = (playerVal - minVal) / (maxVal - minVal);
  const cost = 3 + Math.floor(ratio * 12);
  return Math.max(3, Math.min(15, cost));
}

/**
 * Handles regular nets training session (-train)
 */
export async function executeNetTraining(
  playerId: string,
  mode: 'normal' | 'vip' | 'noeffort' = 'normal'
): Promise<TrainingResult> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return { success: false, message: '❌ Player profile not found. Run `-profile` to register.' };
  }

  if (player.currentLocation !== 'cn') {
    return { success: false, message: '❌ You must be at **🏏 The Cricket Nets** (`-travel cn`) to train!' };
  }

  const now = new Date();

  if (mode === 'vip') {
    if (player.vipTier < 1) {
      return { success: false, message: '⭐ **VIP Training** is reserved for VIP members (Boosters/Referrals/Donors).' };
    }
    if (player.lastTrainedAt && (now.getTime() - player.lastTrainedAt.getTime()) < 6 * 60 * 60 * 1000) {
      const waitMins = Math.ceil((6 * 60 * 60 * 1000 - (now.getTime() - player.lastTrainedAt.getTime())) / 60000);
      return { success: false, message: `⏳ VIP Training on cooldown. Ready in **${waitMins} minutes**.` };
    }

    const tpGained = 6;
    await prisma.player.update({
      where: { id: playerId },
      data: {
        trainingPoints: { increment: tpGained },
        lastTrainedAt: now
      }
    });

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('⭐ High-Performance VIP Training Complete!')
      .setDescription(`Intensive net session with master coaches.\n\n✨ **+${tpGained} Training Points (TP)** earned!\nTotal TP: **${player.trainingPoints + tpGained}**`)
      .setTimestamp();

    return { success: true, message: 'Training complete!', embed };
  }

  // Normal training (30-min cooldown)
  if (player.lastTrainedAt && (now.getTime() - player.lastTrainedAt.getTime()) < 30 * 60 * 1000) {
    const waitMins = Math.ceil((30 * 60 * 1000 - (now.getTime() - player.lastTrainedAt.getTime())) / 60000);
    return { success: false, message: `⏳ Nets are busy! Rest up and return in **${waitMins} minutes**.` };
  }

  const tpGained = Math.floor(Math.random() * 2) + 1; // 1 to 2 TP
  await prisma.player.update({
    where: { id: playerId },
    data: {
      trainingPoints: { increment: tpGained },
      lastTrainedAt: now
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('🏏 Net Training Session Complete!')
    .setDescription(`You faced 100 throwdowns and bowled 6 quality overs.\n\n✨ **+${tpGained} Training Point(s)** earned!\nTotal TP: **${player.trainingPoints + tpGained}**`)
    .setFooter({ text: 'Next training session ready in 30 minutes' })
    .setTimestamp();

  return { success: true, message: 'Training complete!', embed };
}

/**
 * Executes scientific attribute development at the Sports Science Lab (-sptrain <attr>)
 */
export async function executeSpecializedTraining(
  playerId: string,
  targetAttrCode: string
): Promise<TrainingResult> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return { success: false, message: '❌ Player profile not found. Run `-profile` to register.' };
  }

  if (player.currentLocation !== 'sl') {
    return { success: false, message: '❌ You must travel to the **🔬 Sports Science & Biomechanics Lab** (`-travel sl`) to upgrade attributes!' };
  }

  const attrMeta = ATTRIBUTE_LIST.find(a => a.code.toLowerCase() === targetAttrCode.toLowerCase());
  if (!attrMeta) {
    const validCodes = ATTRIBUTE_LIST.map(a => `\`${a.code}\` — ${a.label}`).join('\n');
    return {
      success: false,
      message: `❌ Invalid attribute code \`${targetAttrCode}\`.\n\n**Available Attributes:**\n${validCodes}`
    };
  }

  const currentVal = (player as any)[attrMeta.code] as number;
  if (currentVal >= 99) {
    return { success: false, message: `🏆 **${attrMeta.label}** is already at the maximum rating of **99**!` };
  }

  // Stamina Check
  if (player.stamina < 50) {
    return {
      success: false,
      message: `⚠️ **Insufficient Stamina:** Attribute development requires **50 Stamina** (You have ${player.stamina}/100).\nVisit the **Physio Clinic** (\`-travel ps\` $\\to$ \`-recovery\`) or buy an energy drink!`
    };
  }

  // Dynamic TP Cost
  const tpCost = await calculateDynamicTpCost(attrMeta.code, currentVal);
  if (player.trainingPoints < tpCost) {
    return {
      success: false,
      message: `❌ **Insufficient Training Points:** Upgrading **${attrMeta.label}** from **${currentVal}** costs **${tpCost} TP** based on server rankings (You have ${player.trainingPoints} TP).\nHit the nets (\`-travel cn\` $\\to$ \`-train\`) to earn more TP!`
    };
  }

  // Apply upgrade
  const newVal = currentVal + 1;
  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      [attrMeta.code]: newVal,
      stamina: { decrement: 50 },
      trainingPoints: { decrement: tpCost }
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#9b59b6')
    .setTitle(`🔬 Biomechanical Upgrade: ${attrMeta.label}`)
    .setDescription(`Precision kinematic tuning was successful!\n\n📈 **${attrMeta.label}:** \`${currentVal}\` ➔ **\`${newVal}\`** *(+1)*`)
    .addFields(
      { name: 'Training Points Spent', value: `\`-${tpCost} TP\` (Remaining: ${updatedPlayer.trainingPoints})`, inline: true },
      { name: 'Stamina Spent', value: `\`-50 ⚡\` (Remaining: ${updatedPlayer.stamina}/100)`, inline: true }
    )
    .setFooter({ text: 'Apex CricVerse Biomechanics Lab' })
    .setTimestamp();

  return { success: true, message: 'Upgrade complete!', embed };
}
