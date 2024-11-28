import styled from "styled-components";
import React, {useEffect, useRef} from "react";
import {RuleClassSelector} from "#src/ui/components/RuleEditor";
import {RULE_CATEGORIES, RuleCategoryType} from "#src/ui/filter/base_types";
import {useStore} from "zustand";
import {RuleDef, RuleId, store} from "#src/ui/state/store";
import {Immutable} from "immer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons/faBars";

const RulePanelComponentStyled = styled.div`
    border: 1px solid blue;
    padding: 5px;
    height: 100%;
    display: grid;
    gap: 5px;
    grid-auto-rows: min-content;
`;

export function RulePanelComponent() {
    return <RulePanelComponentStyled>
        <div>
            Category: <RulesCategorySelector/>
        </div>
        <RulesListComponent/>
    </RulePanelComponentStyled>;
}

export function RulesCategorySelector() {
    const ref = useRef<HTMLSelectElement>(null);
    const set_active_category = useStore(store, s => s.set_active_category);
    useEffect(() => {
        ref.current!.value = store.getState().active_category;
    }, []);
    return <select ref={ref} onChange={e => {
        set_active_category(e.target.value as RuleCategoryType);
    }}>
        {RULE_CATEGORIES.map(type =>
            <option key={type} value={type}>{type}</option>)}
    </select>;
}

const RulesListComponentStyled = styled.div`
    border: 1px solid magenta;
    padding: 5px;
    overflow-y: scroll;
    display: grid;
    gap: 5px;
    grid-auto-rows: min-content;
`;

export function RulesListComponent() {
    const rule = useStore(store, s => s.category_rules.get(s.active_category));

    return <RulesListComponentStyled>
        {rule !== undefined && <RuleComponent rule_id={rule}/>}
    </RulesListComponentStyled>;
}

const RuleComponentStyled = styled.div`
    border: 1px solid pink;
    padding: 5px;
`;

const RuleFolderStyled = styled.div`
    border: 1px solid lime;
    padding: 5px;
    display: grid;
    gap: 5px;
    grid-auto-rows: min-content;
    //margin-left: 15px;
`;

const RuleFolderRulesListStyled = styled.div`
    margin-left: 20px;
    display: grid;
    gap: 5px;
    grid-auto-rows: min-content;
`;

const RuleFolderNameStyled = styled.div`
`;

const RuleFolderFooterStyled = styled.div`
    margin-top: 3px;
    margin-bottom: 3px;
    padding: 1px;
    background: deeppink;
`;

const RuleFolderHeaderStyled = styled.div`
    margin-bottom: 3px;
    padding: 1px;
    background: deeppink;
`;


type RuleComponentProps = {
    rule_id: RuleId;
}

export function RuleComponent({rule_id}: RuleComponentProps) {
    const children = useStore(store, s => s.rules.get(rule_id)!.children);

    if ((children?.length ?? 0) === 0) {
        return <RuleComponentStyled>
            <RuleInner rule_id={rule_id}/>
        </RuleComponentStyled>;
    }

    const child_rules = children!.map((r, i) => <RuleComponent rule_id={r} key={i}/>);

    return <RuleFolderStyled>
        <RuleInner rule_id={rule_id}/>
        <RuleFolderHeaderStyled/>
        <RuleFolderRulesListStyled>
            {child_rules}
        </RuleFolderRulesListStyled>
        <RuleFolderFooterStyled/>
    </RuleFolderStyled>;
}

const RuleInnerStyled = styled.div`
    display: grid;
    gap: 5px;
    grid-template-columns: auto auto 1fr auto;

    > * {
        //justify-self: center;
        align-self: center;
    }
`;

export function RuleInner({rule_id}: RuleComponentProps) {
    const rule = useStore(store, s => s.rules.get(rule_id))!;
    const set_active_rule = useStore(store, s => s.set_active_rule);
    return <RuleInnerStyled>
        <input type="checkbox"/>
        <FontAwesomeIcon icon={faBars} style={{cursor: "grab"}}/>
        <span>RULE {rule.name}</span>
        <button style={{cursor: "pointer"}} onClick={() => {
            set_active_rule(rule_id);
        }}>Edit
        </button>
    </RuleInnerStyled>;
}