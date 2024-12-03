import styled from "styled-components";
import React, {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {useStore} from "zustand";
import {DragResult, RuleId, store} from "#src/ui/state/store";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons/faBars";
import {subscribe_with_selector} from "#src/util/zustand_helpers";

const RulePanelComponentStyled = styled.div`
    border: 1px solid blue;
    padding: 5px;
    height: 100%;
    display: grid;
    gap: 5px;
    grid-auto-rows: min-content;
`;

export function RulePanelComponent() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return subscribe_with_selector(store, s => s.drag.active_node_id, active_node => {
            if (active_node !== null)
                ref.current!.style.cursor = "grabbing";
            else
                ref.current!.style.cursor = "";

        });
    }, []);

    return <RulePanelComponentStyled ref={ref} onMouseLeave={e => {
        const st = store.getState();
        if (st.drag.active_node_id !== null) {
            st.finish_drag(false);
        }
    }} onMouseUp={e => {
        const st = store.getState();
        if (st.drag.active_node_id !== null) {
            st.finish_drag(true);
        }
    }}>
        <div>
            Search: <input type="text"/>
            <PointerButton> New Rule</PointerButton>
        </div>
        <RulesListComponent/>
    </RulePanelComponentStyled>;
}

const RulesListComponentStyled = styled.div`
    border: 1px solid magenta;
    padding: 5px;
    overflow-y: scroll;
    display: grid;
    //gap: 5px;
    grid-auto-rows: min-content;
`;

export function RulesListComponent() {
    const root = useStore(store, s => s.root_node);

    return <RulesListComponentStyled>
        <NodeComponent node_id={root}/>
    </RulesListComponentStyled>;
}

const NodeDragTargetStyled = styled.div`
    display: block;
    height: calc(0% + 5px);
    width: 100%;
    background-color: rgba(255, 0, 0, 0.5);
    //border: 1px solid yellow;
    position: relative;
    box-sizing: border-box;
    z-index: -1;
`;

type NodeDragHelperProps = {
    node_id: RuleId;
    children?: ReactNode;
    force_result?: DragResult;
}

function NodeDragTarget({node_id, children, force_result}: NodeDragHelperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const set_drag_target = useStore(store, s => s.set_drag_target);
    const parent_uuid = useStore(store, s => s.get_node(node_id).parent!);
    const parent_children = useStore(store, s => s.get_node(parent_uuid).children!);
    const node_after_us = parent_children[parent_children.indexOf(node_id) + 1];

    useEffect(() => {
        if (!force_result) return;

        function target_is_not_us() {
            ref.current!.style.backgroundColor = "";
            ref.current!.style.cursor = "";
        }

        return subscribe_with_selector(store, s => s.drag.target, target => {
            if (!target) return target_is_not_us();
            const [target_uuid, target_result] = target;
            if (target_result === DragResult.NOOP)
                return target_is_not_us();

            const indirect_us = (
                target_result === DragResult.BEFORE &&
                node_after_us === target_uuid &&
                force_result == DragResult.AFTER
            );
            const is_us = target_uuid === node_id && force_result === target_result;

            if (indirect_us || is_us) {
                ref.current!.style.backgroundColor = "rgba(255,255,255,0.3)";
                return;
            }
            return target_is_not_us();


            // switch (target_result) {
            //     case DragResult.BEFORE:
            //         ref.current!.style.cursor = "row-resize";
            //         break;
            //     case DragResult.AFTER:
            //         ref.current!.style.cursor = "row-resize";
            //         break;
            //     case DragResult.ONTO:
            //         ref.current!.style.cursor = "cell";
            //         break;
            //     case DragResult.FOLDER_TOP:
            //     case DragResult.FOLDER_END:
            //         ref.current!.style.cursor = "copy";
            //         break;
            // }
        });

        // let last = null;
        // return store.subscribe((s) => {
        //     const check = s.drag.target;
        //     if (check === last) return;
        //     last =
        // });
    }, [force_result, node_id, node_after_us]);


    return <div ref={ref} onMouseMove={e => {
        const st = store.getState();

        const active_drag = st.drag.active_node_id;
        if (active_drag === null) return;
        e.stopPropagation();
        if (active_drag === node_id) {
            set_drag_target(node_id, DragResult.NOOP);
            return;
        }

        const mouseY = e.clientY;

        const bound = e.currentTarget.getBoundingClientRect();

        const p = (mouseY - bound.top) / bound.height;

        let result: DragResult;

        if (force_result)
            result = force_result;
        else if (p < 0.2) result = DragResult.BEFORE;
        else if (p > 0.8) result = DragResult.AFTER;
        else result = DragResult.ONTO;

        set_drag_target(node_id, result);

        // console.log(name, DragResult[result]);
    }}>
        {children}
        {/*<NodeDragTargetStyledBottom/>*/}
    </div>;
}


const RuleComponentStyled = styled.div`
    border: 1px solid pink;
    padding: 5px;
`;

