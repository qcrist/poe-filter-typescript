import {createStore, StateCreator, StoreApi} from "zustand";
import {Draft, Immutable, produce} from "immer";
import {Brand} from "#src/util/brand";
import {
    FilterActionDefinition,
    FilterActionType,
    FilterConditionTypes,
    FilterOperator
} from "#src/ui/filter/item-filter-def";

export type ConditionDefType = FilterConditionTypes | "UNSET";
export type ConditionDef = {
    type: ConditionDefType,
    arguments?: string[],
    operator?: FilterOperator
}

export type ActionDef = {
    type: FilterActionType,
    arguments?: string[]
};

export type RuleTreeNodeBase<TYPE extends string> = {
    id: UUID,
    name: string,
    type: TYPE,
    parent?: UUID,
    children?: UUID[]
}

export type FolderDef = RuleTreeNodeBase<"folder"> & {
    // enabled: boolean
}

export type RootDef = RuleTreeNodeBase<"root"> & {}

export type RuleDef = RuleTreeNodeBase<'rule'> & {
    conditions: { [K in FilterConditionTypes]?: ConditionDef },
    actions: { [K in FilterActionType]?: ActionDef }
    // enabled: boolean
}

export type RuleTreeNode = FolderDef | RuleDef | RootDef;
export type RuleTreeNodeType = RuleTreeNode["type"];
export type RuleTreeNodeTypeImpl<T extends RuleTreeNodeType> = Extract<RuleTreeNode, RuleTreeNodeBase<T>>

export type UUID = Brand<string, "uuid">

// export type RuleId = Brand<UUID, "rule_id">
export type RuleId = UUID

export enum DragResult {
    NOOP,
    BEFORE,
    AFTER,
    ONTO,
    FOLDER_TOP,
    FOLDER_END,
}

export type StoreType = Immutable<{
    drag: {
        active_node_id: UUID | null,
        target: [UUID, DragResult] | null,
    }
    current_edit_rule_id: UUID | null,
    root_node: UUID,
    nodes: Map<UUID, RuleTreeNode>,
    set_active_rule(rule: UUID): void;
    get_node<T extends RuleTreeNodeType>(id: UUID, type?: T): Immutable<RuleTreeNodeTypeImpl<T>>;
    get_active_rule(): Immutable<RuleDef> | null;
    set_node_name(node: UUID, name: string): void;
    start_drag(drag_node: UUID): void;
    set_drag_target(node: UUID, result: DragResult): void;
    finish_drag(success: boolean): void;
    delete_node(node: UUID): void;
    // add_rule_condition(rule: RuleId): void;
    // set_rule_condition_type(rule: RuleId, index: number, type: ConditionDefType): void;
    // set_rule_condition_operator(rule: RuleId, index: number, op: FilterOperator): void;
    add_action_to_active_edit_rule(type: FilterActionType): void;
}>

type immer_setter<T> = StoreApi<T>["setState"]
type immer_recipe<T> = (state: Draft<T>) => void;

function immer_setter<T>(setter: immer_setter<T>) {
    return (recipe: immer_recipe<T>) => {
        setter(produce<T>(recipe));
    };
}

function generateUUID(): UUID {
    return crypto.randomUUID() as UUID;
}

