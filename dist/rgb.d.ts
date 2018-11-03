export interface Color {
    toRgb(): Rgb;
    toStyle(): string;
}
export declare class Rgb implements Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    static fromCss(css: string): Rgb | null;
    constructor(r: number, g: number, b: number);
    is(other: Rgb): boolean;
    toRgb(): Rgb;
    with({ r, g, b }: {
        readonly r?: number;
        readonly g?: number;
        readonly b?: number;
    }): Rgb;
    toStyle(): string;
    toLinear(): RgbLinear;
    toString(): string;
}
export declare class RgbLinear {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    static White: RgbLinear;
    static Black: RgbLinear;
    constructor(r: number, g: number, b: number);
    is(other: RgbLinear): boolean;
    with({ r, g, b }: {
        readonly r?: number;
        readonly g?: number;
        readonly b?: number;
    }): Rgb;
    mix(pct: number, other: RgbLinear): RgbLinear;
    lighten(pct: number): RgbLinear;
    darken(pct: number): RgbLinear;
    fromLinear(): Rgb;
    toString(): string;
}
