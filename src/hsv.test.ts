import { expect } from "chai"
import * as Color from "./index"
import * as Jsv from "jsverify"

const hsvGen = Jsv.bless({
    generator: Jsv.tuple([Jsv.number(0, 1), Jsv.number(0, 1), Jsv.number(0, 1)]).generator.map(
        ([h, s, v]) => new Color.Hsv(h, s, v),
    ),
})

describe("HSV", () => {
    describe("hsvToRgb >> rgbToHsv", () => {
        it("should be roughly equal to the input", () => {
            const MARGIN_OF_ERROR = 0.000001
            Jsv.assertForall(hsvGen, hsv => {
                const { h, s, v } = Color.rgbToHsv(Color.hsvToRgb(hsv))
                expect(h).closeTo(hsv.h, MARGIN_OF_ERROR)
                expect(s).closeTo(hsv.s, MARGIN_OF_ERROR)
                expect(v).closeTo(hsv.v, MARGIN_OF_ERROR)
                return true
            })
        })
    })
})
