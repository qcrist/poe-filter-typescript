import {BASE_TYPE_MAP} from "#src/ui/filter/base_types_raw";
import {FilterCondition, FilterConditionTypes} from "#src/ui/filter/item-filter-def";

export type FilterClassType = keyof typeof BASE_TYPE_MAP;
// export type FilterBaseTypes = (typeof BASE_TYPES)[FilterClassType]
export type FilterBaseType = string;

export const FILTER_CLASS_TYPES: FilterClassType[] = Object.keys(BASE_TYPE_MAP).sort() as any;

export type RuleCategoryType = keyof typeof RULE_CATEGORIES_MAP;

const BLACKLIST_CLASSES: Set<FilterClassType> = new Set([
    "Corpses",
    "Charms",
    "Embers of the Allflame",
    "Sentinel Drones"
]);

export const RULE_CATEGORIES_MAP = {
    Currency: ["Stackable Currency", "Delve Stackable Socketable Currency", "Incubators", "Divination Cards"],
    Jewels: ["Abyss Jewels", "Jewels"],
    Equipment: [
        "Amulets",
        "Belts",
        "Body Armours",
        "Boots",
        "Bows",
        "Claws",
        "Daggers",
        "Gloves",
        "Helmets",
        "One Hand Axes",
        "One Hand Maces",
        "One Hand Swords",
        "Quivers",
        "Rings",
        "Rune Daggers",
        "Sceptres",
        "Shields",
        "Staves",
        "Thrusting One Hand Swords",
        "Two Hand Axes",
        "Two Hand Maces",
        "Two Hand Swords",
        "Wands",
        "Warstaves",
    ],
    Flasks: [
        "Hybrid Flasks",
        "Life Flasks",
        "Mana Flasks",
        "Utility Flasks",
        "Tinctures",
    ],
    "Atlas Maps": [
        "Maps",
    ],
    "Map Like": [
        "Blueprints",
        "Breachstones",
        "Contracts",
        "Expedition Logbooks",
        "Map Fragments",
        "Misc Map Items",
        "Sanctum Research",
        "Memories",
        "Vault Keys",
    ],
    "Quest Like": [
        "Atlas Upgrade Items",
        "Incursion Items",
        "Labyrinth Items",
        "Labyrinth Trinkets",
        "Quest Items",
    ],
    Heist: [
        "Heist Brooches",
        "Heist Cloaks",
        "Heist Gear",
        "Heist Targets",
        "Heist Tools",
        "Trinkets"
    ],
    Gems: [
        "Skill Gems",
        "Support Gems",
    ],
    Exotic: [
        "Relics", "Pieces", "Fishing Rods"
    ],
} satisfies { [key: string]: FilterClassType[] };

export const RULE_CATEGORIES_CONDITION_MAP: { [key in RuleCategoryType]: FilterConditionTypes[] } = {
    "Map Like": [
        "BaseType",
        "Class",
        "Corrupted",
        "FracturedItem",
        "HasImplicitMod",
        "Identified",
        "ItemLevel",
        // "Mirrored",
        "Rarity",
    ],
    "Atlas Maps": [
        "AnyEnchantment",
        // "AreaLevel",
        "BaseType",
        "BlightedMap",
        "Class",
        "Corrupted",
        "FracturedItem",
        "HasImplicitMod",
        "HasInfluence",
        "Identified",
        "MapTier",
        // "Mirrored",
        "Quality",
        "Rarity",
        "UberBlightedMap",
    ],
    "Quest Like": [
        "BaseType",
        "Class",
    ],
    Currency: [
        "BaseType",
        "Class",
    ],
    Equipment: [
        "Class",
        "BaseType",
        "ItemLevel",
        "BaseDefencePercentile",
        "DropLevel",
        "LinkedSockets",
        "Quality",
        "Rarity",
        "Sockets",
        "SocketGroup",

        "AnyEnchantment",
        "HasImplicitMod",
        "Identified",
        "FracturedItem",
        "Corrupted",
        "HasInfluence",
        "SynthesisedItem",
        "Width",
        "Height",
        // "AreaLevel",
        "HasEaterOfWorldsImplicit",
        "HasSearingExarchImplicit",
        // "Mirrored",
    ],
    Exotic: [
        "BaseType",
        "Class",
    ],
    Flasks: [
        "AnyEnchantment",
        "BaseType",
        "Class",
        "Corrupted",
        "FracturedItem",
        "Identified",
        "ItemLevel",
        "Quality",
        "Rarity",
    ],
    Gems: [
        "BaseType",
        "Class",
        "Corrupted",
        "GemLevel",
        "Quality",
        "TransfiguredGem",
    ],
    Heist: [
        "BaseType",
        "Class",
        "Corrupted",
        "FracturedItem",
        "Identified",
        "ItemLevel",
        // "Quality",
        // "Rarity",
    ],
    Jewels: [
        "BaseType",
        "Class",
        "Corrupted",
        "EnchantmentPassiveNum",
        "FracturedItem",
        "ItemLevel",
        // "Mirrored",
        "Rarity",
        "SynthesisedItem",
    ]
};

export const RULE_CATEGORIES: RuleCategoryType[] = Object.keys(RULE_CATEGORIES_MAP) as any[];

function verify_all_classes_in_category() {
    const seen = new Set<string>();
    for (let v of Object.values(RULE_CATEGORIES_MAP)) {
        for (const x of v) {
            seen.add(x);
        }
    }
    for (let type of FILTER_CLASS_TYPES) {
        if (!seen.has(type) && !BLACKLIST_CLASSES.has(type)) {
            console.error("TYPE NOT HANDLED!", type);
        }
    }
}

verify_all_classes_in_category();
