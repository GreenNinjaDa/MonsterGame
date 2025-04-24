
// Monster Types
const MONSTER_TYPES = {
    // # - Name - Element - Speed, Phyical Defense, Special Defense, Phyical Attack, Special Attack, Endurance, SizeAdjust
    1: { name: "Derpfish", element: "Water", stats: { spd: 40, pDef: 60, sDef: 70, pAtk: 70, sAtk: 20, endur: 40}, atkCd: 5 }, //Total: 300
    2: { name: "Emberling", element: "Fire", stats: { spd: 70, pDef: 40, sDef: 60, pAtk: 50, sAtk: 60, endur: 20}, atkCd: 5 }, //Total: 300
    3: { name: "DownTwo", element: "Earth", stats: { spd: 30, pDef: 65, sDef: 65, pAtk: 55, sAtk: 55, endur: 30}, atkCd: 5, abilId: 9003 }, //Total: 300
    4: { name: "Potsy", element: "Plant", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 60, sAtk: 60, endur: 30}, atkCd: 5 }, //Total: 300
    5: { name: "Shockles", element: "Electric", stats: { spd: 60, pDef: 30, sDef: 40, pAtk: 50, sAtk: 60, endur: 60}, size: 0.9, atkCd: 5 }, //Total: 300
    6: { name: "Zappy Bird", element: "Electric", stats: { spd: 70, pDef: 40, sDef: 40, pAtk: 30, sAtk: 80, endur: 40}, size: 0.8 }, //Total: 300
    7: { name: "Roflstump", element: "Plant", stats: { spd: 30, pDef: 40, sDef: 40, pAtk: 90, sAtk: 70, endur: 30}, size: 0.8 }, //Total: 300
    8: { name: "Wimbler", element: "Water", stats: { spd: 40, pDef: 60, sDef: 50, pAtk: 45, sAtk: 35, endur: 70}, size: 1.2, atkCd: 5}, //Total: 300
    9: { name: "Urthmoad", element: "Earth", stats: { spd: 100, pDef: 30, sDef: 20, pAtk: 50, sAtk: 20, endur: 80}, atkCd: 3}, //Total: 300
    10: { name: "Emborgi", element: "Fire", stats: { spd: 60, pDef: 30, sDef: 50, pAtk: 40, sAtk: 70, endur: 50}, atkCd: 5 }, //Total: 300
    11: { name: "Vinegents", element: "Plant", stats: { spd: 50, pDef: 40, sDef: 55, pAtk: 35, sAtk: 70, endur: 30}, atkCd: 5}, //Total: 280
    12: { name: "Blackbory", element: "Earth", stats: { spd: 30, pDef: 50, sDef: 70, pAtk: 55, sAtk: 15, endur: 60}, size: 0.8}, //Total: 280
    13: { name: "Rumbleweed", element: "Plant", stats: { spd: 50, pDef: 65, sDef: 45, pAtk: 70, sAtk: 10, endur: 60}, size: 0.85}, //Total: 300
    14: { name: "Blazey", element: "Fire", stats: { spd: 10, pDef: 50, sDef: 60, pAtk: 25, sAtk: 75, endur: 40 } }, //Total: 260
    15: { name: "Treezard", element: "Plant", stats: { spd: 50, pDef: 60, sDef: 30, pAtk: 20, sAtk: 70, endur: 50 } }, //Total: 280
    16: { name: "Dampyre", element: "Water", stats: { spd: 80, pDef: 40, sDef: 30, pAtk: 70, sAtk: 30, endur: 40 } }, //Total: 290
    17: { name: "Moltenoth", element: "Fire", stats: { spd: 20, pDef: 60, sDef: 70, pAtk: 70, sAtk: 20, endur: 60 } }, //Total: 300
    18: { name: "Puddlepus", element: "Water", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 50, sAtk: 50, endur: 50 }, size: 0.95}, //Total: 300
    19: { name: "Lampray", element: "Electric", stats: { spd: 40, pDef: 40, sDef: 60, pAtk: 20, sAtk: 80, endur: 50 } }, //Total: 290
    20: { name: "Hydrant", element: "Water", stats: { spd: 20, pDef: 40, sDef: 40, pAtk: 60, sAtk: 20, endur: 80 } }, //Total: 260
    21: { name: "Pyrithan", element: "Earth", stats: { spd: 30, pDef: 90, sDef: 50, pAtk: 60, sAtk: 30, endur: 40 } }, //Total: 300
    22: { name: "Tesnail", element: "Electric", stats: { spd: 80, pDef: 50, sDef: 30, pAtk: 15, sAtk: 45, endur: 80 } }, //Total: 300
    23: { name: "Crystacean", element: "Earth", stats: { spd: 30, pDef: 40, sDef: 90, pAtk: 80, sAtk: 20, endur: 40 } }, //Total: 300
    24: { name: "Livermort", element: "Plant", stats: { spd: 30, pDef: 50, sDef: 40, pAtk: 30, sAtk: 100, endur: 50 } }, //Total: 300
    25: { name: "Rockhemut", element: "Earth", stats: { spd: 10, pDef: 80, sDef: 60, pAtk: 55, sAtk: 15, endur: 80 }, size: 1.2}, //Total: 300
    26: { name: "Lavavark", element: "Fire", stats: { spd: 40, pDef: 50, sDef: 50, pAtk: 70, sAtk: 40, endur: 50 } }, //Total: 300
    27: { name: "Helapain", element: "Plant", stats: { spd: 30, pDef: 40, sDef: 50, pAtk: 30, sAtk: 110, endur: 40 } }, //Total: 300
    28: { name: "Scorchion", element: "Fire", stats: { spd: 40, pDef: 60, sDef: 60, pAtk: 20, sAtk: 80, endur: 40 } }, //Total: 300
    29: { name: "Steanix", element: "Water", stats: { spd: 50, pDef: 30, sDef: 40, pAtk: 70, sAtk: 70, endur: 40 } }, //Total: 300
    30: { name: "Igneite", element: "Fire", stats: { spd: 60, pDef: 50, sDef: 30, pAtk: 80, sAtk: 20, endur: 60 }, size: 0.9}, //Total: 300
    31: { name: "Boltzalea", element: "Electric", stats: { spd: 30, pDef: 40, sDef: 60, pAtk: 10, sAtk: 120, endur: 40 } }, //Total: 300
    32: { name: "Polrus", element: "Water", stats: { spd: 30, pDef: 50, sDef: 60, pAtk: 35, sAtk: 25, endur: 100 }, size: .95}, //Total: 300
    33: { name: "Shockram", element: "Electric", stats: { spd: 60, pDef: 55, sDef: 45, pAtk: 70, sAtk: 30, endur: 40 }, size: 1.2}, //Total: 300
    34: { name: "RollNRock", element: "Earth", stats: { spd: 90, pDef: 40, sDef: 40, pAtk: 60, sAtk: 10, endur: 60 }, size: 0.75, abilId: 13}, //Total: 300
    35: { name: "Scornfront", element: "Electric", stats: { spd: 90, pDef: 45, sDef: 35, pAtk: 10, sAtk: 70, endur: 50 }, size: 1.2, atkCd: 20}, //Total: 300
    36: { name: "Corgknight", element: "Fire", stats: { spd: 30, pDef: 60, sDef: 40, pAtk: 60, sAtk: 40, endur: 70 }, size: 0.9}, //Total: 300
    /*37: { name: "Souldier", element: "Neutral", stats: { spd: 50, pDef: 70, sDef: 70, pAtk: 30, sAtk: 30, endur: 60 } }, //Total: 310
    38: { name: "Arch", element: "Neutral", stats: { spd: 50, pDef: 30, sDef: 30, pAtk: 120, sAtk: 10, endur: 70 } }, //Total: 310
    39: { name: "Balencia", element: "Neutral", stats: { spd: 55, pDef: 55, sDef: 55, pAtk: 55, sAtk: 55, endur: 55 } }, //Total: 330
    40: { name: "Source", element: "Neutral", stats: { spd: 70, pDef: 30, sDef: 30, pAtk: 10, sAtk: 120, endur: 50 } }, //Total: 310
    */
    // Dragginball
    // Unicorg
    // Gooeytux
    // 1001: { name: "Subject A", element: "Neutral", stats: { spd: 60, pDef: 20, sDef: 20, pAtk: 70, sAtk: 70, endur: 60 } }, //Total: 300
};

