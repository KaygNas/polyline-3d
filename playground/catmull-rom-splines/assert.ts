export function assert(condition: boolean, message = 'Assert Error'): asserts condition {
	if (!condition) throw new Error(message)
}
