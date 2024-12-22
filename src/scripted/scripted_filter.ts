import {BASE_TYPES_RAW} from "#src/scripted/base_types_export";
import parseCSSColor from 'parse-css-color';
import {Immutable} from "immer";

type FilterOperator = "==" | "<" | "<=" | ">" | ">="

type MVPick<MV extends boolean, V> = MV extends true ? (V | (V[])) : V;
type MaybeArray<T> = T | T[];

function wrap_mv<T>(value: MaybeArray<T>): T[] {
    if (Array.isArray(value))
        return value;
    return [value];
}

const FILTER_INDENT = "    ";

abstract class ParamImpl<Type, Ops extends FilterOperator, MultiValue extends boolean> {
    public readonly __type: Type = undefined as any;
    public readonly __allowed_ops: Ops = undefined as any;
    // noinspection JSUnusedGlobalSymbols
    public readonly __multi_value: MultiValue = undefined as any;

    public constructor(
        public readonly alias: string
    ) {
    }

    private getLine(...parts: string[]): string {
        return FILTER_INDENT + parts.filter(x => x.trim().length > 0).join(" ");
    }

    public getConditionLine(data: CVHolder<MVPick<MultiValue, Type>>): string[] {
        let multi_data = data.value_op;

        if (data.has_single()) {
            multi_data = [{op: "==", value: data.value_single!}];
        }

        const result: string[] = [];

        for (const {op, value} of multi_data) {
            const o = op === undefined ? [] : [op];
            result.push(this.getLine(this.alias, ...o, ...wrap_mv<Type>(value).map(this.valueToString)));
        }
        return result;
    };

    public getActionLine(data: MVPick<MultiValue, Type>): string {
        return this.getLine(this.alias, ...wrap_mv<Type>(data).map(this.valueToString));
    };

    public valueToString(value: Type): string {
        return `"${value}"`;
    }

}


class BoolParam extends ParamImpl<boolean, never, false> {
    valueToString(value: boolean): string {
        if (value) return "True";
        return "False";
    }
}

class IntParam<MV extends boolean> extends ParamImpl<number, FilterOperator, MV> {
    public constructor(alias: string,
                       public readonly min: number,
                       public readonly max: number,
    ) {
        super(alias);
    }

    valueToString(value: number): string {
        return String(value);
    }
}

class EnumParam<Values extends string, MV extends boolean> extends ParamImpl<Values, never, MV> {
    // noinspection JSUnusedGlobalSymbols
    public readonly __values: Values = undefined as any;
}

type ColorRGB = `rgba(${string},${string},${string}${string})`;
type ColorRGBA = `rgb(${string},${string},${string})`;
type ColorHex = `#${string}`;
export type ColorParamValue = ColorHex | ColorRGB | ColorRGBA;

class ColorParam extends ParamImpl<ColorParamValue, never, false> {
    valueToString(value: ColorParamValue): string {
        const result = parseCSSColor(value);
        if (result === null || result.type != "rgb")
            throw new Error("rgb conversion failed: " + value);
        const [r, g, b] = result.values;
        const a = Math.round(result.alpha * 255);

        return [r, g, b, a].join(" ");
    }
}

type SoundDef = {
    id: number //1-16
    vol: number //0-300
};

class SoundParam extends ParamImpl<SoundDef, never, false> {

}

class FlagParam extends ParamImpl<true, never, false> {
    valueToString(value: true): string {
        return "";
    }
}

type ColorList = "Red" | "Green" | "Blue" | "Brown" | "White" | "Yellow"
    | "Cyan" | "Grey" | "Orange" | "Pink" | "Purple";

// noinspection JSUnusedGlobalSymbols
export const enum IconSize {
    LARGE = 0,
    MEDIUM = 1,
    SMALL = 2
}

