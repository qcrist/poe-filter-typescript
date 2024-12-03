import React, {useId} from "react";
import styled from "styled-components";
import {useStore} from "zustand";
import {ConditionDefType, RuleId, store, StoreType} from "#src/ui/state/store";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRotateLeft} from "@fortawesome/free-solid-svg-icons/faRotateLeft";
import {
    FilterActionDefinition,
    FilterActionType, FilterActionTypes,
    FilterConditionTypes,
    FilterOperator,
    FilterValueConfig,
    FilterValueType
} from "#src/ui/filter/item-filter-def";

const RuleEditorComponentStyled = styled.div`
    border: 1px solid pink;
    height: 100%;
    padding: 5px;
    gap: 5px;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto auto auto 1fr auto;
`;

const DebugSpan = styled.div`
    border: 1px solid yellow;
`;

export function RuleEditorComponent() {
    const active = useStore(store, s => s.current_edit_rule_id !== null);

    if (!active) return <></>;

    return <RuleEditorComponentStyled>
        <div style={{textAlign: "center", fontSize: "1.5em"}}>Edit Rule</div>
        <ConfigureRuleName/>
        <ConfigureConditions/>
        <ConfigureActions/>
        {/*<DebugSpan>Visibility</DebugSpan>*/}
    </RuleEditorComponentStyled>;
}

const ConfigureRuleNameStyle = styled.div`
    display: grid;
    gap: 5px;
    grid-template-columns: auto 1fr auto;

    > input {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid white;
        outline: none;
        color: white;
    }
`;

function ConfigureRuleName() {
    const active = useStore(store, s => s.current_edit_rule_id)!;
    const name = useStore(store, s => s.get_node(active).name);
    const set_name = useStore(store, s => s.set_node_name);

    return <ConfigureRuleNameStyle>
        <span>Name: </span>
        <input type="text" placeholder="Rule Name" value={name} onChange={e => {
            set_name(active, e.target.value);
        }}/>
        {/*<FontAwesomeIcon icon={faRotateLeft} style={{cursor: "pointer"}}/>*/}
    </ConfigureRuleNameStyle>;
}

export function RuleClassSelector() {
    return <select>
        {/*{BASE_TYPES.map(type =>*/}
        {/*    <option key={type} value={type}>{type}</option>)}*/}
    </select>;
}

const ConfigureConditionsStyle = styled.div`
    display: grid;
    gap: 5px;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto auto;

    > :nth-child(1) {
    }

    > :nth-child(2) {
        text-align: right;
    }

    > :nth-child(3) {
        grid-column: span 2;
    }
`;

function ConfigureConditions() {
    const active = useStore(store, s => s.current_edit_rule_id)!;
    const conditions = useStore(store, s => s.get_node(active, 'rule').conditions) ?? [];
    // const add_condition = useStore(store, s => s.add_rule_condition);

    return <ConfigureConditionsStyle>
        <div>Conditions</div>
        <div>
            {/*<FontAwesomeIcon icon={faSquarePlus} color={"green"}/>*/}
            <button onClick={() => {
                // add_condition(active);
            }}>Add Condition
            </button>
        </div>
        <div>
            {Object.keys(conditions).map((x, i) =>
                <ConfigureCondition rule_id={active} type={x as FilterConditionTypes} key={i}/>
            )}
        </div>
    </ConfigureConditionsStyle>;
}

const ConfigureConditionStyle = styled.div`
    display: grid;
    gap: 5px;
    grid-template-columns: auto auto;
`;


type ConfigureConditionProps = {
    rule_id: RuleId
    type: FilterConditionTypes
}

