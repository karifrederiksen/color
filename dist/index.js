'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Rgb {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    static fromCss(css) {
        css = css.replace(/[ \t]/, "");
        if (css.startsWith("rgb("))
            return parseRgbCss(css.substr(4, css.length - 5));
        if (css.startsWith("#")) {
            return parseHexCss(css.substr(1));
        }
        return parseHexCss(css);
    }
    is(other) {
        return this.r === other.r && this.g === other.g && this.b === other.b;
    }
    toRgb() {
        return this;
    }
    with({ r, g, b }) {
        return new Rgb(r !== undefined ? r : this.r, g !== undefined ? g : this.g, b !== undefined ? b : this.b);
    }
    toStyle() {
        return `rgb(${floatToByte(this.r)},${floatToByte(this.g)},${floatToByte(this.b)})`;
    }
    toLinear() {
        return new RgbLinear(toLinear(this.r), toLinear(this.g), toLinear(this.b));
    }
    toString() {
        return "Rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
}
class RgbLinear {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    is(other) {
        return this.r === other.r && this.g === other.g && this.b === other.b;
    }
    with({ r, g, b, }) {
        return new RgbLinear(r !== undefined ? r : this.r, g !== undefined ? g : this.g, b !== undefined ? b : this.b);
    }
    mix(pct, other) {
        return new RgbLinear(lerp(pct, this.r, other.r), lerp(pct, this.g, other.g), lerp(pct, this.b, other.b));
    }
    lighten(pct) {
        return this.mix(pct, RgbLinear.White);
    }
    darken(pct) {
        return this.mix(pct, RgbLinear.Black);
    }
    fromLinear() {
        return new Rgb(fromLinear(this.r), fromLinear(this.g), fromLinear(this.b));
    }
    toString() {
        return "LinearRgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
}
RgbLinear.White = new RgbLinear(1, 1, 1);
RgbLinear.Black = new RgbLinear(0, 0, 0);
function toLinear(c) {
    return c > 0.04045 ? Math.pow(((c + 0.055) / 1.055), 2.4) : c / 12.92;
}
function fromLinear(c) {
    return c <= 0.0031308 ? c * 12.92 : Math.pow(c * 1.055, 1.0 / 2.4) - 0.055;
}
function floatToByte(x) {
    return (x * 255.9999999) | 0;
}
function validateRgb(r, g, b) {
    if (isNaN(r) || !isFinite(r))
        return null;
    if (isNaN(g) || !isFinite(g))
        return null;
    if (isNaN(b) || !isFinite(b))
        return null;
    return new Rgb(r, g, b);
}
function parseRgbCss(css) {
    const vals = css.split(",");
    if (vals.length !== 3)
        return null;
    const r = Number.parseFloat(vals[0]) / 255;
    const g = Number.parseFloat(vals[1]) / 255;
    const b = Number.parseFloat(vals[2]) / 255;
    return validateRgb(r, g, b);
}
function parseHexCss(css) {
    if (css.length === 3) {
        const r = parseHex(css[0]) / 15;
        const g = parseHex(css[1]) / 15;
        const b = parseHex(css[2]) / 15;
        return validateRgb(r, g, b);
    }
    if (css.length === 6) {
        const r = parseHexPair(css[0], css[1]);
        const g = parseHexPair(css[2], css[3]);
        const b = parseHexPair(css[4], css[5]);
        return validateRgb(r, g, b);
    }
    return null;
}
function parseHexPair(l, r) {
    return (parseHex(l) * 16 + parseHex(r)) / 255;
}
function parseHex(hex) {
    const lcHex = hex.toLowerCase();
    switch (lcHex) {
        case "0":
            return 0;
        case "1":
            return 1;
        case "2":
            return 2;
        case "3":
            return 3;
        case "4":
            return 4;
        case "5":
            return 5;
        case "6":
            return 6;
        case "7":
            return 7;
        case "8":
            return 8;
        case "9":
            return 9;
        case "a":
            return 10;
        case "b":
            return 11;
        case "c":
            return 12;
        case "d":
            return 13;
        case "e":
            return 14;
        case "f":
            return 15;
        default:
            return NaN;
    }
}
function lerp(pct, from, to) {
    return from + pct * (to - from);
}

class Hsv {
    constructor(h, s, v) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.__cachedRgb = null;
    }
    is(other) {
        return this.h === other.h && this.s === other.s && this.v === other.v;
    }
    toRgb() {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsvToRgb(this);
        }
        return this.__cachedRgb;
    }
    toStyle() {
        return this.toRgb().toStyle();
    }
    with({ h, s, v }) {
        return new Hsv(h !== undefined ? h : this.h, s !== undefined ? s : this.s, v !== undefined ? v : this.v);
    }
    toString() {
        return "Hsv(" + this.h + ", " + this.s + ", " + this.v + ")";
    }
}
function rgbToHsv({ r, g, b }) {
    const maxValue = Math.max(r, g, b);
    const minValue = Math.min(r, g, b);
    const d = maxValue - minValue;
    const s = maxValue === 0 ? 0 : d / maxValue;
    let h;
    switch (maxValue) {
        case minValue:
            h = 0;
            break;
        case r:
            h = (g - b) / d + (g < b ? 6.0 : 0.0);
            break;
        case g:
            h = (b - r) / d + 2.0;
            break;
        default:
            h = (r - g) / d + 4.0;
            break;
    }
    return new Hsv(h / 6, s, maxValue);
}
function hsvToRgb({ h, s, v }) {
    const i = (h * 6) | 0;
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r;
    let g;
    let b;
    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default:
            r = v;
            g = p;
            b = q;
            break;
    }
    return new Rgb(r, g, b);
}

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
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Luv {
    constructor(l, u, v) {
        this.l = l;
        this.u = u;
        this.v = v;
    }
}
class Hsluv {
    constructor(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.__cachedRgb = null;
    }
    is(other) {
        return this.h === other.h && this.s === other.s && this.l === other.l;
    }
    with({ h, s, l }) {
        return new Hsluv(h !== undefined ? h : this.h, s !== undefined ? s : this.s, l !== undefined ? l : this.l);
    }
    toRgb() {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsluvToRgb(this);
        }
        return this.__cachedRgb;
    }
    toStyle() {
        const style = this.toRgb().toStyle();
        return style;
    }
    toString() {
        return "Hsluv(" + this.h + ", " + this.s + ", " + this.l + ")";
    }
}
class Hpluv {
    constructor(h, p, l) {
        this.h = h;
        this.p = p;
        this.l = l;
        this.__cachedRgb = null;
    }
    is(other) {
        return this.h === other.h && this.p === other.p && this.l === other.l;
    }
    with({ h, p, l }) {
        return new Hpluv(h !== undefined ? h : this.h, p !== undefined ? p : this.p, l !== undefined ? l : this.l);
    }
    toRgb() {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hpluvToRgb(this);
        }
        return this.__cachedRgb;
    }
    toStyle() {
        return this.toRgb().toStyle();
    }
    toString() {
        return "Hsv(" + this.h + ", " + this.p + ", " + this.l + ")";
    }
}
class Lch {
    constructor(l, c, h) {
        this.l = l;
        this.c = c;
        this.h = h;
    }
}
class Xyz {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
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
const m00 = 3.240969941904521;
const m01 = -1.537383177570093;
const m02 = -0.498610760293;
const m10 = -0.96924363628087;
const m11 = 1.87596750150772;
const m12 = 0.041555057407175;
const m20 = 0.055630079696993;
const m21 = -0.20397695888897;
const m22 = 1.056971514242878;
const mInv00 = 0.41239079926595;
const mInv01 = 0.35758433938387;
const mInv02 = 0.18048078840183;
const mInv10 = 0.21263900587151;
const mInv11 = 0.71516867876775;
const mInv12 = 0.072192315360733;
const mInv20 = 0.019330818715591;
const mInv21 = 0.11919477979462;
const mInv22 = 0.95053215224966;
const refY = 1.0;
const refU = 0.19783000664283;
const refV = 0.46831999493879;
const kappa = 903.2962962;
const epsilon = 0.0088564516;
function degreesToRadians(deg) {
    return (deg * Math.PI) / 180.0;
}
function radiansToDegrees(rad) {
    return (rad * 180.0) / Math.PI;
}
function bound(m1, m2, m3, l, sub2, t) {
    const top1 = (284517 * m1 - 94839 * m3) * sub2;
    const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * l * sub2 - 769860 * t * l;
    const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
    return new Vec2(top1 / bottom, top2 / bottom);
}
function getBounds(l) {
    const sub1 = Math.pow((l + 16), 3) / 1560896;
    const sub2 = sub1 > epsilon ? sub1 : l / kappa;
    const bounds = [
        bound(m00, m01, m02, l, sub2, 0),
        bound(m00, m01, m02, l, sub2, 1),
        bound(m10, m11, m12, l, sub2, 0),
        bound(m10, m11, m12, l, sub2, 1),
        bound(m20, m21, m22, l, sub2, 0),
        bound(m20, m21, m22, l, sub2, 1),
    ];
    return bounds;
}
function maxSafeChromaForL(l) {
    const bounds = getBounds(l);
    let min = Number.MAX_VALUE;
    for (let i = 0; i < 2; ++i) {
        const line = bounds[i];
        const x = line.y / ((-1 / line.x) - line.x);
        const y = line.y + x * line.x;
        const length = Math.sqrt(x * x + y * y);
        if (length < min)
            min = length;
    }
    return min;
}
function maxChromaForLH(l, h) {
    const hrad = (h / 360.0) * Math.PI * 2.0;
    const bounds = getBounds(l);
    let min = Number.MAX_VALUE;
    for (let i = 0; i < bounds.length; i++) {
        const vec = bounds[i];
        const length = vec.y / (Math.sin(hrad) - vec.x * Math.cos(hrad));
        if (length >= 0 && length < min) {
            min = length;
        }
    }
    return min;
}
function funF(t) {
    if (t > epsilon) {
        return 116 * Math.pow((t / refY), (1 / 3)) - 16;
    }
    else {
        return (t / refY) * kappa;
    }
}
function funFInv(t) {
    if (t > 8.0) {
        return Math.pow((refY * ((t + 16.0) / 116.0)), 3.0);
    }
    else {
        return (refY * t) / kappa;
    }
}
function luvToLch({ l, u, v }) {
    const c = Math.sqrt(u * u + v * v);
    if (c < 0.00000001) {
        return new Lch(l, c, 0);
    }
    const h = radiansToDegrees(Math.atan2(v, u));
    if (h < 0.0) {
        return new Lch(l, c, h + 360);
    }
    else {
        return new Lch(l, c, h);
    }
}
function lchToLuv({ l, c, h }) {
    const hrad = degreesToRadians(h);
    const u = Math.cos(hrad) * c;
    const v = Math.sin(hrad) * c;
    return new Luv(l, u, v);
}
function rgbToXyz(rgb) {
    const lrgb = rgb.toLinear();
    const x = lrgb.r * mInv00 + lrgb.g * mInv01 + lrgb.b * mInv02;
    const y = lrgb.r * mInv10 + lrgb.g * mInv11 + lrgb.b * mInv12;
    const z = lrgb.r * mInv20 + lrgb.g * mInv21 + lrgb.b * mInv22;
    return new Xyz(x, y, z);
}
function fromLinear$1(c) {
    if (c <= 0.0031308) {
        return 12.92 * c;
    }
    else {
        return 1.055 * Math.pow(c, (1.0 / 2.4)) - 0.055;
    }
}
function xyzToRgb(xyz) {
    const r = fromLinear$1(xyz.x * m00 + xyz.y * m01 + xyz.z * m02);
    const g = fromLinear$1(xyz.x * m10 + xyz.y * m11 + xyz.z * m12);
    const b = fromLinear$1(xyz.x * m20 + xyz.y * m21 + xyz.z * m22);
    return new Rgb(r, g, b);
}
function lchToHsluv({ l, c, h }) {
    if (l > 99.9999999) {
        return new Hsluv(h, 0, 100);
    }
    if (l < 0.00000001) {
        return new Hsluv(h, 0, 0);
    }
    const mx = maxChromaForLH(l, h);
    const s = (c / mx) * 100;
    return new Hsluv(h, s, l);
}
function hsluvToLch({ h, s, l }) {
    if (l > 99.9999999) {
        return new Lch(100, 0.0, h);
    }
    if (l < 0.00000001) {
        return new Lch(0, 0, h);
    }
    const mx = maxChromaForLH(l, h);
    const c = (mx / 100) * s;
    return new Lch(l, c, h);
}
function lchToHpluv({ l, c, h }) {
    if (l > 99.9999999) {
        return new Hpluv(h, 0, 100);
    }
    if (l < 0.00000001) {
        return new Hpluv(h, 0, 0);
    }
    const mx = maxSafeChromaForL(l);
    const p = (c / mx) * 100;
    return new Hpluv(h, p, l);
}
function hpluvToLch({ h, p, l }) {
    if (l > 99.9999999) {
        return new Lch(100, 0, h);
    }
    if (l < 0.00000001) {
        return new Lch(0, 0, h);
    }
    const mx = maxSafeChromaForL(l);
    const c = (mx / 100) * p;
    return new Lch(l, c, h);
}
function luvToRgb(luv) {
    return xyzToRgb(luvToXyz(luv));
}
function rgbToLch(rgb) {
    return luvToLch(xyzToLuv(rgbToXyz(rgb)));
}
function lchToRgb(lch) {
    return xyzToRgb(luvToXyz(lchToLuv(lch)));
}
function rgbToHsluv(rgb) {
    return lchToHsluv(rgbToLch(rgb));
}
function hsluvToRgb(hsluv) {
    return lchToRgb(hsluvToLch(hsluv));
}
function rgbToHpluv(rgb) {
    return lchToHpluv(rgbToLch(rgb));
}
function hpluvToRgb(hpluv) {
    return lchToRgb(hpluvToLch(hpluv));
}
function xyzToLuv({ x, y, z }) {
    if (x === 0 && y === 0 && z === 0) {
        return new Luv(0, 0, 0);
    }
    const l = funF(y);
    if (l === 0) {
        return new Luv(0, 0, 0);
    }
    const u = 13 * l * ((4 * x) / (x + 15 * y + 3 * z) - refU);
    const v = 13 * l * ((9 * y) / (x + 15 * y + 3 * z) - refV);
    return new Luv(l, u, v);
}
function luvToXyz({ l, u, v }) {
    if (l === 0) {
        return new Xyz(0, 0, 0);
    }
    const initU = u / (13 * l) + refU;
    const initV = v / (13 * l) + refV;
    const y = funFInv(l) * refY;
    const x = 0 - (9 * y * initU) / ((initU - 4) * initV - initU * initV);
    const z = (9 * y - 15 * initV * y - initV * x) / (3 * initV);
    return new Xyz(x, y, z);
}
function toGray({ r, g, b }) {
    const gray = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
    return new Rgb(gray, gray, gray);
}

exports.Rgb = Rgb;
exports.RgbLinear = RgbLinear;
exports.Hsv = Hsv;
exports.rgbToHsv = rgbToHsv;
exports.hsvToRgb = hsvToRgb;
exports.Luv = Luv;
exports.Hsluv = Hsluv;
exports.Hpluv = Hpluv;
exports.Lch = Lch;
exports.Xyz = Xyz;
exports.luvToLch = luvToLch;
exports.lchToLuv = lchToLuv;
exports.rgbToXyz = rgbToXyz;
exports.xyzToRgb = xyzToRgb;
exports.lchToHsluv = lchToHsluv;
exports.hsluvToLch = hsluvToLch;
exports.lchToHpluv = lchToHpluv;
exports.hpluvToLch = hpluvToLch;
exports.luvToRgb = luvToRgb;
exports.rgbToLch = rgbToLch;
exports.lchToRgb = lchToRgb;
exports.rgbToHsluv = rgbToHsluv;
exports.hsluvToRgb = hsluvToRgb;
exports.rgbToHpluv = rgbToHpluv;
exports.hpluvToRgb = hpluvToRgb;
exports.xyzToLuv = xyzToLuv;
exports.luvToXyz = luvToXyz;
exports.toGray = toGray;
//# sourceMappingURL=index.js.map
