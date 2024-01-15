import React from "react"
import IdentityComponent from "./IdentityComponent"
import OpinionXpressGroupsComponent from "./OpinionXpressGroupsComponent"
import ProofsComponent from "./proofsComponents"
import { MainLayout } from "../../layouts/mainLayout"

export default function index() {
    return (
        <MainLayout>
            <div>
                <IdentityComponent />
                <OpinionXpressGroupsComponent />
                <ProofsComponent />
            </div>
        </MainLayout>
    )
}