type IconDef = {
    size: IconSize,
    color: ColorList,
    shape: "Circle" | "Diamond" | "Hexagon" | "Square" | "Star" | "Triangle" | "Cross" | "Moon" | "Raindrop" | "Kite" | "Pentagon" | "UpsideDownHouse"
} | -1;

class IconParam extends ParamImpl<IconDef, never, false> {
    valueToString(value: IconDef): string {
        if (value === -1)
            return "-1";
        return `${value.size} ${value.color} ${value.shape}`;
    }
}

type BeamDef = {
    color: ColorList,
    temp?: true
}

type BeamValue = BeamDef | ColorList;

class BeamParam extends ParamImpl<BeamValue, never, false> {
    valueToString(value: BeamValue): string {
        if (typeof value === "object")
            return `${value.color} ${value.temp ? "Temp" : ""}`;
        return value;
    }
}

const CONDITION_DEF = {
    // is/has
    hasEnchantment: new BoolParam("AnyEnchantment"),
    hasImplicit: new BoolParam("HasImplicitMod"),

    isCorrupted: new BoolParam("Corrupted"),
    isIdentified: new BoolParam("Identified"),
    isMirrored: new BoolParam("Mirrored"),

    //count
    corruptedModCount: new IntParam("CorruptedMods", 0, 2),
    stackSize: new IntParam("StackSize", 0, 100),
    sockets: new IntParam("Sockets", 0, 100),

    //level
    areaLevel: new IntParam("AreaLevel", 1, 100),
    dropLevel: new IntParam("DropLevel", 1, 100),
    gemLevel: new IntParam("GemLevel", 1, 100),
    itemLevel: new IntParam("ItemLevel", 1, 100),
    mapTier: new IntParam("MapTier", 1, 17),
    quality: new IntParam("Quality", 1, 20),

    //stats
    baseArmour: new IntParam("BaseArmour", 0, 1000),
    baseEnergyShield: new IntParam("BaseEnergyShield", 0, 1000),
    baseEvasion: new IntParam("BaseEvasion", 0, 1000),
    baseWard: new IntParam("BaseWard", 0, 1000),
    baseDefencePercentile: new IntParam("BaseDefencePercentile", 0, 100),

    //meta-stats
    height: new IntParam("Height", 1, 4),
    width: new IntParam("Width", 1, 2),

    //lists
    baseType: new EnumParam<BaseType, true>("BaseType"),
    class: new EnumParam<BaseTypeClass, true>("Class"),
    // HasExplicitMod: EXPLICIT_MOD_NAMES,
    // HasInfluence: INFLUENCE_TYPES,
    rarity: new EnumParam<FilterItemRarity, true>("Rarity"),
} as const satisfies { [k: string]: ParamImpl<any, any, any> };

const ACTION_DEF = {
    borderColor: new ColorParam("SetBorderColor"),
    textColor: new ColorParam("SetTextColor"),
    backgroundColor: new ColorParam("SetBackgroundColor"),
    fontSize: new IntParam<false>("SetFontSize", 18, 45),
    alertSound: new SoundParam("PlayAlertSound"),
    alertSoundPos: new SoundParam("PlayAlertSoundPositional"),
    enableDropSound: new FlagParam("EnableDropSound"),
    disableDropSound: new FlagParam("DisableDropSound"),
    enableDropSoundIfAlertSound: new FlagParam("EnableDropSoundIfAlertSound"),
    disableDropSoundIfAlertSound: new FlagParam("DisableDropSoundIfAlertSound"),
    // continue: new FlagParam("Continue"),
    icon: new IconParam("MinimapIcon"),
    beam: new BeamParam("PlayEffect")
} as const satisfies { [k: string]: ParamImpl<any, any, any> };

type ConditionDefType = typeof CONDITION_DEF;
type ConditionName = keyof ConditionDefType;
type ConditionOp<A extends ConditionName> = ConditionDefType[A]["__allowed_ops"];
type ConditionValue<A extends ConditionName> = HandleMV<ConditionDefType[A]>;

