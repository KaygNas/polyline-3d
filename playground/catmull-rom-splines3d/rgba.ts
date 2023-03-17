import { assert } from './assert'

/** 以 0.0 - 1.0 表示的 RGBA 颜色 */
type RGBA_Value = [number, number, number, number]

const rgbaSymbol = Symbol('rgba')
export class RGBA {
	public value: RGBA_Value
	private static [rgbaSymbol]: void
	private constructor(value: RGBA_Value) {
		assert(
			value.every((n) => n >= 0 && n <= 1),
			'every component of RGBA should among [0.0, 1.0]',
		)
		this.value = value
	}

	static create(value: RGBA_Value) {
		return new RGBA(value)
	}
}
