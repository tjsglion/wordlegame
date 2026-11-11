/**
 * Daily Guess word lists — SERVER ONLY.
 *
 * `ANSWERS` are common 5-letter English words that can be picked as the
 * solution. `ALLOWED_GUESSES` additionally accepts a set of plausible but
 * less common words so guesses don't have to come from the answer list.
 * Demo-scale lists (~200+ answers) — swap in a full dictionary later.
 *
 * Never import this from client code: the lists (and thus the daily answer)
 * must not ship in the client bundle. Evaluation happens in
 * src/app/api/daily-guess/guess/route.ts.
 */
import "server-only";

const answerWords = [
  "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult",
  "after", "again", "agent", "agree", "ahead", "alarm", "album", "alert",
  "alike", "alive", "allow", "alone", "along", "alter", "among", "anger",
  "angle", "angry", "apart", "apple", "apply", "arena", "argue", "arise",
  "array", "aside", "asset", "audio", "audit", "avoid", "award", "aware",
  "badly", "baker", "basic", "beach", "began", "begin", "being", "below",
  "bench", "birth", "black", "blame", "blind", "block", "blood", "board",
  "boost", "bound", "brain", "brand", "brave", "bread", "break", "breed",
  "brief", "bring", "broad", "broke", "brown", "build", "buyer", "cable",
  "carry", "catch", "cause", "chain", "chair", "chaos", "charm", "chart",
  "chase", "cheap", "check", "chest", "chief", "child", "civil", "claim",
  "class", "clean", "clear", "climb", "clock", "close", "cloud", "coach",
  "coast", "could", "count", "court", "cover", "craft", "crash", "crazy",
  "cream", "crime", "cross", "crowd", "crown", "cycle", "daily", "dance",
  "dealt", "death", "debut", "delay", "depth", "doing", "doubt", "dozen",
  "draft", "drama", "dream", "dress", "drink", "drive", "eager", "early",
  "earth", "eight", "elite", "empty", "enemy", "enjoy", "enter", "entry",
  "equal", "error", "event", "every", "exact", "exist", "extra", "faith",
  "false", "fault", "favor", "field", "fifth", "fifty", "fight", "final",
  "first", "flame", "flash", "floor", "focus", "force", "forty", "forum",
  "found", "frame", "fresh", "front", "fruit", "fully", "funny", "giant",
  "given", "glass", "globe", "glory", "grade", "grain", "grand", "grant",
  "grape", "graph", "grass", "great", "green", "greet", "group", "guard",
  "guess", "guest", "guide", "habit", "happy", "heart", "heavy", "hello",
  "honey", "honor", "horse", "hotel", "house", "human", "ideal", "image",
  "imply", "index", "inner", "input", "issue", "joint", "judge", "juice",
  "knife", "known", "label", "labor", "large", "later", "laugh", "layer",
  "learn", "least", "leave", "legal", "level", "light", "limit", "liver",
  "local", "logic", "loose", "lower", "lucky", "lunch", "magic", "major",
  "maker", "march", "match", "maybe", "mayor", "meant", "media", "metal",
  "meter", "might", "minor", "minus", "model", "money", "month", "moral",
  "motor", "mount", "mouse", "mouth", "movie", "music", "naive", "nerve",
  "never", "newly", "night", "noise", "north", "noted", "novel", "nurse",
  "occur", "ocean", "offer", "often", "older", "olive", "onion", "opera",
  "order", "other", "ought", "outer", "owner", "paint", "panel", "paper",
  "party", "peace", "phase", "phone", "photo", "piano", "piece", "pilot",
  "pitch", "place", "plain", "plane", "plant", "plate", "point", "pound",
  "power", "press", "price", "pride", "prime", "print", "prior", "prize",
  "proof", "proud", "prove", "queen", "quick", "quiet", "quite", "radio",
  "raise", "range", "rapid", "ratio", "reach", "ready", "refer", "right",
  "river", "robot", "rough", "round", "route", "royal", "rural", "scale",
  "scene", "scope", "score", "sense", "serve", "seven", "shade", "shake",
  "shall", "shape", "share", "sharp", "sheet", "shelf", "shell", "shift",
  "shine", "shirt", "shock", "shoot", "shore", "short", "shown", "sight",
  "since", "sixth", "sixty", "skill", "sleep", "slide", "small", "smart",
  "smile", "smoke", "solid", "solve", "sorry", "sound", "south", "space",
  "spare", "speak", "speed", "spend", "spent", "split", "spoke", "sport",
  "staff", "stage", "stand", "start", "state", "steam", "steel", "stick",
  "still", "stock", "stone", "stood", "store", "storm", "story", "strip",
  "study", "stuff", "style", "sugar", "suite", "super", "sweet", "table",
  "taken", "taste", "teach", "thank", "their", "theme", "there", "these",
  "thick", "thing", "think", "third", "those", "three", "throw", "tight",
  "title", "today", "topic", "total", "touch", "tough", "tower", "track",
  "trade", "train", "treat", "trend", "trial", "tribe", "trick", "truck",
  "truly", "trust", "truth", "twice", "under", "union", "unite", "unity",
  "until", "upper", "upset", "urban", "usage", "usual", "valid", "value",
  "video", "visit", "vital", "voice", "waste", "watch", "water", "wheel",
  "where", "which", "while", "white", "whole", "whose", "woman", "world",
  "worry", "worse", "worst", "worth", "would", "wound", "write", "wrong",
  "yield", "young", "youth",
];