export type BooleanConditionNames = { [K in ConditionName]: ConditionDefType[K] extends BoolParam ? K : never }[ConditionName];

type NoOpConditionNames = { [K in ConditionName]: ConditionOp<K> extends never ? K : never }[ConditionName];
type OpConditionNames = { [K in ConditionName]: ConditionOp<K> extends never ? never : K }[ConditionName];

type HandleMV<T extends ParamImpl<any, any, any>> = T extends ParamImpl<any, any, true> ?
    (T["__type"] | (T["__type"])[]) : T["__type"];

type ActionDefType = typeof ACTION_DEF;
type ActionName = keyof ActionDefType;
type ActionValue<A extends ActionName> = HandleMV<ActionDefType[A]>;

type FilterRuleActionMap = { [K in ActionName]?: ActionValue<K> };
type FilterRuleOpConditionMap = {
    readonly [K in OpConditionNames]: FilterRuleOpConditionMapInner<K>
};
type FilterRuleOpConditionMapInner<K extends ConditionName> = {
    add(op: ConditionOp<K>, ...values: ConditionValue<K>[]): void
};
type FilterRuleNopConditionMap = { [K in NoOpConditionNames]?: Immutable<ConditionValue<K>> };
type FilterRuleConditionMap = FilterRuleNopConditionMap & FilterRuleOpConditionMap;

// type FilterRuleConditionMap = {
//     [K in ConditionName]?: Immutable<ConditionValue<K>> | FilterRuleOpConditionMapInner<K> };


export enum FilterPriority {
    HIGHEST,
    HIGH,
    NORMAL,
    LOW,
    LOWEST
}

class CVHolder<T> {
    public value_single: T | undefined = undefined;
    private single_present: boolean = false;
    public value_op: {
        op?: FilterOperator,
        value: T
    }[] = [];

    public has_single(): boolean {
        return this.single_present;
    }

    public put_single(value: any) {
        this.single_present = true;
        this.value_single = value;
    }

    public get() {
        return this.value_single;
    }

    public put_op(op: FilterOperator, value: any) {
        this.value_op.push({
            op, value
        });
    }
}

export enum FilterModes {
    SHOW = "Show",
    HIDE = "Hide"
}

type FilterRuleEdit = {
    view: FilterRuleActionMap
    cond: FilterRuleConditionMap
}

type RuleConditionData = {
    [K in ConditionName]?: CVHolder<any>
};

function build_condition_map(cd: RuleConditionData): FilterRuleConditionMap {
    return new Proxy<FilterRuleConditionMap>({} as any, {
        set(_: FilterRuleConditionMap, key: ConditionName, newValue: any, _receiver: any): boolean {
            (cd[key] ??= new CVHolder()).put_single(newValue);

            return true;
        },
        get(_: FilterRuleConditionMap, key: ConditionName, _receiver: any): any {
            const h = cd[key] ??= new CVHolder<any>();
            if (h.has_single())
                return h.get();
            return {
                add(op: FilterOperator, ...values) {
                    h.put_op(op, values);
                }
            } satisfies FilterRuleOpConditionMapInner<any>;
        },
        deleteProperty(target: FilterRuleConditionMap, p: string | symbol): boolean {
            throw new Error("todo");
        }
    });
}

export enum FilterRuleType {
    NORMAL,
    TEMPLATE,
    DECORATOR
}

export type FilterRuleWithType<T extends FilterRuleType> = FilterRuleImpl & { rule_type: T };
export type FilterRule = FilterRuleWithType<FilterRuleType.NORMAL | FilterRuleType.DECORATOR>;
export type FilterTemplate = FilterRuleWithType<FilterRuleType.TEMPLATE>;

class FilterRuleImpl {
    constructor(
        public readonly rule_type: FilterRuleType,
        private mode = FilterModes.SHOW
    ) {
    }

    private condition_data: RuleConditionData = {};

