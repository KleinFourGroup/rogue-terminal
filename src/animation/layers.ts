export interface AnimationVector {
    x: number
    y: number
}

export interface LayerData {
    vector: AnimationVector
    weight: number
}

export enum AnimationLayer {
    BASE,
    LOCATION,
    HOVER
}

export class LayerCompositor {
    layerMap: Map<AnimationLayer, LayerData>
    value: AnimationVector

    constructor() {
        this.layerMap = new Map<AnimationLayer, LayerData>()
        this.value = {x: 0, y: 0}
    }

    create(layer: AnimationLayer) {
        this.layerMap.set(layer, {vector: {x: 0, y: 0}, weight: 1})
    }

    get(layer: AnimationLayer) {
        if (!this.layerMap.has(layer)) {
            this.create(layer)
        }

        return this.layerMap.get(layer)!
    }

    setVector(layer: AnimationLayer, x: number, y: number) {
        const layerData = this.get(layer)
        layerData.vector.x = x
        layerData.vector.y = y
    }

    setWeight(layer: AnimationLayer, weight: number) {
        const layerData = this.get(layer)
        layerData.weight = weight
    }

    delete(layer: AnimationLayer) {
        this.layerMap.delete(layer)
    }

    compose() {
        this.value.x = 0
        this.value.y = 0

        for (const data of this.layerMap.values()) {
            this.value.x += data.vector.x * data.weight
            this.value.y += data.vector.y * data.weight
        }
    }
}