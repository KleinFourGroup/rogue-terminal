import { Entity } from "./entity"

export type ClassConstructor<T> = new(...args: any[]) => T

export abstract class Component {
    static name: string
    entity: Entity | null
    constructor() {
        this.entity = null
    }

    setEntity(entity: Entity) {
        this.entity = entity
    }
}