const MONSTER_ABILITIES = {
    /* IDEAS:
    00: { name: "Adaptive Strikes", desc: "Attack damage type becomes the lower of the defender's defenses." },
    00: { name: "Willpower", desc: "Damage goes to stamina when HP is depleted." },
    00: { name: "Ensnaring", desc: "10% of damage also reduces enemy stamina." }
    00: { name: "Masher", desc: "Deals 25% more special damage to enemies below 50% HP." }
    00: { name: "", desc: "." },
    00: { name: "", desc: ".", value: 0},
    00: { name: "Ambusher", desc: "Deals double physical damage to enemies above 90% HP.", value: 2.0, threshold: 0.9 },
    00: { name: "Surprise Attack", desc: "Deals double special damage to enemies above 90% HP.", value: 2, threshold: 0.9 },
    00: { name: "Frontloader", desc: "Spends double stamina to deal 50% more damage with attacks.", value: 1.5, costMulti: 2 },
    00: { name: "Executioner", desc: "Deals 50% more damage to enemies below 15% HP.", value: 1.5, threshold: 0.15 },
    00: { name: "Finisher", desc: "Spends double stamina to deal double damage to enemies below half HP.", value: 2, costMulti: 2 },
    00: { name: "Roundup", desc: "Deals 25% more damage to plant element enemies.", value: 1.25 },
    00: { name: "Indomitable", desc: "Incoming hit damage above 10% of max HP is halved.", threshold: 0.1},
    */
    1: { name: "Infertile", desc: "Takes 20% less damage from plant element enemies.", value: 0.8 },
    2: { name: "Greek Fire", desc: "Deals 25% more damage to water element enemies.", value: 1.25 },
    3: { name: "Between a Rock..", desc: "Takes 5% less damage from enemies per level higher they are.", value: 0.05 },
    4: { name: "Growth Spurt", desc: "Gains 30% more exp.", value: 1.3 },
    5: { name: "Ensnaring", desc: "10% of damage also reduces enemy stamina.", value: 0.1 },
    6: { name: "Early Bird", desc: "Double regen out of combat.", value: 2.0 },
    7: { name: "Stomper", desc: "Deals 25% more physical damage to enemies below 50% HP.", value: 1.25, threshold: 0.5 },
    8: { name: "Rotund", desc: "10% increased max HP, 10% reduced max stamina.", value: 0.1 },
    9: { name: "Unrelenting", desc: "When stamina is depleted, spends HP instead to attack." },
    10: { name: "Extinguisher", desc: "Deals 25% more damage to fire element enemies.", value: 1.25 },
    11: { name: "Vengeance", desc: "Enrages when damaged, dealing 50% more damage for 2 seconds.", value: 1.5, time: 2 },
    12: { name: "Magic Thorns", desc: "Reflects 25% of attack special damage taken before reduction.", value: 0.25 },
    13: { name: "Rumbler", desc: "Rolls around during combat." },
    14: { name: "Lazy", desc: "Always regenerates HP at half out of combat rates.", value: 0.5 },
    15: { name: "Distracting Presence", desc: "Nearby enemies have a 10% chance to miss.", value: 0.1 },
    16: { name: "Physical Drain", desc: "Leeches 15% of physical damage dealt.", value: 0.15 },
    17: { name: "Hardened Body", desc: "Incoming damage reduced by 20, minimum of 20.", value: 20 },
    18: { name: "Waterproof", desc: "Takes 20% less damage from water element enemies.", value: 0.8 },
    19: { name: "Special Drain", desc: "Leeches 15% of special damage dealt.", value: 0.15 },
    20: { name: "Hydra", desc: "Instead of dying, swaps its HP and stamina percentages.", threshold: 0.1 },
    21: { name: "Glancing Blows", desc: "Adds half a second to enemy attack cooldown when attacked.", value: 0.5 },
    22: { name: "Block", desc: "Blocks 50% of physical damage from an attack. Cooldown: 30 seconds, modified by speed.", value: 0.5 }, //TODO
    31: { name: "Beautiful but Deadly", desc: "When attacked, deals 10 special damage in retaliation.", value: 10},
	35: { name: "Static Charge", desc: "15% of physical damage taken gained as stamina.", value: 0.15 },
    9003: { name: "...And a Hard Place", desc: "Deals 5% increased damage to enemies per level higher they are.", value: 0.05 },
}

