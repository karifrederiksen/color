import { Color, Rgb } from "./rgb"

export class Hsv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly s: number, readonly v: number) {}

    is(other: Hsv): boolean {
        return this.h === other.h && this.s === other.s && this.v === other.v
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        return this.toRgb().toStyle()
    }

    with({ h, s, v }: { readonly h?: number; readonly s?: number; readonly v?: number }): Hsv {
        return new Hsv(
            h !== undefined ? h : this.h,
            s !== undefined ? s : this.s,
            v !== undefined ? v : this.v,
        )
    }

    toString() {
        return "Hsv(" + this.h + ", " + this.s + ", " + this.v + ")"
    }
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
    const maxValue = Math.max(r, g, b)
    const minValue = Math.min(r, g, b)
    const d = maxValue - minValue
    const s = maxValue === 0 ? 0 : d / maxValue
    let h: number

    switch (maxValue) {
        case minValue:
            h = 0
            break
        case r:
            h = (g - b) / d + (g < b ? 6.0 : 0.0)
            break
        case g:
            h = (b - r) / d + 2.0
            break
        default:
            h = (r - g) / d + 4.0
            break
    }
    return new Hsv(h / 6, s, maxValue)
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
    const i = (h * 6) | 0
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r: number
    let g: number
    let b: number
    switch (i % 6) {
        case 0:
            r = v
            g = t
            b = p
            break
        case 1:
            r = q
            g = v
            b = p
            break
        case 2:
            r = p
            g = v
            b = t
            break
        case 3:
            r = p
            g = q
            b = v
            break
        case 4:
            r = t
            g = p
            b = v
            break
        default:
            r = v
            g = p
            b = q
            break
    }
    return new Rgb(r, g, b)
}