function initial_map() {
    const nodes: Map<RuleId, RuleTreeNode> = new Map();

    // const category_rules: Map<RuleCategoryType, RuleId> = new Map();

    const fRoot: RootDef = {
        type: "root",
        name: "folder_root",
        id: generateUUID(),
    };

    const f1: FolderDef = {
        type: "folder",
        name: "folder1",
        id: generateUUID(),
    };

    const f2: FolderDef = {
        type: "folder",
        name: "folder2",
        id: generateUUID(),
    };

    const f3: FolderDef = {
        type: "folder",
        name: "folder3",
        id: generateUUID(),
    };

    function do_child(parent: RuleTreeNode, child: RuleTreeNode) {
        (parent.children ??= []).push(child.id);
        child.parent = parent.id;
    }

    const n: RuleDef[] = Array.from({length: 5}, (_, i) => {
        return {
            type: "rule",
            id: generateUUID(),
            conditions: {},
            name: "rule-" + i,
            actions: {}
        } satisfies RuleDef;
    });

    n.forEach(n => nodes.set(n.id, n));
    nodes.set(f1.id, f1);
    nodes.set(f2.id, f2);
    nodes.set(f3.id, f3);
    nodes.set(fRoot.id, fRoot);

    n[2].conditions["BaseType"] =
        {
            type: "BaseType",
            arguments: ["foo"],
            operator: FilterOperator.EQUALS
        };

    n[2].actions["SetFontSize"] =
        {
            type: "SetFontSize",
            arguments: ["30"]
        };

    n[2].actions["SetTextColor"] =
        {
            type: "SetTextColor",
            arguments: ["255", "255", "0"]
        };

    // rules.get(ids[0])!.conditions = [
    //     {
    //         type: "$CATEGORY",
    //         operator: FilterOperator.EQUALS,
    //         arguments: ["Equipment"]
    //     }
    // ];

    do_child(fRoot, n[2]);
    do_child(fRoot, f1);
    do_child(fRoot, n[0]);
    do_child(fRoot, f2);
    do_child(fRoot, n[1]);
    do_child(fRoot, f3);

    do_child(f1, n[3]);
    do_child(f2, n[4]);

    return {
        nodes,
        root_node: fRoot.id,
        current_edit_rule_id: n[2].id
        // category_rules
    } satisfies Partial<StoreType>;
}

