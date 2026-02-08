import { Container } from "pixi.js"
import { IScene, Scene } from "./scene"
import { GameApp } from "./app"
import { AssetLoader } from "./assets"
import { LoadingBar } from "./loading_bar"

const LOAD_DELAY = 1000

export class LoadingScreen extends Container implements IScene {
    app: GameApp
    loader: AssetLoader
    loadingBar: LoadingBar
    nextScene: Scene
    elapsed: number
    
    constructor(app: GameApp, loader: AssetLoader, nextScene: Scene) {
        super()
        this.app = app
        this.loader = loader
        this.nextScene = nextScene
        this.elapsed = -1

        this.loadingBar = new LoadingBar()
        this.loadingBar.setDimensions(this.app.width * 0.75, this.app.height * 0.1)

        this.addChild(this.loadingBar)
    }

    update(deltaMS: number): void {
        if (this.elapsed >= LOAD_DELAY) {
            this.app.setScene(this.nextScene)
        }

        if (this.elapsed >= 0) {
            this.elapsed += deltaMS
        }

        if (this.loader.isLoaded()) {
            this.elapsed = Math.max(this.elapsed, 0)
        }
    
        this.loadingBar.setProgress(Math.max(this.loader.progress, this.elapsed / LOAD_DELAY))
    }

    updateResolution(): void {
        this.loadingBar.setDimensions(this.app.width * 0.75, this.app.height * 0.1)
        this.loadingBar.position.set((this.app.width - this.loadingBar.width) / 2, (this.app.height - this.loadingBar.height) / 2)
    }

}