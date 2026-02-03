import { Container } from "pixi.js"
import { GameApp } from "./app"

export interface IScene {
    app: GameApp

    update(deltaMS: number): void
}

export type Scene = Container & IScene