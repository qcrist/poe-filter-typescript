import React from "react";
import styled from "styled-components";
import {useStore} from "zustand";
import {ConditionDefType, RuleId, store} from "#src/ui/state/store";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRotateLeft} from "@fortawesome/free-solid-svg-icons/faRotateLeft";
import {CONDITION_CONTEXT, FilterOperator} from "#src/ui/filter/item-filter-def";
import {RULE_CATEGORIES_CONDITION_MAP} from "#src/ui/filter/base_types";
// import {FILTER_CLASS_TYPES} from "#src/ui/filter/base_types";

const RuleEditorComponentStyled = styled.div`
    border: 1px solid pink;
    height: 100%;
    padding: 5px;
    gap: 5px;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
`;

const DebugSpan = styled.div`
    border: 1px solid yellow;
`;

export function RuleEditorComponent() {
    const active = useStore(store, s => s.active_rule !== null);

    if (!active) return <></>;

    return <RuleEditorComponentStyled>
        <div style={{textAlign: "center", fontSize: "1.5em"}}>Edit Rule</div>
        <ConfigureRuleName/>
        <ConfigureConditions/>
        <DebugSpan>Visibility</DebugSpan>
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
    const active = useStore(store, s => s.active_rule)!;
    const name = useStore(store, s => s.rules.get(active)!.name);
    const set_name = useStore(store, s => s.set_rule_name);

    return <ConfigureRuleNameStyle>
        <span>Name: </span>
        <input type="text" placeholder="Rule Name" value={name} onChange={e => {
            set_name(active, e.target.value);
        }}/>
        <FontAwesomeIcon icon={faRotateLeft} style={{cursor: "pointer"}}/>
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
    const active = useStore(store, s => s.active_rule)!;
    const conditions = useStore(store, s => s.rules.get(active)!.conditions) ?? [];
    const add_condition = useStore(store, s => s.add_rule_condition);

    return <ConfigureConditionsStyle>
        <div>Conditions</div>
        <div>
            {/*<FontAwesomeIcon icon={faSquarePlus} color={"green"}/>*/}
            <button onClick={() => {
                add_condition(active);
            }}>Add Condition
            </button>
        </div>
        <div>
            {conditions.map((x, i) =>
                <ConfigureCondition rule_id={active} index={i} key={i}/>
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
    index: number
}

function ConfigureCondition({rule_id, index}: ConfigureConditionProps) {
    const conditions = useStore(store, s => s.rules.get(rule_id)!.conditions) ?? [];
    const conditions_available = useStore(store, s => RULE_CATEGORIES_CONDITION_MAP[s.active_category]);
    const set_condition_type = useStore(store, s => s.set_rule_condition_type);
    const set_rule_condition_operator = useStore(store, s => s.set_rule_condition_operator);

    const condition = conditions[index];
    const operators_available = condition.type === "UNSET" ? [] : CONDITION_CONTEXT[condition.type].allowed_operators;

    const options: Set<ConditionDefType> = new Set(conditions_available);
    for (let i = 0; i < conditions.length; i++) {
        if (i === index) continue;
        options.delete(conditions[i].type);
    }
    const optArray: ConditionDefType[] = ["UNSET", ...options];

    return <ConfigureConditionStyle>
        <select onChange={e => {
            set_condition_type(rule_id, index, e.target.value as ConditionDefType);
        }} value={condition.type}>
            {optArray.map(x => {
                const name = (x === "UNSET" ? "Unset" : CONDITION_CONTEXT[x].friendly_name);
                return <option value={x} key={x}>{name}</option>;
            })}
        </select>
        <select onChange={e => {
            set_rule_condition_operator(rule_id, index, e.target.value as FilterOperator);
        }} value={condition.operator ?? operators_available[0]} disabled={operators_available.length < 2}>
            {operators_available.map(x => {
                return <option value={x} key={x}>{x}</option>;
            })}
        </select>
    </ConfigureConditionStyle>;
}