    // public priority = FilterPriority.NORMAL;
    private actions: FilterRuleActionMap = {};
    private cond: FilterRuleConditionMap = build_condition_map(this.condition_data);
    private inherit: FilterRuleImpl[] = [];


    private genFilterText(child_type?: FilterRuleType): string[] {
        this.validate(child_type);
        const lines: string[] = [];
        for (let p of wrap_mv(this.inherit)) {
            lines.push(...p.genFilterText(this.rule_type));
        }
        for (const [name, val] of Object.entries(this.condition_data)) {
            const cdef = CONDITION_DEF[name as ConditionName] as ParamImpl<any, any, any>;
            lines.push(...cdef.getConditionLine(val));
        }
        for (const [name, val] of Object.entries(this.actions)) {
            lines.push(ACTION_DEF[name as ActionName].getActionLine(val as never));
        }
        return lines;
    }

    validate(child_type?: FilterRuleType) {
        // if (child_type === undefined) return;
        switch (this.rule_type) {
            case FilterRuleType.NORMAL: {
                break;
            }
            case FilterRuleType.TEMPLATE: {
                if (child_type === undefined)
                    throw new Error("dont use templates directly!");
                break;
            }
            case FilterRuleType.DECORATOR: {
                if (child_type !== FilterRuleType.DECORATOR)
                    throw new Error("decorators should not be extended");
                break;
            }
        }
    }

    getFilterText(): string {
        const lines: string[] = [this.mode];
        lines.push(...this.genFilterText(this.rule_type));
        if (this.rule_type === FilterRuleType.DECORATOR)
            lines.push(FILTER_INDENT + "Continue");
        return lines.join("\n");
    }

    edit(handler: (rule: FilterRuleEdit) => void) {
        handler({
            cond: this.cond, view: this.actions
        });
        return this;
    }

    public extends(...parents: FilterRuleImpl[]) {
        this.inherit = parents;
        return this;
    }
}

type BaseTypesRawType = typeof BASE_TYPES_RAW;
export type BaseTypeClass = keyof BaseTypesRawType;
export type BaseType = BaseTypesRawType[BaseTypeClass][number]["name"];
export type BaseTypeOfClass<T extends BaseTypeClass> = BaseTypesRawType[T][number]["name"];
export type FilterItemRarity = "Normal" | "Magic" | "Rare" | "Unique";

type BaseTypeCleanType = {
    readonly [K in BaseTypeClass]: ReadonlyArray<{
        readonly stats?: {
            evasion_min: number,
            armour_min: number,
            energy_shield_min: number,
        },
        readonly name: string
    }>
}

export const BASE_TYPES_MAP: BaseTypeCleanType = BASE_TYPES_RAW;
export const BASE_TYPE_CLASSES: BaseTypeClass[] = Object.keys(BASE_TYPES_RAW).filter(x => x[0] !== "#") as any[];

//
//
// type rule_fn = (rule: FilterRule) => void;
//
// export class FilterManager {
//     private readonly rules: FilterRule[] = [];
//
//     rule(impl: rule_fn) {
//         return this.register(new FilterRule()).bulk(impl);
//     }
//
//     template(impl: rule_fn): FilterRule {
//         return new FilterRule().bulk(impl);
//     }
//
//     register(rule: FilterRule) {
//         this.rules.push(rule);
//         return rule;
//     }
//
//     dumpFilter(): string {
//         return this.rules.map(r => r.getFilterText()).join("\n\n");
//     }
// }
//
// export function create_template_rule(...parents: FilterRule[]) {
//     return new FilterRule(...parents);
// }

type rule_fn = (rule: FilterRuleEdit) => void;
type ruleImplArgs = [extending: MaybeArray<FilterRuleImpl>, rule_fn] | [rule_fn];