/*const MONSTER_TYPE_STORIES = {

    1: { story: "Even outside of water, the Derpfish lives! They can often be found sunbathing on the beach. Their lifecycle is unknown." },
    2: { story: "Emberlings are the arsonists of the monster world. They are known to set fire to anything that moves. They are also known collapse from exhaustion regularly." },
    3: { story: "DownTwo is a two-headed rock monster. Or maybe it's two monsters stuck together. It's hard to tell." },
    4: { story: "Potsy is a plant monster that carries its sproutling pot with it everywhere it goes. Some pots have been passed down for generations, dude." },
    5: { story: "Shockles is descended from a water affinity monster similar to a clam. According to legend, they are born when lightning strikes the ocean." },
    6: { story: "Zappy Bird was undiscovered until recently. Where did they come from and where will they go? Better catch some before it's too late!" },
    7: { story: "The best offense is a good stomping. Often seen around pubs, stomping. The pubs. Pub stomping." },
    8: { story: "Often mistaken for narwhals or unicorns, Wimbler's horn is actually a soft protrusion they use to tickle each other affectionately." },
    9: { story: "Perhaps the most impatient monster. Yet it wastes countless hours by giving up before things it calls dead haven't yet had the chance to be born." },
    10: { story: "Despite being fire element, Emborgi is known to extinguish the fires that Emberlings start. But Emborgis do sometimes ignite fires on accident when they sploot for a nap." },
    11: { story: "These bros pretend to have perfect composure, but they throw a fit when you mess with their 'fit." },
    12: { story: "Nobody knows how an Earth affinity monster evolved to live in a jungle environment full of Plant affinity monsters, but I guess when you're THIS tough, you can survive anything." },
    19: { story: "Puddlepus is thought to actually have no elemental affinity, but since it is always covered in water, it fights like a water affinity monster." },

};*/