function ConfigureCondition({rule_id, type}: ConfigureConditionProps) {
    // const conditions = useStore(store, s => s.nodes.get(rule_id)!.conditions) ?? [];
    // const conditions_available = useStore(store, s => RULE_CATEGORIES_CONDITION_MAP[s.active_category]);
    // const set_condition_type = useStore(store, s => s.set_rule_condition_type);
    // const set_rule_condition_operator = useStore(store, s => s.set_rule_condition_operator);
    //
    // const condition = conditions[index];
    // const operators_available = condition.type === "UNSET" ? [] : CONDITION_CONTEXT[condition.type].allowed_operators;
    //
    // const options: Set<ConditionDefType> = new Set(conditions_available);
    // for (let i = 0; i < conditions.length; i++) {
    //     if (i === index) continue;
    //     options.delete(conditions[i].type);
    // }
    // const optArray: ConditionDefType[] = ["UNSET", ...options];
    //
    // return <ConfigureConditionStyle>
    //     <select onChange={e => {
    //         set_condition_type(rule_id, index, e.target.value as ConditionDefType);
    //     }} value={condition.type}>
    //         {optArray.map(x => {
    //             const name = (x === "UNSET" ? "Unset" : CONDITION_CONTEXT[x].friendly_name);
    //             return <option value={x} key={x}>{name}</option>;
    //         })}
    //     </select>
    //     <select onChange={e => {
    //         set_rule_condition_operator(rule_id, index, e.target.value as FilterOperator);
    //     }} value={condition.operator ?? operators_available[0]} disabled={operators_available.length < 2}>
    //         {operators_available.map(x => {
    //             return <option value={x} key={x}>{x}</option>;
    //         })}
    //     </select>
    // </ConfigureConditionStyle>;

    return <></>;
}

const ConfigureActionsStyle = styled.div`
    display: grid;
    gap: 5px;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto auto;

    > :nth-child(1) {
    }

    > :nth-child(2) {
        text-align: right;
    }

    > :nth-child(3) {
        grid-column: span 2;
    }
`;

function ConfigureActions() {
    const active = useStore(store, s => s.current_edit_rule_id)!;
    const actions = useStore(store, s => s.get_node(active, 'rule').actions) ?? [];
    const add_action = useStore(store, s => s.add_action_to_active_edit_rule);
    // const add_condition = useStore(store, s => s.add_rule_condition);

    const available_types = FilterActionTypes.filter(x => actions[x] === undefined);
    const add_action_id = useId();

    let add_add_action_selection = available_types.length == 0 ? <></> :
        <tr>
            <td>
                <input list={add_action_id} type="text" placeholder="add action..."
                       onChange={e => {
                           const match = available_types
                               .filter(x => e.target.value === x)[0];
                           if (!match) return;
                           add_action(match);
                           e.target.value = "";
                       }}
                />
                <datalist id={add_action_id}>
                    {available_types.map(x => <option value={x} key={x}/>)}
                </datalist>
            </td>
            <td/>
            <td/>
        </tr>
    ;

    return <ConfigureActionsStyle>
        <table border={1}>
            <thead>
            <tr>
                <td>Actions</td>
                <td>Value</td>
                <td>var</td>
            </tr>
            </thead>
            <tbody>
            {Object.keys(actions).map((x, i) =>
                <ActionConfiguration rule_id={active} type={x as FilterActionType} key={i}/>
            )}
            {add_add_action_selection}
            </tbody>
        </table>
    </ConfigureActionsStyle>;
}

type ConfigureActionProps = {
    rule_id: RuleId
    type: FilterActionType
}

function ActionConfiguration({rule_id, type}: ConfigureActionProps) {
    const action = useStore(store, s => s.get_node(rule_id, 'rule').actions[type])!;

    return <>
        <tr>
            <td>{action.type}</td>
            <td><FilterValueInput config={FilterActionDefinition[action.type]}
                                  set_value={(new_value) => console.log("set", type, new_value)}
                                  get_value={() => action.arguments ?? []}
            /></td>
            <td>
                <button>#</button>
            </td>
        </tr>
    </>;
}

type FilterValueInputProps = {
    config: FilterValueConfig,
    get_value: () => readonly string[],
    set_value: (value: string[]) => void
}

function FilterValueInput({config, set_value, get_value}: FilterValueInputProps) {
    const value = get_value();

    switch (config.type) {
        case FilterValueType.COLOR: {
            function argumentsToHex(args: readonly string[]) {
                return "#" + args.map(x => (+x).toString(16).padStart(2, "0")).join("");
            }

            function hexToArguments(hex: string) {
                return hex.substring(1).match(/.{2}/g)!.map(x => String(parseInt(x, 16)));
            }

            return <input type={"color"} defaultValue={argumentsToHex(value)} onChange={e => {
                set_value(hexToArguments(e.target.value));
            }}></input>;
        }
        case FilterValueType.INTEGER: {
            return <input type={"number"} max={config.max} min={config.min} defaultValue={value[0] ?? config.def}
                          onChange={e => {
                              if (e.target.value.length > 0)
                                  set_value([e.target.value]);
                          }}
                          onBlur={e => {
                              if (e.target.value.length == 0)
                                  e.target.value = get_value()[0];
                          }}
            />;
        }
    }
}
