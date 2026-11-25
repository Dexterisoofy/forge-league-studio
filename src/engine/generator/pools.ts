import type { BudgetTier, PlayerPosition, PlaystyleArchetype } from '../../types';

/**
 * 96 distinct cities & regions so 64+ team competitions never exhaust unique cities.
 */
export const CITIES: string[] = [
  'Apex', 'Ashford', 'Astoria', 'Avalon', 'Bayside', 'Blackstone', 'Boulder', 'Brighton',
  'Cascade', 'Cedar', 'Cinder', 'Clearwater', 'Cobalt', 'Copperfield', 'Crestwood', 'Crimson',
  'Dalton', 'Duskwood', 'Easton', 'Eldorado', 'Evergreen', 'Fairhaven', 'Falkirk', 'Frostford',
  'Garrison', 'Glacier', 'Glenwood', 'Goldcrest', 'Granite', 'Halcyon', 'Harborview', 'Highland',
  'Ironwood', 'Kingsport', 'Lakewood', 'Lochhaven', 'Mercer', 'Metro', 'Midvale', 'Montclair',
  'Northgate', 'Oakridge', 'Oceanside', 'Olympia', 'Onyx', 'Palisade', 'Pinecrest', 'Portsmouth',
  'Ravenna', 'Redwood', 'Riverdale', 'Rockwell', 'Silverton', 'Solstice', 'Southport', 'Starfall',
  'Stonebridge', 'Suncrest', 'Timberline', 'Valhalla', 'Vanguard', 'Westbrook', 'Windmere', 'Yorktown',
  'Alderbrook', 'Arden', 'Belmont', 'Birchwood', 'Bracken', 'Bridgewater', 'Brookhaven', 'Calder',
  'Camden', 'Carlisle', 'Castlegate', 'Chatham', 'Clairmont', 'Coventry', 'Crestfall', 'Crownpoint',
  'Davenport', 'Dunmore', 'Edgewater', 'Elmsworth', 'Fairfield', 'Fenwick', 'Foxborough', 'Galway',
  'Greenfield', 'Harrow', 'Hartford', 'Hawthorne', 'Kensington', 'Lancaster', 'Marlow', 'Waverly',
];

/**
 * Thematic mascot names mapped to centerpiece icons across all 5 categories.
 */