// List of all available elements
const ELEMENTS = ["Plant", "Earth", "Electric", "Water", "Fire", "Neutral"];

// Element Relationships (bonus/penalty)
const ELEMENT_RELATIONS = {
    "Plant": { strong: "Earth", weak: "Fire" },
    "Earth": { strong: "Electric", weak: "Plant" },
    "Electric": { strong: "Water", weak: "Earth" },
    "Water": { strong: "Fire", weak: "Electric" },
    "Fire": { strong: "Plant", weak: "Water" },
    "Neutral": { strong: "", weak: "" },
};

// Visual colors for elements (for effects)
const ELEMENT_COLORS = {
    "Plant": 0x2ecc71, // Green
    "Earth": 0x964b00, // Brown
    "Electric": 0xf1c40f, // Yellow
    "Water": 0x3498db, // Blue
    "Fire": 0xe74c3c, // Red
    "Neutral": 0x808080 // Gray
};

// Element percentage stat modifiers
const ELEMENT_MODIFIERS = {
    "Plant": { sAtk: 10, endur: 10, spd: -15 },
    "Earth": { pAtk: 10, pDef: 10, sAtk: -15 },
    "Electric": { sAtk: 10, spd: 10, endur: -15 },
    "Water": { endur: 10, spd: 10, pDef: -15 },
    "Fire": { pAtk: 10, sAtk: 10, sDef: -15 },
    "Neutral": { },
};

// Additional element ideas
// "Wind/Air" spd: 10, pDef: 10, pAtk -10
//


/*// Element percentage stat modifiers (alternate version to be considered)
const ELEMENT_MODIFIERS = {
    "Plant": { sAtk: 10, endur: 10, spd: -15 },
    "Earth": { pAtk: 10, pDef: 10, sAtk: -15 },
    "Electric": { sDef: 10, spd: 10, endur: -15 },
    "Water": { endur: 10, sDef: 10, pDef: -15 },
    "Fire": { pDef: 10, sAtk: 10, sDef: -15 },
    "Neutral": { },
};*/

// Element flat stat modifiers
const ELEMENT_TYPESHIFT_STATS = {
    "Plant": { sAtk: 5, endur: 5, spd: -5 },
    "Earth": { pAtk: 5, pDef: 5, sAtk: -5 },
    "Electric": { sAtk: 5, spd: 5, endur: -5 },
    "Water": { endur: 5, spd: 5, pDef: -5 },
    "Fire": { pAtk: 5, sAtk: 5, sDef: -5 },
    "Neutral": { },
};

// Rare Modifiers and their bonuses in percentages
const RARE_MODIFIERS = {
    "Smooth": { spd: 10, pDef: 10 },
    "Sharp": { spd: 10, pAtk: 10 },
    "Witty": { spd: 10, sDef: 10 },
    "Shocking": { spd: 10, sAtk: 10 },
    "Athletic": { spd: 10, endur: 10 },
    "Strong": { pDef: 10, pAtk: 10 },
    "Sturdy": { pDef: 10, sDef: 10 },
    "Slick": { pDef: 10, sAtk: 10 },
    "Tough": { pDef: 10, endur: 10 },
    "Decisive": { pAtk: 10, sDef: 10 },
    "Aggressive": { pAtk: 10, sAtk: 10 },
    "Determined": { pAtk: 10, endur: 10 },
    "Smart": { sDef: 10, sAtk: 10 },
    "Stoic": { sDef: 10, endur: 10 },
    "Thoughtful": { sAtk: 10, endur: 10 }
};