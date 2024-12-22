import {
    BASE_TYPE_CLASSES,
    BASE_TYPES_MAP, BaseType,
    BaseTypeClass,
    BaseTypeClassCategory, BooleanConditionNames,
    CLASS_CATEGORIES,
    CLASS_CATEGORIES_MAP,
    COLOR_PRESETS, ColorParamValue,
    decorator, EQUIPMENT_CATEGORIES, FilterItemRarity,
    FilterRule,
    FilterRuleType,
    FilterRuleWithType,
    generate_filter, hide,
    IconSize,
    rule,
    template
} from "#src/scripted/scripted_filter";
import * as fs from "node:fs";
import {range} from "#src/util/range";

const enum FontSize {
    MINIMAL = 10,
    SMALL = 15,
    LESS = 20,
    DEFAULT = 32,
    NORMAL = 32,
    MORE = 38,
    MAXIMUM = 45
}

const RARITY_COLORS = new Map<FilterItemRarity, ColorParamValue>([
    // ["Normal", COLOR_PRESETS.RarityNormal],
    ["Magic", COLOR_PRESETS.RarityMagic],
    ["Rare", COLOR_PRESETS.RarityRare],
    ["Unique", COLOR_PRESETS.RarityUnique]
]);

const CONDITION_OUTLINES = new Map<BooleanConditionNames, ColorParamValue>([
    ["isMirrored", "#f00"],
    ["isCorrupted", "#f00"],
    ["isIdentified", COLOR_PRESETS.Chaos],
]);

const CATEGORY_COLORS = {
    GEMS: COLOR_PRESETS.Gem,
    CURRENCY_LIKE: COLOR_PRESETS.Currency,
    EQUIPMENT: COLOR_PRESETS.RarityNormal,
    // HEIST_EQUIP: COLOR_PRESETS.RarityNormal,
    MAP_LIKE: COLOR_PRESETS.RarityNormal,
    // DIV_CARD: COLOR_PRESETS.DivinationCard,
    QUEST_LIKE: COLOR_PRESETS.QuestItem,
    NOT_IN_GAME: "rgb(255,0,255)",
    SPECIAL_PICKUP: "rgb(119,0,255)",
    NO_NAME: "#fff"
} satisfies { [K in BaseTypeClassCategory]: ColorParamValue };

const DISPLAY_UNKNOWN = template(({view}) => {
    view.borderColor = "#0000007F";
    view.textColor = "#ffffff";
    view.backgroundColor = "rgb(218,0,255)";
    view.fontSize = 45;
});

const DISPLAY_EXPECTED_UNREACHABLE = template(({view}) => {
    view.borderColor = "#0000007F";
    view.textColor = "#2eff00";
    view.backgroundColor = "rgb(218,0,255)";
    view.fontSize = 45;
});

const MAPS_LEVEL = 60;

