import { Entity } from "./entity"
import { World } from "./world"
import { AILogic } from "./behaviors/behavior"
import { EntityGrid } from "./entity_grid"
import { Observer } from "./visibility/observer"
import { ClassConstructor, Component } from "./component"
import { AnimationManager } from "./animation_manager"
import { Actor } from "./actor"

export class ECS extends EntityGrid<Entity> {
    world: World | null
    componentLists: Map<ClassConstructor<any>, Set<Entity>>
    listenerAddList: Map<Entity, (comp: Component) => void>
    listenerRemoveList: Map<Entity, (comp: Component) => void>

    constructor(rows: number, cols: number) {
        super(rows, cols)
        this.world = null
        this.componentLists = new Map<ClassConstructor<any>, Set<Entity>>()
        this.listenerAddList = new Map<Entity, (comp: Component) => void>()
        this.listenerRemoveList = new Map<Entity, (comp: Component) => void>()
    }

    addToComponentLists(Comp: ClassConstructor<any>, entity: Entity) {
        if (!this.componentLists.has(Comp)) {
            this.componentLists.set(Comp, new Set<Entity>())
        }

        this.componentLists.get(Comp)!.add(entity)
    }

    removeFromComponentLists(Comp: ClassConstructor<any>, entity: Entity) {
        if (this.componentLists.has(Comp)) {
            this.componentLists.get(Comp)!.delete(entity)
        }
    }

    addHook(entity: Entity) {
        for (const [Comp, _component] of entity.components) {
            this.addToComponentLists(Comp, entity)
        }

        const addCallback = (component: Component) => {
            this.addToComponentLists(component.constructor as ClassConstructor<any>, entity)
        }

        const removeCallback = (component: Component) => {
            this.removeFromComponentLists(component.constructor as ClassConstructor<any>, entity)
        }

        entity.signals.onAdd.subscribe(addCallback)
        entity.signals.onRemove.subscribe(removeCallback)
        this.listenerAddList.set(entity, addCallback)
        this.listenerRemoveList.set(entity, removeCallback)
    }

    removeHook(entity: Entity) {
        entity.signals.onAdd.unsubscribe(this.listenerAddList.get(entity)!)
        entity.signals.onRemove.unsubscribe(this.listenerRemoveList.get(entity)!)
        this.listenerAddList.delete(entity)
        this.listenerRemoveList.delete(entity)

        for (const [Comp, _component] of entity.components) {
            this.removeFromComponentLists(Comp, entity)
        }
    }

    setWorld(world: World | null) {
        if (world !== null) {
            console.assert(world.rows === this.rows && world.cols === this.cols)
        }
        
        this.world = world
    }

    getComponentList<Comp extends Component>(comp: ClassConstructor<Comp>) {
        if (!this.componentLists.has(comp)) {
            this.componentLists.set(comp, new Set<Entity>())
        }

        return this.componentLists.get(comp)!
    }

    getActive() {
        return [...this.getComponentList(AnimationManager)].filter((entity: Entity) => entity.getComponent(AnimationManager)!.isActive())
    }

    getObservers() {
        return this.getComponentList(Observer)
    }

    nextAI() {
        const hasAI = this.getComponentList(AILogic)

        const getActor = (entity: Entity) => {
            const actor = entity.getComponent(Actor)
            if (actor !== null) {
                return actor
            } else {
                throw new Error("(nextAI) entity has AI but no Actor")
            }
        }
        
        const minAI = (currMin: Entity, entity: Entity) => getActor(entity).actionCoolDown < getActor(currMin).actionCoolDown ? entity : currMin

        if (hasAI.size > 0) {
            return hasAI.values().reduce(minAI, hasAI.values().next().value!)
        }

        return null
    }

    advanceTicks(ticks: number) {
        // console.log(`Skipping ahead ${ticks} ticks`)
        for (const entity of this.getComponentList(Actor)) {
            entity.getComponent(Actor)!.advanceTicks(ticks)
        }
    }
}