export const MASCOTS_BY_ICON: Record<string, string[]> = {
  // Predators & Mammals
  wolf: ['Timberwolves', 'Direwolves', 'Pack', 'Fang', 'Howlers'],
  lion: ['Lions', 'Pride', 'Monarchs', 'Regals', 'Manes'],
  bear: ['Grizzlies', 'Kodiaks', 'Ursines', 'Bruins', 'Maulers'],
  tiger: ['Tigers', 'Sabers', 'Bengal', 'Stripes', 'Prowlers'],
  panther: ['Panthers', 'Shadowcats', 'Pumas', 'Cougars', 'Stalkers'],
  bull: ['Bulls', 'Stampede', 'Minotaurs', 'Horns', 'Chargers'],
  ram: ['Rams', 'Bighorns', 'Cragrunners', 'Batterers', 'Horned'],
  shark: ['Sharks', 'Makos', 'Riptide', 'Hammerheads', 'Tigersharks'],
  rhino: ['Rhinos', 'Armors', 'Stampede', 'Battering', 'Juggernauts'],
  gorilla: ['Gorillas', 'Silverbacks', 'Titans', 'Kong', 'Brawn'],
  fox: ['Foxes', 'Redtails', 'Sly', 'Vixens', 'Swiftfox'],
  coyote: ['Coyotes', 'Packrunners', 'Brushwolves', 'Desert Dogs', 'Howlers'],
  'wild-boar': ['Boars', 'Tusks', 'Razorbacks', 'Hogs', 'Chargers'],
  mustang: ['Mustangs', 'Broncos', 'Stallions', 'Wildhorses', 'Gallop'],
  stag: ['Stags', 'Antlers', 'Harts', 'Bucks', 'Monarchs'],
  'honey-badger': ['Badgers', 'Fearless', 'Claws', 'Rascals', 'Wreckers'],
  wolverine: ['Wolverines', 'Claw', 'Fury', 'Northmen', 'Slashers'],
  cheetah: ['Cheetahs', 'Sprint', 'Velocity', 'Dash', 'Flash'],
  jaguar: ['Jaguars', 'Spots', 'Jungle Cats', 'Apex', 'Prowl'],
  bison: ['Bison', 'Buffalo', 'Plainsmen', 'Herd', 'Thundering'],
  mammoth: ['Mammoths', 'Woollies', 'Ice Giants', 'Tuskers', 'Glaciers'],
  orca: ['Orcas', 'Seawolves', 'Breakers', 'Tides', 'Pod'],
  'polar-bear': ['Polar Bears', 'Icebears', 'Frost', 'Glaciers', 'Tundra'],
  hyena: ['Hyenas', 'Cacklers', 'Scavengers', 'Pack', 'Savanna'],
  lynx: ['Lynx', 'Bobcats', 'Wildcats', 'Tufts', 'Stalkers'],
  elk: ['Elks', 'Wapiti', 'Timber', 'Stags', 'Rangers'],
  cougar: ['Cougars', 'Mountain Lions', 'Pumas', 'Catamounts', 'Peaks'],
  hound: ['Hounds', 'Bloodhounds', 'Trackers', 'Mastiffs', 'Watchdogs'],
  leopard: ['Leopards', 'Snowcats', 'Spotted', 'Prowlers', 'Hunters'],
  walrus: ['Walruses', 'Tuskers', 'Icebreakers', 'Arctic', 'Flukes'],

  // Birds & Reptiles
  eagle: ['Eagles', 'Condors', 'Ospreys', 'Skyhawks', 'Wings'],
  falcon: ['Falcons', 'Kestrels', 'Peregrines', 'Merlins', 'Dive'],
  owl: ['Owls', 'Nightwatch', 'Barn Owls', 'Specters', 'Hoot'],
  raven: ['Ravens', 'Crows', 'Corvids', 'Rooks', 'Shadowwings'],
  phoenix: ['Phoenix', 'Firebirds', 'Solaris', 'Ashborn', 'Risen'],
  cobra: ['Cobras', 'Serpents', 'Sidewinders', 'Hoods', 'Fang'],
  scorpion: ['Scorpions', 'Stingers', 'Dunes', 'Arachnids', 'Venom'],
  dragon: ['Dragons', 'Wyverns', 'Drakes', 'Firebreathers', 'Scale'],
  griffin: ['Griffins', 'Gryphons', 'Skyguards', 'Talons', 'Sentinels'],
  hawk: ['Hawks', 'Redhawks', 'Warhawks', 'Nighthawks', 'Talons'],
  osprey: ['Ospreys', 'Seahawks', 'Divehawks', 'Skimmers', 'Harborhawks'],
  condor: ['Condors', 'Skykings', 'Andeans', 'Soarers', 'Gliders'],
  vulture: ['Vultures', 'Buzzards', 'Carrion', 'Circlers', 'Scavengers'],
  pelican: ['Pelicans', 'Baybirds', 'Coastals', 'Scoopers', 'Gulls'],
  swan: ['Swans', 'Cygnets', 'Lakewings', 'Royals', 'Gliders'],
  rooster: ['Roosters', 'Gamecocks', 'Spurs', 'Bantams', 'Chanticleers'],
  viper: ['Vipers', 'Adders', 'Asps', 'Rattlers', 'Strike'],
  gator: ['Gators', 'Crocodiles', 'Swampmen', 'Snappers', 'Bayou'],
  komodo: ['Komodos', 'Monitors', 'Lizards', 'Scales', 'Drakes'],
  hornet: ['Hornets', 'Yellowjackets', 'Swarm', 'Stingers', 'Buzz'],
  wasp: ['Wasps', 'Stingers', 'Swarmers', 'Hornets', 'Darts'],
  mantis: ['Mantis', 'Stalkers', 'Blades', 'Ambush', 'Locusts'],
  tarantula: ['Spiders', 'Tarantulas', 'Webs', 'Widows', 'Crawlers'],
  chameleon: ['Chameleons', 'Shifters', 'Geckos', 'Iguanas', 'Prism'],
  rattlesnake: ['Rattlers', 'Sidewinders', 'Diamondbacks', 'Pit Vipers', 'Coils'],
  thunderbird: ['Thunderbirds', 'Stormwings', 'Skybolts', 'Tempest', 'Roc'],
  pterodactyl: ['Pterodactyls', 'Skyclaws', 'Raptors', 'Prehistorics', 'Wings'],
  kraken: ['Kraken', 'Leviathans', 'Tentacles', 'Abyssals', 'Squids'],

  // Mythic, Sci-Fi & Power
  'knight-helm': ['Knights', 'Paladins', 'Crusaders', 'Templars', 'Cavaliers'],
  spartan: ['Spartans', 'Hoplites', 'Phalanx', 'Titans', 'Gladiators'],
  viking: ['Vikings', 'Raiders', 'Norsemen', 'Berserkers', 'Longships'],
  titan: ['Titans', 'Colossi', 'Giants', 'Atlas', 'Juggernauts'],
  wizard: ['Wizards', 'Sorcerers', 'Mages', 'Arcane', 'Mystics'],
  reaper: ['Reapers', 'Grim', 'Phantoms', 'Scythes', 'Wraiths'],
  robot: ['Robots', 'Mechs', 'Automata', 'Bots', 'Droids'],
  rocket: ['Rockets', 'Boosters', 'Astronauts', 'Orbital', 'Launch'],
  ufo: ['Invaders', 'Saucers', 'Aliens', 'Cosmo', 'Martians'],
  skull: ['Skulls', 'Bones', 'Pirates', 'Rebels', 'Outlaws'],
  valkyrie: ['Valkyries', 'Shieldmaidens', 'Winged', 'Asgard', 'Vanguard'],
  samurai: ['Samurai', 'Ronin', 'Shogun', 'Blades', 'Bushido'],
  ninja: ['Ninjas', 'Shinobi', 'Shadows', 'Assassins', 'Stealth'],
  centurion: ['Centurions', 'Legions', 'Romans', 'Praetorians', 'Tribunes'],
  minotaur: ['Minotaurs', 'Labyrinth', 'Horned', 'Beasts', 'Chargers'],
  pegasus: ['Pegasus', 'Winged Steeds', 'Skyhorses', 'Stallions', 'Flyers'],
  cerberus: ['Cerberus', 'Hellhounds', 'Three-Heads', 'Guardians', 'Hounds'],
  golem: ['Golems', 'Stoneguards', 'Monoliths', 'Basalt', 'Crags'],
  cyborg: ['Cyborgs', 'Bionics', 'Synthetics', 'Nexus', 'Androids'],
  astronaut: ['Cosmonauts', 'Astronauts', 'Voyagers', 'Spacemen', 'Pioneers'],
  'mech-head': ['Mechs', 'Gundams', 'Titans', 'Exos', 'Sentinels'],
  alien: ['Extraterrestrials', 'Xenomorphs', 'Martians', 'Stars', 'Visitors'],
  phantom: ['Phantoms', 'Ghosts', 'Specters', 'Apparitions', 'Haunts'],
  gladiator: ['Gladiators', 'Arena', 'Champions', 'Duelists', 'Coliseum'],
  jester: ['Jesters', 'Jokers', 'Wildcards', 'Mavericks', 'Harlequins'],
  'oni-mask': ['Oni', 'Demons', 'Warlords', 'Fierce', 'Mask'],

  // Objects, Elements & Weapons
  crown: ['Royals', 'Sovereigns', 'Crowns', 'Emperors', 'Barons'],
  'crossed-swords': ['Blades', 'Sabres', 'Duelists', 'Lancers', 'Vanguard'],
  trident: ['Tridents', 'Mariners', 'Tide', 'Neptunes', 'Corsairs'],
  anchor: ['Anchors', 'Admirals', 'Harbormen', 'Fleet', 'Seafarers'],
  lightning: ['Lightning', 'Thunderbolts', 'Surge', 'Volts', 'Sparks'],
  flame: ['Inferno', 'Blaze', 'Flames', 'Embers', 'Pyre'],
  'comet-star': ['Comets', 'Novas', 'Meteors', 'Astrals', 'Starlight'],
  'mountain-peak': ['Summits', 'Peaks', 'Avalanche', 'Mountaineers', 'Ridges'],
  tornado: ['Cyclones', 'Twisters', 'Tempest', 'Hurricanes', 'Gales'],
  anvil: ['Forgers', 'Blacksmiths', 'Anvils', 'Ironworks', 'Foundry'],
  'battle-axe': ['Axemen', 'Cleavers', 'Lumberjacks', 'Tomahawks', 'Timber'],
  'war-hammer': ['Hammers', 'Crushers', 'Mallets', 'Forgers', 'Breakers'],
  'shield-emblem': ['Defenders', 'Aegis', 'Bastion', 'Bulwark', 'Wardens'],
  'gear-wheel': ['Engineers', 'Mechanix', 'Cogs', 'Steamers', 'Foundry'],
  'compass-rose': ['Navigators', 'Explorers', 'Pathfinders', 'Pioneers', 'Voyagers'],
  'crescent-moon': ['Lunar', 'Eclipse', 'Moonlight', 'Nightfall', 'Crescents'],
  'solar-flare': ['Suns', 'Solar', 'Helios', 'Radiance', 'Daybreak'],
  snowflake: ['Blizzard', 'Frost', 'Ice', 'Avalanche', 'Chill'],
  'tsunami-wave': ['Waves', 'Tsunami', 'Breakers', 'Surf', 'Riptide'],
  'diamond-cut': ['Diamonds', 'Gems', 'Crystals', 'Facets', 'Jewels'],
  torch: ['Torchbearers', 'Beacons', 'Flames', 'Olympians', 'Keepers'],
  cannon: ['Cannons', 'Artillery', 'Gunners', 'Brigade', 'Ordnance'],
  'ship-wheel': ['Captains', 'Helmsmen', 'Navigators', 'Privateers', 'Corsairs'],
  'tower-rook': ['Rooks', 'Towers', 'Castles', 'Citadel', 'Bastions'],
  meteor: ['Meteors', 'Impacts', 'Asteroids', 'Bolides', 'Stars'],
  'atom-core': ['Atoms', 'Nucleus', 'Reactors', 'Fusion', 'Quarks'],
  'key-crest': ['Keystones', 'Keepers', 'Locksmiths', 'Vault', 'Wardens'],
  hourglass: ['Timers', 'Chronos', 'Sands', 'Endurance', 'Tempo'],

  // Multi-Sport Equipment
  'soccer-ball': ['United', 'Athletic', 'FC', 'Rovers', 'Wanderers'],
  basketball: ['Hoopers', 'Netters', 'Dunkers', 'Courtmen', 'Pioneers'],
  football: ['Gridiron', 'Yardmen', 'Rushers', 'Blitz', 'Outlaws'],
  'hockey-sticks': ['Puckhounds', 'Icemen', 'Slapshots', 'Frostbite', 'Blizzards'],
  'baseball-diamond': ['Sluggers', 'Aces', 'Diamonds', 'Captains', 'Homers'],
  volleyball: ['Spikers', 'Aces', 'Volley', 'Setters', 'Breakers'],
  'crossed-bats': ['Batsmen', 'Sluggers', 'Hitters', 'Knights', 'Swingers'],
  'hockey-puck': ['Pucks', 'Icebreakers', 'Skaters', 'Enforcers', 'Freeze'],
  'checkered-flag': ['Racers', 'Velocity', 'Turbo', 'Apex', 'Pitcrew'],
  barbell: ['Ironmen', 'Lifters', 'Powerhouse', 'Heavyweights', 'Titans'],
  'boxing-glove': ['Boxers', 'Knockouts', 'Brawlers', 'Pugilists', 'Champs'],
  'tennis-racket': ['Aces', 'Volleys', 'Racquets', 'Baseline', 'Smash'],
  'golf-flag': ['Linksmen', 'Eagles', 'Fairway', 'Drivers', 'Greens'],
  'bowling-pins': ['Strikers', 'Kingpins', 'Alleycats', 'Rollers', 'Frames'],
  'rugby-ball': ['Scrum', 'Maulers', 'Trymen', 'Forwards', 'Pack'],
  'lacrosse-sticks': ['Cradlers', 'Checkers', 'Boxmen', 'Sticks', 'Crease'],
  'cricket-bat': ['Wickets', 'Strikers', 'Bowlers', 'Boundary', 'Eleven'],
  shuttlecock: ['Shuttlers', 'Smashers', 'Featherweights', 'Netters', 'Swifts'],
  'cycling-wheel': ['Peloton', 'Cyclists', 'Sprinters', 'Spokes', 'Breakaway'],
  'rowing-oars': ['Oarsmen', 'Crew', 'Regatta', 'Scullers', 'Rowers'],
  'fencing-foils': ['Fencers', 'Foils', 'En Garde', 'Riposte', 'Duelists'],
  'archery-target': ['Archers', 'Bowmen', 'Marksmen', 'Bullseyes', 'Arrows'],
  'medal-ribbon': ['Olympians', 'Medalists', 'Victors', 'Laureates', 'Champs'],
  whistle: ['Officials', 'Enforcers', 'Captains', 'Playmakers', 'Command'],
};