const RuleFolderStyled = styled.div`
    border: 1px solid lime;
    //padding: 5px;
    display: grid;
    //gap: 5px;
    grid-auto-rows: min-content;
    //margin-left: 15px;
`;

const RuleFolderRulesListStyled = styled.div`
    padding-left: 20px;
    padding-right: 5px;
    display: grid;
    //gap: 5px;
    grid-auto-rows: min-content;
`;

const RuleFolderFooterStyled = styled.div`
    margin-top: 8px;
    margin-bottom: 3px;
    margin-left: 5px;
    margin-right: 5px;
    padding: 1px;
    background: deeppink;
`;

const RuleFolderHeaderStyled = styled.div`
    margin-bottom: 8px;
    margin-left: 5px;
    margin-right: 5px;
    padding: 1px;
    background: deeppink;
`;

const VSpacerDiv = styled.div`
    height: 5px;
`;

const FolderPaddingDiv = styled.div`
    padding: 5px;
    padding-top: 0px;
`;

type RuleComponentProps = {
    node_id: RuleId;
}

export function NodeComponent({node_id}: RuleComponentProps) {
    const node_type = useStore(store, s => s.get_node(node_id).type);
    const children = useStore(store, s => s.get_node(node_id).children);

    let child_nodes: ReactNode[] = [];
    if (children != null) {
        child_nodes = children?.flatMap((r, i) => {
            const node = <NodeComponent node_id={r} key={i}/>;
            if (i !== children.length - 1)
                return [node,
                    <NodeDragTarget node_id={r}
                                    force_result={DragResult.AFTER} key={"s" + i}
                    >
                        <VSpacerDiv/>
                    </NodeDragTarget>
                ];
            return [node];
        });
    }


    if (node_type == "root") {
        return <>
            {child_nodes}
        </>;
    }

    //TODO does the memo even help?
    const inner = useMemo(() => <RuleInner node_id={node_id}/>, [node_id]);

    if (node_type == "rule") {
        return <NodeDragTarget node_id={node_id}>
            <RuleComponentStyled>
                <NodeDragTarget node_id={node_id} force_result={DragResult.ONTO}>
                    {inner}
                </NodeDragTarget>
            </RuleComponentStyled>
        </NodeDragTarget>;
    }

    return <NodeDragTarget node_id={node_id}>
        <RuleFolderStyled>
            <VSpacerDiv/>
            <NodeDragTarget node_id={node_id} force_result={DragResult.ONTO}>
                <FolderPaddingDiv>
                    {inner}
                </FolderPaddingDiv>
            </NodeDragTarget>
            <NodeDragTarget node_id={node_id} force_result={DragResult.FOLDER_TOP}>
                <RuleFolderHeaderStyled/>
            </NodeDragTarget>
            <RuleFolderRulesListStyled>
                {child_nodes}
            </RuleFolderRulesListStyled>
            <NodeDragTarget node_id={node_id} force_result={DragResult.FOLDER_END}>
                <RuleFolderFooterStyled/>
            </NodeDragTarget>
            <VSpacerDiv/>
        </RuleFolderStyled>
    </NodeDragTarget>;
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

const PointerButton = styled.button`
    cursor: pointer;
`;

export function RuleInner({node_id}: RuleComponentProps) {
    const rule_type = useStore(store, s => s.get_node(node_id).type);
    const set_active_rule = useStore(store, s => s.set_active_rule);
    const delete_folder = useStore(store, s => s.delete_node);
    const type = rule_type.toUpperCase();
    const button = rule_type === "rule" ?
        <PointerButton onClick={() => {
            set_active_rule(node_id);
        }}>Edit</PointerButton> :
        <PointerButton onClick={() => {
            delete_folder(node_id);
        }}>X</PointerButton>;
    const start_drag = useStore(store, s => s.start_drag);

    return <RuleInnerStyled>
        <input type="checkbox"/>
        <span draggable={true} onDragStartCapture={e => {
            e.preventDefault();
            start_drag(node_id);
        }}>
            <FontAwesomeIcon icon={faBars} style={{cursor: "grab"}}/>
        </span>
        {/*<NodeDragHelper node_id={node_id}>*/}
        {/*</NodeDragHelper>*/}
        <span>{type} <RuleNameComponent node_id={node_id}/></span>
        {button}
    </RuleInnerStyled>;
}

function RuleNameComponent({node_id}: RuleComponentProps) {
    const current_name = useStore(store, s => s.get_node(node_id)!.name);
    const [edit, setEdit] = useState<boolean>(false);
    const set_name = useStore(store, s => s.set_node_name);

    if (edit) {
        return <input defaultValue={current_name} onBlur={e => {
            set_name(node_id, e.target.value);
            setEdit(false);
        }} autoFocus={true}/>;
    }

    return <span onClick={e => {
        if (e.detail === 2)
            setEdit(true);
    }}>{current_name}</span>;
}