function ruleImpl<T extends FilterRuleType>(type: T, mode: FilterModes, args: ruleImplArgs): FilterRuleWithType<T> {
    let fn: rule_fn;
    let ext: MaybeArray<FilterRuleImpl> = [];
    if (args.length === 2) {
        [ext, fn] = args;
    } else {
        [fn] = args;
    }
    const r: FilterRuleImpl = new FilterRuleImpl(type, mode).extends(...wrap_mv(ext)).edit(fn);
    return r as FilterRuleWithType<T>;
}

export function rule(...args: ruleImplArgs) {
    return ruleImpl(FilterRuleType.NORMAL, FilterModes.SHOW, args);
}

export function hide(...args: ruleImplArgs) {
    return ruleImpl(FilterRuleType.NORMAL, FilterModes.HIDE, args);
}

export function template(...args: ruleImplArgs) {
    return ruleImpl(FilterRuleType.TEMPLATE, FilterModes.SHOW, args);
}

export function decorator(...args: ruleImplArgs) {
    return ruleImpl(FilterRuleType.DECORATOR, FilterModes.SHOW, args);
}

export function generate_filter(rules: FilterRuleImpl[]) {
    return rules.map(r => r.getFilterText()).join("\n\n");
}

export const COLOR_PRESETS = {
    RarityNormal: "rgb(200,200,200)",
    RarityMagic: "rgb(136,136,255)",
    RarityRare: "rgb(255,255,119)",
    RarityUnique: "rgb(175,96,37)",
    Gem: "rgb(27,162,155)",
    Currency: "rgb(170,158,130)",
    QuestItem: "rgb(74,230,58)",
    DivinationCard: "rgb(14,186,255)",
    Text: "rgb(127,127,127)",
    White: "rgb(255,255,255)",
    Enchantment: "rgb(136,136,255)",
    Fire: "rgb(150,0,0)",
    Cold: "rgb(54,100,146)",
    Lightning: "rgb(255,215,0)",
    Chaos: "rgb(208,32,144)",
    Crafted: "rgb(184,218,242)",
    Corrupted: "rgb(210,0,0)",
    Torment: "rgb(50,230,100)",
    Title: "rgb(231,180,120)",
    Favour: "rgb(170,158,120)",
} as const;

export type BaseTypeClassCategory = keyof typeof CLASS_CATEGORIES_MAP;
export const CLASS_CATEGORIES_MAP = {
    EQUIPMENT: [
        "Daggers",
        "Sceptres",
        "Gloves",
        "Bows",
        "Staves",
        "Rings",
        "One Hand Swords",
        "Shields",
        "Wands",
        "Quivers",
        "Two Hand Axes",
        "Claws",
        "Helmets",
        "Two Hand Swords",
        "Jewels",
        "Two Hand Maces",
        "One Hand Maces",
        "Body Armours",
        "Mana Flasks",
        "One Hand Axes",
        "Boots",
        "Amulets",
        "Belts",
        "Life Flasks",
        "Charms",

        //guessing
        "Flails",
        "Traps",
        "Spears",
        "Foci",
        "Quarterstaves",
        "Crossbows"
    ],
    SPECIAL_PICKUP: [
        "Fishing Rods",
        "Vault Keys",
        "Pieces",
        "Microtransactions",
        "Relics",
        "Pinnacle Keys",
        "Trial Coins"
    ],
    NOT_IN_GAME: [
        "Hidden Items",
        "Sanctified Relics",
        "Sentinels",
        "Archnemesis Mods",
        "Heist Cloaks",
        "Heist Brooches",
        "Heist Gear",
        "Heist Tools",
    ],
    QUEST_LIKE: [
        "Atlas Upgrade Items",
        "Incursion Items",
        "Memories",
        "Pantheon Souls",
        "Heist Targets",
        "Quest Items",
        "Instance Local Items",
    ],
    CURRENCY_LIKE: [
        "Delve Stackable Socketable Currency",
        "Delve Socketable Currency",
        "Currency",
        "Incubators",
        "Stackable Currency",
        "Map Fragments",
        "Omen",
        "Socketable"
    ],
    MAP_LIKE: [
        "Waystones",
        "Breachstones",
        "Expedition Logbooks",
        "Blueprints",
        "Contracts",
        "Misc Map Items",
        "Inscribed Ultimatum",
        "Tablet",
    ],
    GEMS: [
        "Skill Gems",
        "Support Gems",
    ],
    NO_NAME: [
        "#GiftBox",
        "#UncutReservationGem",
        "#UncutSupportGem",
        "#UncutSkillGem",
        "#ConventionTreasure",
        "#Meta Skill Gem"
    ]
    // DIV_CARD: [
    //      "Divination Cards",
    // ]
} as const satisfies { [k: string]: BaseTypeClass[] };
export const CLASS_CATEGORIES = Object.keys(CLASS_CATEGORIES_MAP) as BaseTypeClassCategory[];

