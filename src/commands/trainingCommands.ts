import { Message } from 'discord.js';
import { executeNetTraining, executeSpecializedTraining } from '../engines/trainingEngine.js';
import { executePhysioRecovery } from '../engines/socialEngine.js';

export async function handleTrainCommand(message: Message, args: string[]) {
  const modeArg = args[0]?.toLowerCase();
  let mode: 'normal' | 'vip' | 'noeffort' = 'normal';
  if (modeArg === 'vip') mode = 'vip';
  if (modeArg === 'noeffort') mode = 'noeffort';

  const result = await executeNetTraining(message.author.id, mode);
  if (result.embed) {
    return await message.reply({ embeds: [result.embed] });
  }
  return await message.reply(result.message);
}

export async function handleSpTrainCommand(message: Message, args: string[]) {
  const targetAttr = args[0];
  if (!targetAttr) {
    return await message.reply(
      '❌ Please specify the attribute to upgrade. Example: `-sptrain power`\n' +
      'Run `-profile` to inspect your current attributes or visit the **Sports Science Lab** (`-travel sl`).'
    );
  }

  const result = await executeSpecializedTraining(message.author.id, targetAttr);
  if (result.embed) {
    return await message.reply({ embeds: [result.embed] });
  }
  return await message.reply(result.message);
}

export async function handleRecoveryCommand(message: Message) {
  const result = await executePhysioRecovery(message.author.id);
  if (result.embed) {
    return await message.reply({ embeds: [result.embed] });
  }
  return await message.reply(result.message);
}
