import { Color, Rgb } from "./rgb";
export declare class Hsv implements Color {
    readonly h: number;
    readonly s: number;
    readonly v: number;
    private __cachedRgb;
    constructor(h: number, s: number, v: number);
    is(other: Hsv): boolean;
    toRgb(): Rgb;
    toStyle(): string;
    with({ h, s, v }: {
        readonly h?: number;
        readonly s?: number;
        readonly v?: number;
    }): Hsv;
    toString(): string;
}
export declare function rgbToHsv({ r, g, b }: Rgb): Hsv;
export declare function hsvToRgb({ h, s, v }: Hsv): Rgb;
