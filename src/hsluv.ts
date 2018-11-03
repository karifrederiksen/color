import { Color, Rgb } from "./rgb"

/* Hsluv vs Hsl:
    http://www.hsluv.org/comparison/

    Implementation based on:
   https://github.com/dvdplm/rust-hsluv/blob/master/src/lib.rs
   https://github.com/hsluv/hsluv-csharp/blob/master/Hsluv/Hsluv.cs

   TODO: Consider having all the transformation functions taking a mutable vector as input and modifying it, rather than creating a new one.

   the pure transformation functions can be implemented on top of these efficient impure functions

   it would be a loss in performance for one-step transformations like rgb -> rgbLinear
   but it would be a performance gain for multi-step transformations such as rgb -> hsluv
*/

class Vec2 {
    // @ts-ignore
    private readonly nominal: void
    constructor(readonly x: number, readonly y: number) {}
}

class Vec3 {
    // @ts-ignore
    private readonly nominal: void
    constructor(readonly x: number, readonly y: number, readonly z: number) {}
}

export class Luv {
    // @ts-ignore
    private readonly nominal: void
    constructor(readonly l: number, readonly u: number, readonly v: number) {}
}

export class Hsluv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly s: number, readonly l: number) {}

    is(other: Hsluv): boolean {
        return this.h === other.h && this.s === other.s && this.l === other.l
    }

    with({ h, s, l }: { readonly h?: number; readonly s?: number; readonly l?: number }): Rgb {
        return new Rgb(
            h !== undefined ? h : this.h,
            s !== undefined ? s : this.s,
            l !== undefined ? l : this.l,
        )
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsluvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        const style = this.toRgb().toStyle()
        return style
    }

    toString() {
        return "Hsluv(" + this.h + ", " + this.s + ", " + this.l + ")"
    }
}

export class Hpluv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly p: number, readonly l: number) {}

    is(other: Hpluv): boolean {
        return this.h === other.h && this.p === other.p && this.l === other.l
    }

    with({ h, p, l }: { readonly h?: number; readonly p?: number; readonly l?: number }): Rgb {
        return new Rgb(
            h !== undefined ? h : this.h,
            p !== undefined ? p : this.p,
            l !== undefined ? l : this.l,
        )
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hpluvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        return this.toRgb().toStyle()
    }

    toString() {
        return "Hsv(" + this.h + ", " + this.p + ", " + this.l + ")"
    }
}

export class Lch {
    // @ts-ignore
    private readonly nominal: void
    constructor(readonly l: number, readonly c: number, readonly h: number) {}
}

export class Xyz {
    // @ts-ignore
    private readonly nominal: void
    constructor(readonly x: number, readonly y: number, readonly z: number) {}
}

interface Mat3 {
    readonly length: 3
    readonly [0]: Vec3
    readonly [1]: Vec3
    readonly [2]: Vec3
}

/*
    m =
        [ 3.240969941904521, -1.537383177570093, -0.498610760293
        , -0.96924363628087, 1.87596750150772, 0.041555057407175
        , 0.055630079696993, -0.20397695888897, 1.056971514242878
        ]

    mInv =
        [ 0.41239079926595, 0.35758433938387, 0.18048078840183
        , 0.21263900587151, 0.71516867876775, 0.072192315360733
        , 0.019330818715591, 0.11919477979462, 0.95053215224966
        ]
*/

const m: Mat3 = [
    new Vec3(3.240969941904521, -1.537383177570093, -0.498610760293),
    new Vec3(-0.96924363628087, 1.87596750150772, 0.041555057407175),
    new Vec3(0.055630079696993, -0.20397695888897, 1.056971514242878),
]

const mInv: Mat3 = [
    new Vec3(0.41239079926595, 0.35758433938387, 0.18048078840183),
    new Vec3(0.21263900587151, 0.71516867876775, 0.072192315360733),
    new Vec3(0.019330818715591, 0.11919477979462, 0.95053215224966),
]

const refY: number = 1.0

const refU: number = 0.19783000664283

