//adapted from https://www.geeksforgeeks.org/min-heap-in-javascript/

export class Heap<T> {
  protected heap: T[];
  protected lessThan: (a: T, b: T) => boolean; //a < b => min heap
  constructor(lessThan: (a: T, b: T) => boolean, ...initialValues: T[]) {
    this.heap = [];
    this.lessThan = lessThan;

    initialValues.forEach((v) => this.add(v));
  }

  // Helper Methods
  protected getLeftChildIndex(parentIndex: number) {
    return 2 * parentIndex + 1;
  }
  protected getRightChildIndex(parentIndex: number) {
    return 2 * parentIndex + 2;
  }
  protected getParentIndex(childIndex: number) {
    return Math.floor((childIndex - 1) / 2);
  }
  protected hasLeftChild(index: number) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }
  protected hasRightChild(index: number) {
    return this.getRightChildIndex(index) < this.heap.length;
  }
  protected hasParent(index: number) {
    return this.getParentIndex(index) >= 0;
  }
  protected leftChild(index: number) {
    return this.heap[this.getLeftChildIndex(index)];
  }
  protected rightChild(index: number) {
    return this.heap[this.getRightChildIndex(index)];
  }
  protected parent(index: number) {
    return this.heap[this.getParentIndex(index)];
  }

  // Functions to create Min Heap

  protected swap(indexOne: number, indexTwo: number) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }

  // Removing an element will remove the
  // top element with highest priority then
  // heapifyDown will be called
  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }

  add(item: T) {
    this.heap.push(item);
    this.heapifyUp();
  }

  protected heapifyUp() {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.lessThan(this.heap[index], this.parent(index))
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  protected heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.lessThan(this.rightChild(index), this.leftChild(index))
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (this.lessThan(this.heap[index], this.heap[smallerChildIndex])) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }

  printHeap() {
    var heap = ` ${this.heap[0]} `;
    for (var i = 1; i < this.heap.length; i++) {
      heap += ` ${this.heap[i]} `;
    }
    console.log(heap);
  }
}
