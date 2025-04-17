
// Monster Types
const MONSTER_TYPES = {
    // # - Name - Element - Speed, Phyical Defense, Special Defense, Phyical Attack, Special Attack, Endurance, SizeAdjust
    1: { name: "Derpfish", element: "Water", stats: { spd: 40, pDef: 60, sDef: 70, pAtk: 70, sAtk: 20, endur: 40}, size: 1, atkCd: 5 }, //Total: 300
    2: { name: "Emberling", element: "Fire", stats: { spd: 70, pDef: 40, sDef: 60, pAtk: 50, sAtk: 60, endur: 20}, size: 1, atkCd: 5 }, //Total: 300
    3: { name: "DownTwo", element: "Earth", stats: { spd: 30, pDef: 65, sDef: 65, pAtk: 55, sAtk: 55, endur: 30}, size: 1, atkCd: 5 }, //Total: 300
    4: { name: "Potsy", element: "Plant", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 60, sAtk: 60, endur: 30}, size: 1, atkCd: 5 }, //Total: 300
    5: { name: "Shockles", element: "Electric", stats: { spd: 60, pDef: 30, sDef: 40, pAtk: 50, sAtk: 60, endur: 60}, size: 0.9, atkCd: 5 }, //Total: 300
    6: { name: "Zappy Bird", element: "Electric", stats: { spd: 70, pDef: 40, sDef: 40, pAtk: 30, sAtk: 80, endur: 40}, size: 0.8 }, //Total: 300
    7: { name: "Roflstump", element: "Plant", stats: { spd: 30, pDef: 40, sDef: 40, pAtk: 90, sAtk: 70, endur: 30}, size: 0.8}, //Total: 300
    8: { name: "Wimbler", element: "Water", stats: { spd: 40, pDef: 60, sDef: 50, pAtk: 45, sAtk: 35, endur: 70}, size: 1.2}, //Total: 300
    9: { name: "Urthmoad", element: "Earth", stats: { spd: 100, pDef: 30, sDef: 20, pAtk: 50, sAtk: 20, endur: 80}, size: 1, atkCd: 3}, //Total: 300
    10: { name: "Emborgi", element: "Fire", stats: { spd: 60, pDef: 30, sDef: 50, pAtk: 40, sAtk: 70, endur: 50}, size: 1}, //Total: 300
    11: { name: "Vinegents", element: "Plant", stats: { spd: 50, pDef: 40, sDef: 55, pAtk: 35, sAtk: 70, endur: 30}, atkCd: 5, size: 1}, //Total: 280
    12: { name: "Blackbory", element: "Earth", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 45, sAtk: 25, endur: 60}, size: 0.8}, //Total: 280
    13: { name: "Rumbleweed", element: "Plant", stats: { spd: 50, pDef: 65, sDef: 45, pAtk: 70, sAtk: 10, endur: 60}, size: 0.85}, //Total: 300
    14: { name: "Blazey", element: "Fire", stats: { spd: 10, pDef: 50, sDef: 60, pAtk: 25, sAtk: 75, endur: 40 }, size: 1}, //Total: 260
    15: { name: "Treezard", element: "Plant", stats: { spd: 50, pDef: 60, sDef: 30, pAtk: 20, sAtk: 60, endur: 40 }, size: 1}, //Total: 260
    16: { name: "Dampyre", element: "Water", stats: { spd: 80, pDef: 40, sDef: 30, pAtk: 80, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    17: { name: "Moltenoth", element: "Fire", stats: { spd: 20, pDef: 60, sDef: 70, pAtk: 70, sAtk: 20, endur: 60 }, size: 1}, //Total: 300
    18: { name: "Puddlepus", element: "Water", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 50, sAtk: 50, endur: 50 }, size: 0.95}, //Total: 300
    19: { name: "Lampray", element: "Electric", stats: { spd: 40, pDef: 40, sDef: 60, pAtk: 20, sAtk: 90, endur: 50 }, size: 1}, //Total: 300
    20: { name: "Hydrant", element: "Water", stats: { spd: 20, pDef: 40, sDef: 40, pAtk: 60, sAtk: 20, endur: 80 }, size: 1}, //Total: 260
    21: { name: "Pyrithan", element: "Earth", stats: { spd: 30, pDef: 90, sDef: 50, pAtk: 60, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    22: { name: "Tesnail", element: "Electric", stats: { spd: 80, pDef: 50, sDef: 30, pAtk: 15, sAtk: 45, endur: 80 }, size: 1}, //Total: 300
    23: { name: "Crystacean", element: "Earth", stats: { spd: 30, pDef: 40, sDef: 90, pAtk: 80, sAtk: 20, endur: 40 }, size: 1}, //Total: 300
    24: { name: "Livermort", element: "Plant", stats: { spd: 30, pDef: 50, sDef: 40, pAtk: 30, sAtk: 100, endur: 50 }, size: 1}, //Total: 300
    25: { name: "Rockhemut", element: "Earth", stats: { spd: 10, pDef: 80, sDef: 60, pAtk: 55, sAtk: 15, endur: 80 }, size: 1.2}, //Total: 300
    26: { name: "Lavavark", element: "Fire", stats: { spd: 40, pDef: 50, sDef: 50, pAtk: 70, sAtk: 40, endur: 50 }, size: 1}, //Total: 300
    27: { name: "Helapain", element: "Plant", stats: { spd: 30, pDef: 40, sDef: 50, pAtk: 30, sAtk: 110, endur: 40 }, size: 1}, //Total: 300
    28: { name: "Scorchion", element: "Fire", stats: { spd: 40, pDef: 60, sDef: 60, pAtk: 20, sAtk: 80, endur: 40 }, size: 1}, //Total: 300
    29: { name: "Steanix", element: "Water", stats: { spd: 50, pDef: 30, sDef: 40, pAtk: 70, sAtk: 70, endur: 40 }, size: 1}, //Total: 300
    30: { name: "Igneite", element: "Fire", stats: { spd: 60, pDef: 50, sDef: 30, pAtk: 80, sAtk: 20, endur: 60 }, size: 0.9}, //Total: 300
    31: { name: "Boltzalea", element: "Electric", stats: { spd: 30, pDef: 40, sDef: 60, pAtk: 10, sAtk: 120, endur: 40 }, size: 1}, //Total: 300
    32: { name: "Polrus", element: "Water", stats: { spd: 30, pDef: 50, sDef: 60, pAtk: 35, sAtk: 25, endur: 100 }, size: .95}, //Total: 300
    33: { name: "Shockram", element: "Electric", stats: { spd: 60, pDef: 55, sDef: 45, pAtk: 70, sAtk: 30, endur: 40 }, size: 1.2}, //Total: 300
    34: { name: "RollNRock", element: "Earth", stats: { spd: 90, pDef: 40, sDef: 40, pAtk: 60, sAtk: 10, endur: 60 }, abilId: 13, size: 0.75}, //Total: 300
    35: { name: "Scornfront", element: "Electric", stats: { spd: 90, pDef: 45, sDef: 35, pAtk: 10, sAtk: 70, endur: 50 }, size: 1.2, atkCd: 20}, //Total: 300
    36: { name: "Corgknight", element: "Fire", stats: { spd: 30, pDef: 60, sDef: 40, pAtk: 60, sAtk: 40, endur: 70 }, size: 0.9}, //Total: 300
    /*37: { name: "Souldier", element: "Neutral", stats: { spd: 50, pDef: 70, sDef: 70, pAtk: 30, sAtk: 30, endur: 60 }, size: 1}, //Total: 310
    38: { name: "Arch", element: "Neutral", stats: { spd: 50, pDef: 30, sDef: 30, pAtk: 120, sAtk: 10, endur: 70 }, size: 1}, //Total: 310
    39: { name: "Balencia", element: "Neutral", stats: { spd: 55, pDef: 55, sDef: 55, pAtk: 55, sAtk: 55, endur: 55 }, size: 1}, //Total: 330
    40: { name: "Source", element: "Neutral", stats: { spd: 70, pDef: 30, sDef: 30, pAtk: 10, sAtk: 120, endur: 50 }, size: 1}, //Total: 310
    */
    // Dragginball
    // Unicorg
};

const MONSTER_ABILITIES = {
    /* IDEAS:
    00: { name: "Adaptive Strikes", desc: "Attack damage type becomes the lower of the defender's defenses." },
    00: { name: "Willpower", desc: "Damage goes to stamina when HP is depleted." },
    00: { name: "Ensnaring", desc: "10% of damage also reduces enemy stamina." }
    */
    8: { name: "Rotund", desc: "10% increased max HP, 10% reduced max stamina.", value: 0.1 },
    9: { name: "Unrelenting", desc: "When stamina is depleted, spends HP instead to attack." },
    11: { name: "Vengeance", desc: "Enrages when damaged, dealing 50% increased damage for 2 seconds.", value: 1.5, time: 2 },
    12: { name: "Magic Thorns", desc: "Reflects 25% of attack special damage taken before reduction.", value: 0.25 },
    13: { name: "Rumbler", desc: "Rolls around during combat." },
    14: { name: "Lazy", desc: "Always regenerates HP at half out of combat rates.", value: 0.5 },
    15: { name: "Distracting Presence", desc: "Nearby enemies have a 20% chance to miss.", value: 0.2 },
    16: { name: "Physical Drain", desc: "Leeches 20% of physical damage dealt.", value: 0.2 },
    17: { name: "Hardened Skin", desc: "Incoming damage reduced by 10, minimum of 10.", value: 10 },
    19: { name: "Special Drain", desc: "Leeches 20% of special damage dealt.", value: 0.2 },
    20: { name: "Hydra", desc: "Instead of dying, swaps its HP and stamina percentages.", value: 0.15 },
	35: { name: "Static Charge", desc: "20% of physical damage taken gained as stamina.", value: 0.2 },
}

/*const MONSTER_TYPE_STORIES = {

    1: { story: "Even outside of water, the Derpfish lives! They can often be found sunbathing on the beach. Their lifecycle is unknown."},
    2: { story: "Emberlings are the arsonists of the monster world. They are known to set fire to anything that moves. They are also known collapse from exhaustion regularly."},
    3: { story: "DownTwo is a two-headed monster. Or maybe it's two monsters stuck together. It's *hard* to tell."},
    4: { story: "Potsy is a plant monster that carries its sproutling pot with it everywhere it goes. Some pots have been passed down for generations."},
    5: { story: "Shockles is descended from a water-type monster similar to a clam. According to legend, they are born when lightning strikes the ocean."},
    6: { story: "Zappy Bird was undiscovered until recently. Where did they come from and where will they go? Better catch some before it's too late!"},
	7:
	8: 
	9:
    10: { story: "Despite being fire element, Emborgi is known to extinguish the fires that Emberlings start. But Emborgis do sometimes ignite fires on accident when they sploot for a nap."},

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