const initStore: StateCreator<StoreType> = (set, get) => {
    const immer_set = immer_setter(set);
    return {
        ...initial_map(),
        drag: {
            active_node_id: null,
            target: null,
        },

        // active_rule: null,
        // active_category: "Equipment",
        // set_active_category(new_category: RuleCategoryType): void {
        //     immer_set(state => {
        //         state.active_category = new_category;
        //     });
        // },
        set_active_rule(rule) {
            immer_set(state => {
                state.current_edit_rule_id = rule;
            });
        },
        get_node<T extends RuleTreeNodeType>(id: UUID, type?: T): Immutable<RuleTreeNodeTypeImpl<T>> {
            const node = get().nodes.get(id);
            if (node === undefined)
                throw new Error("no such node");
            if (type === undefined || node.type === type)
                return node as Immutable<RuleTreeNodeTypeImpl<T>>;
            throw new Error("node is not: " + type);
        },
        get_active_rule(): Immutable<RuleDef> | null {
            const st = get();
            if (st.current_edit_rule_id === null)
                return null;
            return st.get_node(st.current_edit_rule_id, "rule");
        },
        add_action_to_active_edit_rule(type) {
            immer_set(state => {
                if (state.current_edit_rule_id === null) {
                    console.error("failed to add action due to no active rule");
                    return;
                }
                const active = state.nodes.get(state.current_edit_rule_id);
                if (active === undefined) {
                    console.error("failed to find active rule node");
                    return;
                }
                if (active.type !== "rule") {
                    console.error("active node isn't a rule!");
                    return;
                }
                if (active.actions[type] !== undefined) {
                    console.warn("overriding existing action");
                }
                active.actions[type] = {
                    type: type,
                    arguments: FilterActionDefinition[type].def
                };
            });
        },
        set_node_name(id, name: string) {
            immer_set(state => {
                state.nodes.get(id)!.name = name;
            });
        },
        start_drag(drag_node: UUID) {
            immer_set(state => {
                state.drag.active_node_id = drag_node;
                console.log("Drag started");
            });
        },
        set_drag_target(node: UUID, result: DragResult) {
            immer_set(state => {
                state.drag.target = [node, result];
            });
        },
        finish_drag(success: boolean) {
            immer_set(state => {
                if (success && state.drag.target && state.drag.active_node_id) {
                    let [target, result] = state.drag.target;

                    function remove_node_from_parent(target: RuleTreeNode) {
                        const parent = state.nodes.get(target.parent!)!;
                        parent.children = parent.children!.filter(x => x !== target.id);
                        target.parent = undefined;
                    }

                    if (result !== DragResult.NOOP) {
                        const drop_target = state.nodes.get(target)!;
                        const drop_source = state.nodes.get(state.drag.active_node_id)!;
                        remove_node_from_parent(drop_source);

                        // if (drop_target.type === "folder" && result === DragResult.ONTO)
                        //     result = DragResult.FOLDER_TOP;

                        switch (result) {
                            case DragResult.BEFORE: {
                                const p = state.nodes.get(drop_target.parent!)!;
                                const ch = p.children!;
                                const idx = ch.indexOf(drop_target.id);
                                ch.splice(idx, 0, drop_source.id);
                                drop_source.parent = p.id;
                                break;
                            }
                            case DragResult.AFTER: {
                                const p = state.nodes.get(drop_target.parent!)!;
                                const ch = p.children!;
                                const idx = ch.indexOf(drop_target.id);
                                ch.splice(idx + 1, 0, drop_source.id);
                                drop_source.parent = p.id;
                                break;
                            }
                            case DragResult.ONTO: {
                                const f: FolderDef = {
                                    type: "folder",
                                    id: generateUUID(),
                                    name: "New Folder"
                                };
                                const p = state.nodes.get(drop_target.parent!)!;
                                const ch = p.children!;
                                const idx = ch.indexOf(drop_target.id);
                                ch[idx] = f.id;
                                state.nodes.set(f.id, f);
                                f.parent = p.id;
                                drop_target.parent = f.id;
                                drop_source.parent = f.id;
                                f.children = [drop_target.id, drop_source.id];
                                break;
                            }
                            case DragResult.FOLDER_TOP: {
                                const ch = drop_target.children ?? [];
                                drop_target.children = [drop_source.id, ...ch];
                                drop_source.parent = drop_target.id;
                                break;
                            }
                            case DragResult.FOLDER_END: {
                                const ch = drop_target.children ?? [];
                                drop_target.children = [...ch, drop_source.id];
                                drop_source.parent = drop_target.id;
                                break;
                            }
                        }
                    }


                    console.log("execute drag!");
                } else {
                    console.log("drag abort");
                }

                state.drag.target = state.drag.active_node_id = null;
            });
        },
        delete_node(node: UUID) {
            immer_set(state => {
                const n = state.nodes.get(node)!;
                if (n.type === "root") {
                    console.warn("refusing to delete root");
                    return;
                }
                const p = state.nodes.get(n.parent!)!;

                if (n.type === "folder" && n.children !== undefined) {
                    const idx = p.children!.indexOf(node);
                    p.children!.splice(idx, 1, ...n.children!);
                    for (let ch of n.children) {
                        state.nodes.get(ch)!.parent = p.id;
                    }
                } else {
                    p.children = p.children!.filter(x => x !== node);
                }

                n.parent = undefined;
                state.nodes.delete(n.id);
            });
        }
        // add_rule_condition(rule) {
        //     immer_set(state => {
        //         const r = state.rules.get(rule)!;
        //         (r.conditions ??= []).push({
        //             arguments: [],
        //             operator: FilterOperator.EQUALS,
        //             type: "UNSET"
        //         });
        //     });
        // },
        // set_rule_condition_type(rule: RuleId, index: number, type: ConditionDefType) {
        //     immer_set(state => {
        //         const r = state.rules.get(rule)!;
        //         r.conditions![index] = {type};
        //     });
        // },
        // set_rule_condition_operator(rule: RuleId, index: number, op: FilterOperator) {
        //     immer_set(state => {
        //         const r = state.rules.get(rule)!;
        //         r.conditions![index].operator = op;
        //     });
        // }
    } satisfies StoreType;
};

export const store: StoreApi<StoreType> = createStore(initStore);