export const EXTRA_MASCOTS: string[] = [
  'Dynamo', 'Sparta', 'Locomotives', 'Olympians', 'Guardians', 'Rebels',
  'Valkyries', 'Dragonslayers', 'Rangers', 'Stallions', 'Mustangs', 'Foxes',
  'Jaguars', 'Lynx', 'Falcons', 'Hawks', 'Thunder', 'Storm', 'Vanguard', 'Alliance',
];

export const STADIUM_PREFIXES: string[] = [
  'Grand', 'Apex', 'Memorial', 'National', 'Royal', 'Heritage', 'Olympic',
  'Summit', 'Foundry', 'Beacon', 'Harbor', 'Vanguard', 'Iron', 'Sovereign',
];

export const STADIUM_SUFFIXES: string[] = [
  'Arena', 'Stadium', 'Park', 'Coliseum', 'Field', 'Dome', 'Grounds', 'Fortress', 'Bowl',
];

export const PLAYSTYLES: PlaystyleArchetype[] = [
  'Gegenpress',
  'Tiki-Taka',
  'Counter-Attack',
  'Total Attack',
  'Iron Curtain',
  'Wing Blitz',
  'Tempo Control',
  'Direct Long-Ball',
];

export const BUDGET_TIERS: BudgetTier[] = [
  'Grassroots',
  'Challenger',
  'Contender',
  'Powerhouse',
  'Titan',
];

