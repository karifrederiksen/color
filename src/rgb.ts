export interface Color {
    toRgb(): Rgb
    toStyle(): string
}

export class Rgb implements Color {
    static fromCss(css: string): Rgb | null {
        css = css.replace(/[ \t]/, "")
        if (css.startsWith("rgb(")) return parseRgbCss(css.substr(4, css.length - 5))
        if (css.startsWith("#")) {
            return parseHexCss(css.substr(1))
        }
        return parseHexCss(css)
    }

    constructor(readonly r: number, readonly g: number, readonly b: number) {}

    is(other: Rgb): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toRgb(): Rgb {
        return this
    }

    with({ r, g, b }: { readonly r?: number; readonly g?: number; readonly b?: number }): Rgb {
        return new Rgb(
            r !== undefined ? r : this.r,
            g !== undefined ? g : this.g,
            b !== undefined ? b : this.b,
        )
    }

    toStyle(): string {
        return `rgb(${floatToByte(this.r)},${floatToByte(this.g)},${floatToByte(this.b)})`
    }

    toLinear(): RgbLinear {
        return new RgbLinear(toLinear(this.r), toLinear(this.g), toLinear(this.b))
    }

    toString(): string {
        return "Rgb(" + this.r + ", " + this.g + ", " + this.b + ")"
    }
}

export class RgbLinear {
    static White = new RgbLinear(1, 1, 1)
    static Black = new RgbLinear(0, 0, 0)

    constructor(readonly r: number, readonly g: number, readonly b: number) {}

    is(other: RgbLinear): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    with({
        r,
        g,
        b,
    }: {
        readonly r?: number
        readonly g?: number
        readonly b?: number
    }): RgbLinear {
        return new RgbLinear(
            r !== undefined ? r : this.r,
            g !== undefined ? g : this.g,
            b !== undefined ? b : this.b,
        )
    }

    mix(pct: number, other: RgbLinear): RgbLinear {
        return new RgbLinear(
            lerp(pct, this.r, other.r),
            lerp(pct, this.g, other.g),
            lerp(pct, this.b, other.b),
        )
    }

    lighten(pct: number): RgbLinear {
        return this.mix(pct, RgbLinear.White)
    }

    darken(pct: number): RgbLinear {
        return this.mix(pct, RgbLinear.Black)
    }

    fromLinear(): Rgb {
        return new Rgb(fromLinear(this.r), fromLinear(this.g), fromLinear(this.b))
    }

    toString(): string {
        return "LinearRgb(" + this.r + ", " + this.g + ", " + this.b + ")"
    }
}

function toLinear(c: number) {
    return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92
}

function fromLinear(c: number) {
    return c <= 0.0031308 ? c * 12.92 : Math.pow(c * 1.055, 1.0 / 2.4) - 0.055
}

function floatToByte(x: number): number {
    return (x * 255.9999999) | 0
}

function validateRgb(r: number, g: number, b: number): Rgb | null {
    if (isNaN(r) || !isFinite(r)) return null
    if (isNaN(g) || !isFinite(g)) return null
    if (isNaN(b) || !isFinite(b)) return null

    return new Rgb(r, g, b)
}

function parseRgbCss(css: string): Rgb | null {
    const vals = css.split(",")
    if (vals.length !== 3) return null

    const r = Number.parseFloat(vals[0]) / 255
    const g = Number.parseFloat(vals[1]) / 255
    const b = Number.parseFloat(vals[2]) / 255

    return validateRgb(r, g, b)
}

function parseHexCss(css: string): Rgb | null {
    if (css.length === 3) {
        const r = parseHex(css[0]) / 15
        const g = parseHex(css[1]) / 15
        const b = parseHex(css[2]) / 15
        return validateRgb(r, g, b)
    }
    if (css.length === 6) {
        const r = parseHexPair(css[0], css[1])
        const g = parseHexPair(css[2], css[3])
        const b = parseHexPair(css[4], css[5])
        return validateRgb(r, g, b)
    }
    return null
}

function parseHexPair(l: string, r: string): number {
    return (parseHex(l) * 16 + parseHex(r)) / 255
}

function parseHex(hex: string): number {
    const lcHex = hex.toLowerCase()
    switch (lcHex) {
        case "0":
            return 0
        case "1":
            return 1
        case "2":
            return 2
        case "3":
            return 3
        case "4":
            return 4
        case "5":
            return 5
        case "6":
            return 6
        case "7":
            return 7
        case "8":
            return 8
        case "9":
            return 9
        case "a":
            return 10
        case "b":
            return 11
        case "c":
            return 12
        case "d":
            return 13
        case "e":
            return 14
        case "f":
            return 15
        default:
            return NaN
    }
}

function lerp(pct: number, from: number, to: number): number {
    return from + pct * (to - from)
}
