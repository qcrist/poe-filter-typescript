export enum FilterOperator {
    CONTAINS = "=",
    NOT_CONTAINS = "!=",
    LESS_EQ = "<=",
    GREATER_EQ = ">=",
    LESS = "<",
    GREATER = ">",
    EQUALS = "=="
}

export type FilterConditionTypes = keyof typeof FilterConditionKeys;
const FilterConditionKeys = {
    AnyEnchantment: null,
    BaseDefencePercentile: null,
    BaseType: null,
    BlightedMap: null,
    Class: null,
    Corrupted: null,
    DropLevel: null,
    EnchantmentPassiveNum: null,
    FracturedItem: null,
    GemLevel: null,
    HasEaterOfWorldsImplicit: null,
    HasImplicitMod: null,
    HasInfluence: null,
    HasSearingExarchImplicit: null,
    Height: null,
    Identified: null,
    ItemLevel: null,
    LinkedSockets: null,
    MapTier: null,
    Mirrored: null,
    Quality: null,
    Rarity: null,
    SocketGroup: null,
    Sockets: null,
    StackSize: null,
    SynthesisedItem: null,
    TransfiguredGem: null,
    UberBlightedMap: null,
    Width: null,
};

export enum FilterValueType {
    COLOR,
    INTEGER
}

export enum FilterValueVariableType {
    COLOR,
    FONT_SIZE
}

type FilterValueConfigBase<T extends FilterValueType> = {
    type: T,
    var_type: FilterValueVariableType
    def: string[]
}

type FilterValueConfigColor = FilterValueConfigBase<FilterValueType.COLOR>

type FilterValueConfigInteger = FilterValueConfigBase<FilterValueType.INTEGER> & {
    min: number,
    max: number,
}

export type FilterValueConfig = FilterValueConfigColor | FilterValueConfigInteger;


const COLOR_CONFIG: FilterValueConfigColor = {
    type: FilterValueType.COLOR,
    def: ["255", "0", "0"],
    var_type: FilterValueVariableType.COLOR
};

const FONT_SIZE_CONFIG: FilterValueConfigInteger = {
    type: FilterValueType.INTEGER,
    min: 1,
    max: 45,
    def: ["32"],
    var_type: FilterValueVariableType.FONT_SIZE
};

export type FilterActionType = keyof typeof FilterActionDefinition;
export const FilterActionDefinition = {
    // MinimapIcon: null,
    SetBackgroundColor: COLOR_CONFIG,
    SetBorderColor: COLOR_CONFIG,
    SetFontSize: FONT_SIZE_CONFIG,
    SetTextColor: COLOR_CONFIG
} satisfies { [key: string]: FilterValueConfig };
export const FilterActionTypes: readonly FilterActionType[] = Object.keys(FilterActionDefinition) as FilterActionType[];


//
// export type ConditionTypeArgs = {
//     $CATEGORY: RuleCategoryType,
//     AnyEnchantment: boolean,
//     // AreaLevel: number,
//     BaseDefencePercentile: number,
//     // BaseEnergyShield: number,
//     // BaseEvasion: number,
//     BaseType: string,//"Item name",
//     // BaseWard: number,
//     BlightedMap: boolean,
//     Class: string,//"Item class name",
//     Corrupted: boolean,
//     DropLevel: number,
//     // EnchantmentPassiveNode: string,//"Cluster Jewel enchantment name", TODO
//     EnchantmentPassiveNum: number,
//     FracturedItem: boolean,
//     GemLevel: number,
//     HasEaterOfWorldsImplicit: number,
//     HasImplicitMod: boolean,
//     HasInfluence: string,
//     HasSearingExarchImplicit: number,
//     Height: number,
//     Identified: boolean,
//     ItemLevel: number,
//     LinkedSockets: number,
//     MapTier: number,
//     Mirrored: boolean,
//     Quality: number,
//     Rarity: string,
//     // Replica: boolean,
//     SocketGroup: string,//"Numeric, R:Red, G:Green, B:Blue, A:Abyss, D:Delve, W:White",
//     Sockets: string,//"Numeric, R:Red, G:Green, B:Blue, A:Abyss, D:Delve, W:White",
//     StackSize: number,
//     SynthesisedItem: boolean,
//     TransfiguredGem: boolean,
//     UberBlightedMap: boolean,
//     Width: number,
// };


