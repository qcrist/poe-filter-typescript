import {createStore, StateCreator, StoreApi} from "zustand";
import {Draft, Immutable, produce} from "immer";
import {RuleCategoryType} from "#src/ui/filter/base_types";
import {Brand} from "#src/util/brand";
import {FilterConditionTypes, FilterOperator} from "#src/ui/filter/item-filter-def";

export type ConditionDefType = FilterConditionTypes | "UNSET";
export type ConditionDef = {
    type: ConditionDefType,
    arguments?: any[],
    operator?: FilterOperator
}

export type RuleDef = {
    name: string,
    conditions?: ConditionDef[],
    children?: RuleId[],
    parent?: RuleId
}

export type RuleId = Brand<number, "ruleId">

export type StoreType = Immutable<{
    active_category: RuleCategoryType,
    active_rule: RuleId | null,
    category_rules: Map<RuleCategoryType, RuleId>,
    rules: Map<RuleId, RuleDef>
    set_active_category(new_category: RuleCategoryType): void;
    set_active_rule(rule: RuleId): void;
    set_rule_name(rule: RuleId, name: string): void;
    add_rule_condition(rule: RuleId): void;
    set_rule_condition_type(rule: RuleId, index: number, type: ConditionDefType): void;
    set_rule_condition_operator(rule: RuleId, index: number, op: FilterOperator): void;
}>

type immer_setter<T> = StoreApi<T>["setState"]
type immer_recipe<T> = (state: Draft<T>) => void;

function immer_setter<T>(setter: immer_setter<T>) {
    return (recipe: immer_recipe<T>) => {
        setter(produce<T>(recipe));
    };
}

function initial_map() {
    const rules: Map<RuleId, RuleDef> = new Map();
    const category_rules: Map<RuleCategoryType, RuleId> = new Map();

    function do_child(parent: RuleId, child: RuleId) {
        const p = rules.get(parent)!;
        const c = rules.get(child)!;
        (p.children ??= []).push(child);
        c.parent = parent;
    }

    const ids = [0, 1, 2, 3, 4, 5].map(x => x as RuleId);
    for (let i = 0; i <= 5; i++) {
        rules.set(ids[i], {
            name: "TEST" + (i),
        });
    }
    rules.get(ids[0])!.conditions = [
        {
            type: "$CATEGORY",
            operator: FilterOperator.EQUALS,
            arguments: ["Equipment"]
        }
    ];
    category_rules.set("Equipment", ids[0]);
    do_child(ids[0], ids[1]);
    do_child(ids[0], ids[2]);
    do_child(ids[0], ids[3]);
    do_child(ids[2], ids[4]);
    do_child(ids[2], ids[5]);

    return {
        rules, category_rules
    };
}

const initStore: StateCreator<StoreType> = (set, get) => {
    const immer_set = immer_setter(set);
    return {
        ...initial_map(),
        active_rule: 1 as RuleId,
        active_category: "Equipment",
        set_active_category(new_category: RuleCategoryType): void {
            immer_set(state => {
                state.active_category = new_category;
            });
        },
        set_active_rule(rule) {
            immer_set(state => {
                state.active_rule = rule;
            });
        },
        set_rule_name(rule, name: string) {
            immer_set(state => {
                state.rules.get(rule)!.name = name;
            });
        },
        add_rule_condition(rule) {
            immer_set(state => {
                const r = state.rules.get(rule)!;
                (r.conditions ??= []).push({
                    arguments: [],
                    operator: FilterOperator.EQUALS,
                    type: "UNSET"
                });
            });
        },
        set_rule_condition_type(rule: RuleId, index: number, type: ConditionDefType) {
            immer_set(state => {
                const r = state.rules.get(rule)!;
                r.conditions![index] = {type};
            });
        },
        set_rule_condition_operator(rule: RuleId, index: number, op: FilterOperator) {
            immer_set(state=>{
                const r = state.rules.get(rule)!;
                r.conditions![index].operator = op;
            })
        }
    } satisfies StoreType;
};

export const store: StoreApi<StoreType> = createStore(initStore);