export const FIRST_NAMES: string[] = [
  'Liam', 'Noah', 'Mateo', 'Lucas', 'Ethan', 'Julian', 'Leo', 'Gabriel', 'Marcus', 'Rafael',
  'Daniel', 'Samuel', 'Sebastian', 'Adrian', 'Diego', 'Kai', 'Xavier', 'Nolan', 'Caleb', 'Owen',
  'Isaac', 'Dominic', 'Roman', 'Lorenzo', 'Tomas', 'Henrik', 'Soren', 'Emil', 'Lukas', 'Kieran',
  'Declan', 'Ronan', 'Callum', 'Bram', 'Jasper', 'Finn', 'Milo', 'Toby', 'Axel', 'Victor',
  'Hugo', 'Enzo', 'Thiago', 'Bruno', 'Andre', 'Carlos', 'Javier', 'Rodrigo', 'Marco', 'Matteo',
  'Nicolo', 'Dante', 'Gael', 'Yusuf', 'Tariq', 'Amir', 'Zane', 'Malik', 'Darius', 'Kendall',
  'Devon', 'Tanner', 'Cole', 'Grant', 'Brett', 'Blake', 'Chase', 'Bryce', 'Reid', 'Spencer',
  'Wyatt', 'Garrett', 'Trevor', 'Shawn', 'Curtis', 'Wesley', 'Miles', 'Elliot', 'Arthur', 'Henry',
  'Oliver', 'Theo', 'Archie', 'Jude', 'Ezra', 'Silas', 'Felix', 'Oscar', 'Max', 'Anton',
  'Stefan', 'Nikola', 'Pavel', 'Marek', 'Jan', 'Koji', 'Ren', 'Haruto', 'Minjun', 'Sora',
];

