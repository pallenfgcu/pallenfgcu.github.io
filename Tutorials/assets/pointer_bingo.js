/*
 * Pointer Bingo
 * Template-based version
 *
 * Memory layout:
 *   0x00 - 0x02 : ptr1, ptr2, ptr3
 *   0x03 - 0x06 : var1, var2, var3, var4
 *   0x07 - 0x12 : array[0] through array[11]
 */

const MIN_VALUE = 0;
const MAX_VALUE = 15;

const POINTER_COUNT = 3;
const VARIABLE_COUNT = 4;
const ARRAY_COUNT = 12;
const MEMORY_SIZE = POINTER_COUNT + VARIABLE_COUNT + ARRAY_COUNT;

const POINTER_START = 0;
const VARIABLE_START = POINTER_START + POINTER_COUNT;
const ARRAY_START = VARIABLE_START + VARIABLE_COUNT;

class PointerBingo {
    constructor(maxValue = MAX_VALUE) {
        this.round = 0;
        this.maxValue = maxValue;
        this.memory = [];
        this.lastInstructionWasValid = true;
        this.lastChangedAddress = null;
        this.seenPointeeValues = new Set();

        this.resetMemory();
    }

    resetMemory() {
        this.round = 0;
        this.memory = [];
        this.lastInstructionWasValid = true;
        this.lastChangedAddress = null;
        this.seenPointeeValues.clear();

        for (let i = 0; i < POINTER_COUNT; i++) {
            this.memory.push(randBetween(VARIABLE_START, MEMORY_SIZE - 1));
        }

        for (let i = POINTER_COUNT; i < MEMORY_SIZE; i++) {
            this.memory.push(randBetween(MIN_VALUE, this.maxValue));
        }

        this.recordCurrentPointeeValues();
    }

    nextInstruction() {
        this.round++;
        this.lastChangedAddress = null;

        const template = this.chooseTemplate();
        const result = template.call(this);

        this.lastInstructionWasValid = result.valid;

        if (result.valid && typeof result.apply === 'function') {
            result.apply();
            this.recordCurrentPointeeValues();
        }

        return result.text;
    }

    chooseTemplate() {
        const templates = [
            { weight: 18, fn: this.templateSetPointeeToLiteral },
            { weight: 14, fn: this.templateAddToPointee },
            { weight: 10, fn: this.templateSubtractFromPointee },
            { weight: 8,  fn: this.templateIncrementPointee },
            { weight: 8,  fn: this.templateDecrementPointee },
            { weight: 10, fn: this.templateSetPointeeFromVariable },
            { weight: 10, fn: this.templateSetVariableFromPointee },
            { weight: 12, fn: this.templatePointerToVariable },
            { weight: 12, fn: this.templatePointerToArray },
            { weight: 6,  fn: this.templateCopyPointer },
            { weight: 12, fn: this.templateInvalidInstruction }
        ];

        const total = templates.reduce((sum, entry) => sum + entry.weight, 0);
        let pick = randBetween(1, total);

        for (const entry of templates) {
            pick -= entry.weight;
            if (pick <= 0) {
                return entry.fn;
            }
        }

        return templates[0].fn;
    }

    templateSetPointeeToLiteral() {
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);
        const value = this.chooseUsefulValue();

