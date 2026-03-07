type SignalCallback<T> = (eventData: T) => void

export class SignalEmitter<T> {
    listeners: SignalCallback<T>[]

    constructor() {
        this.listeners = []
    }

    subscribe(listener: SignalCallback<T>) {
        if (this.listeners.indexOf(listener) === -1) {
            this.listeners.push(listener)
        }
    }

    unsubscribe(listener: SignalCallback<T>) {
        const index = this.listeners.indexOf(listener)
        if (index >= 0) {
            this.listeners.splice(index, 1)
        }
    }

    emit(eventData: T) {
        for (const listener of this.listeners) {
            listener(eventData)
        }
    }
}