export const LAST_NAMES: string[] = [
  'Vance', 'Mercer', 'Kovacs', 'Silva', 'Moretti', 'Lindqvist', 'Navarro', 'Okafor', 'Bennett', 'Holloway',
  'Castellano', 'Richter', 'Bergstrom', 'Takahashi', 'Nakamura', 'Delgado', 'Serrano', 'Mendoza', 'Pereira', 'Costa',
  'Ferreira', 'Almeida', 'Bauer', 'Weber', 'Hoffmann', 'Keller', 'Zimmerman', 'Vogel', 'Novak', 'Horvat',
  'Kowalski', 'Zielinski', 'Petrov', 'Volkov', 'Sokolov', 'Morozov', 'Hansen', 'Nielsen', 'Jensen', 'Larsen',
  'Solberg', 'Bakken', 'Haddad', 'Mansour', 'Khoury', 'Diallo', 'Traore', 'Mensah', 'Boadu', 'Kamara',
  'Callahan', 'Gallagher', 'Donovan', 'Sullivan', 'McAllister', 'MacLeod', 'Campbell', 'Fraser', 'Fletcher', 'Porter',
  'Hawkins', 'Crawford', 'Hayes', 'Wallace', 'Gibson', 'Reynolds', 'Henderson', 'Griffin', 'Thornton', 'Whitaker',
  'Sterling', 'Blackwood', 'Ashworth', 'Prescott', 'Montoya', 'Ramos', 'Cortez', 'Vargas', 'Salazar', 'Fuentes',
  'Romano', 'Conti', 'Esposito', 'Ricci', 'Marino', 'Greco', 'Lombardi', 'Fontana', 'Leclerc', 'Laurent',
  'Moreau', 'Girard', 'Mercier', 'Lefevre', 'Rousseau', 'Dupont', 'Kimura', 'Sato', 'Tanaka', 'Kobayashi',
  'Park', 'Choi', 'Kang', 'Yoon', 'Lin', 'Chen', 'Wu', 'Zhang', 'Patel', 'Rao',
];