//
// const enum FilterConditionValueType {
//     NUMBER,
//     STRING,
//     SOCKETS,
//     CLASS_TYPE,
//     BASE_TYPE,
//     CATEGORY
// }
//
// type FilterConditionBase = {
//     friendly_name: string,
//     allowed_operators: FilterOperator[];
//     type: FilterConditionValueType,
// };
//
// export type FilterCondition =
//     FilterConditionString
//     | FilterConditionNumber
//     | FilterConditionSpecial;
//
// type FilterConditionString = FilterConditionBase & {
//     type: FilterConditionValueType.STRING,
//     options: string[];
//     options_friendly_name: string[];
// }
//
// type FilterConditionNumber = FilterConditionBase & {
//     type: FilterConditionValueType.NUMBER,
//     min_value: number,
//     max_value: number
// }
//
// type FilterConditionSpecial = FilterConditionBase & {
//     type: FilterConditionValueType.CLASS_TYPE |
//         FilterConditionValueType.SOCKETS |
//         FilterConditionValueType.BASE_TYPE |
//         FilterConditionValueType.CATEGORY,
// }
//
//
// class BooleanCondition implements FilterConditionString {
//     public readonly options = ["True", "False"];
//     public readonly type = FilterConditionValueType.STRING;
//     public readonly allowed_operators = [FilterOperator.EQUALS];
//     public readonly options_friendly_name: string[];
//
//     constructor(
//         public readonly friendly_name: string,
//         private readonly name_true: string = "Yes",
//         private readonly name_false: string = "No",
//     ) {
//         this.options_friendly_name = [name_true, name_false];
//     }
// }
//
// class StringCondition implements FilterConditionString {
//     public readonly options_friendly_name: string[];
//     public readonly type = FilterConditionValueType.STRING;
//     public readonly allowed_operators = [FilterOperator.EQUALS];
//
//     constructor(
//         public readonly friendly_name: string,
//         public readonly options: string[],
//         options_friendly?: string[],
//     ) {
//         this.options_friendly_name = options_friendly ?? options;
//     }
// }
//
// class SocketCondition implements FilterConditionSpecial {
//     public readonly allowed_operators: FilterOperator[] = [
//         FilterOperator.GREATER_EQ,
//         FilterOperator.LESS
//     ];
//
//     public readonly type = FilterConditionValueType.SOCKETS;
//
//     constructor(
//         public readonly friendly_name: string,
//     ) {
//     }
// }
//
// class SpecialCondition implements FilterConditionSpecial {
//     public readonly allowed_operators: FilterOperator[] = [
//         FilterOperator.EQUALS,
//     ];
//
//     constructor(
//         public readonly type: FilterConditionSpecial['type'],
//         public readonly friendly_name: string,
//     ) {
//     }
// }
//
// class NumberCondition implements FilterConditionNumber {
//     public readonly type = FilterConditionValueType.NUMBER;
//     public readonly allowed_operators: FilterOperator[] = [
//         FilterOperator.EQUALS,
//         FilterOperator.GREATER_EQ,
//         FilterOperator.LESS_EQ,
//         FilterOperator.GREATER,
//         FilterOperator.LESS,
//     ];
//
//     constructor(
//         public readonly friendly_name: string,
//         public readonly min_value: number,
//         public readonly max_value: number
//     ) {
//     }
// }
//
// export const CONDITION_CONTEXT: { [K in FilterConditionTypes]: FilterCondition } = {
//     $CATEGORY: new SpecialCondition(FilterConditionValueType.CATEGORY, "Category"),
//     AnyEnchantment: new BooleanCondition("Has Enchantment"),
//     BlightedMap: new BooleanCondition("Is Map Blighted"),
//     UberBlightedMap: new BooleanCondition("Is Map Uber Blighted"),
//     Corrupted: new BooleanCondition("Corrupted"),
//     FracturedItem: new BooleanCondition("Fractured"),
//     HasImplicitMod: new BooleanCondition("Has Implicit"),
//     Identified: new BooleanCondition("Is Identified"),
//     Mirrored: new BooleanCondition("Is Mirrored"),
//     // Replica: new BooleanCondition("Is Replica"),
//     SynthesisedItem: new BooleanCondition("Is Synthesized"),
//     TransfiguredGem: new BooleanCondition("Is Transfigured"),
//
//     Class: new SpecialCondition(FilterConditionValueType.CLASS_TYPE, "Item Class Type"),
//     BaseType: new SpecialCondition(FilterConditionValueType.BASE_TYPE, "Item Base Type"),
//     // EnchantmentPassiveNode: TODO,//"Cluster Jewel enchantment name",
//     HasInfluence: new StringCondition("Has Influence", ["Shaper", "Elder", "Crusader", "Hunter", "Redeemer", "Warlord", "None"]),
//     Rarity: new StringCondition("Rarity", ["Normal", "Magic", "Rare", "Unique"]),
//     SocketGroup: new SocketCondition("Linked Sockets"),//"Numeric, R:Red, G:Green, B:Blue, A:Abyss, D:Delve, W:White",
//     Sockets: new SocketCondition("Sockets"),//"Numeric, R:Red, G:Green, B:Blue, A:Abyss, D:Delve, W:White",
//
//     // AreaLevel: new NumberCondition("Area Level", 0, 100),
//     BaseDefencePercentile: new NumberCondition("Defence Percentile", 0, 100),
//     DropLevel: new NumberCondition("Drop Level", 0, 100),
//     EnchantmentPassiveNum: new NumberCondition("Cluster Jewel Passive Count", 2, 12),
//     GemLevel: new NumberCondition("Gem Level", 1, 21),
//     HasEaterOfWorldsImplicit: new NumberCondition("Eater of Worlds Implicit Tier", 1, 6),
//     HasSearingExarchImplicit: new NumberCondition("Searing Exarch Implicit Tier", 1, 6),
//     Height: new NumberCondition("Item Height Slots", 1, 4),
//     ItemLevel: new NumberCondition("Item Level", 0, 100),
//     LinkedSockets: new NumberCondition("Linked Socket Count", 0, 6),
//     MapTier: new NumberCondition("Map Tier", 1, 17),
//     Quality: new NumberCondition("Quality", 0, 40),
//     StackSize: new NumberCondition("Stack Size", 1, 50000),
//     Width: new NumberCondition("Item Width Slots", 1, 2),
// };