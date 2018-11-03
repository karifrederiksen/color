import { Color, Rgb } from "./rgb";
export declare class Luv {
    readonly l: number;
    readonly u: number;
    readonly v: number;
    private readonly nominal;
    constructor(l: number, u: number, v: number);
}
export declare class Hsluv implements Color {
    readonly h: number;
    readonly s: number;
    readonly l: number;
    private __cachedRgb;
    constructor(h: number, s: number, l: number);
    is(other: Hsluv): boolean;
    with({ h, s, l }: {
        readonly h?: number;
        readonly s?: number;
        readonly l?: number;
    }): Hsluv;
    toRgb(): Rgb;
    toStyle(): string;
    toString(): string;
}
export declare class Hpluv implements Color {
    readonly h: number;
    readonly p: number;
    readonly l: number;
    private __cachedRgb;
    constructor(h: number, p: number, l: number);
    is(other: Hpluv): boolean;
    with({ h, p, l }: {
        readonly h?: number;
        readonly p?: number;
        readonly l?: number;
    }): Hpluv;
    toRgb(): Rgb;
    toStyle(): string;
    toString(): string;
}
export declare class Lch {
    readonly l: number;
    readonly c: number;
    readonly h: number;
    private readonly nominal;
    constructor(l: number, c: number, h: number);
}
export declare class Xyz {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    private readonly nominal;
    constructor(x: number, y: number, z: number);
}
export declare function luvToLch({ l, u, v }: Luv): Lch;
export declare function lchToLuv({ l, c, h }: Lch): Luv;
export declare function rgbToXyz(rgb: Rgb): Xyz;
export declare function xyzToRgb(xyz: Xyz): Rgb;
export declare function lchToHsluv({ l, c, h }: Lch): Hsluv;
export declare function hsluvToLch({ h, s, l }: Hsluv): Lch;
export declare function lchToHpluv({ l, c, h }: Lch): Hpluv;
export declare function hpluvToLch({ h, p, l }: Hpluv): Lch;
export declare function luvToRgb(luv: Luv): Rgb;
export declare function rgbToLch(rgb: Rgb): Lch;
export declare function lchToRgb(lch: Lch): Rgb;
export declare function rgbToHsluv(rgb: Rgb): Hsluv;
export declare function hsluvToRgb(hsluv: Hsluv): Rgb;
export declare function rgbToHpluv(rgb: Rgb): Hpluv;
export declare function hpluvToRgb(hpluv: Hpluv): Rgb;
export declare function xyzToLuv({ x, y, z }: Xyz): Luv;
export declare function luvToXyz({ l, u, v }: Luv): Xyz;
export declare function toGray({ r, g, b }: Rgb): Rgb;