function filter_impl() {
    const rules: FilterRuleWithType<FilterRuleType.NORMAL | FilterRuleType.DECORATOR>[] = [];
    //not in game?
    rules.push(rule(DISPLAY_EXPECTED_UNREACHABLE, ({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.NOT_IN_GAME;
    }));
    // Unique item beam
    rules.push(rule(({cond, view}) => {
        cond.rarity = "Unique";
        view.beam = "Orange";
        view.icon = {color: "Orange", shape: "Circle", size: IconSize.MEDIUM};
        view.fontSize = FontSize.MAXIMUM;
    }));

    //defaults
    rules.push(decorator(({view}) => {
        view.fontSize = FontSize.DEFAULT;
        view.borderColor = "#777";
        view.backgroundColor = "rgba(0,0,0,1)";
        view.textColor = "#FFF";
    }));

    //category colors
    for (let cat of CLASS_CATEGORIES) {
        if (cat === "NO_NAME") continue;
        rules.push(decorator(({cond, view}) => {
            cond.class = CLASS_CATEGORIES_MAP[cat];
            view.textColor = CATEGORY_COLORS[cat];
            view.borderColor = CATEGORY_COLORS[cat];
        }));
    }

    //rarities
    for (const [r, c] of RARITY_COLORS.entries())
        rules.push(decorator(({cond, view}) => {
            cond.rarity = r;
            view.textColor = c;
            view.borderColor = c;
        }));

    //hide low base types
    for (const zone_level of range(15, 100)) {
        const base = decorator(({cond, view}) => {
            cond.class = [
                ...EQUIPMENT_CATEGORIES.WEAPON,
                ...EQUIPMENT_CATEGORIES.ARMOUR,
                ...EQUIPMENT_CATEGORIES.FLASK,
            ];
            cond.areaLevel.add("==", zone_level);
            cond.dropLevel.add("<", zone_level - 10);
            view.borderColor = "rgba(0,0,0,0)";
        });
        rules.push(decorator(base, ({cond, view}) => {
            cond.rarity = ["Normal", "Magic"];
            view.fontSize = FontSize.LESS;
        }));
        rules.push(decorator(base, ({cond, view}) => {
            cond.rarity = ["Magic"];
            cond.width.add("==", 1);
            view.fontSize = FontSize.DEFAULT;
        }));
        rules.push(decorator(base, ({cond, view}) => {
            cond.rarity = ["Magic"];
            cond.width.add("==", 2);
            cond.height.add("<=", 2);
            view.fontSize = FontSize.DEFAULT;
        }));
    }

    //quality equipment
    rules.push(decorator(({cond, view}) => {
        cond.quality.add(">", 0);
        view.fontSize = 32;
        view.borderColor = "#00FF00";
    }));

    // Condition outlines
    for (const [cv, color] of CONDITION_OUTLINES.entries()) {
        rules.push(decorator(({cond, view}) => {
            cond[cv] = true;
            view.borderColor = color;
        }));
    }

    // Currency Pop
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.CURRENCY_LIKE;
        view.fontSize = FontSize.MAXIMUM;
        view.icon = {color: "Grey", shape: "Circle", size: IconSize.MEDIUM};
        view.backgroundColor = "rgb(213, 159, 0)";
        view.borderColor = view.textColor = "#000";
    }));
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.CURRENCY_LIKE;
        cond.baseType = ["Scroll of Wisdom"];
        view.icon = -1;
        view.backgroundColor = "#000";
        view.textColor = "#ccc";
        view.fontSize = FontSize.LESS;
    }));
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.CURRENCY_LIKE;
        cond.baseType = ["Gold"];
        view.icon = {color: "Yellow", shape: "Star", size: IconSize.SMALL};
        view.borderColor = "rgba(0,0,0,0)";
        view.backgroundColor = "#000";
        view.textColor = "#ffcc00";
        view.fontSize = FontSize.NORMAL;
    }));

    //Quest item Pop
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.QUEST_LIKE;
        view.fontSize = FontSize.MAXIMUM;
        view.icon = {color: "Green", shape: "Circle", size: IconSize.SMALL};
    }));

    //Map pop
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.MAP_LIKE;
        view.fontSize = FontSize.MAXIMUM;
        view.icon = {color: "White", shape: "Square", size: IconSize.MEDIUM};
        view.backgroundColor = "#FFF";
        view.textColor = "#000";
        view.borderColor = "#000";
    }));

    //Rares pop
    rules.push(decorator(({cond, view}) => {
        cond.rarity = "Rare";
        view.fontSize = 45;
        view.icon = {color: "Yellow", shape: "Circle", size: IconSize.SMALL};
    }));

    //special item pop
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.SPECIAL_PICKUP;
        view.fontSize = FontSize.MAXIMUM;
        view.icon = {color: "Purple", shape: "Circle", size: IconSize.SMALL};
        view.beam = "Purple";
    }));


    // END OF BASIC DECORATORS

    //socket gear pop
    rules.push(rule(({cond, view}) => {
        cond.sockets.add(">", 0);
        view.icon = {color: "Grey", shape: "Circle", size: IconSize.SMALL};
        view.backgroundColor = "rgb(155, 138, 138)";
        view.borderColor = "#fff";
        view.textColor = "#fff";
        view.fontSize = FontSize.MORE;
    }));

    //jewelry pop
    rules.push(rule(({cond, view}) => {
        cond.class = [
            ...EQUIPMENT_CATEGORIES.JEWELRY,
            ...EQUIPMENT_CATEGORIES.JEWELS,
        ];
        view.icon = {color: "Purple", shape: "Circle", size: IconSize.SMALL};
        view.beam = {color: "Purple"};
        view.borderColor = "rgb(229,0,255)";
        view.fontSize = FontSize.MORE;
    }));


    //relics
    rules.push(rule(({cond, view}) => {
        cond.class = "Relics";
        view.icon = {color: "Cyan", shape: "Star", size: IconSize.SMALL};
        view.beam = {color: "Cyan"};
        view.borderColor = "#000";
        view.backgroundColor = "#09f";
        view.textColor = "#000";
    }));

    // //my base types
    // rules.push(rule(({cond, view}) => {
    //     cond.baseType = Object.values(BASE_TYPES_MAP)
    //         .flatMap(x => x)
    //         .filter(x => {
    //             return x.stats?.evasion_min === 0 && x.stats?.armour_min === 0 && x.name.startsWith("Expert");
    //         })
    //         .map(x => x.name) as BaseType[];
    //     cond.rarity = ["Rare", "Magic", "Normal"];
    //     view.fontSize = FontSize.MAXIMUM;
    // }));

    // //expert normals
    // rules.push(rule(({cond, view}) => {
    //     cond.baseType = Object.values(BASE_TYPES_MAP)
    //         .flatMap(x => x)
    //         .filter(x => {
    //             return x.name.startsWith("Expert");
    //         })
    //         .map(x => x.name) as BaseType[];
    //     cond.rarity = ["Normal"];
    //     view.fontSize = FontSize.MORE;https://www.pathofexile.com/trade2/search/poe2/Standard/lagnbwjHV
    // }));


    //Current Flasks
    for (const zone_level of range(15, 100)) {
        rules.push(rule(({cond, view}) => {
            cond.class = EQUIPMENT_CATEGORIES.FLASK;
            cond.areaLevel.add("==", zone_level);
            cond.dropLevel.add(">", zone_level - 5);
            view.borderColor = "rgba(50, 200, 125, 0.8)";
            view.backgroundColor = "rgba(25, 100, 75, 0.8)";
            view.fontSize = FontSize.MORE;
        }));
    }

    //uncut gems
    const GEM_BASE = template(({cond, view}) => {
        cond.baseType = [
            "Uncut Skill Gem",
            "Uncut Spirit Gem",
            "Uncut Support Gem"
        ];
        view.icon = {color: "Cyan", shape: "Circle", size: IconSize.SMALL};
        view.textColor = COLOR_PRESETS.Gem;
        view.borderColor = COLOR_PRESETS.Gem;
    });
    rules.push(rule(GEM_BASE, ({cond, view}) => {
        view.fontSize = 45;
        view.beam = {color: "Cyan"};
        cond.areaLevel.add("<=", MAPS_LEVEL);
    }));
    rules.push(rule(GEM_BASE, ({cond, view}) => {
        view.fontSize = 45;
        view.beam = {color: "Cyan"};
        cond.itemLevel.add(">", 14);
        cond.areaLevel.add(">", MAPS_LEVEL);
    }));
    rules.push(rule(GEM_BASE, ({cond, view}) => {
        cond.baseType = "Uncut Spirit Gem";
        view.fontSize = 45;
        view.beam = {color: "Cyan"};
    }));
    rules.push(rule(GEM_BASE, ({cond, view}) => {
        view.fontSize = 20;
        view.icon = -1;
        cond.areaLevel.add(">", MAPS_LEVEL);
    }));

    //TODO highlight best bases at area level?
    //TODO whitelist of important to pickup items? (MIRROR?)
    //TODO blacklist of less important items

    //START OF FINALIZERS

    rules.push(rule(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.EQUIPMENT;
        cond.quality.add(">", 0);
    }));

    //smaller whites/blues
    rules.push(hide(({cond, view}) => {
        cond.rarity = ["Normal", "Magic"];
        cond.class = CLASS_CATEGORIES_MAP.EQUIPMENT;
        // view.fontSize = FontSize.MINIMAL;
        cond.areaLevel.add(">", MAPS_LEVEL);
    }));

    //hide wisdom late
    rules.push(hide(({cond, view}) => {
        cond.baseType = "Scroll of Wisdom";
        cond.areaLevel.add(">", MAPS_LEVEL);
    }));

    rules.push(rule(({cond}) => {
        cond.class = BASE_TYPE_CLASSES; //known classes
    }));
    rules.push(rule(DISPLAY_UNKNOWN, () => undefined));

    const filter_text = generate_filter(rules);
    // console.log(filter_text);

    fs.writeFileSync("C:\\Users\\qcrist\\Documents\\My Games\\Path of Exile 2\\gen_filter.filter", filter_text);
    console.log("DONE!");
}

filter_impl();