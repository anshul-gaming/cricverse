# Apex CricVerse 🏏🏆

### The Living Multiplayer Cricket Career Simulation MMORPG for Discord

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Discord.js v14](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

---

## 🌟 Overview

**Apex CricVerse** is a Discord-native living career MMORPG that turns a Discord server into a persistent cricket world. Starting as a grassroots academy rookie, players travel through campus facilities, train at the nets, upgrade 15 individual attributes, buy superbikes and supercars to cut travel cooldowns, sign real-world brand endorsements, engage in interactive 10-second delivery duels, and rise to Franchise and World Cup glory.

CricVerse operates in tandem with **LeagueMaster**, which acts as the governing cricket federation, tournament host, and ESPN Cricinfo media network.

---

## 🧭 The 8 Core Subsystems

```
                                ┌──────────────────────────────────────────────┐
                                │           APEX CRICVERSE UNIVERSE            │
                                └──────────────────────┬───────────────────────┘
                                                       │
         ┌───────────────────┬─────────────────────────┼─────────────────────────┬───────────────────┐
         ▼                   ▼                         ▼                         ▼                   ▼
   1. SPATIAL WORLD    2. 15 ATTRIBUTES         3. STAMINA &             4. SOCIAL MEDIA       5. DELIVERY DUEL
      & CAMPUS            & DERIVED RATINGS        RECOVERY                 & BRANDS              MIND-GAME
   • 7 Locations       • BAT, BOWL, FLD         • 100 Max Cap            • CricTwit chirps     • Yorker vs Scoop
   • Dynamic Perms     • Dynamic Rank Cost      • Physio & Cryo Clinic   • Likes & Trolls      • 10s Secret choices
   • Cooldown Vehicles • 8 Player Archetypes    • Energy Drinks          • Daily Wealth Tax    • Real-time agency
```

### 1. Spatial Campus Navigation (`-travel`)
Channels are hidden and shown dynamically using Discord permission overwrites so each player is physically in one facility at a time:
- 🏏 **The Cricket Nets (`#cricket-nets` / `-travel cn`)**: Net practice sessions (`-train`).
- 🔬 **Sports Science & Biomechanics Lab (`#sports-lab` / `-travel sl`)**: Upgrading attributes (`-sptrain`).
- 🛍️ **Gear Pavilion (`#gear-pavilion` / `-travel gp`)**: Bats, spikes, energy drinks.
- 📸 **Media & Press Center (`#press-center` / `-travel pc`)**: Brand endorsements (`-advert`).
- ❄️ **Physio & Cryo Clinic (`#physio-clinic` / `-travel ps`)**: Free stamina recovery (`-recovery`).
- 🏟️ **Local Club Pavilion (`#club-pavilion` / `-travel cp`)**: Coaching & fan signing.
- 🏎️ **Luxury Dealership (`#dealership` / `-travel ld`)**: Exotic rides slashing cooldowns from 20m down to 1m.

### 2. 15 Granular Attributes & Dynamic Ranking Costs
- **Batting**: Power (`PWR`), Timing (`TIM`), Defensive Tech (`DEF`), Running (`RUN`).
- **Bowling**: Pace & Seam (`PAC`), Swing (`SWG`), Spin & Drift (`SPN`), Line & Length (`ACC`).
- **Fielding**: Catching (`CAT`), Throwing (`THR`), Ground Agility (`AGI`), Glovework (`GLV`).
- **Mental/Physical**: Composure (`CMP`), Stamina (`STA`), Cricket IQ (`IQ`).
- **Dynamic Research Algorithm**: The server's lowest rated player pays only 3 TP to upgrade, while the #1 superstar pays 15 TP, naturally balancing competition.

### 3. Active Delivery Mind-Game Duels
During high-leverage deliveries, bowlers and batsmen engage in a **10-second secret duel**:
- **Bowler**: Yorker, Bouncer, Slower Cutter, Wide Tramline.
- **Batter**: Step-Out Loft, Helicopter Shot, Compact Defense, 360° Dilscoop.

### 4. Social Media Sim ("CricTwit"), Endorsements & Wealth Taxes
- Post chirps with `-chirp <text>`: Peer reactions alter follower counts (👍 $+100\text{k}$ fans, 👎 $-50\text{k}$ fans).
- Overnight relevancy decay: Inactive players lose 5% of their followers daily.
- Progressive wealth tax: 5% daily tax collected on wealth exceeding 1,000,000 coins.

---

## 📋 Command Matrix

| Category | Command | Description | Location / Permission |
| :--- | :--- | :--- | :--- |
| **Profile** | `-profile [@user]` | View player card, BAT/BOWL/FLD ratings & 15 attributes | Everywhere |
| | `-setdesc <text>` | Set personal profile bio (max 100 chars) | Everywhere |
| | `-lb [category]` | Leaderboards (runs, wickets, coins, fans, TP) | Everywhere |
| **Travel** | `-locations` | List all 7 campus facilities & active position | Everywhere |
| | `-travel <alias>` | Travel between locations (`cn`, `sl`, `gp`, `pc`, `ps`, `cp`, `ld`) | Everywhere |
| | `-showroom` | Inspect exotic vehicles and cooldown reductions | Everywhere |
| | `-vehiclebuy <alias>` | Purchase a superbike or supercar | Dealership (`#dealership`) |
| **Training** | `-train [vip\|noeffort]` | Net training session for Training Points | Nets (`#cricket-nets`) |
| | `-sptrain <attr>` | Biomechanical attribute upgrade (dynamic TP cost) | Sports Lab (`#sports-lab`) |
| | `-recovery` | Free stamina restoration (12h cooldown) | Physio Clinic (`#physio-clinic`) |
| **Economy** | `-advert [deal]` | Sign brand endorsements (CEAT, Red Bull, Dream11, MRF) | Press Center (`#press-center`) |
| | `-coaching` | Coach academy rookies (+50k coins, 2h cooldown) | Club Pavilion (`#club-pavilion`) |
| | `-meetgreet` | Autograph signing session (+50k fans, 2h cooldown) | Club Pavilion (`#club-pavilion`) |
| | `-chirp <text>` | Post a message on CricTwit for peer reactions | Everywhere |
| **Matches & DRS** | `-duel [@user]` | 10-second delivery mind-game duel with interactive buttons | Everywhere |
| | `-match [t5\|t10]` | Live over-by-over match with RHB/LHB synergy & Cricinfo news recap | Everywhere |
| | `-pitchreport [type]` | Inspect pitch moisture, cracks, and dew forecast | Everywhere |
| | `-toss <heads\|tails>` | Matchday coin flip for batting or bowling first | Everywhere |
| | `-drs [lbw\|edge] [call]` | Third Umpire Hawk-Eye & UltraEdge Snicko decision review | Everywhere |
| **Masteries** | `-masteries` | View unlocked batting & bowling signature techniques | Everywhere |
| | `-mastery upgrade <move>` | Spend TP & coins to upgrade signature moves (Lvl 1 to 5) | Everywhere |
| **Mega Auction** | `-auction [start\|status]` | Enter the live auction room or put a player on the gavel | Everywhere |
| | `-bid <club_alias> <coins>` | Place a franchise bid on the active player lot | Everywhere |
| | `-rtm <club_alias>` | Exercise Right-to-Match card to match winning bid and keep player | Everywhere |
| | `-clubs` | View official franchise clubs, budgets, and rosters | Everywhere |
| **Spectator Fantasy** | `-fantasy [create\|lb]` | Build Dream XI fantasy lineup with 2x captain / 1.5x vice-captain | Everywhere |
| | `-odds [home] [away]` | View live in-play win probabilities and bookmaker odds | Everywhere |
| | `-predict <team> <coins>` | Place prediction bets on match outcomes | Everywhere |
| **DevOps** | `-gitpull [branch]` | Hot pull with auto-compilation test & zero-downtime rollback | Bot Owner |
| | `-gitpullback` | Emergency one-command rollback to previous working commit | Bot Owner |

---

## 🛠️ Quick Start & Setup

### Prerequisites
- Node.js 20+
- PostgreSQL Database
- pnpm package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/anshul-gaming/cricverse.git
cd cricverse

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and DATABASE_URL

# Generate Prisma Client & Push Schema
pnpm prisma generate
pnpm prisma db push

# Start in development mode
pnpm dev

# Build and start in production
pnpm build
pnpm start
```
