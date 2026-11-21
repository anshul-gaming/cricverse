# 🏏 APEX CRICVERSE: COMPLETE PLAYER CAREER HANDBOOK & MECHANICS MANUAL

Welcome to **Apex CricVerse**, the living multiplayer cricket career simulation on Discord!

You start your career as a grassroots academy rookie dreaming of World Cup and Franchise glory. Starting from the cricket nets, you will travel between campus facilities, train your skills, purchase exotic vehicles to cut travel cooldowns, sign commercial brand deals, engage in 10-second delivery duels, review umpire calls with DRS Hawk-Eye, and rise to become a multi-million-coin international superstar.

---

## 📚 Library Structure
1. **Welcome & Quickstart Guide** (For new players)
2. **Spatial Campus & Travel Navigation** (`-travel`, `-locations`, `-showroom`)
3. **Player Profile & 15 Granular Attributes** (`-profile`, `-setdesc`, `-lb`)
4. **Training, Biometrics & Dynamic Rank-Cost Algorithm** (`-train`, `-sptrain`)
5. **Pro Shop Gear & Daily Scouting Intel** (`-buy`, `-intel`)
6. **Reputation, Brand Endorsements & Wealth Taxes** (`-advert`, `-coaching`, `-meetgreet`, `-chirp`)
7. **Tactical Matches, 10-Second Duels & DRS Hawk-Eye** (`-duel`, `-match`, `-pitchreport`, `-toss`, `-drs`)
8. **Signature Specialization Masteries** (`-masteries`, `-mastery upgrade`)
9. **Franchise League & Mega-Auctions with RTM Cards** (`-auction`, `-bid`, `-rtm`, `-clubs`)
10. **Spectator Fantasy (Dream XI) & Live Odds** (`-fantasy`, `-odds`, `-predict`)
11. **Frequently Asked Questions (FAQ)**

---

## 1. 🚀 Quickstart: "Play the Game" in 4 Steps

1. **Initialize Your Career**:
   Type `-profile` in any channel to create your player card.
2. **Travel to the Cricket Nets**:
   Type `-travel cn` to walk to `#cricket-nets`.
3. **Train to Gain Training Points (TP)**:
   Type `-train` to complete your net practice drill and earn Training Points.
4. **Challenge a Rival to a 10s Duel**:
   Type `-duel @opponent` in `#match-arena` and click your shot buttons!

---

## 2. 🧭 Spatial Campus & Travel Engine

CricVerse features an immersive spatial MMO layout. Channels dynamically reveal themselves only when your character travels to that location:

| Facility Name | Channel | Alias | Primary Activities |
| :--- | :--- | :--- | :--- |
| **The Cricket Nets** | `#cricket-nets` | `cn` | Net training drills (`-train`, `-train vip`, `-train noeffort`) |
| **Sports Science Lab** | `#sports-lab` | `sl` | Attribute development (`-sptrain <attr>`) & masteries |
| **Gear Pavilion** | `#gear-pavilion` | `gp` | Bats, spikes, gloves & energy drinks (`-buy`, `-intel`) |
| **Media & Press Center** | `#press-center` | `pc` | Brand endorsement contracts (`-advert`) |
| **Physio & Cryo Clinic** | `#physio-clinic` | `ps` | Free stamina restoration (`-recovery`) |
| **Local Club Pavilion** | `#club-pavilion` | `cp` | Youth coaching (`-coaching`) & fan autographs (`-meetgreet`) |
| **Luxury Dealership** | `#dealership` | `ld` | Exotic superbikes & supercars (`-showroom`, `-vehiclebuy`) |

### Travel Cooldowns & Vehicles
- Base travel cooldown on foot is **20 minutes**.
- Buying vehicles at the dealership (`#dealership`) permanently slashes cooldowns:
  - 🚲 **City Commuter Scooter**: 15m cooldown (50,000 coins)
  - 🏍️ **Ninja Superbike**: 10m cooldown (250,000 coins)
  - 🏎️ **Audi R8 V10 Sport**: 5m cooldown (1,500,000 coins)
  - 🚀 **Bugatti Chiron Hypercar**: **1m cooldown** (10,000,000 coins)

