/**
 * Wordplay level data — GENERATED FILE — do not edit by hand. Regenerate
 * with: npm run build:wordplay-levels (see scripts/build-wordplay-levels.mjs
 * for the data sources, difficulty curve, and placement algorithm).
 *
 * 200 levels; index 0 is level 1. Lazy-load this module from the
 * client — it ships to the browser.
 */
export interface WordplayLevel {
  /** Board is size×size. */
  size: number;
  /** Grid rows, each a string of `size` uppercase A-Z letters. */
  rows: string[];
  /** Target words the player must find (uppercase). */
  targets: string[];
  /** Other dictionary words traceable on the board (uppercase), for bonus points. */
  bonus: string[];
}

export const WORDPLAY_LEVELS: WordplayLevel[] = [
  {
    size: 3,
    rows: ["YVO", "ATE", "GHY"],
    targets: [
      "GAY", "HAVE", "THEY",
    ],
    bonus: [
      "ATE", "GAT", "HAG", "HAT", "HAY", "HET", "OVA", "TAG",
      "THE", "THY", "TOE", "VAT", "VET", "YET", "GATE", "GAVE",
      "HATE", "VETO", "VOTE",
    ],
  },
  {
    size: 3,
    rows: ["FDE", "CAT", "DHE"],
    targets: [
      "CHAT", "DEAF", "HEAD",
    ],
    bonus: [
      "ATE", "CAD", "CAT", "DAH", "EAT", "FAD", "FAT", "HAD",
      "HAT", "HET", "TAD", "TEA", "THE", "ACHE", "DATE", "DEAD",
      "EACH", "FADE", "FATE", "HATE", "HEAT", "TACH", "CADET", "CHEAT",
      "DATED", "DEATH", "FATED", "HATED", "TEACH", "DETACH", "HEATED", "CHEATED",
    ],
  },
  {
    size: 3,
    rows: ["NHB", "TEY", "VET"],
    targets: [
      "BET", "EVEN", "THEY",
    ],
    bonus: [
      "BEE", "EEN", "EYE", "HEN", "HET", "NEE", "NET", "TEE",
      "TEN", "THE", "THY", "VET", "YEN", "YET", "BEET", "BENT",
      "TEEN", "TENT", "THEE", "THEN", "VENT", "EVENT", "TEETH", "TENTH",
    ],
  },
  {
    size: 3,
    rows: ["RAH", "OTT", "BES"],
    targets: [
      "HAT", "BETS", "ROBE",
    ],
    bonus: [
      "ART", "ATE", "BET", "BOA", "BOT", "EST", "OAR", "OAT",
      "ORA", "RAT", "ROB", "ROT", "SET", "TAR", "TAT", "TOE",
      "TOR", "ARTS", "BEST", "BOAR", "BOAT", "BOTH", "BOTS", "HATE",
      "HATS", "OATH", "OATS", "RATE", "RATS", "ROTS", "STAR", "STAT",
      "TART", "TATS", "TEST", "THAR", "THAT", "TOES", "BOATS", "HATES",
    ],
  },
  {
    size: 3,
    rows: ["DTY", "EUT", "MNO"],
    targets: [
      "MET", "DUTY", "UNTO",
    ],
    bonus: [
      "DEN", "DUE", "DUN", "MED", "MEN", "MUD", "NET", "NOT",
      "NUT", "ONE", "OUT", "TEN", "TON", "YUM", "DENT", "DUET",
      "DUNE", "MENT", "MENU", "MUTE", "MUTT", "TENT", "TONE", "TOUT",
      "TUNE", "MUTED", "NUTTY", "OUTED", "TONED", "TUNED", "MUTTON",
    ],
  },
  {
    size: 3,
    rows: ["ORG", "IWE", "HMD"],
    targets: [
      "HIM", "RED", "GROW",
    ],
    bonus: [
      "DEW", "GEM", "IRE", "MED", "MEW", "ORE", "OWE", "RIM",
      "ROW", "WED", "GREW", "GRIM", "HIRE", "MIRE", "OWED", "WHIM",
      "WIRE", "WORE", "GRIME", "HIRED", "MIRED", "ROWED", "WIRED",
    ],
  },
  {
    size: 3,
    rows: ["ROH", "NAO", "WZS"],
    targets: [
      "HAS", "ZOO", "WARN",
    ],
    bonus: [
      "HON", "HOO", "HOS", "NOR", "OAR", "ORA", "RAN", "RAW",
      "SAW", "WAR", "WAS", "HORN", "SOAR", "SOON", "WAZOO",
    ],
  },
  {
    size: 3,
    rows: ["EUG", "TIT", "SAR"],
    targets: [
      "GUT", "ITS", "RATE",
    ],
    bonus: [
      "AIR", "ART", "ATE", "GIT", "RAT", "RIG", "SAT", "SIR",
      "SIT", "TAR", "TAS", "TAT", "TIE", "TUG", "GIST", "GUTS",
      "RATS", "RITE", "SARI", "SITE", "STAR", "STAT", "STIR", "TART",
      "TATS", "TRIG", "TUTS", "IRATE", "SITAR", "STAIR", "START", "TASTE",
      "TRAIT", "TRITE", "ARTIST", "GUITAR", "STATUE", "TRAITS", "ARTISTE",
    ],
  },
  {
    size: 3,
    rows: ["BJO", "OEN", "ATM"],
    targets: [
      "JOB", "ONE", "MEAT",
    ],
    bonus: [
      "ATE", "BET", "BOA", "BOT", "EAT", "EON", "JET", "JOT",
      "MEN", "MET", "NET", "OAT", "TEA", "TEN", "TOE", "BEAT",
      "BENT", "BOAT", "MENT", "NEAT", "ONTO",
    ],
  },
  {
    size: 3,
    rows: ["OMN", "NAH", "GUT"],
    targets: [
      "HUG", "MON", "TUNA",
    ],
    bonus: [
      "GAT", "GUN", "GUT", "HAG", "HAM", "HAT", "HUT", "MAG",
      "MAN", "MAT", "NAG", "NOM", "NUT", "OAT", "TAG", "TAN",
      "TUG", "GNAT", "HANG", "HUNG", "MANO", "MATH", "MOAN", "MOAT",
      "OATH", "THAN", "THUG", "AMONG", "GUANO", "GUNMAN",
    ],
  },
  {
    size: 3,
    rows: ["MTS", "DUS", "DRE"],
    targets: [
      "DRUM", "DUST", "REST",
    ],
    bonus: [
      "DUD", "DUE", "ERS", "EST", "MUD", "RES", "RUM", "RUT",
      "SUM", "SUR", "USE", "DUES", "MUSE", "MUSS", "MUST", "RUSE",
      "RUST", "STUD", "SUES", "SURE", "TURD", "USER", "DRESS", "DURST",
      "RESTS", "RUSSE", "SERUM", "DURESS", "SUREST",
    ],
  },
  {
    size: 3,
    rows: ["DUD", "EGE", "LAS"],
    targets: [
      "DUG", "DEAL", "EASE",
    ],
    bonus: [
      "AGE", "ALE", "DUD", "DUE", "GAL", "GAS", "GEL", "LAG",
      "LED", "LEG", "SAG", "SEA", "SED", "AGED", "AGES", "DUDE",
      "DUEL", "DUES", "EDGE", "LEGS", "SAGE", "SALE", "SEAL", "DUDES",
      "EASED", "EDGED", "EDGES", "LEASE", "LEDGE", "SEGUE", "LEAGUE", "LEASED",
      "SEALED", "LEAGUES",
    ],
  },
  {
    size: 3,
    rows: ["SCW", "ENO", "TAM"],
    targets: [
      "SEC", "WON", "TEAM",
    ],
    bonus: [
      "ANT", "ATE", "CON", "COW", "EAT", "MAN", "MAT", "MON",
      "MOW", "NET", "NOM", "NOW", "OAT", "ONE", "ONS", "OWN",
      "SEA", "SET", "TAN", "TEA", "TEN", "ANTE", "CENT", "COAT",
      "COMA", "CONE", "CONS", "MANE", "MANO", "MATE", "MOAN", "MOAT",
      "NEAT", "ONCE", "ONES", "OWNS", "SCOW", "SEAM", "SEAT", "SENT",
    ],
  },
  {
    size: 3,
    rows: ["EPI", "ENA", "NEM"],
    targets: [
      "APE", "INN", "MEN",
    ],
    bonus: [
      "AIN", "EEN", "MAN", "MAP", "MEE", "NAP", "NEE", "NIP",
      "PAN", "PEE", "PEN", "PIN", "MAIN", "MANE", "MEAN", "NAME",
      "NAPE", "PAIN", "PANE", "PINA", "PINE", "ENEMA",
    ],
  },
  {
    size: 3,
    rows: ["OCT", "TAA", "EMR"],
    targets: [
      "ARM", "ATE", "COAT",
    ],
    bonus: [
      "ACT", "CAR", "CAT", "COT", "EAR", "EAT", "MAT", "MET",
      "OAR", "OAT", "RAM", "RAT", "TAR", "TAT", "TEA", "CAME",
      "MATE", "MEAT", "RATE", "TACO", "TACT", "TAME", "TEAM", "TEAR",
      "TEAT", "CARAT", "TARMAC",
    ],
  },
  {
    size: 4,
    rows: ["RILD", "OKLS", "DSUO", "YSTL"],
    targets: [
      "ROD", "TOLD", "KILLS", "LOUSY",
    ],
    bonus: [
      "DOS", "ILK", "ILL", "KOI", "LOT", "OIL", "OLD", "OUT",
      "SKI", "SOD", "SOT", "SOU", "DORK", "DOST", "ILLS", "KILL",
      "KILO", "LOTS", "LOUT", "LULL", "LUST", "OILS", "OLDS", "OUTS",
      "RODS", "SLOT", "SOIL", "SOLD", "SOUL", "SOUS", "SULK", "SUSS",
      "TOLL", "TUSK", "DORKS", "KILOS", "LULLS", "LUSTS", "SKILL", "SKULL",
    ],
  },
  {
    size: 4,
    rows: ["SEAR", "FNCK", "OADR", "TWHE"],
    targets: [
      "RED", "FEAR", "TONE", "WHACK",
    ],
    bonus: [
      "AND", "CAD", "CAN", "CAR", "CAT", "CAW", "DAH", "EAR",
      "END", "FAD", "FAN", "FAT", "HAD", "HAT", "HER", "NOT",
      "NOW", "OAF", "OAT", "ONE", "ONS", "RAN", "SEA", "SEC",
      "TAD", "TAN", "TON", "TOW", "TWO", "WAD", "WON", "ACES",
      "ACNE", "ACRE", "CAFE", "CANE", "CANS", "CRED", "FACE", "FADE",
    ],
  },
  {
    size: 4,
    rows: ["PISH", "OLBC", "TCAI", "IBAS"],
    targets: [
      "ACT", "BIT", "BASIC", "POLISH",
    ],
    bonus: [
      "ABS", "ALT", "BAS", "BIO", "CAB", "COP", "COT", "ISH",
      "LAB", "LAC", "LIB", "LIP", "LOP", "LOT", "OIL", "POI",
      "POT", "SAC", "SIP", "TOP", "BAAS", "BIAS", "BLAB", "BLIP",
      "BLOT", "CABS", "CACA", "CASA", "CLIP", "CLOT", "COIL", "LABS",
      "LACS", "LOCA", "OILS", "PISH", "PLOT", "SACS", "SALT", "SCAB",
    ],
  },
  {
    size: 4,
    rows: ["MSET", "HRIC", "NAGT", "EVSY"],
    targets: [
      "GAS", "CITY", "HAVEN", "TERMS",
    ],
    bonus: [
      "AIR", "ARE", "ARM", "CIG", "EAR", "ERA", "ERS", "GIT",
      "HAG", "HAS", "ICE", "IRE", "ISH", "ISM", "ITS", "NAG",
      "RAG", "RAN", "REC", "RES", "RIG", "SAG", "SEC", "SEI",
      "SET", "SIR", "SIT", "STY", "TIE", "AIRS", "ARMS", "ARSE",
      "CITE", "EARN", "EARS", "EASY", "ERAS", "GAIT", "GAVE", "GRIT",
    ],
  },
  {
    size: 4,
    rows: ["BOON", "SEKM", "GIYE", "SNAL"],
    targets: [
      "LEAN", "SOON", "BEINGS", "MONKEY",
    ],
    bonus: [
      "AIN", "ALE", "ANY", "BEG", "EON", "EYE", "GIN", "ING",
      "INS", "KEG", "KEY", "KIN", "LAY", "LYE", "MON", "NOM",
      "SEI", "SIN", "SIS", "SOB", "AYES", "BEGS", "BEIN", "BOOK",
      "BOOM", "EYES", "KEGS", "KING", "LAIN", "MEAL", "MEAN", "MONK",
      "MOOS", "NOOK", "OBEY", "SIGN", "SING", "SINS", "BEGIN", "BEING",
    ],
  },
  {
    size: 4,
    rows: ["GFYW", "OUIL", "SARN", "LADD"],
    targets: [
      "GUY", "FOUR", "WIND", "SALAD",
    ],
    bonus: [
      "ADD", "AIL", "AIN", "AIR", "FIN", "FIR", "FOG", "FUR",
      "LAD", "NIL", "OAR", "OUR", "RAD", "RUG", "SAD", "SOU",
      "SUR", "URN", "WIN", "ALSO", "ARIA", "AURA", "DARN", "DRUG",
      "FIND", "FOAL", "GOAL", "LAIN", "LAIR", "LARD", "LIAR", "LIRA",
      "RAIL", "RAIN", "RIND", "RUIN", "SAIL", "SARI", "SOAR", "SOUR",
    ],
  },
  {
    size: 4,
    rows: ["TCAI", "LLRC", "SEKO", "JOCL"],
    targets: [
      "ACT", "JOKE", "CALLS", "LOCKER",
    ],
    bonus: [
      "AIR", "ALE", "ALL", "ALT", "ARE", "CAR", "COS", "ELL",
      "ERA", "IRE", "LAC", "ORA", "ORE", "REC", "RES", "SEC",
      "ACRE", "ALLS", "ALSO", "CALL", "CARE", "CELL", "CORE", "CORK",
      "CROC", "JERK", "LACK", "LAIR", "LARK", "LOCA", "LOCK", "LOCO",
      "LORE", "OKRA", "ORAL", "ORES", "RACK", "ROCK", "SELL", "SERA",
    ],
  },
  {
    size: 4,
    rows: ["DECO", "NIAS", "LORL", "SAHE"],
    targets: [
      "ALSO", "DICE", "HEROIN", "SOCIAL",
    ],
    bonus: [
      "AID", "AIL", "AIN", "AIR", "ALE", "ARE", "CAR", "COS",
      "DEN", "DIE", "EAR", "END", "ERA", "ERS", "HAS", "HER",
      "HON", "HOS", "ICE", "ION", "IRE", "LAC", "LAH", "LID",
      "LIE", "NIL", "NOR", "OAR", "OIL", "ONE", "ORA", "ORE",
      "ORS", "RID", "SAC", "SON", "ACED", "ACID", "AIDE", "AILS",
    ],
  },
  {
    size: 4,
    rows: ["SEWS", "RCNE", "IPON", "CURC"],
    targets: [
      "CUP", "CORN", "NEWS", "PRICES",
    ],
    bonus: [
      "CON", "COP", "CUR", "EON", "ERS", "EWE", "ICE", "IRE",
      "NEW", "NON", "NOR", "ONE", "ONS", "OUR", "PRE", "PRO",
      "REC", "RES", "RIP", "SEC", "SEW", "URN", "CONE", "CONS",
      "COUP", "CREW", "CROC", "CROP", "EONS", "ICON", "NEON", "NONE",
      "ONCE", "ONES", "PICS", "POUR", "RICE", "SEWN", "SEWS", "UPON",
    ],
  },
  {
    size: 4,
    rows: ["NTDL", "EJOU", "DCOT", "ENIH"],
    targets: [
      "HIT", "COULD", "DECENT", "JOINED",
    ],
    bonus: [
      "CON", "COO", "COT", "DEN", "DOO", "DOT", "END", "HOC",
      "HON", "HOO", "HOT", "ICE", "ION", "JET", "JOT", "LOD",
      "LOO", "LOT", "NET", "NOT", "OLD", "ONE", "OUT", "TEN",
      "THO", "TIN", "TON", "TOO", "CENT", "COIN", "COLD", "CONE",
      "COOL", "COOT", "DECO", "DENT", "DOJO", "DOTE", "DOTH", "HIND",
    ],
  },
  {
    size: 4,
    rows: ["NDSO", "TEIC", "HISN", "NGKS"],
    targets: [
      "COIN", "SKIN", "SENDS", "THINGS",
    ],
    bonus: [
      "COS", "DEN", "DIE", "DIS", "END", "GIN", "GIT", "HEN",
      "HET", "HIS", "HIT", "ING", "INK", "INS", "KIN", "KIT",
      "NET", "SED", "SEI", "SET", "SIN", "SIS", "SIT", "SKI",
      "TEN", "THE", "TIE", "TIN", "DENT", "DESK", "DIES", "DIET",
      "DISC", "DISK", "DISS", "ENDS", "HISS", "INKS", "KING", "KISS",
    ],
  },
  {
    size: 4,
    rows: ["CONK", "TMBI", "NASA", "YDEL"],
    targets: [
      "INK", "MANY", "DEALS", "COMBAT",
    ],
    bonus: [
      "ABS", "ADS", "AIN", "ALE", "AND", "ANT", "ANY", "BAD",
      "BAM", "BAN", "BAS", "BAT", "BIN", "BOT", "CON", "COT",
      "DAB", "DAM", "DAY", "EAT", "ISM", "KIN", "LAB", "LED",
      "MAD", "MAN", "MAS", "MAT", "MAY", "MOB", "MON", "NAB",
      "NOM", "NOT", "SAD", "SAT", "SAY", "SEA", "SED", "SIN",
    ],
  },
  {
    size: 4,
    rows: ["SASG", "OWDE", "HUIL", "JAGN"],
    targets: [
      "SAW", "WHO", "GAIN", "JUDGES",
    ],
    bonus: [
      "ADS", "AID", "AIL", "AIN", "DIE", "DIG", "DUG", "GEL",
      "GIN", "HAG", "HOS", "HUG", "ING", "JUG", "LED", "LEG",
      "LID", "LIE", "NIL", "SAD", "SED", "SEI", "SOU", "SOW",
      "WAD", "WAS", "WIG", "WIN", "AGIN", "AIDE", "AIDS", "DELI",
      "DIES", "IDLE", "JAIL", "LEGS", "LIDS", "LIED", "LIES", "SAWS",
    ],
  },
  {
    size: 4,
    rows: ["ERGC", "SIUN", "POHT", "NESC"],
    targets: [
      "CHIP", "CURE", "SIGN", "HONEST",
    ],
    bonus: [
      "CUR", "CUT", "EON", "ERS", "EST", "GUN", "GUT", "HEN",
      "HEP", "HIP", "HIS", "HOE", "HON", "HOP", "HOS", "HUG",
      "HUT", "ION", "IRE", "NUT", "ONE", "OPS", "OUR", "OUT",
      "PEN", "PIE", "PIG", "POI", "RES", "RIG", "RIP", "RUG",
      "RUN", "RUT", "SEI", "SHE", "SIP", "SIR", "SON", "SOU",
    ],
  },
  {
    size: 4,
    rows: ["RLMT", "ORAI", "FNTP", "EOSE"],
    targets: [
      "APE", "TIP", "STONE", "FORMAL",
    ],
    bonus: [
      "AIM", "AMI", "ANT", "APT", "ARM", "ART", "ATE", "EON",
      "EST", "FOE", "FOR", "FRO", "ITS", "LAP", "MAN", "MAP",
      "MAT", "NAP", "NOR", "NOT", "ONE", "ONS", "ORA", "PAL",
      "PAN", "PAR", "PET", "PIT", "RAM", "RAN", "RAP", "RAT",
      "SET", "SON", "SOT", "SPA", "TAN", "TAP", "TAR", "TAT",
    ],
  },
  {
    size: 4,
    rows: ["IRSS", "FPED", "OLBL", "TSIT"],
    targets: [
      "BIT", "BLESS", "RIFLE", "STOPS",
    ],
    bonus: [
      "BED", "ELF", "ERS", "FIR", "FOP", "IRE", "LED", "LIB",
      "LIT", "LOP", "LOT", "OPS", "PER", "POT", "PRE", "RED",
      "REP", "RES", "RIP", "SED", "SIT", "SOT", "TIL", "TOP",
      "BEDS", "BELT", "BILE", "BLED", "BLOT", "DEBT", "DELI", "FIRE",
      "FIRS", "FLED", "FLIT", "FLOP", "ISLE", "LESS", "LILT", "LIST",
    ],
  },
  {
    size: 4,
    rows: ["ELOG", "LGWR", "PUHE", "NAKS"],
    targets: [
      "PAN", "GREW", "HUGE", "SKULL",
    ],
    bonus: [
      "AKE", "EGO", "ELL", "GEL", "GUN", "HER", "HUG", "LEG",
      "LOG", "LOW", "LUG", "NAP", "ORE", "OWE", "OWL", "PUN",
      "RES", "ROW", "SEW", "SHE", "GLOW", "GROG", "GROW", "GULL",
      "GULP", "HAUL", "HERO", "HULL", "LORE", "LUGE", "NUKE", "NULL",
      "OGLE", "OGRE", "ORES", "OWES", "PLUG", "PUKE", "PULL", "ROLE",
    ],
  },
  {
    size: 4,
    rows: ["SEEE", "SNDD", "TOKO", "TANR"],
    targets: [
      "ROD", "TANK", "TOSS", "NEEDED",
    ],
    bonus: [
      "DEN", "DON", "DOS", "DOT", "EEN", "END", "EST", "NEE",
      "NOD", "NON", "NOR", "NOT", "OAK", "OAT", "ODD", "ONE",
      "ONS", "SED", "SEE", "SOD", "SON", "SOT", "TAN", "TAT",
      "TON", "ANON", "DEED", "DENS", "DENT", "DODO", "DONE", "DONS",
      "DORK", "DOSE", "DOST", "DOTS", "KNEE", "KNOT", "NEED", "NEST",
    ],
  },
  {
    size: 4,
    rows: ["FONS", "OTIP", "EETR", "RNAC"],
    targets: [
      "TOO", "REAR", "SPIN", "OFTEN", "ACTION",
    ],
    bonus: [
      "ACT", "ANT", "ART", "ATE", "CAN", "CAR", "CAT", "EAR",
      "EAT", "EEN", "ERE", "FOE", "INS", "ION", "NEE", "NET",
      "NIP", "NOT", "OFT", "ONS", "PIE", "PIN", "PIT", "RAN",
      "RAT", "RIP", "SIN", "SIP", "SIR", "SIT", "TAN", "TAR",
      "TEA", "TEE", "TEN", "TIE", "TIN", "TIP", "TOE", "TON",
    ],
  },
  {
    size: 4,
    rows: ["LEEL", "CVLI", "AEAS", "RSNE"],
    targets: [
      "NAIL", "CARES", "CEASE", "LEVELS",
    ],
    bonus: [
      "AIL", "ALE", "ALL", "ARE", "CAR", "EAR", "EEL", "ELL",
      "ERA", "ERS", "ILL", "LIE", "REC", "RES", "SAC", "SEA",
      "SEC", "ACES", "AILS", "AREA", "ARSE", "CARE", "CARS", "CASA",
      "CASE", "CAVA", "CAVE", "CELL", "EARS", "EASE", "EELS", "ELSE",
      "ERAS", "EVEN", "EVER", "ILLS", "ISLE", "LAVA", "LEAN", "LENS",
    ],
  },
  {
    size: 4,
    rows: ["BRDE", "WOTT", "SBIE", "HINR"],
    targets: [
      "BOW", "RODE", "SHINE", "BITTER",
    ],
    bonus: [
      "BIN", "BIO", "BIT", "BOD", "BOT", "BRO", "DOS", "DOT",
      "HIS", "IRE", "ISH", "NET", "ORB", "RIB", "ROB", "ROD",
      "ROT", "ROW", "SIN", "SOB", "SOD", "SOT", "SOW", "TEN",
      "TIE", "TIN", "TOR", "TOW", "BIEN", "BITE", "BODE", "BOWS",
      "BROW", "DOTE", "REIN", "RIBS", "RIOT", "RITE", "ROBS", "ROWS",
    ],
  },
  {
    size: 4,
    rows: ["MREV", "AOCE", "THWF", "WTIS"],
    targets: [
      "TWO", "THIS", "FEVER", "MARCH",
    ],
    bonus: [
      "AHI", "ARE", "ARM", "COT", "COW", "ERA", "FEE", "FEW",
      "FIT", "HAM", "HAT", "HIS", "HIT", "HOC", "HOE", "HOM",
      "HOT", "IFS", "MAT", "MOR", "MOW", "OAR", "OAT", "ORA",
      "ORE", "OWE", "RAM", "RAT", "REC", "ROM", "ROT", "ROW",
      "SIT", "TAR", "THO", "TOE", "TOR", "TOW", "WEE", "WHO",
    ],
  },
  {
    size: 4,
    rows: ["HEIV", "TSFE", "RENB", "KIRU"],
    targets: [
      "SHE", "BURN", "FIVE", "STRIKE",
    ],
    bonus: [
      "BUN", "ERS", "EST", "FER", "HET", "IFS", "INS", "IRE",
      "ISH", "KIN", "NET", "REF", "RES", "RUB", "RUN", "SEI",
      "SET", "TEN", "THE", "UNI", "UNS", "URN", "VIE", "BUNS",
      "FENS", "FEST", "FETE", "FISH", "FIST", "KERB", "NEST", "NETS",
      "REIN", "REST", "RUNS", "SNUB", "TENS", "VISE", "BRIEF", "BRINE",
    ],
  },
  {
    size: 4,
    rows: ["HTFB", "EEOL", "NGSO", "SETH"],
    targets: [
      "BOTH", "GOLF", "TENSE", "THOSE",
    ],
    bonus: [
      "BOG", "BOT", "EEN", "EGO", "EST", "FEE", "FOB", "FOE",
      "FOG", "GET", "GOO", "GOT", "HEN", "HET", "HOO", "HOS",
      "HOT", "LOB", "LOG", "LOO", "LOT", "NEE", "NEG", "NET",
      "OFT", "SEE", "SET", "SOB", "SOT", "TEE", "TEN", "THE",
      "THO", "TOE", "TOO", "BLOG", "BLOT", "BOGS", "BOOT", "EGOS",
    ],
  },
  {
    size: 4,
    rows: ["GEHT", "ATRP", "NECO", "KSET"],
    targets: [
      "PORT", "KNEES", "GATHER", "SECTOR",
    ],
    bonus: [
      "AGE", "ANT", "ATE", "COP", "COT", "EAT", "EEN", "ERE",
      "GAT", "GET", "HER", "HET", "NAG", "NEE", "NET", "OPT",
      "ORE", "POT", "PRE", "PRO", "REC", "RES", "ROT", "SEA",
      "SEC", "SEE", "SET", "TAG", "TAN", "TEA", "TEE", "TEN",
      "THE", "TOE", "TOP", "TOR", "ANTE", "CENT", "CORE", "CROP",
    ],
  },
  {
    size: 4,
    rows: ["FLAS", "NLRG", "CALE", "BESO"],
    targets: [
      "BALL", "FLAG", "RACE", "LOSERS",
    ],
    bonus: [
      "AGE", "ALE", "ALL", "ARE", "BAN", "BAR", "BAS", "CAB",
      "CAN", "CAR", "EAR", "ELL", "ERA", "ERS", "GAL", "GAS",
      "GEL", "LAB", "LAC", "LAG", "LEG", "NAB", "RAG", "RAN",
      "RES", "SAC", "SAG", "SEA", "SEC", "ACES", "AGES", "ALLS",
      "ALOE", "ALSO", "BALE", "BARE", "BARS", "BASE", "BEAN", "BEAR",
    ],
  },
  {
    size: 4,
    rows: ["TOTH", "SFOA", "LASS", "IDES"],
    targets: [
      "HAS", "FOOT", "ASSES", "SLIDE",
    ],
    bonus: [
      "ADS", "AFT", "AID", "AIL", "FAD", "HAT", "HOO", "HOS",
      "HOT", "LAD", "LID", "OAF", "OAT", "OFT", "SAD", "SAT",
      "SEA", "SED", "SOT", "TAS", "THO", "TOO", "AIDE", "AIDS",
      "AILS", "ALSO", "DAFT", "DEAF", "DEAL", "DIAL", "FADE", "FAIL",
      "FAST", "FOAL", "HOOF", "HOOT", "HOSE", "IDEA", "LADS", "LAID",
    ],
  },
  {
    size: 4,
    rows: ["SMDL", "KEIP", "ANEA", "TYNR"],
    targets: [
      "DESK", "LIAR", "MEAT", "PENNY",
    ],
    bonus: [
      "AID", "AIL", "AIM", "AIN", "AKE", "ANT", "ANY", "APE",
      "ARE", "DEN", "DIE", "DIM", "DIP", "EAR", "EAT", "EEN",
      "ERA", "INK", "INN", "LID", "LIE", "LIP", "MED", "MEE",
      "MEN", "MID", "MIL", "NAP", "NEE", "NIL", "NIP", "PAN",
      "PAR", "PEA", "PEE", "PEN", "PER", "PIE", "PIN", "RAN",
    ],
  },
  {
    size: 4,
    rows: ["AEHO", "SEEC", "MOID", "ETNV"],
    targets: [
      "MET", "NOT", "VIDEO", "CHEESE",
    ],
    bonus: [
      "DIE", "DIT", "EON", "HEM", "HOC", "HOE", "ICE", "ION",
      "MEE", "MOI", "MON", "NOM", "SEA", "SEE", "SEI", "SON",
      "SOT", "TIE", "TIN", "TOE", "TON", "VIE", "CITE", "COED",
      "DECO", "DEEM", "DICE", "DIES", "EASE", "EDIT", "HEED", "ICED",
      "INTO", "ITEM", "MOTE", "NICE", "NOSE", "NOTE", "SEED", "SEEM",
    ],
  },
  {
    size: 4,
    rows: ["CTNY", "ASAM", "FSAE", "ALKD"],
    targets: [
      "FACT", "LAST", "ASKED", "NAMED",
    ],
    bonus: [
      "ACT", "AKE", "ANT", "ANY", "ASK", "CAT", "DAM", "EAT",
      "FAT", "LAD", "MAD", "MAN", "MAS", "MAT", "MAY", "MED",
      "SAC", "SAD", "SAT", "SAY", "TAN", "TAS", "ACTS", "ANTS",
      "CASA", "CAST", "CATS", "DAME", "DAMN", "DEAL", "EATS", "FAST",
      "FATS", "FLAK", "LAKE", "LAME", "LASS", "MADE", "MAKE", "MANY",
    ],
  },
  {
    size: 4,
    rows: ["OTUN", "GTAS", "ISEO", "SPUT"],
    targets: [
      "GOT", "SAT", "NUTS", "TOES", "ISSUE",
    ],
    bonus: [
      "ATE", "EAT", "EST", "GIT", "ITS", "NUT", "OAT", "OUT",
      "PEA", "PET", "PIG", "PIT", "PUS", "PUT", "SEA", "SET",
      "SIP", "SIS", "SIT", "SOT", "SOU", "SUN", "TAN", "TAS",
      "TAT", "TEA", "TIP", "TOE", "UNS", "UPS", "USE", "AUTO",
      "EATS", "GIST", "OATS", "PEAS", "PEAT", "PESO", "PEST", "PETS",
    ],
  },
  {
    size: 4,
    rows: ["LDBS", "ALEL", "OITI", "PTST"],
    targets: [
      "LAD", "BELT", "LIED", "TIES", "PILOTS",
    ],
    bonus: [
      "AIL", "ALE", "ALL", "ALT", "BED", "BET", "ELL", "ILL",
      "ITS", "LED", "LIE", "LIP", "LIT", "LOP", "LOT", "OIL",
      "OLD", "OPT", "PIE", "PIT", "POI", "POT", "SED", "SEI",
      "SET", "SIP", "SIT", "TIE", "TIL", "TIP", "TOP", "BELL",
      "BETS", "BLED", "BLIP", "BLOT", "DAIS", "DELI", "LETS", "LIES",
    ],
  },
  {
    size: 4,
    rows: ["ADES", "CTER", "ATHS", "WGIR"],
    targets: [
      "RIG", "ACTED", "THREE", "WATERS",
    ],
    bonus: [
      "ACT", "ATE", "CAD", "CAT", "CAW", "ERE", "ERS", "GAT",
      "GIT", "HER", "HET", "HIS", "HIT", "ISH", "RED", "RES",
      "SED", "SEE", "SET", "SHE", "SIR", "SIT", "TAD", "TAG",
      "TAT", "TEE", "THE", "WAG", "DATA", "DATE", "DEER", "GATE",
      "HEED", "HERE", "HERS", "RISE", "RITE", "SEED", "SEES", "SHED",
    ],
  },
  {
    size: 4,
    rows: ["WIAW", "OHTY", "TLLE", "OJRS"],
    targets: [
      "HOT", "JOLLY", "WHITE", "WATERS",
    ],
    bonus: [
      "AHI", "ATE", "ELL", "ERS", "HAT", "HAY", "HIT", "JOT",
      "LOT", "LOW", "LYE", "RES", "SET", "SLY", "THO", "TOW",
      "WAY", "WHO", "WIT", "YAW", "YET", "AYES", "HATE", "JOLT",
      "RELY", "SELL", "TELL", "THAT", "THAW", "TOLL", "WAIT", "WITH",
      "YELL", "HATER", "HATES", "TOLLS", "WATER", "HATERS", "HOLLER", "LOITER",
    ],
  },
  {
    size: 4,
    rows: ["DNER", "MOPV", "RGRE", "YMAS"],
    targets: [
      "GYM", "ROD", "PROM", "NERVES",
    ],
    bonus: [
      "AGO", "ARE", "ARM", "DOG", "DON", "EAR", "END", "EON",
      "ERA", "ERS", "GAS", "GON", "MAG", "MAS", "MON", "MOP",
      "MOR", "NOD", "NOG", "NOM", "NOR", "ONE", "ORA", "ORE",
      "ORS", "PEA", "PEN", "PER", "POD", "PRE", "PRO", "RAG",
      "RAM", "REP", "RES", "ROM", "SAG", "SEA", "ARMY", "ARSE",
    ],
  },
  {
    size: 4,
    rows: ["ELLY", "HENE", "HWRO", "BABO"],
    targets: [
      "BORN", "HERO", "WHEEL", "BARELY",
    ],
    bonus: [
      "ARE", "AWE", "BAR", "BRA", "BRO", "EEL", "EEN", "ELL",
      "EON", "ERA", "ERE", "HEN", "HER", "LYE", "NEE", "NEW",
      "NOR", "ONE", "ORA", "ORB", "ORE", "RAW", "ROB", "WAR",
      "WEE", "YEN", "BARE", "BARN", "BONE", "BONY", "BORE", "BREW",
      "HEEL", "HELL", "HERE", "HEWN", "OBOE", "ONLY", "REEL", "RELY",
    ],
  },
  {
    size: 4,
    rows: ["OBEE", "IYCN", "SDTS", "EMIO"],
    targets: [
      "BOYS", "IDIOT", "SCENE", "TIMES",
    ],
    bonus: [
      "BEE", "BID", "BIO", "BOY", "DIM", "DIS", "DIT", "DYE",
      "EEN", "ISM", "ITS", "MED", "MID", "NEE", "SED", "SIT",
      "SOT", "STY", "YEN", "BEEN", "BENT", "BIDE", "BIDS", "CENT",
      "DIME", "DISC", "EDIT", "EMIT", "MEDS", "MISO", "MIST", "OBEY",
      "SEMI", "SIDE", "TIDE", "TIDY", "TIME", "CENTS", "DIMES", "EDITS",
    ],
  },
  {
    size: 4,
    rows: ["SCLS", "EODL", "PUTI", "LAID"],
    targets: [
      "ILL", "LAID", "TAPES", "CLOUDS",
    ],
    bonus: [
      "AID", "APE", "COP", "COS", "COT", "DID", "DIT", "DOS",
      "DOT", "DUE", "LAP", "LID", "LIT", "LOD", "LOP", "LOT",
      "OLD", "OUT", "PAL", "POD", "POT", "PUT", "SEC", "SOD",
      "SOT", "SOU", "TAP", "TIL", "TOE", "TOP", "APES", "ATOP",
      "AUTO", "CLOD", "CLOT", "COLD", "COPE", "COUP", "DIAL", "DOCS",
    ],
  },
  {
    size: 4,
    rows: ["ANLD", "HDEN", "SOTU", "RWOM"],
    targets: [
      "WOOD", "HANDS", "MOTEL", "WOUND",
    ],
    bonus: [
      "ADO", "ADS", "AND", "DAH", "DEN", "DOO", "DOS", "DOT",
      "END", "HAD", "HOE", "HOO", "HOS", "HOT", "LED", "MOW",
      "NET", "NUT", "ORS", "OUT", "ROD", "ROT", "ROW", "SOD",
      "SOT", "SOW", "TEN", "TOE", "TOO", "TOR", "TOW", "TWO",
      "WOE", "ANDS", "DENT", "DOOM", "DOTE", "ENDS", "HAND", "HOOT",
    ],
  },
  {
    size: 4,
    rows: ["GYKN", "IRSI", "APND", "CWAR"],
    targets: [
      "CAR", "GRIP", "SINK", "DRAWN",
    ],
    bonus: [
      "ADS", "AIR", "AND", "CAP", "CAW", "DIS", "INK", "INS",
      "KID", "KIN", "NAP", "PAD", "PAN", "PAR", "PAW", "PIG",
      "PRY", "RAD", "RAN", "RAP", "RAW", "RIG", "RIP", "SIN",
      "SKI", "SKY", "SPA", "WAD", "WAR", "AIRS", "AIRY", "ANDS",
      "CAPS", "CARP", "CARS", "DARN", "DAWN", "DISK", "DRAW", "INKS",
    ],
  },
  {
    size: 4,
    rows: ["URUT", "MNES", "OANR", "RSCK"],
    targets: [
      "RACK", "TUNA", "MANNER", "RUMORS",
    ],
    bonus: [
      "CAN", "CAR", "EAR", "ERS", "EST", "MAN", "MAS", "MON",
      "MOR", "NET", "NOM", "NOR", "NUT", "OAR", "ONE", "ORA",
      "ORS", "RAM", "RAN", "RES", "ROM", "RUM", "RUN", "RUT",
      "SAC", "SEA", "SET", "SON", "SUN", "SUR", "TEA", "TEN",
      "URN", "USE", "ACNE", "ACRE", "CANE", "CANN", "CANS", "CARS",
    ],
  },
  {
    size: 4,
    rows: ["CCKR", "MEEH", "NISR", "PUAW"],
    targets: [
      "AIM", "SEC", "WRECK", "PUNISH",
    ],
    bonus: [
      "AIN", "ARE", "EEN", "ERA", "ERS", "HER", "ISH", "MEE",
      "MEN", "NEE", "NIP", "PIE", "PIN", "PUN", "PUS", "RAW",
      "REC", "RES", "SAW", "SEE", "SEI", "SHE", "SIN", "SIP",
      "SUN", "UNI", "USE", "WAR", "WAS", "ARSE", "ERAS", "HECK",
      "HERS", "KEEN", "MEEK", "MENU", "MESH", "MINE", "NECK", "PIER",
    ],
  },
  {
    size: 4,
    rows: ["ORSM", "UDEE", "DMST", "NALA"],
    targets: [
      "MEET", "OURS", "SALAD", "DEMAND",
    ],
    bonus: [
      "ADD", "ALT", "AND", "ATE", "DAM", "DUD", "ERS", "EST",
      "LAD", "MAD", "MAN", "MAS", "MED", "MEE", "MEM", "MET",
      "MUD", "ODD", "ORE", "ORS", "OUR", "RED", "RES", "ROD",
      "RUM", "SAD", "SAT", "SED", "SEE", "SET", "TAS", "TEE",
      "ADDS", "DAME", "DAMN", "DAMS", "DEEM", "DRUM", "DUDE", "DUDS",
    ],
  },
  {
    size: 4,
    rows: ["RLBS", "IAAA", "BEDL", "RUST"],
    targets: [
      "BUST", "LIAR", "SALAD", "BABIES",
    ],
    bonus: [
      "ABS", "ADS", "AIL", "AIR", "ALT", "BAD", "BAR", "BAS",
      "BED", "BUS", "DAB", "DUB", "DUE", "EAR", "EST", "LAB",
      "LAD", "LIB", "LIE", "RAD", "RED", "RES", "RIB", "RUB",
      "SAD", "SEA", "SED", "SEI", "SUB", "SUR", "USE", "ABED",
      "BAAS", "BABE", "BADE", "BAIL", "BALD", "BEAD", "BEAR", "BEDS",
    ],
  },
  {
    size: 4,
    rows: ["AWEM", "FLOA", "LPKR", "SOMF"],
    targets: [
      "PORK", "WORM", "FALLS", "FRAME",
    ],
    bonus: [
      "ALE", "ALL", "ARM", "AWE", "EAR", "ELF", "ELL", "FRO",
      "LAW", "LOP", "LOW", "MEW", "MOP", "MOR", "MOW", "OAK",
      "OAR", "OPS", "ORA", "OWE", "OWL", "RAM", "ROM", "ROW",
      "WOE", "WOK", "WOP", "ALLS", "ALOE", "AMOK", "FALL", "FLAW",
      "FLEA", "FLEW", "FLOE", "FLOP", "FLOW", "FROM", "LEAK", "MAKO",
    ],
  },
  {
    size: 5,
    rows: ["DECNL", "OTADE", "YSSRA", "EUAEY", "TYDCT"],
    targets: [
      "CARE", "LEND", "YARD", "CAUSED", "TESTED",
    ],
    bonus: [
      "ACT", "ADS", "AND", "ARE", "ATE", "CAD", "CAN", "CAR",
      "CAT", "DAY", "DEN", "DEY", "DOS", "DOT", "DRY", "DUE",
      "DYE", "EAR", "EAT", "END", "ERA", "ERE", "ERS", "EST",
      "LED", "RAD", "RAN", "RAT", "REC", "RED", "RES", "RYE",
      "SAC", "SAD", "SAT", "SAY", "SEA", "SEC", "SED", "SET",
    ],
  },
  {
    size: 5,
    rows: ["SNCOD", "SPUKW", "ESONE", "LITIN", "IHDGS"],
    targets: [
      "DOWN", "SITS", "HIDING", "SPOKEN", "COUNSEL",
    ],
    bonus: [
      "COW", "CUP", "DIE", "DIG", "DIS", "DIT", "EST", "GIN",
      "GIT", "HID", "HIS", "HIT", "ING", "INK", "INN", "INS",
      "ION", "ITS", "KOI", "LID", "LIE", "LIT", "NEW", "NOT",
      "NUN", "OIL", "ONE", "OPS", "OWE", "OWN", "POI", "POT",
      "PUN", "PUS", "SEI", "SIN", "SIT", "SON", "SOT", "SOU",
    ],
  },
  {
    size: 5,
    rows: ["ODUMP", "NORTL", "SSOOO", "CTMKW", "ANSOH"],
    targets: [
      "CANS", "DUMP", "SOON", "TOOK", "WHOM", "STORM",
    ],
    bonus: [
      "ACT", "ANT", "CAN", "CAT", "DON", "DOO", "DOS", "HOM",
      "HOS", "LOO", "LOT", "LOW", "MOR", "MOW", "MUD", "NOD",
      "NOR", "ONS", "ORS", "OUR", "OUT", "ROD", "ROM", "ROT",
      "ROW", "RUM", "RUT", "SOD", "SON", "SOT", "SOU", "SOW",
      "TAN", "TOO", "TOR", "TOW", "UMP", "WHO", "WOK", "ACTS",
    ],
  },
  {
    size: 5,
    rows: ["SEROE", "MIOSC", "OEDUB", "YOSIE", "EDENG"],
    targets: [
      "EYES", "BEGINS", "DOOMED", "SCORES", "SERIOUS",
    ],
    bonus: [
      "BEG", "BID", "BIG", "BIN", "BUS", "COO", "COS", "CUD",
      "CUE", "DEN", "DEY", "DIE", "DIG", "DIM", "DIS", "DOO",
      "DOS", "DUB", "DUE", "DYE", "ERS", "EYE", "GIN", "ING",
      "INS", "IRE", "ISM", "MED", "MID", "MOI", "NEG", "ORE",
      "ORS", "RES", "RID", "RIM", "ROD", "SEC", "SED", "SEI",
    ],
  },
  {
    size: 5,
    rows: ["USHOE", "IKSMN", "SLUIR", "OLBCE", "LIKED"],
    targets: [
      "BEER", "HOME", "MINE", "SKILLS", "SUCKED",
    ],
    bonus: [
      "BED", "BEE", "BIN", "BIO", "BUM", "BUS", "EON", "HOE",
      "HOM", "HON", "HOS", "ICE", "ILK", "ILL", "IRE", "ISH",
      "ISM", "LIB", "MEN", "MIC", "MON", "NOM", "OIL", "ONE",
      "REC", "RED", "RIB", "RIM", "SIN", "SIR", "SIS", "SKI",
      "SON", "SUB", "SUM", "BIKE", "BULK", "BULL", "BUMS", "BUSH",
    ],
  },
  {
    size: 5,
    rows: ["HOYIT", "KNURD", "EDICE", "THLHS", "SAESA"],
    targets: [
      "HOUR", "LINK", "TIRE", "SHINY", "CHASED", "SEATED",
    ],
    bonus: [
      "AHI", "ALE", "ATE", "CRY", "CUD", "CUR", "DEN", "DIT",
      "DRY", "DUN", "EAT", "END", "HAS", "HAT", "HEN", "HER",
      "HET", "HID", "HON", "HOY", "ICE", "INK", "IRE", "LAH",
      "LID", "NET", "NIL", "ONE", "OUR", "REC", "RED", "RES",
      "RID", "RUN", "SAT", "SEA", "SEC", "SED", "SHE", "TAS",
    ],
  },
  {
    size: 5,
    rows: ["PBOTS", "AGOME", "JINTL", "BETIA", "OCRUD"],
    targets: [
      "BOOM", "PAIN", "DURING", "LATEST", "OBJECT",
    ],
    bonus: [
      "AGO", "AID", "AIL", "AIN", "AIR", "ALE", "ALT", "ATE",
      "BAG", "BET", "BIG", "BIN", "BIO", "BIT", "BOG", "BOT",
      "DIT", "EST", "GAB", "GAP", "GIN", "GIT", "GON", "GOO",
      "GOT", "ING", "ION", "IRE", "JAB", "JET", "JIB", "JIG",
      "LAD", "LID", "LIT", "MET", "MOB", "MOI", "MON", "NET",
    ],
  },
  {
    size: 5,
    rows: ["FDPCK", "EDSIS", "CATEA", "RNSFE", "CAHKR"],
    targets: [
      "SEEK", "SITS", "CRASH", "PICKS", "SAFER", "DANCED",
    ],
    bonus: [
      "ADD", "ADS", "AFT", "ANT", "ASK", "ATE", "CAD", "CAN",
      "CAR", "CAT", "DEF", "EAR", "EAT", "EST", "FED", "FEE",
      "FER", "HAS", "ITS", "KIT", "PIE", "PIT", "RAD", "RAN",
      "RAT", "REF", "SAC", "SAD", "SAT", "SEA", "SEE", "SEI",
      "SET", "SIP", "SIS", "SIT", "SKI", "TAD", "TAN", "TAR",
    ],
  },
  {
    size: 5,
    rows: ["ASDSE", "EEIRI", "DRVRV", "NIGRW", "SSKOO"],
    targets: [
      "SIDE", "WORKS", "EASIER", "SERVED", "VIRGIN",
    ],
    bonus: [
      "DIE", "DIG", "DIS", "ERE", "ERR", "ERS", "GIN", "GOO",
      "INS", "IRE", "KID", "KIN", "RED", "RES", "RID", "RIG",
      "ROW", "SEA", "SED", "SEE", "SEI", "SIN", "SIR", "SIS",
      "SKI", "VIE", "WOK", "DEED", "DEER", "DIED", "DIES", "DIGS",
      "DIRE", "DISK", "DISS", "DIVE", "EASE", "GIVE", "GRID", "GRIN",
    ],
  },
  {
    size: 5,
    rows: ["AILCE", "VLMUS", "EOCSB", "SHIEN", "AILOB"],
    targets: [
      "BONE", "CLUB", "CHILI", "MOVES", "CLAIMS",
    ],
    bonus: [
      "AHI", "AIL", "AIM", "ALE", "ALL", "BUM", "BUS", "COS",
      "CUE", "ELL", "EON", "HAS", "HIS", "HOC", "HOE", "HOM",
      "HOS", "ICE", "ILL", "ION", "ISH", "ISM", "LIE", "LOB",
      "MIL", "MOI", "OIL", "ONE", "ONS", "OVA", "SEC", "SEI",
      "SHE", "SUB", "SUM", "USE", "VIA", "AIMS", "ALOE", "BOIL",
    ],
  },
  {
    size: 5,
    rows: ["TERSL", "TRSLO", "ERARD", "LWTAB", "POSSR"],
    targets: [
      "RATS", "BRASS", "POWER", "DOLLARS", "LETTERS",
    ],
    bonus: [
      "ABS", "ADO", "ALL", "ARE", "ART", "AWE", "BAD", "BAR",
      "BAS", "BAT", "BRA", "BRO", "DAB", "DOS", "ERA", "ERE",
      "ERR", "ERS", "LAW", "LOD", "LOP", "LOT", "LOW", "OLD",
      "ORA", "ORB", "ORS", "OWE", "OWL", "POT", "RAD", "RAT",
      "RAW", "RES", "ROD", "SAD", "SAT", "SAW", "SET", "SOD",
    ],
  },
  {
    size: 5,
    rows: ["POSGN", "UDTAI", "SNHVY", "LGIRC", "IRDWO"],
    targets: [
      "GIRL", "CROWD", "POUNDS", "RIGHTS", "SAVING",
    ],
    bonus: [
      "AHI", "AIN", "COW", "CRY", "DIG", "DOS", "DOT", "DRY",
      "DUN", "GAS", "GAT", "GAY", "GIN", "HAG", "HAS", "HAT",
      "HAY", "HID", "ING", "INS", "NAG", "POD", "POT", "PUN",
      "PUS", "RID", "RIG", "ROW", "SAG", "SAT", "SAY", "SOD",
      "SOT", "SOU", "SUN", "TAG", "TAN", "TAS", "TOP", "UNI",
    ],
  },
  {
    size: 5,
    rows: ["BUBNI", "EYDLH", "LSERI", "ASRCV", "ABEAR"],
    targets: [
      "BASE", "BUYS", "RARE", "VICE", "BLIND", "LASER",
    ],
    bonus: [
      "ABS", "ALE", "ARE", "BAS", "BRA", "BUB", "BUY", "CAR",
      "DEY", "DUB", "DUE", "DYE", "EAR", "ERA", "ERE", "ERR",
      "ERS", "EYE", "ICE", "IRE", "LAB", "LED", "LYE", "NIL",
      "REC", "RED", "RES", "SEA", "SEC", "SED", "SLY", "ACED",
      "ACES", "ACRE", "ARSE", "BAAS", "BALE", "BASS", "BEAR", "BLED",
    ],
  },
  {
    size: 5,
    rows: ["FFEDT", "UTTIT", "SABEI", "KERTM", "NESEH"],
    targets: [
      "ITEM", "TAKEN", "THESE", "BITTER", "STUFFED",
    ],
    bonus: [
      "AKE", "ARE", "ART", "ASK", "ATE", "BAR", "BAS", "BAT",
      "BEE", "BET", "BID", "BIT", "BRA", "DEF", "DIE", "DIT",
      "EAR", "EAT", "EEN", "EFF", "ERA", "ERE", "ERS", "EST",
      "FED", "HEM", "HER", "HET", "ITS", "MET", "NEE", "RAT",
      "RES", "SAT", "SEA", "SEE", "SET", "TAB", "TAR", "TAS",
    ],
  },
  {
    size: 5,
    rows: ["NEHOS", "ANLER", "CHRUE", "SEVTL", "ATOLB"],
    targets: [
      "HOLE", "BLUES", "LOVES", "CHANNEL", "RETREAT",
    ],
    bonus: [
      "ATE", "CAN", "EAT", "EEL", "ELL", "ERE", "ERS", "EST",
      "HEN", "HER", "HET", "HOE", "HOS", "LOT", "LUV", "ORE",
      "ORS", "REC", "RES", "RUT", "SAT", "SEA", "SEC", "SEE",
      "SET", "SHE", "TAS", "TEA", "TEE", "TOE", "URN", "VET",
      "ACES", "ACHE", "ACNE", "BLOT", "BLUE", "BLUR", "CANE", "CANN",
    ],
  },
  {
    size: 5,
    rows: ["IFEVL", "LTLKO", "LULYO", "ALOWR", "SWABA"],
    targets: [
      "FILL", "ABOUT", "BROKE", "LOVELY", "SWALLOW",
    ],
    bonus: [
      "ALL", "ALT", "BAR", "BOA", "BOW", "BOY", "BRA", "BRO",
      "ELF", "ELL", "FIT", "FLU", "FLY", "ILL", "LAB", "LAW",
      "LIT", "LOB", "LOO", "LOW", "ORA", "ORB", "OUT", "OWL",
      "RAW", "ROW", "SAW", "TIL", "VET", "WAR", "WAS", "WOK",
      "WRY", "YOU", "ALLS", "AWRY", "BALL", "BAWL", "BOLT", "BOUT",
    ],
  },
  {
    size: 5,
    rows: ["EDRPP", "RIROR", "VUMIH", "EETSU", "SMIES"],
    targets: [
      "SHOP", "ISSUE", "MEETS", "PRIOR", "DRIVES", "MURDER",
    ],
    bonus: [
      "DIE", "DIM", "EST", "HIM", "HIS", "HIT", "HOM", "HOP",
      "IRE", "ISH", "ISM", "ITS", "MEE", "MEM", "MET", "MID",
      "MOI", "MOP", "MOR", "POI", "PRO", "RED", "RID", "RIM",
      "ROM", "RUM", "RUT", "SEE", "SEI", "SET", "SIR", "SIT",
      "TEE", "TIE", "USE", "VET", "VIE", "DIME", "DIRE", "DIVE",
    ],
  },
  {
    size: 5,
    rows: ["GAIER", "YRDEB", "SUSAL", "TMYYD", "UDWAE"],
    targets: [
      "DRUM", "GRAY", "WAYS", "BLADE", "RIDER", "STUDY",
    ],
    bonus: [
      "ADS", "AID", "AIR", "ALE", "BAD", "BAS", "BED", "BEE",
      "DAB", "DAY", "DEY", "DIE", "DRY", "DYE", "EEL", "ERE",
      "GAD", "GAY", "LAB", "LAD", "LAY", "LED", "LYE", "MUD",
      "RAD", "RAG", "RED", "RES", "RID", "RUM", "RUT", "SAD",
      "SAY", "SEA", "SED", "SEE", "SEI", "SUM", "SUR", "USE",
    ],
  },
  {
    size: 5,
    rows: ["AVISP", "CLYRW", "EYRLE", "CNVNG", "EALUE"],
    targets: [
      "NEWS", "UGLY", "VALUE", "PRIVACY", "SILENCE",
    ],
    bonus: [
      "ALE", "ANY", "CAN", "ERR", "ERS", "GEL", "GUN", "GUV",
      "IRE", "LAC", "LEG", "LUG", "LUV", "LYE", "NEG", "NEW",
      "PRE", "PRY", "RYE", "SIR", "WRY", "YEN", "ACNE", "CANE",
      "ENVY", "LACE", "LIRE", "LISP", "LUGE", "LUNG", "RELY", "RILE",
      "SIRE", "SPRY", "ULNA", "VANE", "VILE", "CYCLE", "LUNGE", "NEWLY",
    ],
  },
  {
    size: 5,
    rows: ["LKSUF", "FATEF", "TKTPR", "CETNC", "REDOE"],
    targets: [
      "DECK", "AFTER", "STUFF", "TALKS", "PERCENT",
    ],
    bonus: [
      "AFT", "AKE", "ASK", "ATE", "CON", "COT", "DON", "DOT",
      "EFF", "END", "EON", "ERE", "EST", "FAT", "FER", "NOD",
      "NOT", "ONE", "PER", "PET", "PRE", "REC", "RED", "REF",
      "REP", "RES", "SAT", "SET", "TAS", "TAT", "TEE", "TOE",
      "TON", "USE", "CENT", "CODE", "CONE", "CRED", "DEER", "DONE",
    ],
  },
  {
    size: 5,
    rows: ["TTSRT", "AGELY", "LVNEO", "AEIST", "SZNTL"],
    targets: [
      "SIZE", "TREE", "LATELY", "TALENT", "SAVINGS",
    ],
    bonus: [
      "AGE", "ALE", "ATE", "EEL", "EEN", "ERS", "EST", "GAL",
      "GAT", "GEL", "GET", "ING", "INS", "ITS", "LAG", "LEG",
      "LOT", "LYE", "NEE", "NEG", "NET", "RES", "RYE", "SEA",
      "SEE", "SEI", "SET", "SIN", "SIT", "SLY", "SOT", "SOY",
      "TAG", "TAT", "TEE", "TEN", "TIE", "TIN", "TOE", "TOY",
    ],
  },
  {
    size: 5,
    rows: ["TSAGE", "ESALR", "AFMEA", "RFOEL", "USECD"],
    targets: [
      "DEAL", "REAL", "TEARS", "COFFEE", "MASSAGE",
    ],
    bonus: [
      "AGE", "ALE", "ARE", "COS", "EAR", "EEL", "EFF", "ERA",
      "ERE", "EST", "FAR", "FEE", "FOE", "FUR", "GAL", "GAS",
      "GEL", "LAG", "LED", "LEG", "MAG", "MAS", "MED", "MEE",
      "OFF", "SAG", "SEA", "SEC", "SEE", "SET", "SUR", "TEA",
      "USE", "AFAR", "AREA", "ARSE", "COED", "COMA", "COMS", "DEAR",
    ],
  },
  {
    size: 5,
    rows: ["DURSN", "HTAYS", "SPADS", "OTIWE", "GHGRB"],
    targets: [
      "HIDE", "PASS", "WAYS", "HURTS", "BRIGHT",
    ],
    bonus: [
      "ADS", "AID", "AIR", "APT", "ART", "AWE", "BED", "DAY",
      "DEW", "DIG", "DIP", "DIT", "GIT", "GOT", "HID", "HIP",
      "HIT", "HOG", "HOP", "HOS", "HOT", "HUT", "IRE", "ITS",
      "OPS", "OPT", "PAD", "PAR", "PAS", "PAW", "PAY", "PIG",
      "PIT", "POT", "RAD", "RAP", "RAT", "RED", "RES", "RID",
    ],
  },
  {
    size: 5,
    rows: ["IUDNE", "MRTEC", "NIDEP", "RUBOV", "RYYRE"],
    targets: [
      "BURY", "DRUM", "OPEN", "UNIT", "EVERY", "DECENT",
    ],
    bonus: [
      "BED", "BEE", "BET", "BID", "BIN", "BIT", "BOD", "BOP",
      "BOY", "BRO", "BUN", "BUY", "DEN", "DIM", "DIT", "DUB",
      "DUN", "EEN", "END", "MID", "MUD", "NEE", "NET", "ORB",
      "ORE", "PEE", "PEN", "PET", "POD", "RIB", "RID", "RIM",
      "ROB", "ROD", "RUB", "RUM", "RUN", "RUT", "TEE", "TEN",
    ],
  },
  {
    size: 5,
    rows: ["CNNDO", "RASFO", "SGHKN", "IVEDE", "XTHSE"],
    targets: [
      "FOOD", "KNEE", "GIVES", "SIXTH", "CRASHED",
    ],
    bonus: [
      "AGE", "AND", "ASK", "CAN", "CAR", "DEN", "DON", "DOO",
      "EEN", "END", "GAS", "GET", "GIT", "HAG", "HAS", "HET",
      "KEG", "NAG", "NEE", "NOD", "ONE", "RAG", "RAN", "SAC",
      "SAG", "SED", "SEE", "SET", "SHE", "SIT", "SIX", "THE",
      "VEG", "VET", "AGED", "AGES", "ANDS", "CAGE", "CANN", "CANS",
    ],
  },
  {
    size: 5,
    rows: ["GAORE", "IDEEL", "VNDTA", "ECERE", "SAREC"],
    targets: [
      "DEAL", "TREE", "ADORE", "GIVEN", "SCENE",
    ],
    bonus: [
      "ADD", "ADO", "AID", "AIN", "ALE", "ALT", "ARE", "ART",
      "ATE", "CAR", "DEN", "DIG", "EAR", "EAT", "EEL", "EEN",
      "END", "ERA", "ERE", "ERR", "GAD", "GIN", "LED", "NEE",
      "NET", "ODD", "ORE", "RAT", "REC", "RED", "ROD", "SAC",
      "SEA", "SEC", "TAR", "TEA", "TEE", "TEN", "VIA", "ACED",
    ],
  },
  {
    size: 5,
    rows: ["SSAVH", "GTIIR", "SNHED", "OEGDE", "CUERG"],
    targets: [
      "COSTS", "HIRED", "OUGHT", "DEGREE", "SAVING",
    ],
    bonus: [
      "AID", "AIN", "AIR", "CON", "COS", "CUE", "DIE", "EEN",
      "EON", "ERE", "EST", "HEN", "HER", "HID", "HIS", "HIT",
      "ING", "INS", "IRE", "ITS", "NEE", "NEG", "ONE", "ONS",
      "RED", "RID", "SAT", "SEC", "SEE", "SIN", "SIT", "SON",
      "SOU", "TAS", "THE", "TIE", "TIN", "VAT", "VIA", "VIE",
    ],
  },
  {
    size: 5,
    rows: ["IWORS", "DOMBI", "NEMNG", "TSERO", "STUBS"],
    targets: [
      "BUST", "SORE", "WIDE", "BORING", "MOMENT",
    ],
    bonus: [
      "BEE", "BET", "BIG", "BIN", "BOG", "BOW", "BRO", "BUS",
      "BUT", "DEN", "DON", "DOO", "EEN", "END", "EON", "ERS",
      "EST", "GIN", "GON", "ING", "ION", "MED", "MEE", "MEM",
      "MEN", "MET", "MOB", "MOI", "MON", "MOR", "MOW", "NEE",
      "NET", "NOD", "NOG", "NOM", "NOR", "NOW", "ONE", "ONS",
    ],
  },
  {
    size: 5,
    rows: ["WLCOS", "ARODP", "TTVSE", "RIFAE", "PRELR"],
    targets: [
      "CODE", "TRIP", "SAFER", "VITAL", "TROOPS",
    ],
    bonus: [
      "AFT", "ALE", "ARE", "ART", "COO", "COP", "COS", "COT",
      "DOO", "DOS", "DOT", "EAR", "EEL", "ELF", "ERA", "ERR",
      "FAR", "FER", "FIR", "FIT", "IFS", "IRE", "LAW", "LOD",
      "LOO", "LOT", "OPS", "ORA", "OVA", "PEA", "PEE", "PIE",
      "PIT", "POD", "POO", "PRE", "RAT", "RAW", "REF", "RES",
    ],
  },
  {
    size: 5,
    rows: ["NTTOE", "WFLPS", "OLORT", "FTKOS", "RACKO"],
    targets: [
      "FACT", "FLOW", "LOOK", "PORT", "TOES", "TRACKS",
    ],
    bonus: [
      "ACT", "AFT", "ART", "CAR", "CAT", "COO", "COS", "COT",
      "EST", "FAR", "FAT", "FOP", "FOR", "LOO", "LOP", "LOT",
      "LOW", "OFT", "OPS", "OPT", "ORS", "OWL", "OWN", "POO",
      "POT", "PRO", "RAT", "ROT", "SOT", "TAR", "TOE", "TOO",
      "TOP", "TOR", "TOW", "TWO", "ATOP", "CART", "COOK", "COOL",
    ],
  },
  {
    size: 5,
    rows: ["USGRN", "OCWEI", "FIAHR", "NLDSE", "LSRHP"],
    targets: [
      "FILL", "GREW", "FOCUS", "READS", "SHINE",
    ],
    bonus: [
      "ADS", "AHI", "AID", "AIL", "AIN", "ALL", "AWE", "CAD",
      "CAW", "COS", "DAH", "ERE", "ERS", "FIN", "HAD", "HAS",
      "HEN", "HEP", "HER", "ILL", "INS", "IRE", "LAC", "LAD",
      "LAH", "LAW", "LID", "NEG", "NEW", "NIL", "OIL", "PER",
      "REP", "RES", "SAC", "SAD", "SAW", "SHE", "SOU", "WAD",
    ],
  },
  {
    size: 5,
    rows: ["DIIIC", "CTNCL", "TSGHL", "RWAEE", "ATSSW"],
    targets: [
      "SWELL", "CLINIC", "INCHES", "STARTS", "WASTING",
    ],
    bonus: [
      "AGE", "ART", "DIT", "EAT", "EEL", "ELL", "EST", "EWE",
      "GAS", "GAT", "GEL", "HAG", "HAS", "HAT", "ILL", "ING",
      "INS", "ITS", "LEG", "NIL", "RAT", "RAW", "SAG", "SAT",
      "SAW", "SEA", "SEE", "SEW", "TAG", "TAR", "TAS", "TIN",
      "WAG", "WAR", "WAS", "WEE", "AGES", "ARTS", "CHAT", "CHAW",
    ],
  },
  {
    size: 5,
    rows: ["LKSET", "OFHGS", "ATSCT", "OECAS", "RBZLE"],
    targets: [
      "GETS", "ZERO", "CATCH", "FOLKS", "SALES", "BREATH",
    ],
    bonus: [
      "ACT", "AFT", "ALE", "ATE", "BET", "BOA", "BOT", "BRO",
      "CAT", "EAT", "EST", "FAT", "GET", "HET", "LAC", "LOT",
      "OAF", "OAT", "OFT", "ORB", "ORE", "REC", "RES", "ROB",
      "ROT", "SAC", "SAT", "SEA", "SEC", "SET", "SHE", "TAS",
      "TEA", "THE", "TOE", "TOR", "ACES", "ACHE", "ACTS", "BEAT",
    ],
  },
  {
    size: 5,
    rows: ["OUMIC", "NESSA", "DIHDL", "YZOUS", "ZIDJO"],
    targets: [
      "ALSO", "DIZZY", "JOINED", "SHOULD", "MUSICAL",
    ],
    bonus: [
      "ADO", "ADS", "AIM", "CAD", "DEN", "DIE", "DIS", "DUD",
      "END", "EON", "HEM", "HEN", "HID", "HIS", "ISH", "ISM",
      "JUS", "LAC", "LAD", "MED", "MEN", "MIC", "ONE", "SAC",
      "SAD", "SED", "SEI", "SHE", "SIN", "SIS", "SOU", "SUM",
      "SUN", "UNI", "USE", "AIMS", "CASH", "DAIS", "DASH", "DIES",
    ],
  },
  {
    size: 5,
    rows: ["TEISE", "ASSKE", "MZOOB", "LAEOY", "TLJLL"],
    targets: [
      "MATE", "SEEK", "TALL", "BOOZE", "JOLLY", "KISSES",
    ],
    bonus: [
      "ALE", "ALL", "ALT", "ATE", "BEE", "BOY", "EAT", "ELL",
      "EST", "ISM", "JAM", "JOB", "JOY", "LOB", "LOO", "MAS",
      "MAT", "OAT", "SAT", "SEA", "SEE", "SEI", "SET", "SIS",
      "SKI", "SOB", "SOY", "TAS", "TEA", "ZOO", "BEES", "BOOK",
      "BOSS", "BOYO", "EATS", "ESSE", "JAMS", "KISS", "LOBE", "LOOK",
    ],
  },
  {
    size: 5,
    rows: ["YSEEH", "FLYRA", "EEAEA", "ATSHF", "PINSI"],
    targets: [
      "FISH", "HERE", "SAYS", "FLEET", "PAINT",
    ],
    bonus: [
      "AHI", "AIN", "ALE", "APT", "ARE", "ATE", "EAR", "EAT",
      "EEL", "ELF", "ERA", "ERE", "EST", "EYE", "FAR", "FEE",
      "FER", "FEY", "FLY", "HAS", "HAT", "HAY", "HER", "HIS",
      "IFS", "INS", "ISH", "ITS", "LAH", "LAY", "LYE", "NIP",
      "PIN", "PIT", "RAT", "REF", "RES", "RYE", "SAT", "SAY",
    ],
  },
  {
    size: 5,
    rows: ["OTTAC", "GIFGE", "RXDED", "GAEUI", "BRAGM"],
    targets: [
      "BADGE", "FIXED", "GOTTA", "GUIDE", "GARAGE",
    ],
    bonus: [
      "AFT", "AGE", "ARE", "AXE", "BAD", "BAG", "BAR", "BRA",
      "CAT", "DAB", "DEF", "DIE", "DIG", "DIM", "DIT", "DUD",
      "DUE", "DUG", "EAR", "EAT", "ERA", "FAT", "FED", "FEE",
      "FIG", "FIR", "FIT", "FIX", "GAB", "GAD", "GAT", "GIT",
      "GOT", "GUM", "MID", "MUD", "MUG", "RAD", "RAG", "RED",
    ],
  },
  {
    size: 5,
    rows: ["OHCFT", "NLOII", "LCNPG", "EIASR", "TRRMO"],
    targets: [
      "CELL", "COPS", "GIFT", "ARMOR", "MARTINI",
    ],
    bonus: [
      "AIL", "AIN", "AIR", "ARE", "ARM", "ART", "CAN", "CAP",
      "CAR", "CIG", "CON", "COP", "ELL", "ERA", "ERR", "FIG",
      "FIN", "FIT", "FOP", "GIN", "GIT", "HOC", "HON", "HOP",
      "ICE", "ILL", "INS", "ION", "IRE", "LIE", "LIT", "LOP",
      "MAN", "MAP", "MAS", "MOR", "NAP", "NIL", "NIP", "OFT",
    ],
  },
  {
    size: 5,
    rows: ["NTEMY", "DERSE", "ISELF", "EDALC", "ILLIH"],
    targets: [
      "DIES", "CHILL", "LADIES", "MYSELF", "ENTERED",
    ],
    bonus: [
      "ADS", "AIL", "ALE", "ALL", "DEN", "DID", "DIE", "DIS",
      "EEL", "EEN", "ELF", "ELL", "END", "ERE", "ERS", "FEY",
      "ILL", "LAD", "LED", "LID", "LIE", "MEE", "MET", "NEE",
      "NET", "RED", "RES", "SAD", "SEA", "SED", "SEE", "SEI",
      "SET", "TEE", "TEN", "ALLS", "CLAD", "DEAL", "DEED", "DEEM",
    ],
  },
  {
    size: 5,
    rows: ["ICIEP", "HTWSI", "TASSI", "LEMUS", "TLUSE"],
    targets: [
      "HATE", "PISS", "SAME", "CITIES", "ISSUES", "WALLET",
    ],
    bonus: [
      "AHI", "ALE", "ALL", "ALT", "ATE", "AWE", "EAT", "ELL",
      "EST", "HAM", "HAS", "HAT", "HIT", "ISM", "ITS", "LAH",
      "LAW", "MAS", "MAT", "MAW", "MET", "PEW", "PIE", "SAT",
      "SAW", "SEA", "SEI", "SET", "SEW", "SIP", "SIS", "SIT",
      "SUM", "TAS", "TAT", "TEA", "TIE", "USE", "WAS", "WIT",
    ],
  },
  {
    size: 5,
    rows: ["LOKGN", "WARIW", "ESMAD", "TARWE", "RSISN"],
    targets: [
      "WARM", "WARS", "STEAL", "RAISED", "WORKING",
    ],
    bonus: [
      "AID", "AIM", "AIN", "AIR", "AMI", "ARM", "ART", "ATE",
      "AWE", "DAM", "DEN", "DEW", "DIG", "DIM", "EAR", "EAT",
      "EST", "GIN", "ING", "KID", "KIN", "LAW", "LOW", "MAD",
      "MAS", "MAT", "MAW", "MID", "NEW", "OAK", "OAR", "ORA",
      "ORS", "OWE", "OWL", "RAD", "RAM", "RAT", "RAW", "RID",
    ],
  },
  {
    size: 5,
    rows: ["VRESI", "ISUNM", "DCHOS", "EIIRE", "KCWCA"],
    targets: [
      "EARS", "MINUS", "WICKED", "CHOICES", "SERVICE",
    ],
    bonus: [
      "ARE", "CAR", "CUE", "CUR", "DIE", "DIS", "EAR", "EON",
      "ERA", "ERS", "HID", "HOE", "HOM", "HON", "HOS", "ICE",
      "INS", "ION", "IRE", "ISH", "ISM", "KID", "MOI", "MON",
      "MOR", "NOM", "NOR", "ONE", "ONS", "ORA", "ORE", "ORS",
      "OUR", "REC", "RES", "RID", "ROM", "RUN", "SEA", "SEC",
    ],
  },
  {
    size: 5,
    rows: ["ATIST", "NXRIT", "EEGLR", "RCOHE", "CSCNT"],
    targets: [
      "TAXI", "EXIST", "SCREEN", "SOCCER", "LIGHTER",
    ],
    bonus: [
      "ANT", "AXE", "COG", "CON", "COS", "EEN", "EGO", "EON",
      "ERE", "ERS", "GIT", "GON", "HEN", "HER", "HET", "HOC",
      "HOE", "HOG", "HON", "HOS", "IRE", "ITS", "LIT", "LOG",
      "NEE", "NEG", "NET", "NOG", "ONE", "REC", "RIG", "SIR",
      "SIT", "SIX", "SON", "TAN", "TAX", "TEN", "THE", "THO",
    ],
  },
  {
    size: 5,
    rows: ["ARMFE", "HEDED", "CESIC", "DOLAY", "FIRDT"],
    targets: [
      "LADY", "ROLE", "CHARM", "FILED", "DECIDES",
    ],
    bonus: [
      "AID", "AIL", "ALE", "ARE", "ARM", "CAD", "CAR", "CAT",
      "COS", "DAY", "DEF", "DID", "DIE", "DIS", "DOS", "EAR",
      "EEL", "ERA", "FED", "FEE", "FIR", "FOE", "FOR", "HEM",
      "HER", "ICE", "ICY", "LAC", "LAD", "LAY", "LED", "LID",
      "LIE", "LOD", "MED", "MEE", "OIL", "OLD", "ORA", "RAD",
    ],
  },
  {
    size: 5,
    rows: ["NGSBO", "ISKIM", "EDPUB", "DENLF", "SIGYL"],
    targets: [
      "BOMB", "FULLY", "DESIGN", "PISSED", "KISSING",
    ],
    bonus: [
      "BIB", "BIO", "BUM", "BUN", "DEN", "DIE", "DIG", "DIS",
      "EEN", "END", "FLU", "FLY", "FUM", "FUN", "GIN", "ING",
      "INS", "MOB", "MOI", "NEE", "NEG", "PEE", "PEN", "PLY",
      "PUB", "PUN", "SED", "SEE", "SEI", "SIN", "SIP", "SKI",
      "UNI", "UPS", "BIBS", "BULL", "DEED", "DEEP", "DENY", "DESK",
    ],
  },
  {
    size: 5,
    rows: ["WKARA", "ORLEH", "LSLYI", "DYOSD", "HRRPE"],
    targets: [
      "HIDE", "LEAK", "RELY", "SORRY", "WORLDS",
    ],
    bonus: [
      "AHI", "ALE", "ALL", "ARE", "DIE", "DIS", "DRY", "DYE",
      "EAR", "ELL", "ERA", "HER", "HID", "HIS", "LOP", "LOW",
      "LYE", "OLD", "OPS", "ORA", "ORS", "PRO", "PRY", "ROW",
      "SED", "SLY", "SOW", "SOY", "WOK", "ALLS", "ALSO", "AREA",
      "DROP", "EARS", "ELSE", "HEAL", "HEAR", "HELL", "ISLE", "KALE",
    ],
  },
  {
    size: 5,
    rows: ["LIERW", "SAEVI", "ESESC", "DKAAK", "INLTR"],
    targets: [
      "LAND", "SKIN", "WIVES", "TRACKS", "REALISE",
    ],
    bonus: [
      "AIL", "AKE", "ALT", "AND", "ART", "ASK", "CAR", "CAT",
      "EAR", "EAT", "ERE", "INK", "IRE", "KID", "KIN", "LAC",
      "LIE", "RAT", "RES", "SAC", "SAT", "SEA", "SED", "SEE",
      "SEI", "SIR", "SKI", "TAN", "TAR", "TAS", "AILS", "AKIN",
      "ANDS", "CART", "CASA", "CASE", "DEAL", "DESK", "DIKE", "EASE",
    ],
  },
  {
    size: 5,
    rows: ["NROHS", "EBETU", "ENLER", "NBYAB", "TURPT"],
    targets: [
      "BEEN", "BRUSH", "BOTHER", "PRAYER", "TUNNEL",
    ],
    bonus: [
      "ALE", "ALT", "APT", "ARE", "ART", "BAR", "BAT", "BEE",
      "BET", "BOH", "BOT", "BRA", "BRO", "BUN", "BUT", "BUY",
      "EAR", "EAT", "EEL", "EEN", "ERA", "ERE", "HEN", "HER",
      "HET", "HOE", "HOT", "HUT", "LAB", "LAP", "LAY", "LYE",
      "NEE", "NET", "NUT", "ORB", "ORE", "PAL", "PAR", "PAY",
    ],
  },
  {
    size: 5,
    rows: ["RAOAR", "EBRAE", "RAHDG", "ATESN", "HEBLO"],
    targets: [
      "GEAR", "HEAR", "EARTH", "ABOARD", "BELONGS",
    ],
    bonus: [
      "ADS", "AGE", "ARE", "ART", "ATE", "BAR", "BAT", "BED",
      "BEE", "BET", "BOA", "BRA", "BRO", "DAH", "EAR", "EAT",
      "EEL", "ERA", "GAD", "HAD", "HAG", "HAT", "HET", "LED",
      "OAR", "ONS", "ORA", "ORB", "RAD", "RAG", "RAT", "RED",
      "ROB", "SEA", "SED", "SEE", "SET", "SHE", "SON", "TAB",
    ],
  },
  {
    size: 5,
    rows: ["YSAFE", "DRWWO", "PEEDR", "LUSAN", "LHBIM"],
    targets: [
      "DEEP", "SWELL", "MISERY", "FORWARD", "HUSBAND",
    ],
    bonus: [
      "ABS", "ADO", "ADS", "AIM", "AIN", "AMI", "AND", "ARE",
      "AWE", "BAD", "BAM", "BAN", "BAR", "BAS", "BIN", "BUS",
      "DAB", "DAM", "DEW", "DRY", "EAR", "EEL", "ELL", "ERA",
      "ERE", "ERS", "EWE", "FAR", "FEW", "FOE", "FOR", "ISH",
      "LED", "MAD", "MAN", "MAS", "NAB", "ORA", "OWE", "PEE",
    ],
  },
  {
    size: 5,
    rows: ["VHEDA", "NSERE", "ESDLT", "EEGEU", "FRLSE"],
    targets: [
      "HERE", "FEELS", "TRADE", "DEGREE", "USELESS",
    ],
    bonus: [
      "ARE", "ART", "DEF", "EAR", "EEL", "EEN", "ERA", "ERE",
      "FED", "FEE", "FER", "GEL", "GET", "HER", "LED", "LEG",
      "NEE", "RAD", "RED", "REF", "RES", "SED", "SEE", "SET",
      "SHE", "TEA", "TEE", "USE", "DARE", "DART", "DEAR", "DEED",
      "DEER", "EDGE", "EELS", "ELSE", "ESSE", "FEDS", "FEED", "FEEL",
    ],
  },
  {
    size: 5,
    rows: ["NTEDO", "DETEO", "SBSIN", "RNSDE", "IUGOT"],
    targets: [
      "NEED", "TIDE", "BRINGS", "SUNSET", "TOSSED",
    ],
    bonus: [
      "BED", "BEE", "BET", "DEN", "DIE", "DIS", "DIT", "DOG",
      "DON", "DOO", "DOS", "DOT", "EEN", "END", "EON", "EST",
      "GOT", "GUN", "ING", "INS", "ION", "ITS", "NEE", "NET",
      "NOD", "ONE", "RUG", "RUN", "SED", "SEE", "SEI", "SET",
      "SIN", "SIS", "SIT", "SOD", "SOT", "SUN", "SUR", "TEE",
    ],
  },
  {
    size: 5,
    rows: ["NGBHW", "IAADE", "HYARN", "ORLLS", "LCAEC"],
    targets: [
      "BARS", "WHEN", "CLEAR", "LOYAL", "CRYING",
    ],
    bonus: [
      "AHI", "AIN", "ALE", "ALL", "ARE", "BAD", "BAG", "BAN",
      "BAR", "CAR", "COY", "CRY", "DAB", "DAH", "DAY", "DEN",
      "DEW", "EAR", "ELL", "END", "ERA", "ERS", "GAB", "GAD",
      "GAY", "GIN", "HAD", "HAG", "HAY", "HEN", "HER", "HOC",
      "HOY", "ING", "LAC", "LAD", "LAY", "NAB", "NAG", "NEW",
    ],
  },
  {
    size: 5,
    rows: ["AORLF", "TTNEL", "MTEWO", "EAKRS", "MLCYO"],
    targets: [
      "MEAL", "TORN", "ATTACK", "METERS", "FELLOWS",
    ],
    bonus: [
      "AKE", "ALE", "ATE", "CAT", "CRY", "EAT", "EEL", "EEN",
      "ELF", "ELL", "ERS", "EWE", "FEE", "FER", "FEW", "LAC",
      "LOW", "MAT", "MEM", "MET", "NEE", "NET", "NEW", "NOR",
      "NOT", "OAT", "ONE", "ORE", "ORS", "OWE", "OWL", "OWN",
      "REF", "ROT", "ROW", "SOW", "SOY", "TAT", "TEA", "TEE",
    ],
  },
  {
    size: 5,
    rows: ["FLEBE", "OFRRA", "RPAOL", "TYRDL", "AESDE"],
    targets: [
      "BEAR", "ODDS", "PRAY", "EFFORT", "ROLLED",
    ],
    bonus: [
      "ADD", "ADO", "ADS", "ALL", "APT", "ARE", "ATE", "BAR",
      "BRA", "BRO", "DAY", "DRY", "EAR", "EAT", "EFF", "ELF",
      "ELL", "ERA", "ERE", "ERR", "ERS", "FAD", "FAR", "FER",
      "FOP", "FOR", "FRO", "FRY", "LAB", "LED", "LOD", "LOP",
      "OAF", "OAR", "ODD", "OFF", "OLD", "OPT", "ORA", "ORB",
    ],
  },
  {
    size: 5,
    rows: ["HGIUS", "TSNGC", "TIDEK", "UNETA", "HQLLT"],
    targets: [
      "TALL", "QUIET", "SIGNED", "SUCKED", "HUNTING",
    ],
    bonus: [
      "AKE", "ALE", "ALL", "ALT", "ATE", "DEN", "DIE", "DIS",
      "DIT", "EAT", "EEL", "EEN", "ELL", "END", "GET", "GIG",
      "GIN", "GUN", "HUT", "ING", "INS", "ISH", "ITS", "KEG",
      "LED", "NEE", "NEG", "NET", "NUT", "SIN", "SIT", "SUN",
      "TAT", "TEA", "TEE", "TEN", "TIE", "TIN", "UNI", "UNS",
    ],
  },
  {
    size: 5,
    rows: ["RGSSU", "OANUC", "YARCK", "EWVCE", "EILRD"],
    targets: [
      "VIEW", "CRAWL", "GROANS", "SUCKED", "SUCKER",
    ],
    bonus: [
      "AGO", "AWE", "CUR", "EAR", "EWE", "GAS", "GAY", "LIE",
      "NAG", "OAR", "ORA", "RAG", "RAN", "RAW", "REC", "RED",
      "RUN", "SAG", "SAY", "SUN", "SUR", "UNS", "URN", "VIE",
      "WAR", "WAY", "WEE", "YAW", "CRAG", "CRAW", "CRED", "CUSS",
      "DECK", "EARN", "GNAW", "GRAY", "NAGS", "NARC", "NUKE", "RAGS",
    ],
  },
  {
    size: 5,
    rows: ["YDRHL", "LEAOC", "ILNTS", "SOOEN", "RTCUR"],
    targets: [
      "CORE", "RUNS", "STONE", "COLORS", "HARDLY",
    ],
    bonus: [
      "ALE", "ALL", "ANT", "ARE", "ATE", "CON", "COO", "COS",
      "COT", "CUE", "CUR", "DAH", "DEN", "DEY", "DYE", "EAR",
      "EAT", "ELL", "EON", "ERA", "EST", "HAD", "HAT", "HOC",
      "HON", "HOS", "HOT", "ILL", "ION", "LAD", "LAH", "LED",
      "LIE", "LOO", "LOT", "LYE", "NET", "NOR", "NOT", "OAR",
    ],
  },
  {
    size: 5,
    rows: ["CTMDI", "HAECS", "GAKSA", "ULNWI", "CESGE"],
    targets: [
      "CLUE", "GATE", "SACK", "MEALS", "DESIGN",
    ],
    bonus: [
      "ACT", "AKA", "AKE", "ALE", "ASK", "ATE", "AWE", "CAT",
      "CAW", "CUE", "DIS", "EAT", "GAL", "GAT", "HAG", "HAM",
      "HAT", "ICE", "LAG", "LAH", "LUG", "MAG", "MAT", "MED",
      "MET", "NAG", "SAC", "SAW", "SEA", "SEC", "SED", "SET",
      "TAG", "TEA", "WAS", "WIG", "ACED", "ACES", "ACID", "CAKE",
    ],
  },
  {
    size: 5,
    rows: ["URWGE", "PPDRU", "OEMNA", "STGEL", "OVISS"],
    targets: [
      "MESS", "VOTE", "GUARD", "SIGNAL", "PURPOSE",
    ],
    bonus: [
      "ALE", "AND", "ARE", "ARM", "EAR", "END", "ERA", "EST",
      "GEL", "GEM", "GET", "GIT", "GUN", "ITS", "LEG", "MED",
      "MEN", "MET", "NEG", "PEP", "PET", "POT", "PUP", "RAN",
      "RUG", "RUN", "SEA", "SED", "SEI", "SET", "SIT", "SOT",
      "TIE", "TOE", "TOP", "URN", "VIE", "DRUG", "EARN", "EDGE",
    ],
  },
  {
    size: 6,
    rows: ["FFOOTP", "AEESYI", "DANCKU", "TAOLNP", "OPLIFS", "MCATEL"],
    targets: [
      "DATA", "LOCK", "PITY", "SELF", "UPSET", "OFFENSE", "COMPLAIN",
    ],
    bonus: [
      "AIL", "AIN", "ALL", "ALT", "APT", "ATE", "CAP", "CAT",
      "CON", "COP", "COT", "DEF", "DEN", "EAT", "EEN", "EFF",
      "ELF", "EST", "FAD", "FED", "FEE", "FIN", "FIT", "FOE",
      "IFS", "ILK", "ILL", "INK", "INS", "ION", "ITS", "KIT",
      "LAC", "LAD", "LAP", "LIE", "LIT", "LOP", "MOP", "NAP",
    ],
  },
  {
    size: 6,
    rows: ["DAGASU", "SEGNSO", "BOSERI", "MREETB", "YERGAE", "ANDALL"],
    targets: [
      "BEDS", "SITE", "GRADE", "BALLET", "ANYMORE", "ENGAGED", "SERIOUS",
    ],
    bonus: [
      "ADS", "AGE", "AGO", "ALE", "ALL", "AND", "ANY", "ARE",
      "ATE", "BAG", "BAT", "BED", "BEG", "BET", "BIO", "BIT",
      "BOG", "BRO", "DEN", "DEY", "EAT", "EEN", "EGG", "EGO",
      "ELL", "END", "ERA", "ERE", "ERR", "ERS", "GAB", "GAD",
      "GAG", "GAL", "GAS", "GAT", "GET", "IRE", "LAB", "LAD",
    ],
  },
  {
    size: 6,
    rows: ["SGGIAM", "KNNMXT", "AEPEEE", "HBDSRF", "ALQTAF", "SREUCO"],
    targets: [
      "BALD", "EXAM", "MATE", "COFFEE", "SPEAKS", "HANGING", "QUARTER",
    ],
    bonus: [
      "ACT", "AIM", "AIN", "AKE", "ALE", "AMI", "AMP", "ARE",
      "ART", "ATE", "AXE", "BAN", "BAR", "BAS", "BED", "CAR",
      "CAT", "CUE", "CUT", "DEN", "EEN", "EFF", "ERA", "ERE",
      "ERS", "EST", "FAR", "FAT", "FEE", "FER", "GIN", "HAS",
      "HEN", "HEP", "IMP", "ING", "INN", "KEP", "LAB", "LAH",
    ],
  },
  {
    size: 6,
    rows: ["IHASLV", "REDMEI", "EVOEWC", "FMSQIT", "EVUPEL", "IASSPR"],
    targets: [
      "HIRE", "LIVE", "SAME", "MOVED", "TWICE", "SUPPER",
    ],
    bonus: [
      "ADO", "ADS", "AHI", "DAH", "DAM", "DEW", "DOS", "EEL",
      "ERE", "EWE", "FEE", "FER", "HAD", "HAM", "HAS", "HER",
      "ICE", "IRE", "LIE", "LIP", "LIT", "MAD", "MAS", "MED",
      "MEE", "MEW", "PEP", "PER", "PET", "PIE", "PIT", "PRE",
      "PUS", "QUA", "RED", "REF", "REP", "RES", "SAD", "SEC",
    ],
  },
  {
    size: 6,
    rows: ["SSREDO", "ECBOSB", "TCATSE", "LRUSDS", "BAYNCE", "MDTSEW"],
    targets: [
      "LADY", "LAMB", "BORED", "CENTS", "START", "SUCCESS", "OBSESSED",
    ],
    bonus: [
      "ABS", "ACT", "ALT", "ART", "BAD", "BAM", "BAR", "BAS",
      "BAT", "BED", "BOA", "BOD", "BOT", "BRA", "BRO", "CAB",
      "CAR", "CAT", "CRY", "CUR", "CUT", "DAB", "DAM", "DAY",
      "DEW", "DOS", "DOT", "EEN", "END", "ERS", "EST", "EWE",
      "LAB", "LAD", "LAY", "MAD", "MAT", "MAY", "NEE", "NEW",
    ],
  },
  {
    size: 6,
    rows: ["SSSEAP", "REDATL", "ARKEES", "LPLDSE", "ALLARH", "STNIAC"],
    targets: [
      "PARK", "SEAL", "SEEK", "DRAIN", "STALL", "CHAIRS", "PLATES", "LEADERS",
    ],
    bonus: [
      "ADS", "AIL", "AIN", "AIR", "AKE", "ALE", "ALL", "ALT",
      "ANT", "APT", "ARE", "ATE", "CAR", "EAR", "EAT", "EEL",
      "ELL", "ERA", "ERR", "ERS", "EST", "HER", "ILL", "IRE",
      "LAD", "LAP", "LED", "NIL", "PAL", "PAR", "PAS", "PRE",
      "RAD", "RAN", "RAP", "RED", "RES", "SAD", "SAP", "SAT",
    ],
  },
  {
    size: 6,
    rows: ["CSCIET", "BAEVRR", "LIRHEA", "YREISC", "ATBONK", "RDARGI"],
    targets: [
      "TRAY", "BROAD", "SCARING", "SERVICES", "TERRIBLY", "TRACKING",
    ],
    bonus: [
      "ABS", "AIL", "AIR", "ARE", "ART", "ASK", "ATE", "BAD",
      "BAR", "BAS", "BAT", "BET", "BIN", "BIO", "BOA", "BOG",
      "BRA", "BRO", "CAB", "CAR", "DAB", "DAY", "EAR", "EON",
      "ERA", "ERE", "ERR", "GIN", "GON", "HER", "HET", "HIS",
      "ICE", "ING", "INK", "INS", "ION", "IRE", "ISH", "KIN",
    ],
  },
  {
    size: 6,
    rows: ["IDPLAG", "SESLUE", "DSBEWR", "CWOREO", "OLYPRC", "BGNIHE"],
    targets: [
      "SIDE", "BLOWS", "BORROW", "CHERRY", "PLAGUE", "SLEEPING",
    ],
    bonus: [
      "AGE", "ALE", "ALL", "BED", "BEE", "BOG", "BOP", "BOW",
      "BOY", "BRO", "COG", "COW", "DIE", "DIS", "EEL", "ELL",
      "ERE", "ERR", "EWE", "GAL", "GYP", "HER", "HIP", "ING",
      "IRE", "LAG", "LOB", "LOG", "LOP", "LOW", "LUG", "NIP",
      "ORB", "ORE", "OWE", "OWL", "PEE", "PER", "PEW", "PIN",
    ],
  },
  {
    size: 6,
    rows: ["ROCSTO", "SONKUO", "SGLRAN", "EROCII", "DMOHUN", "DEBBGR"],
    targets: [
      "HOME", "SONG", "TOUR", "ROCKS", "CLOSED", "ROBBED", "RUINING",
    ],
    bonus: [
      "AIN", "AIR", "BED", "BOH", "BUG", "BUN", "CAN", "CAR",
      "COG", "CON", "COO", "COS", "CUR", "EBB", "EGO", "ERS",
      "GEM", "GON", "GOO", "GUN", "HOC", "HOE", "HOG", "HOM",
      "HOO", "HUG", "ING", "LOG", "LOO", "MED", "MOB", "MOR",
      "NOG", "NOR", "NOT", "NUT", "OAK", "OAR", "ONS", "ORA",
    ],
  },
  {
    size: 6,
    rows: ["RROTIL", "OWAMOO", "HSERAY", "IPALST", "MFNTYE", "RORIES"],
    targets: [
      "TEST", "FRIES", "SPARE", "INFORM", "LOYALTY", "TOMORROW",
    ],
    bonus: [
      "ALE", "ALT", "AMI", "ANT", "APE", "ARE", "ARM", "ATE",
      "AWE", "EAR", "EAT", "ERA", "ERS", "EST", "EYE", "FAN",
      "FAR", "FAT", "FOR", "FRO", "HIM", "HIP", "HIS", "HOS",
      "IMP", "ISH", "ITS", "LAP", "LAY", "LIT", "LOO", "LOT",
      "LYE", "MAS", "MAT", "MAW", "MAY", "MEW", "MIL", "MOI",
    ],
  },
  {
    size: 6,
    rows: ["AATDSN", "RWESNH", "ENVRAI", "ASECEK", "ECSAKS", "EERTTT"],
    targets: [
      "SCAN", "AWARE", "KINDS", "SHAKE", "SEVERE", "TRACKS",
    ],
    bonus: [
      "AHI", "AIN", "AKE", "AND", "ARE", "ART", "ATE", "AWE",
      "CAN", "CAR", "CAT", "DEN", "DEW", "EAR", "EAT", "ERA",
      "ERE", "ERS", "EST", "EWE", "HAS", "INN", "INS", "KIN",
      "NET", "NEW", "RAN", "RAT", "RAW", "REC", "RED", "RES",
      "SAC", "SAT", "SEA", "SEC", "SED", "SEE", "SEI", "SET",
    ],
  },
  {
    size: 6,
    rows: ["WOLAKC", "FLRNEI", "YEERRH", "EPAAAC", "DORNGE", "MADSIW"],
    targets: [
      "AREA", "FEEL", "PARADE", "WISDOM", "YELLOW", "ARRANGE", "CHICKEN",
    ],
    bonus: [
      "ADO", "ADS", "AGE", "AHI", "AKE", "ALL", "AND", "APE",
      "ARE", "CAN", "CAR", "DAM", "DEY", "EAR", "EEL", "EEN",
      "ELF", "ELL", "ERA", "ERE", "ERR", "EYE", "FEE", "FER",
      "FEY", "FLY", "FOR", "GIN", "HAG", "HEN", "HER", "ICE",
      "ING", "INS", "IRE", "LOW", "LYE", "MAD", "MOP", "MOR",
    ],
  },
  {
    size: 6,
    rows: ["MNEVEG", "EROROE", "LWVUTA", "DSNOLS", "LECDCB", "DIEPIP"],
    targets: [
      "PIPE", "VOTE", "BLAST", "WORLD", "COUNCIL", "DECIDES", "GOVERNOR",
    ],
    bonus: [
      "ALT", "ATE", "BID", "CON", "COT", "DEN", "DIE", "DIP",
      "DON", "DOT", "EAT", "EEL", "EEN", "EGO", "END", "EON",
      "ERE", "GET", "GOT", "GOV", "ICE", "LED", "LID", "LIE",
      "LOD", "LOT", "LUV", "MEN", "MEW", "NEE", "NEW", "NOD",
      "NOR", "NOT", "NOW", "NUT", "OAT", "OLD", "ONE", "ONS",
    ],
  },
  {
    size: 6,
    rows: ["AGDGWM", "RAEOAA", "MEVNAD", "OTRIYS", "NTHADY", "RDERDL"],
    targets: [
      "DIRT", "REAR", "MONTH", "DEADLY", "AVERAGE", "DAMAGED", "NOWADAYS",
    ],
    bonus: [
      "ADD", "ADO", "ADS", "AGE", "AGO", "AHI", "AID", "AIN",
      "AIR", "ANY", "ARE", "ARM", "ART", "DAH", "DAM", "DAY",
      "DEN", "DOG", "DON", "EAR", "EEN", "EGO", "EON", "ERA",
      "GAD", "GON", "GOV", "HAD", "HAY", "HER", "HET", "HID",
      "IRE", "MAD", "MAG", "MAN", "MAW", "MEE", "MET", "MON",
    ],
  },
  {
    size: 6,
    rows: ["STREAH", "ELDUMS", "ONYNTA", "THPSEL", "ASTOCP", "EESUPA"],
    targets: [
      "CUTE", "POPS", "RUNS", "SEATS", "APPLES", "ASHAMED", "HONESTLY",
    ],
    bonus: [
      "ALE", "ALT", "APE", "ATE", "CAP", "COP", "COS", "COT",
      "CUP", "CUT", "DUE", "DUN", "EAT", "END", "EON", "EST",
      "HAM", "HAS", "HAT", "HOE", "HON", "HOT", "LOT", "MAS",
      "MAT", "MED", "MUD", "NET", "NOT", "NUT", "OLD", "ONE",
      "OPS", "OPT", "OUT", "PAP", "PEA", "PEN", "PET", "POT",
    ],
  },
  {
    size: 6,
    rows: ["KKWPRS", "NCAIEE", "ROOLDP", "AUGOUT", "SLERYP", "HOEYAR"],
    targets: [
      "PRAY", "SHOE", "WIPE", "KNOCK", "DEPUTY", "SERIAL", "REGULAR",
    ],
    bonus: [
      "AID", "AIL", "AIR", "ALE", "APE", "APT", "ARE", "CAP",
      "CAW", "COG", "CON", "COO", "DIE", "DIP", "DOG", "DOO",
      "EEL", "EGO", "ERA", "ERE", "ERS", "EYE", "GEL", "GON",
      "GOO", "HOE", "HOS", "IRE", "LAC", "LAP", "LAW", "LED",
      "LEG", "LID", "LIE", "LIP", "LOD", "LOG", "LOO", "LUG",
    ],
  },
  {
    size: 6,
    rows: ["DNETWS", "AERAAE", "GSABBV", "ELGENE", "SNAIVH", "DALREE"],
    targets: [
      "BARN", "EVIL", "DEALS", "RANGE", "WAVES", "AGENDA",
    ],
    bonus: [
      "ADS", "AGE", "AIL", "AIN", "AIR", "ALE", "AND", "ARE",
      "ART", "ATE", "AWE", "BAG", "BAR", "BAS", "BAT", "BEG",
      "BRA", "DEN", "EAR", "EAT", "EBB", "EEN", "END", "ERA",
      "ERE", "ERS", "GAB", "GAD", "GAL", "GAS", "GEL", "GIN",
      "HEN", "HER", "IRE", "LAB", "LAD", "LAG", "LEG", "LIE",
    ],
  },
  {
    size: 6,
    rows: ["RATRSE", "OMIART", "LUEAEN", "NSNDGG", "OGSYUI", "LADSCS"],
    targets: [
      "GUYS", "LOAD", "CIGAR", "LUNGS", "TIMES", "AROUND", "ARRESTED",
    ],
    bonus: [
      "ADS", "AGE", "AGO", "AIM", "AIR", "AMI", "AND", "ANY",
      "ARE", "ARM", "ART", "CIG", "CUD", "DEN", "DUG", "EAR",
      "EAT", "EGG", "END", "ERA", "ERE", "ERR", "ERS", "EST",
      "GAD", "GAL", "GAS", "GET", "GIG", "GON", "GUY", "ICY",
      "LAD", "LAG", "LOG", "MAT", "MED", "MEN", "MOR", "NAG",
    ],
  },
  {
    size: 6,
    rows: ["ITUGNE", "EYPNGI", "ISFIHH", "NDNTRU", "GYTOSG", "TLNNES"],
    targets: [
      "SETUP", "GENTLY", "NIGHTS", "NOTIFY", "FINDING", "HURTING",
    ],
    bonus: [
      "DIE", "DIS", "EGG", "EON", "EST", "FIG", "FIN", "FIR",
      "FIT", "GIN", "GIT", "GUN", "GUT", "GUY", "HIP", "HIT",
      "HUG", "HUH", "IFS", "ING", "INN", "INS", "ITS", "NEG",
      "NIP", "NON", "NOR", "NOT", "NUT", "ONE", "ONS", "ORS",
      "PIG", "PIN", "PIT", "PUN", "PUT", "RIG", "RIP", "ROT",
    ],
  },
  {
    size: 6,
    rows: ["OHARES", "NONNLA", "PRUNOG", "SAESSE", "ESHOMI", "DDWARC"],
    targets: [
      "SALE", "GONNA", "SHAME", "HONOUR", "MISSES", "PASSED", "CROWDED",
    ],
    bonus: [
      "AGE", "AGO", "ALE", "AMI", "ARE", "ARM", "EAR", "EGO",
      "EON", "ERA", "ERS", "GAL", "GAS", "GEM", "GON", "HAM",
      "HAS", "HEN", "HER", "HOE", "HOM", "HON", "HOO", "HOP",
      "HOS", "ISM", "LAG", "LOG", "MAW", "MIC", "MOR", "MOW",
      "NOG", "NON", "NOR", "NUN", "OAR", "ONE", "ONS", "OPS",
    ],
  },
  {
    size: 6,
    rows: ["DLESKE", "NSDROS", "AETRET", "LCKATE", "CEKEVN", "HUDSES"],
    targets: [
      "SEVEN", "STEAK", "STROKE", "CANDLES", "CHECKED", "TREATED",
    ],
    bonus: [
      "ACT", "AKE", "ALE", "AND", "ARE", "ART", "ATE", "CAN",
      "CUD", "CUE", "DEN", "DUE", "EAR", "EAT", "EEN", "END",
      "ERA", "ERE", "ERR", "ERS", "EST", "LAC", "LED", "NEE",
      "NET", "ORA", "ORE", "ORS", "RAT", "RED", "RES", "ROT",
      "SAC", "SEA", "SEC", "SED", "SEE", "SET", "SOT", "TAR",
    ],
  },
  {
    size: 6,
    rows: ["ALBNLD", "HSDNAA", "TOSEIL", "UGDRCS", "NPEGOT", "APDRAW"],
    targets: [
      "ALIEN", "BLAST", "STAGE", "COWARD", "LANDED", "PAPERS", "SHOTGUN",
    ],
    bonus: [
      "AGE", "AGO", "AIL", "AIN", "AIR", "AND", "APE", "ARE",
      "COG", "COS", "COT", "COW", "DEN", "DOG", "DOS", "DOT",
      "EGO", "END", "ERA", "ERE", "ERS", "GAT", "GOT", "GUN",
      "GUT", "HAS", "HOG", "HOS", "HOT", "ICE", "INN", "INS",
      "IRE", "LAD", "LAH", "LIE", "NAP", "NIL", "NUT", "OAR",
    ],
  },
  {
    size: 6,
    rows: ["OZFOOG", "REELGE", "REEIGR", "MBRRRE", "TINTIQ", "SADCEU"],
    targets: [
      "GOLF", "MERE", "BREEZE", "REQUIRE", "TRIGGER", "DISTANCE",
    ],
    bonus: [
      "AID", "AIM", "AIN", "AIR", "AND", "ANT", "BEE", "BID",
      "BIN", "BIT", "DIM", "DIS", "DIT", "EEL", "EGG", "EGO",
      "ELF", "ERE", "ERR", "FEE", "FER", "FOE", "FOG", "GIG",
      "GOO", "ICE", "IRE", "ITS", "LIE", "LOG", "LOO", "MEE",
      "MID", "ORE", "REF", "RIB", "RID", "RIG", "RIM", "SAD",
    ],
  },
  {
    size: 6,
    rows: ["SOEHFM", "EOIBOI", "VLAASR", "MULTGS", "ORBUER", "PBLEMP"],
    targets: [
      "BALL", "FIST", "ALBUM", "LOOSE", "PRESS", "MORGUE", "PROBLEM",
    ],
    bonus: [
      "ABS", "AGE", "AIL", "ALE", "ALL", "ALT", "ATE", "BAG",
      "BAS", "BAT", "BEE", "BIO", "BOA", "BOH", "BOP", "BRO",
      "BUG", "BUM", "BUT", "EBB", "EEL", "ELL", "ERS", "FIR",
      "FOB", "FOR", "GAB", "GAL", "GAS", "GAT", "GEM", "GET",
      "GUM", "GUT", "HOM", "HOS", "ILL", "LAB", "LAG", "LIB",
    ],
  },
  {
    size: 6,
    rows: ["PORTYH", "GNKNLD", "CHIRDL", "TWSSEK", "AOLEAE", "WKNTSV"],
    targets: [
      "PORT", "KNOWS", "LEAVE", "STAKE", "KINDLY", "WATCHING",
    ],
    bonus: [
      "AKE", "ATE", "EAT", "EEL", "EEN", "ELL", "ERS", "EST",
      "GON", "HIS", "ING", "INK", "IRE", "ISH", "KIN", "LED",
      "LOT", "LOW", "NEE", "NET", "NOG", "NOR", "NOT", "NOW",
      "OAK", "OAT", "ONE", "OWL", "RED", "RES", "SAT", "SEA",
      "SED", "SEE", "SET", "SIN", "SIR", "SIS", "SON", "SOT",
    ],
  },
  {
    size: 6,
    rows: ["TAALEK", "NRIDOL", "IEGNIO", "MASWTE", "DKSTSK", "ETOATA"],
    targets: [
      "TWIN", "ASKED", "TAKES", "LOOKED", "LARGEST", "MAINTAIN",
    ],
    bonus: [
      "ADO", "AGE", "AID", "AIL", "AIM", "AIN", "AIR", "AKE",
      "ALE", "AMI", "ANT", "ARE", "ART", "ASK", "DAM", "DIE",
      "DIG", "DIT", "DON", "DOO", "EON", "ERA", "EST", "GAD",
      "GAS", "GEM", "GIN", "ILK", "ING", "INS", "ION", "IRE",
      "ITS", "KOI", "LAD", "LED", "LID", "LIE", "LIT", "LOD",
    ],
  },
  {
    size: 6,
    rows: ["EELCSD", "WNASRA", "KARENY", "FNILOL", "LEGESI", "WSECNV"],
    targets: [
      "KNEW", "SOIL", "SCALE", "YARDS", "SEEING", "WELFARE", "VIOLENCE",
    ],
    bonus: [
      "ADS", "AIL", "AIN", "AIR", "ALE", "ANY", "ARE", "AWE",
      "CAN", "CAR", "CRY", "DAY", "DRY", "EAR", "EEL", "EEN",
      "ELF", "EON", "ERA", "ERS", "EWE", "FAN", "FAR", "FEE",
      "FEW", "GEL", "GIN", "ING", "INK", "INS", "ION", "IRE",
      "LAC", "LEG", "LIE", "NEE", "NEG", "NEW", "NIL", "OIL",
    ],
  },
  {
    size: 6,
    rows: ["POBOMK", "ERYLCE", "TSDERD", "HATADI", "DEEILU", "EGREMO"],
    targets: [
      "EDGE", "HEAD", "BLOCK", "MEETS", "LADDER", "MEDIUM", "POETRY", "RETIRE",
    ],
    bonus: [
      "ADD", "ADS", "AID", "AIL", "AIM", "AIR", "ALE", "ARE",
      "ATE", "BOP", "BOY", "BRO", "COY", "DAH", "DEY", "DID",
      "DIE", "DIM", "DIT", "DRY", "DYE", "EAR", "EAT", "EEL",
      "ERA", "ERE", "ERS", "EST", "GET", "HAD", "HAS", "HAT",
      "HER", "HET", "IRE", "ITS", "LAD", "LED", "LID", "LIE",
    ],
  },
  {
    size: 6,
    rows: ["CERDEL", "NBNIAA", "OUSSRE", "CYFADR", "SABUNA", "UOLIWC"],
    targets: [
      "AREA", "BUYS", "CARDS", "IDEAL", "WINDS", "CONCERN", "FABULOUS",
    ],
    bonus: [
      "ADS", "AID", "AIN", "AIR", "ALE", "AND", "ARE", "BAD",
      "BAN", "BAR", "BAS", "BIN", "BOA", "BOY", "BUN", "BUS",
      "BUY", "CAB", "CAD", "CAN", "CAR", "CAW", "CON", "COY",
      "DAB", "DIE", "DIS", "DUB", "DUN", "EAR", "END", "ERA",
      "ERR", "ERS", "FAB", "FAD", "FAN", "FAR", "FUN", "INS",
    ],
  },
  {
    size: 6,
    rows: ["NHCAHB", "TOENEE", "CRRACL", "ISGKET", "MESCDP", "ETRIAP"],
    targets: [
      "BELT", "DICE", "EACH", "HECK", "ORGAN", "METERS", "APPEARS",
    ],
    bonus: [
      "ACT", "AGE", "AID", "AIR", "AKE", "APE", "APT", "ARE",
      "BEE", "CAD", "CAN", "CAP", "CAR", "CON", "COT", "DIS",
      "EAR", "EEL", "EEN", "EON", "ERA", "ERR", "ERS", "EST",
      "GEM", "GET", "HEN", "HER", "HOC", "HOE", "HON", "HOT",
      "ICE", "IRE", "ISM", "KEP", "LED", "MEE", "MET", "MIC",
    ],
  },
  {
    size: 6,
    rows: ["SISUES", "NTGSEK", "GEANTI", "NSRHWR", "EESIEA", "IMLCRB"],
    targets: [
      "RICE", "STARS", "AWHILE", "STRIKE", "ENEMIES", "GUESSING",
    ],
    bonus: [
      "AGE", "AHI", "ANT", "ARE", "ART", "ATE", "AWE", "BAR",
      "BRA", "EAR", "EAT", "EEL", "EEN", "ERA", "ERE", "ERS",
      "EST", "GAS", "GAT", "GET", "GIN", "GIT", "HAG", "HAS",
      "HAT", "HER", "HIS", "ICE", "ING", "INS", "IRE", "ISH",
      "ISM", "ITS", "KIT", "LIE", "MEE", "MEN", "NAG", "NEE",
    ],
  },
  {
    size: 6,
    rows: ["IHGHIH", "SIOUTN", "TSTLAD", "TEPRDO", "RAGMAR", "EHMSWC"],
    targets: [
      "GRAND", "SWAMP", "TEAMS", "TIGHT", "HEARTS", "SHOULD",
    ],
    bonus: [
      "ADD", "ADO", "AGE", "ALT", "AMP", "AND", "ANT", "APE",
      "APT", "ARE", "ARM", "ART", "ATE", "CAD", "CAR", "CAW",
      "DAM", "EAR", "EAT", "ERA", "ERE", "EST", "GAP", "GAT",
      "GET", "GIT", "GOT", "GUT", "HAG", "HAM", "HAT", "HER",
      "HIS", "HIT", "HOG", "HOS", "HOT", "HUG", "HUT", "ISH",
    ],
  },
  {
    size: 6,
    rows: ["SPEDTH", "ILAELI", "SWTTLN", "ARDEEK", "IDELTS", "DPMEII"],
    targets: [
      "SLAP", "TEST", "WIPE", "EMPIRE", "SADDLE", "TELLIN", "THINKS",
    ],
    bonus: [
      "ADD", "AID", "AIR", "ALE", "ALT", "APE", "ARE", "ART",
      "ATE", "DID", "DIP", "EAT", "EEL", "EEN", "ELL", "ERA",
      "ERS", "EST", "HIT", "ILK", "ILL", "INK", "IRE", "ITS",
      "LAD", "LAP", "LAW", "LED", "LIE", "LIP", "LIT", "MED",
      "MEE", "MET", "NEE", "NET", "NIL", "PAD", "PAL", "PAW",
    ],
  },
  {
    size: 6,
    rows: ["ROADSI", "LAIOUN", "IRECRS", "MAKDRE", "LSFISI", "LAGNNK"],
    targets: [
      "CORE", "DICE", "FALLS", "DRINKS", "MAKING", "COUSINS", "RAILROAD",
    ],
    bonus: [
      "ADO", "ADS", "AID", "AIL", "AIM", "AIR", "AKE", "ALL",
      "AMI", "ARE", "ARM", "ASK", "COS", "CUD", "CUR", "DIE",
      "DIG", "DIS", "DOS", "DUN", "EAR", "ERA", "ERR", "ERS",
      "FAR", "FIG", "FIN", "FIR", "GAL", "GAS", "GIN", "ICE",
      "IFS", "ING", "INK", "INN", "INS", "IRE", "KID", "KIN",
    ],
  },
  {
    size: 6,
    rows: ["IPTSML", "ARNRET", "EEKEIO", "NSCSSO", "EISRSE", "OTASTT"],
    targets: [
      "MELT", "RAIN", "SIRE", "TESTS", "PRESENTS", "SICKNESS",
    ],
    bonus: [
      "AIN", "AIR", "APT", "ARE", "ART", "ATE", "EAR", "EEL",
      "EEN", "ERA", "ERE", "ERS", "EST", "ICE", "INS", "IRE",
      "ITS", "MEE", "MET", "NEE", "NET", "PAR", "PRE", "RAP",
      "RAT", "REC", "RES", "RIP", "SAT", "SEA", "SEC", "SEE",
      "SEI", "SET", "SIN", "SIR", "SIS", "SIT", "SOT", "TAR",
    ],
  },
  {
    size: 6,
    rows: ["IWSING", "EMMAHS", "SPTKRQ", "ATEIUA", "RAPNEA", "INLGWS"],
    targets: [
      "PLAIN", "QUIET", "SHAKING", "WEARING", "SEPARATE", "SWIMMING",
    ],
    bonus: [
      "AHI", "AIM", "AIN", "AIR", "AKE", "AMI", "AMP", "APE",
      "APT", "ART", "ATE", "AWE", "EAR", "EAT", "EST", "HAM",
      "HAS", "HAT", "HIM", "HIS", "IMP", "ING", "INS", "ISM",
      "KEP", "KIN", "KIT", "LAP", "MAN", "MAS", "MAT", "MEW",
      "NAP", "NEG", "NET", "NEW", "NIP", "PAL", "PAN", "PAR",
    ],
  },
  {
    size: 6,
    rows: ["RUCKLC", "NTUESA", "TRTIMR", "LIEAKI", "RFKNSM", "AEDURI"],
    targets: [
      "DEAR", "RISK", "TURN", "NAKED", "TRUCKS", "MIRACLE", "LIFETIME",
    ],
    bonus: [
      "AIM", "AKE", "ALE", "AMI", "AND", "ARE", "ARM", "ASK",
      "ATE", "CAR", "CUE", "CUR", "CUT", "DEF", "DUN", "EAR",
      "EAT", "END", "ERA", "FAR", "FED", "FER", "FIR", "FIT",
      "IRE", "ISM", "KIT", "LAC", "LIE", "LIT", "MAN", "MAS",
      "MAT", "MET", "NET", "NUT", "RAM", "RED", "REF", "RIM",
    ],
  },
  {
    size: 6,
    rows: ["OMEEPG", "RMSRDU", "IEEAYT", "EDCVEN", "NEINIO", "TFDWHF"],
    targets: [
      "ACID", "FINE", "WIFE", "DEPUTY", "WHOEVER", "INCIDENT", "MEMORIES",
    ],
    bonus: [
      "ARE", "CAD", "CAR", "DAY", "DEF", "DEN", "DID", "DIE",
      "DIM", "DRY", "DUG", "DYE", "EAR", "EEN", "END", "EON",
      "ERA", "ERE", "ERS", "FED", "FEE", "FIN", "FOE", "GUT",
      "GUY", "HOE", "HON", "ICE", "ION", "IRE", "MED", "MEE",
      "MEM", "MID", "MOR", "NEE", "NET", "ONE", "ORE", "PEE",
    ],
  },
  {
    size: 6,
    rows: ["REINEH", "TMEDML", "OVLULI", "HSEIFC", "CSROAE", "MOTNEP"],
    targets: [
      "HOME", "VOTE", "REMIND", "SCORES", "MILLION", "PEACEFUL",
    ],
    bonus: [
      "AIL", "AIR", "ANT", "APE", "CAN", "CAP", "COS", "COT",
      "DEN", "DIE", "DIM", "DUE", "EEL", "EEN", "ELL", "END",
      "EON", "ERS", "EST", "FAN", "FEE", "FIR", "FLU", "FOE",
      "FOR", "FUM", "HEM", "HEN", "HOM", "HOS", "HOT", "ICE",
      "ILL", "ION", "IRE", "LED", "LIE", "MED", "MEE", "MEN",
    ],
  },
  {
    size: 6,
    rows: ["OTLTEU", "LUBSLR", "EDGAAO", "JDVEMR", "UIFSOR", "TSEELF"],
    targets: [
      "BLUE", "ROLE", "TOLD", "FORMS", "LASER", "JUDGES", "FESTIVAL",
    ],
    bonus: [
      "ABS", "AGE", "ALE", "ALT", "ARE", "ARM", "BAG", "BAM",
      "BAS", "BUG", "BUT", "DIE", "DIS", "DIT", "DUB", "DUE",
      "DUG", "EAR", "EEL", "ELF", "ERA", "EST", "FEE", "FIT",
      "FOE", "FOR", "FRO", "GAB", "GAL", "GAS", "GEM", "GUT",
      "IFS", "ITS", "JUS", "LAB", "LAG", "LED", "LOT", "LUG",
    ],
  },
  {
    size: 6,
    rows: ["SCRBXM", "HAKEEC", "EPATAH", "DEHPTN", "ACEHGE", "DURRYT"],
    targets: [
      "CAKE", "DEAD", "MEAN", "TAPE", "SHAPE", "BREATH", "CHERRY", "EXCHANGE",
    ],
    bonus: [
      "AKA", "AKE", "ANT", "APE", "APT", "ARE", "ATE", "BEE",
      "BET", "BRA", "CAD", "CAN", "CAP", "CAR", "CAT", "CUD",
      "CUE", "CUR", "DUE", "EAR", "EAT", "ERA", "ERR", "GET",
      "HAS", "HAT", "HEM", "HEP", "HER", "HET", "HEX", "MEE",
      "MET", "NAP", "NEG", "NET", "PAN", "PAP", "PAR", "PAS",
    ],
  },
  {
    size: 6,
    rows: ["GHCEJA", "IAMKZC", "CPILZE", "OWNSMT", "HREEEE", "SPXEYR"],
    targets: [
      "JAZZ", "LIKE", "CHAMP", "MAGIC", "SHOWER", "EXPENSE", "CEMETERY",
    ],
    bonus: [
      "AHI", "AIL", "AIM", "AIN", "AMI", "AMP", "CAP", "CIG",
      "COP", "COW", "EEN", "ERE", "ERS", "EYE", "GAP", "HAG",
      "HAM", "HIP", "HOC", "HOP", "ILK", "IMP", "INS", "ISM",
      "KIN", "LIP", "MAG", "MAP", "MEE", "MEN", "MET", "MIL",
      "NEE", "NEW", "NIL", "NIP", "ORE", "ORS", "OWE", "OWN",
    ],
  },
  {
    size: 6,
    rows: ["DAHARG", "ENDNMU", "GEOSIR", "ARGLAD", "SEINRE", "SITTDE"],
    targets: [
      "SITE", "GRADE", "HANDS", "AGENDA", "SAILOR", "SITTING", "MURDERED",
    ],
    bonus: [
      "ADO", "ADS", "AGE", "AID", "AIL", "AIM", "AIN", "AIR",
      "AMI", "AND", "ANT", "ARE", "ARM", "ART", "DAH", "DAM",
      "DEN", "DIM", "DIS", "DOG", "DON", "DOS", "EAR", "EEN",
      "EGO", "END", "EON", "ERA", "ERE", "ERS", "GAS", "GET",
      "GIN", "GIT", "GON", "GUM", "HAD", "HAM", "ING", "INS",
    ],
  },
  {
    size: 6,
    rows: ["MASGUY", "SRLGTR", "ETESNP", "TESDIE", "RAHERL", "WLETSF"],
    targets: [
      "SLIP", "LATER", "SHEETS", "FRIENDS", "MASTERS", "STRUGGLE",
    ],
    bonus: [
      "ALE", "ALT", "ARE", "ARM", "ART", "ATE", "DIE", "DIP",
      "DIS", "EAR", "EAT", "EEL", "EGG", "ELF", "END", "ERA",
      "ERE", "ERS", "EST", "GEL", "GET", "GUT", "GUY", "HAS",
      "HAT", "HER", "HET", "ING", "INS", "IRE", "LAH", "LAW",
      "LED", "LEG", "LID", "LIE", "LIP", "MAS", "NIL", "NIP",
    ],
  },
  {
    size: 6,
    rows: ["REVEOU", "IOTMLT", "MNCCLH", "AGIAAR", "MOEDGA", "NTICEV"],
    targets: [
      "GRAVE", "MOTEL", "MOUTH", "MAGICAL", "NOTICED", "COVERING",
    ],
    bonus: [
      "ACT", "AGE", "AGO", "AID", "AIN", "ALL", "ALT", "AMI",
      "ANT", "CAD", "CAR", "CIG", "CON", "COT", "DAH", "DIE",
      "DIG", "DIT", "EAR", "EGO", "ELL", "EON", "GAD", "GAL",
      "GET", "GIN", "GON", "GOT", "HAD", "HAG", "ICE", "ING",
      "ION", "IRE", "LAC", "LAD", "LAG", "LAH", "LOT", "MAG",
    ],
  },
  {
    size: 6,
    rows: ["OSDEPA", "NIPPRI", "EEROPM", "CRFTOM", "ENIEST", "TBQUEN"],
    targets: [
      "PIMP", "MOTOR", "QUEEN", "INFORM", "RECENT", "STOPPED", "PRISONER",
    ],
    bonus: [
      "AIM", "AIR", "APE", "ARE", "ARM", "BET", "BIN", "BIT",
      "DIE", "DIP", "DIS", "EEN", "ERA", "ERE", "ERR", "EST",
      "FEE", "FER", "FIB", "FIN", "FIR", "FIT", "FOP", "FOR",
      "FRO", "IMP", "INS", "ION", "IRE", "ITS", "MOP", "NEE",
      "NET", "NIP", "OFT", "ONE", "ONS", "OPS", "OPT", "ORA",
    ],
  },
  {
    size: 6,
    rows: ["NKJEWW", "NUCRAR", "YIONHO", "ROOTNU", "ATODOG", "CFIBAR"],
    targets: [
      "CREW", "JUNK", "WARN", "TOOTH", "UNION", "WRONG", "AROUND", "FACTORY",
    ],
    bonus: [
      "ACT", "ADO", "AFT", "AGO", "ANT", "ARE", "ART", "AWE",
      "BAD", "BAG", "BAR", "BID", "BIO", "BIT", "BOA", "BOD",
      "BOG", "BOT", "CAR", "CAT", "CON", "COO", "COT", "DAB",
      "DIT", "DOG", "DON", "DOO", "DOT", "EAR", "ERA", "FAR",
      "FAT", "FIB", "FIT", "FOB", "GAB", "GAD", "GON", "GOT",
    ],
  },
  {
    size: 6,
    rows: ["YEJAHE", "LLHCNG", "GOOLDB", "VNISAI", "MEETTM", "USRNHE"],
    targets: [
      "BATH", "LAME", "JELLY", "CHOSEN", "LOVERS", "HANDLING",
    ],
    bonus: [
      "ADS", "AID", "AIM", "AMI", "AND", "ATE", "BAD", "BAM",
      "BAS", "BAT", "BID", "BIT", "CAN", "CON", "COO", "COS",
      "DAB", "DAM", "DIM", "DIT", "EEN", "ELL", "END", "ERE",
      "ERS", "EST", "GON", "GOO", "GOV", "HEM", "HEN", "HET",
      "HOC", "HOG", "HON", "HOO", "HOS", "ING", "ION", "ITS",
    ],
  },
  {
    size: 6,
    rows: ["HSMADV", "OETNME", "MENIDL", "OSOOEN", "OALSCA", "PLLABC"],
    targets: [
      "DAMN", "LOSE", "SHOE", "SOAP", "BALLOON", "CANCELED", "SOMETIME",
    ],
    bonus: [
      "ABS", "ALL", "AMI", "AND", "ANT", "ATE", "BAN", "BAS",
      "CAB", "CAN", "CON", "COO", "COS", "DAM", "DEN", "DIE",
      "DIM", "DIT", "DON", "DOO", "DOS", "EEN", "END", "EON",
      "EST", "HEM", "HEN", "HET", "HOE", "HOM", "HOS", "INN",
      "INS", "ION", "ITS", "LAB", "LAC", "LAP", "LED", "LOD",
    ],
  },
  {
    size: 6,
    rows: ["EMSASE", "ATWRFL", "TYEIYG", "BEALNK", "ERNRCK", "RTUSTU"],
    targets: [
      "LINK", "STUCK", "SWING", "NEARBY", "RETURN", "SAFELY", "MATTERS",
    ],
    bonus: [
      "AIL", "AIN", "AIR", "ALE", "ANT", "ARE", "ART", "ATE",
      "AWE", "BEE", "BET", "BRA", "CUT", "EAR", "EAT", "EEL",
      "EEN", "ELF", "ERA", "ERE", "ERR", "ERS", "EYE", "FAR",
      "FIN", "FIR", "FLY", "FRY", "IFS", "ING", "INK", "IRE",
      "LAY", "LIE", "MAT", "MAY", "MET", "NEE", "NET", "NIL",
    ],
  },
  {
    size: 6,
    rows: ["EDDEIE", "RELASR", "UNALGR", "TOCIOH", "SLUWEB", "SIKRAN"],
    targets: [
      "KISS", "LASER", "ROLLED", "CULTURE", "WORRIED", "NEIGHBOR",
    ],
    bonus: [
      "ADD", "AGO", "AIL", "AIR", "ALE", "ALL", "ANT", "ARE",
      "AWE", "BAN", "BAR", "BOG", "BOH", "BOW", "CAN", "CIG",
      "CON", "COS", "COT", "CUR", "DEN", "EAR", "EEL", "EEN",
      "ELL", "ERA", "ERE", "ERR", "ERS", "GAD", "GAL", "GAS",
      "HEN", "HER", "HOE", "HOG", "ILK", "ILL", "IRE", "LAC",
    ],
  },
  {
    size: 6,
    rows: ["PCLSCB", "AAEYOE", "GSPETT", "SETSNE", "SOAFOS", "BYFIPH"],
    targets: [
      "BOYS", "CLASS", "PAGES", "STAFF", "TYPES", "PHONES",
    ],
    bonus: [
      "AFT", "AGE", "ALE", "APE", "APT", "ATE", "BET", "BOA",
      "BOT", "BOY", "CAP", "COS", "COT", "COY", "EAT", "EEL",
      "EEN", "EON", "EST", "EYE", "FAT", "FOB", "FOE", "FOP",
      "GAL", "GAP", "GAS", "GET", "HOE", "HON", "HOP", "HOS",
      "IFS", "ION", "LAC", "LAG", "LAP", "LYE", "NEE", "NET",
    ],
  },
  {
    size: 6,
    rows: ["EPFREA", "METTEH", "RODROB", "IDEITK", "WCHGCE", "OPNARO"],
    targets: [
      "FREE", "BOTTOM", "CHARGE", "PERIOD", "POWDER", "ROCKET",
    ],
    bonus: [
      "ACT", "AGE", "AHI", "ARE", "BEE", "BET", "BOH", "BOT",
      "CAN", "CAR", "CIG", "COP", "COW", "DEF", "DIE", "DIG",
      "DIT", "DOT", "ERA", "ERE", "FED", "FEE", "FER", "GIT",
      "HAG", "HER", "HET", "HID", "HIT", "HOE", "HOT", "ICE",
      "IRE", "KOI", "MED", "MEE", "MET", "MOI", "MOR", "NAG",
    ],
  },
  {
    size: 6,
    rows: ["WDRPDT", "ENOYCR", "ULGVIO", "ALEESP", "OHSARY", "WUOHNM"],
    targets: [
      "COPY", "EARN", "HOUSE", "TRIES", "GLOVES", "LAUNDRY",
    ],
    bonus: [
      "ALE", "ALL", "ANY", "ARE", "ARM", "COP", "COS", "DEN",
      "DEW", "DOG", "DON", "DRY", "EAR", "EEL", "EGO", "ELL",
      "END", "ERA", "ERS", "GEL", "GON", "GOV", "GYP", "HAS",
      "HOS", "ICY", "LAH", "LED", "LEG", "LOD", "LOG", "LOP",
      "LOW", "NEW", "NOD", "NOG", "NOR", "OAR", "ONE", "OPS",
    ],
  },
  {
    size: 6,
    rows: ["FRAKIG", "TSENEN", "EIDISB", "LNEALR", "CABLLO", "ONOROF"],
    targets: [
      "ROLL", "BACON", "BEGIN", "FREAK", "FLOORS", "LISTENED",
    ],
    bonus: [
      "ADS", "AID", "AIL", "AIN", "AKE", "ALE", "ALL", "AND",
      "ARE", "ART", "BAD", "BAN", "BAS", "BED", "BEG", "BOA",
      "BRO", "CAB", "CAN", "CON", "DAB", "DEN", "DIE", "DIS",
      "DIT", "EAR", "ELL", "END", "ERA", "ERS", "EST", "FOR",
      "GIN", "ILL", "ING", "INK", "INS", "ITS", "KEG", "KIN",
    ],
  },
  {
    size: 6,
    rows: ["ECITET", "NRINAC", "OACCRD", "UVEBOE", "NLAARB", "ITSFRD"],
    targets: [
      "BOARD", "UNITS", "BORDER", "CANCEL", "CANCER", "FAVORITE",
    ],
    bonus: [
      "ACT", "ADO", "AIN", "AIR", "ALE", "ALT", "ANT", "ARE",
      "ATE", "BAR", "BAS", "BAT", "BED", "BOA", "BOD", "BRA",
      "BRO", "CAD", "CAN", "CAR", "CAT", "EAR", "EAT", "ERA",
      "ERR", "FAB", "FAR", "FAT", "FRO", "ICE", "IRE", "ITS",
      "LAB", "LIT", "LUV", "NET", "NIL", "NOR", "OAF", "OAR",
    ],
  },
  {
    size: 6,
    rows: ["HOAMLL", "RSETAT", "ESELHS", "AGRASG", "ASNAVI", "USBERN"],
    targets: [
      "BARN", "MALL", "SIGHT", "HORSES", "ETERNAL", "MASSIVE", "SAUSAGE",
    ],
    bonus: [
      "ABS", "AGE", "ALE", "ALL", "ALT", "ARE", "ATE", "BAN",
      "BAR", "BAS", "EAR", "EAT", "EEL", "ERA", "ERS", "GAS",
      "GEL", "GET", "GIN", "HAM", "HAS", "HAT", "HOE", "HOS",
      "IRE", "ISH", "LAH", "LEG", "MAS", "MAT", "MEE", "MET",
      "NAB", "OAT", "ORE", "ORS", "RAN", "RES", "RIG", "SAG",
    ],
  },
  {
    size: 6,
    rows: ["SKTSES", "PARNEC", "MEROTR", "DRTIUU", "BOATOS", "NILECA"],
    targets: [
      "DRAIN", "ROUTE", "SPEAK", "STREAM", "TOILET", "ACTIONS", "SOURCES",
    ],
    bonus: [
      "ACT", "AIL", "AIN", "AIR", "ALE", "ALT", "AMP", "APE",
      "ARE", "ARM", "ART", "ASK", "ATE", "BIN", "BIO", "BOA",
      "BOD", "BOT", "BRA", "BRO", "COS", "COT", "DON", "DOT",
      "EAR", "EAT", "EEN", "EON", "ERA", "ERR", "ERS", "EST",
      "ION", "IRE", "LIB", "LOB", "LOD", "LOT", "MAP", "MAS",
    ],
  },
  {
    size: 6,
    rows: ["OGTAFA", "DSRRSM", "PERIHA", "LDEVIK", "AHTGNO", "NULNEN"],
    targets: [
      "GODS", "HAUL", "PLAN", "ARRIVE", "MAKING", "ENTERED", "FASHION",
    ],
    bonus: [
      "AHI", "AIN", "ALE", "ARE", "ART", "DAH", "DOG", "DOS",
      "EEL", "EON", "ERA", "ERE", "ERR", "ERS", "EST", "FAR",
      "FAT", "GET", "GIN", "HAD", "HAM", "HAS", "HER", "HET",
      "HIS", "HUT", "ING", "INK", "INN", "ION", "IRE", "ISH",
      "ISM", "KIN", "KOI", "LAD", "LAH", "LED", "MAS", "NEG",
    ],
  },
  {
    size: 6,
    rows: ["RPMISD", "EOVIOD", "OVNKOO", "GFGCAL", "NIEUTS", "RLEHRH"],
    targets: [
      "CASH", "ODDS", "HURTS", "FEELING", "IMPROVE", "LOOKING",
    ],
    bonus: [
      "ACT", "ALT", "CAT", "COO", "CUE", "CUR", "CUT", "DOO",
      "DOS", "EEL", "EON", "FEE", "FIG", "FIN", "FIR", "FOE",
      "FOG", "GEL", "GIG", "GIN", "GOO", "GOV", "GUT", "HUG",
      "HUT", "IMP", "ING", "INK", "KIN", "KOI", "LAC", "LEG",
      "LIE", "LOD", "LOO", "MON", "MOP", "MOR", "NIL", "NOM",
    ],
  },
  {
    size: 6,
    rows: ["TSSNWC", "IGETOE", "HANURS", "TDDKNF", "NSEEFE", "OUDALO"],
    targets: [
      "DEAL", "TIGHT", "COUNTS", "NETWORK", "OFFENSE", "SOUNDED",
    ],
    bonus: [
      "ADD", "ADS", "AGE", "AHI", "ALE", "AND", "ANT", "CON",
      "COS", "COT", "COW", "DAH", "DEF", "DEN", "DUE", "DUN",
      "EAT", "EEL", "EEN", "EFF", "ELF", "END", "EON", "ERS",
      "EST", "FAD", "FED", "FEE", "FOE", "FRO", "GAD", "GAT",
      "GET", "GIT", "HAD", "HAG", "HAT", "HIS", "HIT", "ITS",
    ],
  },
  {
    size: 6,
    rows: ["REDEDA", "VCINOL", "EIENSD", "NITEEE", "SDCDAS", "EBEOSP"],
    targets: [
      "CODE", "NEVER", "BESIDE", "LOADED", "PASSED", "INTENSE",
    ],
    bonus: [
      "ADO", "ADS", "BED", "COS", "DEN", "DIE", "DIS", "DIT",
      "DON", "DOS", "EEN", "END", "EON", "ICE", "INN", "INS",
      "LAD", "LOD", "NEE", "NET", "NOD", "NON", "OLD", "ONE",
      "ONS", "PAD", "PAS", "REC", "RED", "SAD", "SAP", "SEA",
      "SEC", "SED", "SEE", "SET", "SIN", "SIT", "SOD", "SON",
    ],
  },
  {
    size: 6,
    rows: ["BPARNT", "RLDEDS", "THENAE", "OWATUH", "EDETLE", "LIAABE"],
    targets: [
      "HAND", "IDEA", "BLEED", "TOWEL", "BATTLE", "PARENTS",
    ],
    bonus: [
      "ADO", "ADS", "AID", "AIL", "ALE", "ALT", "AND", "ANT",
      "ARE", "ATE", "AWE", "BAT", "BEE", "DAH", "DEN", "DEW",
      "DIE", "DOT", "EAR", "EAT", "EEL", "EEN", "END", "ERA",
      "EST", "EWE", "HAD", "HAS", "HAT", "HEN", "HET", "HOE",
      "HOT", "HUT", "LAB", "LAD", "LAP", "LED", "LID", "LIE",
    ],
  },
  {
    size: 6,
    rows: ["HSEEIC", "TSSZRS", "AEEUBS", "ERMONA", "GMITOL", "YARSUC"],
    targets: [
      "SEAT", "TRAY", "BREEZE", "SUMMER", "CLASSIC", "SOLUTION",
    ],
    bonus: [
      "ABS", "AGE", "AIM", "AIR", "AMI", "ANT", "ARE", "ARM",
      "ART", "ATE", "BAN", "BAS", "BOT", "BUM", "BUN", "BUS",
      "CON", "COO", "COS", "COT", "CUT", "EAR", "EAT", "EON",
      "ERA", "ERE", "ERS", "EST", "GAY", "GEM", "GYM", "ION",
      "IRE", "ITS", "LAB", "LOO", "LOT", "MAG", "MAY", "MEE",
    ],
  },
  {
    size: 6,
    rows: ["SLORSH", "LSEHRE", "PEIEOG", "CREBLS", "ADOTRS", "TCEFOM"],
    targets: [
      "BLEED", "CELLS", "FORMS", "GROSS", "HORSE", "PROTECT",
    ],
    bonus: [
      "ACT", "ADO", "ARE", "BED", "BEE", "BET", "BOD", "BOG",
      "BOH", "BOT", "BRO", "CAD", "CAR", "CAT", "COT", "DEF",
      "DOT", "EEL", "EGO", "ELL", "ERA", "ERE", "ERR", "ERS",
      "FED", "FOB", "FOE", "FOR", "FRO", "HER", "HIS", "HOE",
      "HOG", "HOS", "IRE", "LOB", "LOG", "MOR", "OFT", "ORA",
    ],
  },
  {
    size: 6,
    rows: ["EOHRTS", "SSNOUN", "HICOLB", "DGVUEY", "IETOSD", "GOLPTO"],
    targets: [
      "PLOT", "HONOR", "SIGHS", "COUNTS", "BELOVED", "CUSTODY",
    ],
    bonus: [
      "BED", "BUN", "BUS", "BUT", "CIG", "CON", "COO", "COT",
      "CUE", "CUT", "DEY", "DIE", "DIG", "DIS", "DOS", "DOT",
      "DYE", "EGO", "EON", "EST", "GEL", "GET", "GIG", "GIN",
      "GOT", "HID", "HIS", "HOC", "HOE", "HON", "HOO", "HOS",
      "HOT", "INS", "ISH", "LED", "LEG", "LOG", "LOO", "LOP",
    ],
  },
  {
    size: 6,
    rows: ["IRGLEN", "MCVODT", "ESESTE", "ARHGNR", "DIICEI", "NGSAGO"],
    targets: [
      "CAGE", "GLOVE", "CRIMES", "RISING", "STRING", "TENDER",
    ],
    bonus: [
      "AGE", "AGO", "AID", "AIN", "AIR", "ARE", "CIG", "DEN",
      "DIG", "DIS", "DOG", "DOS", "DOT", "EAR", "EGO", "END",
      "ERA", "ERE", "ERS", "EST", "GAS", "GIG", "GIN", "GOT",
      "GOV", "HER", "HID", "HIS", "ICE", "ING", "INS", "IRE",
      "LED", "LOD", "LOG", "LOT", "MIC", "NEG", "NET", "OLD",
    ],
  },
  {
    size: 6,
    rows: ["PTIAXE", "DVCTES", "AIETST", "CLSVFE", "AEPGLB", "ARELRU"],
    targets: [
      "FELL", "EXACT", "TESTS", "ADVICE", "BURGER", "SPECIAL",
    ],
    bonus: [
      "ACT", "AID", "AIL", "ALE", "ARE", "ATE", "AXE", "BET",
      "CAD", "CAR", "CAT", "DIE", "DIS", "EAR", "EAT", "EEL",
      "ELF", "ELL", "ERA", "ERE", "EST", "FLU", "GEL", "ICE",
      "ITS", "LAC", "LAD", "LEG", "LID", "LIE", "PEA", "PEE",
      "PER", "PRE", "REC", "REP", "RES", "RUB", "SEA", "SEC",
    ],
  },
  {
    size: 6,
    rows: ["SITNTH", "EIVORS", "ASTNGE", "ILOUIT", "ACORTO", "RCAPRH"],
    targets: [
      "ALSO", "COURT", "RAISE", "CARING", "PROTEST", "VISITOR",
    ],
    bonus: [
      "AIL", "ALT", "APT", "ART", "CAP", "CAR", "CON", "COO",
      "COP", "COS", "COT", "EGO", "ERS", "EST", "GET", "GIN",
      "GIT", "GON", "GOT", "GOV", "GUN", "GUT", "HOT", "ING",
      "ITS", "LAC", "LOO", "LOP", "LOT", "NOG", "NON", "NOR",
      "NOT", "NUT", "OAR", "OPT", "ORA", "ORE", "ORS", "OUR",
    ],
  },
  {
    size: 6,
    rows: ["HLAGER", "LCMSEV", "ATBASN", "EKOBGU", "ANALNI", "CRSEUL"],
    targets: [
      "CALL", "CARS", "EACH", "MASS", "LUNGS", "BLANKET", "GENUINE", "OBSERVE",
    ],
    bonus: [
      "ABS", "ACT", "AGE", "AKA", "AKE", "ALE", "ALL", "ALT",
      "ATE", "BAG", "BAM", "BAN", "BAR", "BAS", "BOA", "BOT",
      "CAN", "CAR", "CAT", "EAR", "EAT", "EEN", "ERE", "GAB",
      "GAL", "GAS", "GIN", "GUN", "ING", "LAB", "LAC", "LAG",
      "LOB", "LOT", "MAG", "MAS", "NAB", "NEE", "NEG", "NET",
    ],
  },
  {
    size: 6,
    rows: ["URIVEI", "DADPLB", "RTTEDI", "AOKTER", "HPARSD", "SPEEWS"],
    targets: [
      "BIRD", "KEPT", "DATED", "DRIVE", "SHORT", "APPEARS", "SWEATER",
    ],
    bonus: [
      "AID", "AIR", "AKE", "APE", "ARE", "ART", "ATE", "BID",
      "DIE", "DIP", "EAR", "EAT", "EEL", "ERA", "ERE", "ERS",
      "EST", "HAT", "HOP", "HOT", "IRE", "KEP", "LED", "LIB",
      "LID", "LIE", "OAK", "OAR", "OAT", "OPS", "ORA", "PAP",
      "PAR", "PEA", "PEE", "PEP", "PER", "PET", "POT", "RAD",
    ],
  },
  {
    size: 6,
    rows: ["USPKRA", "COPECE", "IERCTA", "TEATES", "AINCMI", "HGIVWS"],
    targets: [
      "RACE", "SWIM", "VICE", "ATTACK", "MISTER", "CREATING", "PRECIOUS",
    ],
    bonus: [
      "ACT", "AHI", "AIN", "ANT", "ARE", "ART", "ATE", "CAN",
      "CAR", "CAT", "CIG", "COP", "COS", "EAR", "EAT", "EEN",
      "ERA", "ERE", "EST", "GAT", "GIN", "GIT", "HAG", "HAT",
      "HIT", "ICE", "ING", "ISM", "KEP", "MET", "NEE", "NET",
      "OPS", "ORA", "ORE", "PEA", "PEE", "PEP", "PER", "PET",
    ],
  },
  {
    size: 6,
    rows: ["TPNLOY", "ROEJTW", "IBNGOP", "NSIWHS", "TSADTA", "ETRMSY"],
    targets: [
      "BELOW", "ENJOY", "STAYS", "PRINTS", "TASTES", "TONIGHT", "TOWARDS",
    ],
    bonus: [
      "ADS", "AID", "AIN", "ARM", "ART", "ATE", "BEG", "BID",
      "BIG", "BIN", "BIO", "BOP", "BOT", "BRO", "DAM", "DIG",
      "DIS", "EGO", "EON", "EST", "GEL", "GIN", "GOT", "HAS",
      "HAT", "HAY", "HOG", "HOP", "HOS", "HOT", "ING", "INS",
      "ION", "JOG", "JOT", "JOY", "LEG", "LOT", "LOW", "MAD",
    ],
  },
  {
    size: 6,
    rows: ["AOSEAG", "RDNRDM", "MEASEU", "TEHISL", "CSNGKH", "OHECUC"],
    targets: [
      "MEAN", "ROAD", "CHOSE", "SHEET", "GARDEN", "AMUSING", "CHUCKLES",
    ],
    bonus: [
      "ADO", "ADS", "AHI", "AIN", "AND", "ARE", "ARM", "COS",
      "DAH", "DAM", "DEN", "DON", "DOS", "DUE", "EAR", "EEN",
      "END", "ERA", "ERE", "ERS", "EST", "GAD", "GIN", "HAD",
      "HAS", "HEM", "HEN", "HER", "HET", "HIS", "HOC", "HOS",
      "HUG", "ING", "INS", "ISH", "KIN", "LED", "MAD", "MAG",
    ],
  },
  {
    size: 6,
    rows: ["ENISRA", "TNHATY", "GRTCEF", "IHANDB", "ERIEAI", "ESTRLP"],
    targets: [
      "CASH", "PAID", "RARE", "EIGHT", "BETRAY", "STRAIN", "TENNIS", "FEDERAL",
    ],
    bonus: [
      "ACT", "AHI", "AID", "AIL", "AIN", "AIR", "ALE", "AND",
      "ANT", "ARE", "ART", "ATE", "BAD", "BAN", "BAR", "BED",
      "BET", "BID", "CAN", "CAR", "CAT", "DAB", "DEF", "DEN",
      "DEY", "DIP", "EAR", "EAT", "END", "ERA", "ERE", "ERS",
      "EST", "FED", "FEY", "HAS", "HAT", "HER", "HIS", "HIT",
    ],
  },
  {
    size: 6,
    rows: ["WANYSU", "TOMOAB", "WCOCCW", "ERHRSM", "DDEXFA", "SSECIG"],
    targets: [
      "COMA", "OWED", "FIXED", "MAGIC", "SCORE", "SUBWAY", "WATCHES",
    ],
    bonus: [
      "ABS", "ANY", "BAS", "BUS", "CAB", "CAW", "CIG", "CON",
      "COO", "COS", "COT", "COW", "COY", "DEW", "ERE", "ERS",
      "FIG", "FIX", "FRO", "GAS", "HER", "HEX", "HOC", "HOM",
      "HOO", "ICE", "IFS", "MAG", "MAN", "MAS", "MAT", "MAW",
      "MON", "MOR", "MOW", "NOM", "NOT", "NOW", "OAT", "ORE",
    ],
  },
  {
    size: 6,
    rows: ["BEGAGE", "RPCRAE", "YEENIG", "ESGNFR", "TUZZAW", "IDIYLW"],
    targets: [
      "DIZZY", "LARGE", "SUITE", "WANNA", "CREEPY", "FINGER", "GARAGE",
    ],
    bonus: [
      "AGE", "AIN", "AIR", "ARE", "BEG", "CAR", "DIT", "DUE",
      "DUG", "EAR", "EEN", "ERA", "ERE", "EST", "EYE", "FAN",
      "FAR", "FIG", "FIN", "FIR", "GAG", "GIN", "GUT", "ING",
      "INN", "IRE", "ITS", "LAW", "LAY", "NAG", "NEE", "NEG",
      "PEE", "PEN", "PER", "PRE", "PRY", "RAG", "RAN", "RAW",
    ],
  },
  {
    size: 6,
    rows: ["NOEPOM", "NAEBDS", "REDNND", "OLUTEO", "YMPNFE", "FEDRAL"],
    targets: [
      "DOPE", "NONE", "OFTEN", "DUMPED", "NEARLY", "LEARNED",
    ],
    bonus: [
      "AFT", "ALE", "AND", "ANT", "ARE", "BED", "BEE", "BOD",
      "BOP", "DEF", "DEN", "DEY", "DON", "DOS", "DUE", "DUN",
      "EAR", "EEL", "EEN", "ELF", "END", "EON", "ERA", "FAN",
      "FAR", "FED", "FEE", "FEY", "FOE", "LED", "LYE", "MED",
      "MOB", "MOP", "MOR", "MUD", "NEE", "NET", "NOD", "NON",
    ],
  },
  {
    size: 6,
    rows: ["ORAWNE", "NDTGVR", "EPYREE", "CIUOGR", "ATBNRL", "ELSGWA"],
    targets: [
      "LAWN", "STEAL", "WRONG", "BURGER", "WARDEN", "REVENGE", "TYPICAL",
    ],
    bonus: [
      "ACT", "ADO", "AGE", "ALE", "ALT", "ART", "ATE", "BIT",
      "BOG", "BOY", "BUN", "BUT", "BUY", "CAT", "DEN", "DON",
      "EAT", "EGO", "END", "EON", "ERE", "ERR", "GAD", "GAT",
      "GON", "GYP", "ICE", "ITS", "LAC", "LAW", "NOD", "NOG",
      "NOR", "NUT", "ONE", "ONS", "ORA", "ORE", "OUR", "OUT",
    ],
  },
  {
    size: 6,
    rows: ["PDIONM", "IRSEMH", "TDKOTS", "HLNAOL", "EEVHII", "RELAED"],
    targets: [
      "HAVE", "HELD", "LOOK", "TRIP", "DEALER", "IDIOTS", "SOMEONE",
    ],
    bonus: [
      "AHI", "AID", "AIL", "AKE", "ALE", "AND", "ATE", "DID",
      "DIE", "DIP", "DIS", "DIT", "EEL", "EEN", "END", "EON",
      "ERE", "HAT", "HEN", "HER", "HID", "HOO", "HOS", "HOT",
      "ION", "LAH", "LID", "LIE", "LOO", "LOT", "MEN", "MET",
      "MOI", "MON", "NEE", "NET", "NOM", "NOT", "OAK", "OAT",
    ],
  },
];