const refV: number = 0.46831999493879

const kappa: number = 903.2962962

const epsilon: number = 0.0088564516

function degreesToRadians(deg: number) {
    return (deg * Math.PI) / 180.0
}

function radiansToDegrees(rad: number) {
    return (rad * 180.0) / Math.PI
}

function lengthOfRayUntilIntersect(theta: number, vec: Vec2) {
    const length = vec.y / (Math.sin(theta) - vec.x * Math.cos(theta))
    if (length < 0.0) {
        return -0.0001
    } else {
        return length
    }
}

type ZeroToTwo = 0 | 1 | 2

function getBounds(l: number): ReadonlyArray<Vec2> {
    const sub1 = (l + 16) ** 3 / 1560896
    const sub2 = sub1 > epsilon ? sub1 : l / kappa

    const bounds = new Array<Vec2>(3 * 2)

    // TODO: unwrap loop
    // can I also inline the matrix's values?
    for (let c = 0; c < 3; c++) {
        const m1 = m[c as ZeroToTwo].x
        const m2 = m[c as ZeroToTwo].y
        const m3 = m[c as ZeroToTwo].z

        for (let t = 0; t < 2; t++) {
            const top1 = (284517 * m1 - 94839 * m3) * sub2
            const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * l * sub2 - 769860 * t * l
            const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t
            bounds[c * 2 + t] = new Vec2(top1 / bottom, top2 / bottom)
        }
    }

    return bounds
}

function distance(x: number, y: number) {
    return Math.sqrt(x * x + y * y)
}

function intersectLineLine(vec1: Vec2, vec2: Vec2) {
    return (vec1.y - vec2.y) / (vec2.x - vec1.x)
}

function maxSafeChromaForL(l: number) {
    const bounds = getBounds(l)

    let min = Number.MAX_VALUE

    for (let i = 0; i < 2; ++i) {
        const line = bounds[i]

        // TODO: inline
        const x = intersectLineLine(line, new Vec2(-1 / line.x, 0))

        const length = distance(x, line.y + x * line.x)

        if (length < min) min = length
    }

    return min
}

function maxChromaForLH(l: number, h: number) {
    const hrad = (h / 360.0) * Math.PI * 2.0
    const bounds = getBounds(l)

    let min = Number.MAX_VALUE
    for (let i = 0; i < bounds.length; i++) {
        // TODO: inline
        const length = lengthOfRayUntilIntersect(hrad, bounds[i])

        if (length >= 0 && length < min) min = length
    }
    return min
}

function funF(t: number) {
    if (t > epsilon) {
        return 116 * (t / refY) ** (1 / 3) - 16
    } else {
        return (t / refY) * kappa
    }
}

function funFInv(t: number) {
    if (t > 8.0) {
        return (refY * ((t + 16.0) / 116.0)) ** 3.0
    } else {
        return (refY * t) / kappa
    }
}

function fromLinear(c: number) {
    if (c <= 0.0031308) {
        return 12.92 * c
    } else {
        return 1.055 * c ** (1.0 / 2.4) - 0.055
    }
}

export function luvToLch({ l, u, v }: Luv): Lch {
    const c = distance(u, v)
    if (c < 0.00000001) {
        return new Lch(l, c, 0)
    }
    const h = radiansToDegrees(Math.atan2(v, u))
    if (h < 0.0) {
        return new Lch(l, c, h + 360)
    } else {
        return new Lch(l, c, h)
    }
}

export function lchToLuv({ l, c, h }: Lch): Luv {
    const hrad = degreesToRadians(h)
    const u = Math.cos(hrad) * c
    const v = Math.sin(hrad) * c
    return new Luv(l, u, v)
}

function mat3map<a>(fn: (x: Vec3) => a, mat: Mat3): Readonly<[a, a, a]> {
    return [fn(mat[0]), fn(mat[1]), fn(mat[2])]
}

