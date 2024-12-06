import {
    BASE_TYPE_CLASSES,
    BASE_TYPES_MAP,
    BaseTypeClass,
    BaseTypeClassCategory, BooleanConditionNames,
    CLASS_CATEGORIES,
    CLASS_CATEGORIES_MAP,
    COLOR_PRESETS, ColorParamValue,
    decorator, FilterItemRarity,
    FilterRule,
    FilterRuleType,
    FilterRuleWithType,
    generate_filter,
    IconSize,
    rule,
    template
} from "#src/scripted/scripted_filter";
import * as fs from "node:fs";

const DEFAULT_FONT_SIZE = 32;

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
    HEIST_EQUIP: COLOR_PRESETS.RarityNormal,
    MAP_LIKE: COLOR_PRESETS.RarityNormal,
    DIV_CARD: COLOR_PRESETS.DivinationCard,
    QUEST_LIKE: COLOR_PRESETS.QuestItem,
    NOT_IN_GAME: "rgb(255,0,255)",
    SPECIAL_PICKUP: "rgb(74,0,160)",
} satisfies { [K in BaseTypeClassCategory]: ColorParamValue };

const DISPLAY_HIGH_PRIO = template(({view}) => {
    view.beam = {color: "White"};
    view.icon = {color: "Yellow", shape: "Star", size: IconSize.LARGE};
    view.borderColor = "#000000";
    view.textColor = "#000000";
    view.backgroundColor = "#FFFFFF";
    view.fontSize = 45;
});

const DISPLAY_MINIMAL = template(({view}) => {
    view.borderColor = "#0000007F";
    view.textColor = "#FFFFFFAA";
    view.backgroundColor = "rgba(0,0,0,0.3)";
    view.fontSize = 1;
});

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

function filter_impl() {
    const rules: FilterRuleWithType<FilterRuleType.NORMAL | FilterRuleType.DECORATOR>[] = [];

    //defaults
    rules.push(decorator(({view}) => {
        view.fontSize = DEFAULT_FONT_SIZE;
        view.borderColor = "#777";
        view.backgroundColor = "rgba(0,0,0,0.75)";
        view.textColor = "#FFF";
    }));

    //category colors
    for (let cat of CLASS_CATEGORIES) {
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

    // Unique item beam
    rules.push(decorator(({cond, view}) => {
        cond.rarity = "Unique";
        view.beam = "Orange";
        view.icon = {color: "Orange", shape: "Circle", size: IconSize.MEDIUM};
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
        view.fontSize = 45;
        view.icon = {color: "Grey", shape: "Circle", size: IconSize.MEDIUM};
    }));

    //Map pop
    rules.push(decorator(({cond, view}) => {
        cond.class = CLASS_CATEGORIES_MAP.MAP_LIKE;
        view.fontSize = 45;
        view.icon = {color: "White", shape: "Square", size: IconSize.MEDIUM};
    }));

    // END OF DECORATORS

    //TODO highlight best bases at area level?
    //TODO whitelist of important to pickup items? (MIRROR?)
    //TODO blacklist of less important items

    //START OF FINALIZERS

    rules.push(rule(({cond}) => {
        cond.class = BASE_TYPE_CLASSES; //known classes
    }));
    rules.push(rule(DISPLAY_UNKNOWN, () => undefined));

    const filter_text = generate_filter(rules);
    console.log(filter_text);

    fs.writeFileSync("C:\\Users\\qcrist\\Documents\\My Games\\Path of Exile\\gen_filter.filter", filter_text);
}

filter_impl();