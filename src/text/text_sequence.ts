export class TextSequence {
    characters: string[]
    index: number

    constructor(characters: string[]) {
        if (characters.length === 0) {
            throw new Error("(TextSequence.constructor) sequence has length 0")
        }

        this.characters = characters
        this.index = 0
    }

    get length() {
        return this.characters.length
    }

    getCurrent() {
        return this.characters[this.index]
    }

    step(count: number = 1) {
        const length = this.characters.length
        const index = (this.index + count) % length
        this.index = (index + length) % length
    }

    clone() {
        const copy = new TextSequence([...this.characters])
        copy.index = this.index
        
        return copy
    }

    getString() {
        return this.characters.join("")
    }

    static fromString(text: string) {
        const characters = [...text]
        return new TextSequence(characters)
    }
}