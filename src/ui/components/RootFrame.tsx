import React from "react";
import styled from "styled-components";
import {RulePanelComponent} from "#src/ui/components/RuleComponet";
import {RuleEditorComponent} from "#src/ui/components/RuleEditor";


const MainLayoutContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: 
    "t t"
    "s m";
    gap: 10px;
    padding: 10px;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid green;
    color: white;

    user-select: none;
`;


export function RootFrame() {
    return <>
        <MainLayoutContainer>
            <MainTitle/>
            <SideBar/>
            <MainBody/>
        </MainLayoutContainer>
    </>;
}

const MainLayoutSidebarContainer = styled.div`
    grid-area: s;
    width: 100%;
    height: 100%;
    //justify-self: center;
    //align-self: center;
    //padding: .25em;
    //border: 1px solid red;
`;

export function SideBar() {
    return <MainLayoutSidebarContainer>
        <RulePanelComponent/>
    </MainLayoutSidebarContainer>;
}

const MainLayoutTitleContainer = styled.div`
    grid-area: t;
    //justify-self: center;
    //align-self: center;
    //padding: .25em;
    border: 1px solid red;
`;

export function MainTitle() {
    return <MainLayoutTitleContainer>
        TITLE!
    </MainLayoutTitleContainer>;
}

const MainLayoutBodyContainer = styled.div`
    grid-area: m;
    //justify-self: center;
    //align-self: center;
    //padding: .25em;
    border: 1px solid red;
`;

export function MainBody() {
    return <MainLayoutBodyContainer>
        <RuleEditorComponent/>
    </MainLayoutBodyContainer>;
}