---

## 3. 👤 Player Profile & 15 Granular Attributes

Your profile card (`-profile`) displays three overall ratings computed from 15 individual attributes (1 to 99):

### Derived Ratings
- 🏏 **BAT (Batting Rating)**: `(Power + Timing + Defense + Running) / 4`
- 🎯 **BOWL (Bowling Rating)**: `(Pace + Swing + Spin + Accuracy) / 4`
- 🧤 **FLD (Fielding Rating)**: `(Catching + Throwing + Agility + Glovework) / 4`

### Attribute Breakdown
- **Batting**: Power (`power`), Timing (`timing`), Defensive Technique (`defensivetech`), Running (`running`).
- **Bowling**: Pace & Seam (`pace`), Swing (`swing`), Spin & Drift (`spin`), Line & Length (`accuracy`).
- **Fielding**: Catching (`catching`), Throwing (`throwing`), Ground Agility (`agility`), Glovework (`glovework`).
- **Physical & Mental**: Composure (`composure`), Fitness (`fitness`), Cricket IQ (`cricketiq`).

---

## 4. 🔬 Training & Dynamic Research Algorithm

- **Net Practice (`-train`)**: Conducted at `#cricket-nets` (30m cooldown). Grants Training Points (TP) and character XP.
- **Biomechanical Lab (`-sptrain <attr>`)**: Conducted at `#sports-lab`. Permanently upgrades an attribute by +1.
- **Dynamic Rank Cost Algorithm**:
  - The server's #1 ranked superstar pays **15 TP** per attribute point.
  - An academy rookie near the bottom of the leaderboard pays only **3 TP**.
  - Naturally balances competition and allows newer players to catch up!
- **Stamina & Recovery (`-recovery`)**: Matches and training consume stamina (100 cap). Visit `#physio-clinic` every 12 hours for a free cryotherapy stamina restore.

---

## 5. 🛍️ Pro Shop Gear & Scouting Intel

Visit `#gear-pavilion` to equip matchday gear:
- 🥤 **Sports Drink (`-buy sd`)**: Restores +50 Stamina instantly (100k coins).
- 🏏 **Pro Willow Bat (`-buy bat`)**: Equips +10 Batting Power for next match (500k coins).
- 👟 **Bowling Spikes (`-buy spikes`)**: Equips +10 Express Pace for next match (500k coins).
- 🧤 **Keeping Gloves (`-buy gloves`)**: Equips +10 Glovework & Catching (500k coins).
- 📋 **Scouting Intel (`-intel`)**: Free daily report on opposition bowling patterns (+1 to +6 random attribute boost).

---

## 6. 📸 Reputation, Brand Deals & Wealth Taxes

- **Brand Deals (`-advert`)**: Sign contracts at `#press-center` with global brands (CEAT, Red Bull, Dream11, MRF) to earn passive coin payouts.
- **Grassroots Coaching (`-coaching`)**: Coach academy rookies at `#club-pavilion` (+50k coins, 2h cooldown).
- **Fan Autographs (`-meetgreet`)**: Sign photos for supporters (+50k followers, 2h cooldown).
- **CricTwit Social Feed (`-chirp <text>`)**: Post tweets in `#crictwit-feed`. Peer reactions alter your fame (👍 +100k fans, 👎 -50k fans).
- **Daily Relevancy Decay**: Inactive players lose 5% of their fan base daily.
- **Progressive Wealth Tax**: 5% daily tax collected on net worth exceeding 1,000,000 coins.

---

## 7. ⚡ Tactical Matches, 10-Second Duels & DRS

