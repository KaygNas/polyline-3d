import { assert } from '../core/assert'
type DotValue = number[]

export class Dot {
  static fromValue(value: DotValue) {
    return new Dot(...value)
  }

  private _value: DotValue
  get x() { return this._value[0] }
  get y() { return this._value[1] }
  get force() { return this._value[2] }

  constructor(...value: DotValue) {
    assert(
      value.length >= 3,
      `Dot must construct with three components: x, y, force, but got value: ${value}.`,
    )
    this._value = value
  }

  toValue(): DotValue {
    return this._value
  }
}
