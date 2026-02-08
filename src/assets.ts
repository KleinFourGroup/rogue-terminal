import { Assets } from "pixi.js"

const ASSET_LIST: string[] = [

]

export class AssetLoader {
    loadingStatus: {[id: string]: boolean}
    loadingProgress: {[id: string]: number}
    constructor() {
        this.loadingStatus = {}
        this.loadingProgress = {}

        for (const path of ASSET_LIST) {
            this.loadingStatus[path] = false
            this.loadingProgress[path] = 0

            Assets.load(path,
                (progress) => {
                    this.loadingProgress[path] = progress
                }
            ).then(
                (_value) => {
                    this.loadingStatus[path] = true
                }
            ).catch(
                (err) => {
                    console.error(`Error loading asset '${path}': ${err}`)
                }
            )
        }
    }

    isLoaded() {
        let loaded = true

        for (const path in this.loadingStatus) {
            loaded = loaded && this.loadingStatus[path]
        }

        return loaded
    }

    get progress() {
        let size = 0
        let amount = 0

        for (const path in this.loadingStatus) {
            size += 1
            amount += this.loadingStatus[path] ? 1 : this.loadingProgress[path]
        }

        return amount / size
    }
}