export function rgbToXyz(rgb: Rgb): Xyz {
    const lrgb = rgb.toLinear()
    // todo: unwrap map
    const xyz = mat3map(vec => lrgb.r * vec.x + lrgb.g * vec.y + lrgb.b * vec.z, mInv)
    return new Xyz(xyz[0], xyz[1], xyz[2])
}

export function xyzToRgb(xyz: Xyz): Rgb {
    // todo: unwrap map
    const rgb = mat3map(vec => fromLinear(xyz.x * vec.x + xyz.y * vec.y + xyz.z * vec.z), m)
    return new Rgb(rgb[0], rgb[1], rgb[2])
}

export function lchToHsluv({ l, c, h }: Lch): Hsluv {
    if (l > 99.9999999) {
        return new Hsluv(h, 0, 100)
    }
    if (l < 0.00000001) {
        return new Hsluv(h, 0, 0)
    }
    const mx = maxChromaForLH(l, h)
    const s = (c / mx) * 100
    return new Hsluv(h, s, l)
}

export function hsluvToLch({ h, s, l }: Hsluv): Lch {
    if (l > 99.9999999) {
        return new Lch(100, 0.0, h)
    }
    if (l < 0.00000001) {
        return new Lch(0, 0, h)
    }
    const mx = maxChromaForLH(l, h)
    const c = (mx / 100) * s
    return new Lch(l, c, h)
}

export function lchToHpluv({ l, c, h }: Lch): Hpluv {
    if (l > 99.9999999) {
        return new Hpluv(h, 0, 100)
    }
    if (l < 0.00000001) {
        return new Hpluv(h, 0, 0)
    }

    const mx = maxSafeChromaForL(l)
    const p = (c / mx) * 100
    return new Hpluv(h, p, l)
}

export function hpluvToLch({ h, p, l }: Hpluv): Lch {
    if (l > 99.9999999) {
        return new Lch(100, 0, h)
    }
    if (l < 0.00000001) {
        return new Lch(0, 0, h)
    }
    const mx = maxSafeChromaForL(l)
    const c = (mx / 100) * p
    return new Lch(l, c, h)
}

export function luvToRgb(luv: Luv): Rgb {
    return xyzToRgb(luvToXyz(luv))
}

export function rgbToLch(rgb: Rgb): Lch {
    return luvToLch(xyzToLuv(rgbToXyz(rgb)))
}

export function lchToRgb(lch: Lch): Rgb {
    return xyzToRgb(luvToXyz(lchToLuv(lch)))
}

export function rgbToHsluv(rgb: Rgb): Hsluv {
    return lchToHsluv(rgbToLch(rgb))
}

export function hsluvToRgb(hsluv: Hsluv): Rgb {
    return lchToRgb(hsluvToLch(hsluv))
}

export function rgbToHpluv(rgb: Rgb): Hpluv {
    return lchToHpluv(rgbToLch(rgb))
}

export function hpluvToRgb(hpluv: Hpluv): Rgb {
    return lchToRgb(hpluvToLch(hpluv))
}

export function xyzToLuv({ x, y, z }: Xyz): Luv {
    if (x === 0 && y === 0 && z === 0) {
        return new Luv(0, 0, 0)
    }
    const l = funF(y)
    if (l === 0) {
        return new Luv(0, 0, 0)
    }

    const u = 13 * l * ((4 * x) / (x + 15 * y + 3 * z) - refU)
    const v = 13 * l * ((9 * y) / (x + 15 * y + 3 * z) - refV)
    return new Luv(l, u, v)
}

export function luvToXyz({ l, u, v }: Luv): Xyz {
    if (l === 0) {
        return new Xyz(0, 0, 0)
    }

    const initU = u / (13 * l) + refU
    const initV = v / (13 * l) + refV

    const y = funFInv(l) * refY
    const x = 0 - (9 * y * initU) / ((initU - 4) * initV - initU * initV)
    const z = (9 * y - 15 * initV * y - initV * x) / (3 * initV)
    return new Xyz(x, y, z)
}

export function toGray({ r, g, b }: Rgb): Rgb {
    const gray = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b)
    return new Rgb(gray, gray, gray)
}