const extraGuessWords = [
  "abide", "abyss", "acorn", "adore", "adorn", "afoot", "agony", "aisle",
  "algae", "alibi", "allot", "alloy", "aloft", "alpha", "amber", "ample",
  "angel", "ankle", "apron", "arbor", "arose", "ashes", "attic", "avail",
  "bacon", "badge", "bagel", "banjo", "basil", "batch", "baton", "beard",
  "beast", "berry", "blade", "blast", "blaze", "bless", "bliss",
  "blown", "blues", "blunt", "bonus", "booth", "brake", "brick", "bride",
  "brush", "buddy", "bunch", "cabin", "candy", "cargo", "carve", "cedar",
  "chalk", "chill", "choir", "chunk", "cider", "civic", "clash", "cliff",
  "cloak", "clone", "clown", "cocoa", "coral", "crane", "crisp", "curly",
  "curve", "dairy", "daisy", "delta", "denim", "diary", "dodge",
  "donor", "dough", "drift", "drill", "dusty", "eagle", "elbow",
  "elder", "emoji", "fable", "fairy", "fence", "ferry", "fiber", "flair",
  "flock", "flour", "fluid", "foggy", "forge", "frost", "fudge", "gauge",
  "genie", "ghost", "glide", "glove", "grace", "grill", "grove", "guilt",
  "gusty", "handy", "haste", "haunt", "hedge", "hinge", "hobby", "humor",
  "hurry", "igloo", "ivory", "jelly", "jewel", "joker", "jolly", "karma",
  "kneel", "knock", "lemon", "lilac", "linen", "lodge", "loyal", "lunar",
  "mango", "maple", "marsh", "medal", "melon", "mercy", "merry", "micro",
  "midst", "mimic", "minty", "mocha", "moist", "motto", "muddy", "nifty",
  "noble", "nylon", "oasis", "orbit", "otter", "pasta", "patch",
  "peach", "pearl", "penny", "perch", "petal", "plaza", "pluck", "plumb",
  "polar", "pouch", "prism", "puppy", "quilt", "quota", "rainy", "rally",
  "ranch", "realm", "rebel", "reign", "ridge", "risky", "roast", "robin",
  "rocky", "salsa", "sandy", "sauce", "scarf", "scent", "scold", "scout",
  "shady", "shark", "shiny", "siege", "silly", "skein", "slope",
  "smash", "snack", "sneak", "solar", "spice", "spicy", "squad", "stain",
  "stair", "stale", "steep", "stern", "sting", "stomp", "stool", "stove",
  "straw", "stump", "sunny", "surge", "swamp", "swear", "swept", "swift",
  "swing", "syrup", "tango", "tease", "tempo", "tenth", "thorn", "tidal",
  "tiger", "toast", "tonic", "trace", "trail", "tramp", "tulip", "tutor",
  "tweak", "twist", "ultra", "uncle", "vague", "vapor", "vault", "venom",
  "verse", "vivid", "vowel", "wagon", "waist", "waltz", "weary", "weave",
  "wedge", "whale", "wheat", "whisk", "widen", "widow", "windy", "witch",
  "woven", "yeast", "zebra", "zesty",
];

function normalize(words: string[]): string[] {
  return [...new Set(words.map((w) => w.trim().toLowerCase()))].filter(
    (w) => /^[a-z]{5}$/.test(w),
  );
}

export const ANSWERS: readonly string[] = normalize(answerWords);
export const ALLOWED_GUESSES: ReadonlySet<string> = new Set(
  normalize([...answerWords, ...extraGuessWords]),
);
