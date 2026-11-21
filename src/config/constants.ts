export interface LocationDef {
  id: string;
  name: string;
  alias: string;
  channelName: string;
  emoji: string;
  description: string;
  activities: string[];
}

export const CAMPUS_LOCATIONS: Record<string, LocationDef> = {
  cn: {
    id: 'cn',
    name: 'The Cricket Nets',
    alias: 'cn',
    channelName: 'cricket-nets',
    emoji: '🏏',
    description: 'High-intensity batting and bowling training nets with automated bowling machines.',
    activities: ['-train (Gain Training Points)', '-train vip', '-train noeffort']
  },
  sl: {
    id: 'sl',
    name: 'Sports Science & Biomechanics Lab',
    alias: 'sl',
    channelName: 'sports-lab',
    emoji: '🔬',
    description: 'State-of-the-art facility for permanently developing attributes and unlocking signature masteries.',
    activities: ['-sptrain <attr> (Upgrade attribute with TP)', '-convert <archetype>', '-mastery <move>']
  },
  gp: {
    id: 'gp',
    name: 'Gear Pavilion & Pro Shop',
    alias: 'gp',
    channelName: 'gear-pavilion',
    emoji: '🛍️',
    description: 'Purchase matchday willow bats, bowling spikes, keeping gloves, and energy drinks.',
    activities: ['-buy sd (Sports Drink: +50 Stamina)', '-buy bat (+10 Batting Power)', '-buy spikes (+10 Bowling Pace)', '-buy gloves (+10 Keeping)']
  },
  pc: {
    id: 'pc',
    name: 'Media & Sponsorship Hub',
    alias: 'pc',
    channelName: 'press-center',
    emoji: '📸',
    description: 'Sign lucrative brand endorsements, hold press conferences, and review follower trends.',
    activities: ['-advert (Sign brand deals: CEAT, Red Bull, Dream11, MRF)', '-press (Post official team press release)']
  },
  ps: {
    id: 'ps',
    name: 'Physio & Cryo Clinic',
    alias: 'ps',
    channelName: 'physio-clinic',
    emoji: '❄️',
    description: 'Ice baths and physiotherapy sessions to completely restore stamina and treat minor injuries.',
    activities: ['-recovery (Free stamina restore, 12h cooldown)']
  },
  cp: {
    id: 'cp',
    name: 'Local Club Pavilion',
    alias: 'cp',
    channelName: 'club-pavilion',
    emoji: '🏟️',
    description: 'Grassroots community ground to earn match fees through youth coaching and autograph sessions.',
    activities: ['-coaching (+50k coins, 2h cooldown)', '-meetgreet (+50k followers, 2h cooldown)']
  },
  ld: {
    id: 'ld',
    name: 'Luxury Motor Dealership',
    alias: 'ld',
    channelName: 'dealership',
    emoji: '🏎️',
    description: 'Purchase superbikes and exotic supercars to dramatically reduce campus travel cooldowns.',
    activities: ['-showroom (Inspect available vehicles)', '-vehiclebuy <alias>']
  }
};

export interface VehicleDef {
  key: string;
  name: string;
  cost: bigint;
  cooldownMinutes: number;
  emoji: string;
}

export const VEHICLE_CATALOG: VehicleDef[] = [
  { key: 'royal_enfield', name: 'Royal Enfield Classic 350', cost: 700000n, cooldownMinutes: 16, emoji: '🏍️' },
  { key: 'thar', name: 'Mahindra Thar 4x4', cost: 1000000n, cooldownMinutes: 14, emoji: '🚙' },
  { key: 'fortuner', name: 'Toyota Fortuner GR-S', cost: 3000000n, cooldownMinutes: 10, emoji: '🚗' },
  { key: 'm4', name: 'BMW M4 Competition', cost: 5350000n, cooldownMinutes: 7, emoji: '🏎️' },
  { key: 'gt3', name: 'Porsche 911 GT3 RS', cost: 6750000n, cooldownMinutes: 4, emoji: '🏎️' },
  { key: 'urus', name: 'Lamborghini Urus Performante', cost: 8400000n, cooldownMinutes: 3, emoji: '🏎️' },
  { key: 'phantom', name: 'Rolls Royce Phantom Series II', cost: 10250000n, cooldownMinutes: 2, emoji: '🚘' },
  { key: 'sf90', name: 'Ferrari SF90 Stradale', cost: 17700000n, cooldownMinutes: 1, emoji: '⚡' },
  { key: 'chiron', name: 'Bugatti Chiron Super Sport', cost: 20500000n, cooldownMinutes: 1, emoji: '👑' }
];

export interface EndorsementDef {
  key: string;
  name: string;
  minFollowers: bigint;
  staminaCost: number;
  coinsEarned: bigint;
  followerChange: bigint;
  emoji: string;
}

export const ENDORSEMENTS: EndorsementDef[] = [
  { key: 'ceat', name: 'CEAT Bat Endorsement', minFollowers: 100000n, staminaCost: 5, coinsEarned: 100000n, followerChange: -50000n, emoji: '🏏' },
  { key: 'redbull', name: 'Red Bull Athlete', minFollowers: 1000000n, staminaCost: 10, coinsEarned: 200000n, followerChange: 0n, emoji: '🥤' },
  { key: 'dream11', name: 'Dream11 Brand Ambassador', minFollowers: 5000000n, staminaCost: 10, coinsEarned: 300000n, followerChange: -200000n, emoji: '🎲' },
  { key: 'mrf', name: 'MRF Master Blaster', minFollowers: 6000000n, staminaCost: 30, coinsEarned: 300000n, followerChange: 50000n, emoji: '🌟' }
];

export const ATTRIBUTE_LIST = [
  { code: 'power', label: 'Power (PWR)', category: 'Batting' },
  { code: 'timing', label: 'Timing (TIM)', category: 'Batting' },
  { code: 'defensiveTech', label: 'Defensive Tech (DEF)', category: 'Batting' },
  { code: 'running', label: 'Running (RUN)', category: 'Batting' },
  { code: 'pace', label: 'Pace & Seam (PAC)', category: 'Bowling' },
  { code: 'swing', label: 'Swing & Movement (SWG)', category: 'Bowling' },
  { code: 'spin', label: 'Spin & Drift (SPN)', category: 'Bowling' },
  { code: 'accuracy', label: 'Line & Length (ACC)', category: 'Bowling' },
  { code: 'catching', label: 'Catching (CAT)', category: 'Fielding' },
  { code: 'throwing', label: 'Throwing Arm (THR)', category: 'Fielding' },
  { code: 'agility', label: 'Ground Agility (AGI)', category: 'Fielding' },
  { code: 'glovework', label: 'Glovework (GLV)', category: 'Fielding' },
  { code: 'composure', label: 'Composure (CMP)', category: 'Mental' },
  { code: 'fitness', label: 'Stamina & Fitness (STA)', category: 'Physical' },
  { code: 'cricketIq', label: 'Cricket IQ (IQ)', category: 'Mental' }
] as const;

export const BASE_TRAVEL_COOLDOWN_MINUTES = 20;
export const WEALTH_TAX_THRESHOLD = 1000000n; // 1M coins
export const WEALTH_TAX_PERCENTAGE = 0.05; // 5% daily
export const RELEVANCY_DECAY_PERCENTAGE = 0.05; // 5% daily
