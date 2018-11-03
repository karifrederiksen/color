import { expect } from "chai"
import * as Color from "./index"
import * as Io from "io-ts"

type Vec3 = [number, number, number]

function vec3ToRgb([r, g, b]: Vec3): Color.Rgb {
    return new Color.Rgb(r, g, b)
}

function vec3Tolch([l, c, h]: Vec3): Color.Rgb {
    return Color.lchToRgb(new Color.Lch(l, c, h))
}

function vec3ToLuv([l, u, v]: Vec3): Color.Rgb {
    return Color.luvToRgb(new Color.Luv(l, u, v))
}

function vec3ToXyz([x, y, z]: Vec3): Color.Rgb {
    return Color.xyzToRgb(new Color.Xyz(x, y, z))
}

function vec3ToHpluv([h, p, l]: Vec3): Color.Rgb {
    return Color.hpluvToRgb(new Color.Hpluv(h, p, l))
}

function vec3ToHsluv([h, s, l]: Vec3): Color.Rgb {
    return Color.hsluvToRgb(new Color.Hsluv(h, s, l))
}

const threeNumbers = Io.tuple([Io.number, Io.number, Io.number])

const colorSample = Io.type({
    rgb: threeNumbers, //Decode.map(threeNumbers, ([r, g, b]) => new Color.Rgb(r, g, b)),
    lch: threeNumbers, //Decode.map(threeNumbers, ([l, c, h]) => new Color.Lch(l, c, h)),
    luv: threeNumbers, //Decode.map(threeNumbers, ([l, u, v]) => new Color.Luv(l, u, v)),
    xyz: threeNumbers, //Decode.map(threeNumbers, ([x, y, z]) => new Color.Xyz(x, y, z)),
    hpluv: threeNumbers, //Decode.map(threeNumbers, ([h, p, l]) => new Color.Hpluv(h, p, l)),
    hsluv: threeNumbers, //Decode.map(threeNumbers, ([h, s, l]) => new Color.Hsluv(h, s, l)),
})

describe("Color transforms work according to the sample data", () => {
    const roughEq = (l: number, r: number) => {
        const marginOfError = 0.00001
        const d = l - r
        return d < marginOfError && d > -marginOfError
    }

    const rgbRoughEq = (l: Color.Rgb, r: Color.Rgb) =>
        roughEq(l.r, r.r) && roughEq(l.g, r.g) && roughEq(l.b, r.b)

    const samplesRoughEq = (l: ReadonlyArray<Color.Rgb>, r: ReadonlyArray<Color.Rgb>) => {
        if (l.length !== r.length) return false

        for (let i = 0; i < l.length; i++) {
            if (!rgbRoughEq(l[i], r[i])) {
                return false
            }
        }
        return true
    }
    let samples: Readonly<{
        hex: ReadonlyArray<Color.Rgb | null>
        rgb: ReadonlyArray<Color.Rgb>
        lch: ReadonlyArray<Color.Rgb>
        luv: ReadonlyArray<Color.Rgb>
        xyz: ReadonlyArray<Color.Rgb>
        hpluv: ReadonlyArray<Color.Rgb>
        hsluv: ReadonlyArray<Color.Rgb>
    }>
    it("All samples are successfully extracted from the json blob", () => {
        expect(() => {
            samples = Io.dictionary(Io.string, colorSample)
                .decode(require("./color-samples.json"))
                .bimap(
                    _ => {
                        throw "failed to decode"
                    },
                    dict => {
                        const keys = Object.keys(dict)
                        return {
                            hex: keys.map(key => Color.Rgb.fromCss(key)),
                            rgb: keys.map(key => vec3ToRgb(dict[key].rgb)),
                            lch: keys.map(key => vec3Tolch(dict[key].lch)),
                            luv: keys.map(key => vec3ToLuv(dict[key].luv)),
                            xyz: keys.map(key => vec3ToXyz(dict[key].xyz)),
                            hpluv: keys.map(key => vec3ToHpluv(dict[key].hpluv)),
                            hsluv: keys.map(key => vec3ToHsluv(dict[key].hsluv)),
                        }
                    },
                ).value
        }).to.not.throw()
    })

    it("Hex samples transform to the correct RGB", () => {
        expect(samples.hex.every(x => x !== null)).equals(true)

        expect(samplesRoughEq(samples.rgb, samples.hex as ReadonlyArray<Color.Rgb>)).equals(true)
    })

    it("XYZ samples transform to the correct RGB", () => {
        expect(samplesRoughEq(samples.rgb, samples.xyz)).equals(true)
    })

    it("LUV samples transform to the correct RGB", () => {
        expect(samplesRoughEq(samples.rgb, samples.luv)).equals(true)
    })

    it("LCH samples transform to the correct RGB", () => {
        expect(samplesRoughEq(samples.rgb, samples.lch)).equals(true)
    })

    it("HSLuv samples transform to the correct RGB", () => {
        expect(samplesRoughEq(samples.rgb, samples.hsluv)).equals(true)
    })

    it("HPLuv samples transform to the correct RGB", () => {
        expect(samplesRoughEq(samples.rgb, samples.hpluv)).equals(true)
    })
})