export interface PositionSpec {
  position: PlayerPosition;
  label: string;
  countRange: [number, number];
  heightInRange: [number, number];
  weightLbsRange: [number, number];
  archetypes: string[];
  statWeights: { offense: number; defense: number; speed: number; stamina: number; iq: number };
}

export const POSITION_SPECS: PositionSpec[] = [
  {
    position: 'GK',
    label: 'Goalkeeper',
    countRange: [2, 2],
    heightInRange: [73, 78],
    weightLbsRange: [185, 220],
    archetypes: ['Shot Stopper', 'Sweeper Keeper', 'Commanding GK'],
    statWeights: { offense: 0.35, defense: 1.15, speed: 0.72, stamina: 0.8, iq: 1.05 },
  },
  {
    position: 'CB',
    label: 'Center Back',
    countRange: [3, 4],
    heightInRange: [72, 77],
    weightLbsRange: [180, 215],
    archetypes: ['Stopper', 'Ball-Playing CB', 'Aerial Anchor'],
    statWeights: { offense: 0.55, defense: 1.15, speed: 0.85, stamina: 0.95, iq: 1.0 },
  },
  {
    position: 'FB',
    label: 'Fullback',
    countRange: [2, 3],
    heightInRange: [68, 73],
    weightLbsRange: [160, 188],
    archetypes: ['Wingback', 'Lockdown FB', 'Inverted FB'],
    statWeights: { offense: 0.85, defense: 1.0, speed: 1.1, stamina: 1.12, iq: 0.95 },
  },
  {
    position: 'CDM',
    label: 'Defensive Mid',
    countRange: [2, 2],
    heightInRange: [70, 75],
    weightLbsRange: [168, 198],
    archetypes: ['Destroyer', 'Deep-Lying Playmaker', 'Anchor Man'],
    statWeights: { offense: 0.78, defense: 1.08, speed: 0.9, stamina: 1.1, iq: 1.08 },
  },
  {
    position: 'CM',
    label: 'Central Mid',
    countRange: [2, 3],
    heightInRange: [68, 73],
    weightLbsRange: [158, 186],
    archetypes: ['Box-to-Box', 'Mezzala', 'Tempo Controller'],
    statWeights: { offense: 0.95, defense: 0.92, speed: 0.96, stamina: 1.12, iq: 1.08 },
  },
  {
    position: 'CAM',
    label: 'Attacking Mid',
    countRange: [1, 2],
    heightInRange: [67, 72],
    weightLbsRange: [152, 180],
    archetypes: ['Classic #10', 'Shadow Striker', 'Creative Hub'],
    statWeights: { offense: 1.1, defense: 0.65, speed: 1.0, stamina: 0.95, iq: 1.14 },
  },
  {
    position: 'W',
    label: 'Winger',
    countRange: [2, 3],
    heightInRange: [66, 72],
    weightLbsRange: [148, 178],
    archetypes: ['Inverted Winger', 'Touchline Flyer', 'Inside Forward'],
    statWeights: { offense: 1.08, defense: 0.62, speed: 1.16, stamina: 1.02, iq: 0.95 },
  },
  {
    position: 'ST',
    label: 'Striker',
    countRange: [2, 3],
    heightInRange: [69, 76],
    weightLbsRange: [165, 205],
    archetypes: ['Poacher', 'Target Forward', 'Complete Forward'],
    statWeights: { offense: 1.16, defense: 0.48, speed: 1.05, stamina: 0.94, iq: 1.0 },
  },
];
