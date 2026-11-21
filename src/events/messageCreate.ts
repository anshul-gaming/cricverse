import { Message } from 'discord.js';
import { handleProfileCommand, handleSetDescCommand, handleLeaderboardCommand } from '../commands/playerCommands.js';
import { handleTravelCommand, handleLocationsCommand, handleShowroomCommand, handleVehicleBuyCommand } from '../commands/travelCommands.js';
import { handleTrainCommand, handleSpTrainCommand, handleRecoveryCommand } from '../commands/trainingCommands.js';
import { handleAdvertCommand, handleCoachingCommand, handleMeetGreetCommand, handleChirpCommand } from '../commands/socialCommands.js';
import { handleDuelCommand, handleMatchCommand, handlePitchReportCommand, handleTossCommand, handleDrsCommand } from '../commands/matchCommands.js';
import { handleMasteryCommand } from '../commands/masteryCommands.js';
import { handleBuyCommand, handleIntelCommand } from '../commands/marketCommands.js';
import { handleAuctionCommand, handleBidCommand, handleRtmCommand, handleClubsCommand } from '../commands/auctionCommands.js';
import { handleFantasyCommand, handleOddsCommand, handlePredictCommand } from '../commands/fantasyCommands.js';
import { handleSetupCommand } from '../commands/setupCommand.js';
import { handleHelpCommand } from '../commands/helpCommand.js';
import { handleCricVerseGitPull, handleCricVerseGitPullBack } from '../services/gitService.js';
import { logger } from '../utils/logger.js';

const PREFIX = '-';

export async function onMessageCreate(message: Message) {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith(PREFIX)) return;

  const args = content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();
  if (!cmd) return;

  try {
    switch (cmd) {
      // Profile & Leaderboards
      case 'profile':
      case 'p':
        await handleProfileCommand(message, args);
        break;
      case 'setdesc':
      case 'bio':
        await handleSetDescCommand(message, args);
        break;
      case 'lb':
      case 'leaderboard':
        await handleLeaderboardCommand(message, args);
        break;

      // Spatial Campus & Travel
      case 'locations':
      case 'locs':
        await handleLocationsCommand(message);
        break;
      case 'travel':
      case 't':
        await handleTravelCommand(message, args);
        break;
      case 'showroom':
      case 'vs':
      case 'dealership':
        await handleShowroomCommand(message);
        break;
      case 'vehiclebuy':
      case 'buycar':
        await handleVehicleBuyCommand(message, args);
        break;

      // Training & Biometrics Lab
      case 'train':
        await handleTrainCommand(message, args);
        break;
      case 'sptrain':
        await handleSpTrainCommand(message, args);
        break;
      case 'recovery':
      case 'physio':
        await handleRecoveryCommand(message);
        break;

      // Pro Shop & Matchday Equipment
      case 'buy':
      case 'shop':
        await handleBuyCommand(message, args);
        break;
      case 'intel':
      case 'scout':
        await handleIntelCommand(message);
        break;

      // Matches & Delivery Mind-Game Duels
      case 'duel':
      case 'ball':
        await handleDuelCommand(message);
        break;
      case 'match':
      case 'play':
        await handleMatchCommand(message, args);
        break;
      case 'pitchreport':
      case 'pitch':
        await handlePitchReportCommand(message, args);
        break;
      case 'toss':
      case 'coin':
        await handleTossCommand(message, args);
        break;
      case 'drs':
      case 'review':
        await handleDrsCommand(message, args);
        break;

      // Specialization Trees & Signature Masteries
      case 'masteries':
      case 'mastery':
        await handleMasteryCommand(message, args);
        break;

      // Franchise Mega Auctions & RTM Cards
      case 'auction':
        await handleAuctionCommand(message, args);
        break;
      case 'bid':
        await handleBidCommand(message, args);
        break;
      case 'rtm':
        await handleRtmCommand(message, args);
        break;
      case 'clubs':
      case 'franchises':
        await handleClubsCommand(message);
        break;

      // Spectator Fantasy & Live Odds
      case 'fantasy':
      case 'f':
        await handleFantasyCommand(message, args);
        break;
      case 'odds':
        await handleOddsCommand(message, args);
        break;
      case 'predict':
      case 'bet':
        await handlePredictCommand(message, args);
        break;

      // Social Media & Economics
      case 'advert':
      case 'sponsor':
        await handleAdvertCommand(message, args);
        break;
      case 'coaching':
      case 'coach':
        await handleCoachingCommand(message);
        break;
      case 'meetgreet':
      case 'mg':
        await handleMeetGreetCommand(message);
        break;
      case 'chirp':
      case 'tweet':
        await handleChirpCommand(message, args);
        break;

      // Help & Server Setup
      case 'setup':
      case 'setupcampus':
      case 'serversetup':
        await handleSetupCommand(message);
        break;
      case 'help':
      case 'commands':
        await handleHelpCommand(message);
        break;

      // DevOps Hot-Reload
      case 'gitpull':
      case 'pull':
        await handleCricVerseGitPull(message, args);
        break;
      case 'gitpullback':
      case 'rollback':
        await handleCricVerseGitPullBack(message);
        break;

      default:
        break;
    }
  } catch (error) {
    logger.error({ error, cmd }, 'Error executing CricVerse command');
    await message.reply('❌ An unexpected error occurred while executing this command.').catch(() => {});
  }
}