### The 10-Second Delivery Mind-Game Duel (`-duel`)
During high-leverage balls, the bowler and batter lock in secret tactical choices:
```
[BOWLER TACTICS]                 [BATTER COUNTERS]
1. 🎯 Pinpoint Yorker            1. 🚁 Helicopter Shot
2. 🚀 Rib-Cage Bouncer           2. 🤿 360° Dilscoop Ramp
3. 🌀 Slower Cutter              3. 💥 Step-Out Loft
4. 📐 Tramline Wide Off          4. 🛡️ Compact Defense
```
- **Yorker vs Helicopter**: 💥 104m SIX!
- **Bouncer vs Loft**: ❌ TOP EDGE & CAUGHT!
- **Slower Cutter vs Loft**: 🔥 BOWLED!
- **Yorker vs Ramp**: 🤿 Audacious scoop over keeper!

### Living Pitches & Night Dew (`-pitchreport`)
- 🌿 **Green Mamba**: Early seam movement and extra bounce (+20% nick chance).
- 🏜️ **Dust Bowl**: Cracked surface with sharp spin turn and drift.
- 🛣️ **Flat Highway**: Batting paradise with lightning outfield (200+ scores).
- 💧 **Night Dew Factor**: Second innings run chases get dew advantage, reducing spin grip.

### DRS Third Umpire Hawk-Eye (`-drs [lbw|edge] [out|notout]`)
Appeals trigger a multi-stage review:
- **UltraEdge Snicko**: Waveform spike check (`━━━━━/\━━━━━`).
- **Hawk-Eye Ball Tracking**: Pitching In-Line, Impact Zone, and Wickets Hitting vs **Umpire's Call**.
- Umpire's Call retains review; incorrect calls lose a review.

### Player of the Match (POTM)
- Matches compute fair impact ratings across runs, strike rates, wickets, economy, and catches.
- The POTM winner receives an automated **+2 permanent upgrade** to a key attribute!

---

## 8. 🌟 Signature Masteries

Unlock and level up signature moves (Level 1 $\to$ 5) with `-masteries` and `-mastery upgrade <move>`:
- **Batting**: `helicopter`, `ramp_360`, `cover_drive`, `switch_hit`.
- **Bowling**: `yorker_150`, `carrom_ball`, `heavy_bouncer`, `knuckle_ball`.

---

## 9. 🏆 Franchise Mega-Auctions & RTM Cards

- Official Franchises (`mm`, `csk`, `rcb`, `kkr`) enter the auction room with purse budgets.
- `-auction start [@player] [base_price]`: Place a star on the block.
- `-bid <club_alias> <coins>`: Compete in live bidding wars.
- **The Right-To-Match (RTM) Card (`-rtm <club_alias>`)**: The player's former franchise can match the winning bid to retain their star!

---

## 10. 🎮 Spectator Fantasy (Dream XI) & Live Odds

- **Fantasy Lineups (`-fantasy create @p1 @p2 @p3`)**: Pick an 11-player squad with 2x Captain and 1.5x Vice-Captain point multipliers.
- **Live Odds (`-odds`)**: In-play win probability and decimal odds updated over-by-over.
- **Coin Predictions (`-predict <team> <coins>`)**: Place bets on live match outcomes and earn payouts!

---

## 11. ❓ Frequently Asked Questions (FAQ)

**Q: How do I earn coins?**
A: Win matches (`-match`), sign brand sponsorships (`-advert`), coach youth players (`-coaching`), or win prediction bets (`-predict`).

**Q: Why are some campus facilities hidden?**
A: CricVerse uses a spatial travel engine. Facilities only reveal themselves when you use `-travel <loc>`.

**Q: How do I reduce travel cooldowns?**
A: Buy a ride at the dealership (`#dealership`) with `-showroom` and `-vehiclebuy <alias>`.

**Q: What is the benefit of Player of the Match (POTM)?**
A: POTM awardees earn permanent +2 attribute upgrades to their character card!