        return {
            valid: this.isDataAddress(address),
            text: `*ptr${p + 1} = 0x${toHex(value)};`,
            apply: () => this.setMemory(address, value)
        };
    }

    templateAddToPointee() {
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);
        const delta = randBetween(1, 4);

        return {
            valid: this.isDataAddress(address),
            text: `*ptr${p + 1} += ${delta};`,
            apply: () => this.setMemory(address, clampValue(this.getMemory(address) + delta, MIN_VALUE, this.maxValue))
        };
    }

    templateSubtractFromPointee() {
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);
        const delta = randBetween(1, 4);

        return {
            valid: this.isDataAddress(address),
            text: `*ptr${p + 1} -= ${delta};`,
            apply: () => this.setMemory(address, clampValue(this.getMemory(address) - delta, MIN_VALUE, this.maxValue))
        };
    }

    templateIncrementPointee() {
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);

        return {
            valid: this.isDataAddress(address),
            text: `(*ptr${p + 1})++;`,
            apply: () => this.setMemory(address, clampValue(this.getMemory(address) + 1, MIN_VALUE, this.maxValue))
        };
    }

    templateDecrementPointee() {
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);

        return {
            valid: this.isDataAddress(address),
            text: `(*ptr${p + 1})--;`,
            apply: () => this.setMemory(address, clampValue(this.getMemory(address) - 1, MIN_VALUE, this.maxValue))
        };
    }

    templateSetPointeeFromVariable() {
        const p = this.randPointerIndex();
        const v = this.randVariableIndex();
        const address = this.getPointerAddress(p);
        const value = this.getVariableValue(v);

        return {
            valid: this.isDataAddress(address),
            text: `*ptr${p + 1} = var${v + 1};`,
            apply: () => this.setMemory(address, value)
        };
    }

    templateSetVariableFromPointee() {
        const v = this.randVariableIndex();
        const p = this.randPointerIndex();
        const address = this.getPointerAddress(p);
        const value = this.getMemory(address);

        return {
            valid: this.isDataAddress(address),
            text: `var${v + 1} = *ptr${p + 1};`,
            apply: () => this.setVariableValue(v, value)
        };
    }

    templatePointerToVariable() {
        const p = this.randPointerIndex();
        const v = this.randVariableIndex();
        const address = this.variableAddress(v);

        return {
            valid: true,
            text: `ptr${p + 1} = &var${v + 1};`,
            apply: () => this.setPointerAddress(p, address)
        };
    }

    templatePointerToArray() {
        const p = this.randPointerIndex();
        const a = this.randArrayIndex();
        const address = this.arrayAddress(a);

        return {
            valid: true,
            text: `ptr${p + 1} = &array[${a}];`,
            apply: () => this.setPointerAddress(p, address)
        };
    }

    templateCopyPointer() {
        const destination = this.randPointerIndex();
        const source = this.randPointerIndex(destination);
        const address = this.getPointerAddress(source);

        return {
            valid: true,
            text: `ptr${destination + 1} = ptr${source + 1};`,
            apply: () => this.setPointerAddress(destination, address)
        };
    }

    templateInvalidInstruction() {
        const p = this.randPointerIndex();
        const v = this.randVariableIndex();
        const a = this.randArrayIndex();
        const value = randBetween(MIN_VALUE, this.maxValue);

        const invalids = [
            `&ptr${p + 1} = var${v + 1};`,
            `*var${v + 1} = 0x${toHex(value)};`,
            `ptr${p + 1} = var${v + 1};`,
            `*ptr${p + 1} = &var${v + 1};`,
            `ptr${p + 1} += &var${v + 1};`,
            `array[${a}] = &ptr${p + 1};`,
            `&array[${a}] = 0x${toHex(value)};`
        ];

        return {
            valid: false,
            text: invalids[randBetween(0, invalids.length - 1)],
            apply: null
        };
    }

    getMemory(address) {
        return this.memory[address];
    }

    setMemory(address, value) {
        if (address < 0 || address >= this.memory.length) {
            return;
        }

        this.memory[address] = clampValue(value, MIN_VALUE, this.maxValue);
        this.lastChangedAddress = address;
    }

    getPointerAddress(pointerIndex) {
        return this.memory[POINTER_START + pointerIndex];
    }

    setPointerAddress(pointerIndex, address) {
        if (address < 0 || address >= MEMORY_SIZE) {
            return;
        }

        const memoryAddress = POINTER_START + pointerIndex;
        this.memory[memoryAddress] = address;
        this.lastChangedAddress = memoryAddress;
    }

    getVariableValue(variableIndex) {
        return this.memory[this.variableAddress(variableIndex)];
    }

    setVariableValue(variableIndex, value) {
        this.setMemory(this.variableAddress(variableIndex), value);
    }

    getArrayValue(arrayIndex) {
        return this.memory[this.arrayAddress(arrayIndex)];
    }

    setArrayValue(arrayIndex, value) {
        this.setMemory(this.arrayAddress(arrayIndex), value);
    }

    variableAddress(variableIndex) {
        return VARIABLE_START + variableIndex;
    }

    arrayAddress(arrayIndex) {
        return ARRAY_START + arrayIndex;
    }

    isPointerAddress(address) {
        return address >= POINTER_START && address < VARIABLE_START;
    }

    isVariableAddress(address) {
        return address >= VARIABLE_START && address < ARRAY_START;
    }

    isArrayAddress(address) {
        return address >= ARRAY_START && address < MEMORY_SIZE;
    }

    isDataAddress(address) {
        return this.isVariableAddress(address) || this.isArrayAddress(address);
    }

    recordCurrentPointeeValues() {
        for (let p = 0; p < POINTER_COUNT; p++) {
            const address = this.getPointerAddress(p);
            if (this.isDataAddress(address)) {
                this.seenPointeeValues.add(this.getMemory(address));
            }
        }
    }

    chooseUsefulValue() {
        const unseen = [];

        for (let value = MIN_VALUE; value <= this.maxValue; value++) {
            if (!this.seenPointeeValues.has(value)) {
                unseen.push(value);
            }
        }

        if (unseen.length > 0 && randBetween(0, 99) < 75) {
            return unseen[randBetween(0, unseen.length - 1)];
        }

        return randBetween(MIN_VALUE, this.maxValue);
    }

    randPointerIndex(exclude = -1) {
        return randIndex(POINTER_COUNT, exclude);
    }

    randVariableIndex(exclude = -1) {
        return randIndex(VARIABLE_COUNT, exclude);
    }

    randArrayIndex(exclude = -1) {
        return randIndex(ARRAY_COUNT, exclude);
    }

    getPointerReference(index = 0) {
        return this.getPointerAddress(index);
    }

    setPointerReference(index, reference) {
        this.setPointerAddress(index, reference);
    }

    getPointerValue(index = 0) {
        const address = this.getPointerAddress(index);
        return this.getMemory(address);
    }

    setPointerValue(index, value) {
        const address = this.getPointerAddress(index);
        this.setMemory(address, value);
    }

    getArrayFirstIndex() {
        return ARRAY_START;
    }

    getArrayLength() {
        return ARRAY_COUNT;
    }
}

function randIndex(count, exclude = -1) {
    if (count <= 1 && exclude === 0) {
        return 0;
    }

    let value = -1;

    do {
        value = randBetween(0, count - 1);
    } while (value === exclude);

    return value;
}

function randBetween(min = 0, max = 2) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function toHex(value) {
    const num = parseInt(value, 10);

    if (Number.isNaN(num)) {
        return '0';
    }

    return num.toString(16).toUpperCase();
}