export const EQUIPMENT_CATEGORIES = {
    WEAPON: [
        "Daggers",
        "Sceptres",
        "Bows",
        "Staves",
        "One Hand Swords",
        "Wands",
        "Quivers",
        "Two Hand Axes",
        "Claws",
        "Two Hand Swords",
        "Two Hand Maces",
        "One Hand Maces",
        "One Hand Axes",
        "Flails",
        "Traps",
        "Spears",
        "Quarterstaves",
        "Crossbows"
    ],
    ARMOUR: [
        "Gloves",
        "Shields",
        "Helmets",
        "Body Armours",
        "Boots",
        "Foci",
    ],
    JEWELRY: [
        "Rings",
        "Amulets",
        "Belts",
        "Charms"
    ],
    JEWELS: [
        "Jewels",
    ],
    FLASK: [
        "Mana Flasks",
        "Life Flasks",
    ],
} as const satisfies { [k: string]: (typeof CLASS_CATEGORIES_MAP)["EQUIPMENT"][number][] };

function test_class_categories() {
    const counts: { [k: string]: number | undefined } = {};

    const should_not_have = new Set<string>();
    const too_many = new Set<string>();
    const not_enough = new Set<string>();

    for (const [k, v] of Object.entries(CLASS_CATEGORIES_MAP)) {
        for (let x of v) {
            counts[x] ??= 0;
            counts[x]++;
            if (!(Object.hasOwn(BASE_TYPES_RAW, x)))
                should_not_have.add(x);
        }
    }

    for (let cls of BASE_TYPE_CLASSES) {
        const read = counts[cls];
        if (read === 1) continue;
        if (read === undefined || read < 1)
            not_enough.add(cls);
        else {
            too_many.add(cls);
        }
    }

    if (should_not_have.size > 0 || too_many.size > 0 || not_enough.size > 0) {
        if (should_not_have.size > 0) console.warn("should not have:", should_not_have);
        if (too_many.size > 0) console.warn("too many:", too_many);
        if (not_enough.size > 0) console.warn("not enough:", not_enough);
        console.warn("categories validation failed!");
        process.exit(-1);
        // throw new Error("validation failed");
    }

}

test_class_categories();


//   "rgb(200,200,200)  	
//   "rgb(136,136,255)  	
//   "rgb(255,255,119)  	
//   "rgb(175,96,37)  	
//   "rgb(27,162,155)  	
//   "rgb(170,158,130)  	
//   "rgb(74,230,58)  	
//   "rgb(14,186,255)  	
//   "rgb(127,127,127)  	
//   "rgb(255,255,255)  	
//   "rgb(136,136,255)  	
//   "rgb(150,0,0) 	    
//   "rgb(54,100,146)  	
//   "rgb(255,215,0)  	
//   "rgb(208,32,144)  	
//   "rgb(184,218,242)  	
//   "rgb(210,0,0) 	    
//   "rgb(50,230,100)  	
//   "rgb(231,180,120)  	
//   "rgb(170,158,120)  	
