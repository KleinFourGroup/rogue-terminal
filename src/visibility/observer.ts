import { Component } from "../component"

export class Observer extends Component {
    viewDistance: number

    constructor(viewDistance: number) {
        super()
        this.viewDistance = viewDistance
    }
}