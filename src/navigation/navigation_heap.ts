import { NavigationNode } from "./navigation_node";


export class NavigationHeap {
    heapArray: NavigationNode[];

    constructor() {
        this.heapArray = [];
    }

    get length() {
        return this.heapArray.length;
    }

    peek() {
        if (this.heapArray.length === 0) {
            return null;
        }

        return this.heapArray[0];
    }

    push(node: NavigationNode) {
        this.heapArray.push(node);
        this.upheap(this.heapArray.length - 1);
    }

    pop() {
        if (this.heapArray.length === 0) {
            return null;
        } else if (this.heapArray.length === 1) {
            return this.heapArray.pop()!;
        }

        const root = this.heapArray[0];
        const edge = this.heapArray.pop()!;

        this.heapArray[0] = edge;
        this.downheap(0);

        return root;
    }

    upheap(index: number) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (this.heapArray[parent].distance > this.heapArray[index].distance) {
                [this.heapArray[index], this.heapArray[parent]] = [this.heapArray[parent], this.heapArray[index]];
                this.heapArray[index].heapIndex = index; // Update swapped's index
                index = parent;
            } else {
                break;
            }
        }

        this.heapArray[index].heapIndex = index; // Update original's index
    }

    downheap(index: number) {
        while (true) {
            let toSwap: number | null = null;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild < this.heapArray.length && this.heapArray[leftChild].distance < this.heapArray[index].distance) {
                toSwap = leftChild;
            }

            if (rightChild < this.heapArray.length && this.heapArray[rightChild].distance < this.heapArray[index].distance) {
                toSwap = (this.heapArray[rightChild].distance < this.heapArray[leftChild].distance) ? rightChild : toSwap;
            }

            if (toSwap === null) {
                break;
            } else {
                [this.heapArray[index], this.heapArray[toSwap]] = [this.heapArray[toSwap], this.heapArray[index]];
                this.heapArray[index].heapIndex = index; // Update swapped's index
                index = toSwap;
            }
        }

        this.heapArray[index].heapIndex = index; // Update original's index
    }
}
