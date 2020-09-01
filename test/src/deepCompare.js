import test from 'ava';

import deepCompare from '../../src';

const macro = (t, a, b, expected) => {
	const result = deepCompare(a, b);
	t.is(expected, result);
	const reversedResult = deepCompare(b, a);
	t.is(-expected | 0, reversedResult);
};

const repr = (x) => {
	if (x instanceof RegExp) return x.toString();
	if (x instanceof Date) return `Date(${x.getTime()})`;
	if (x instanceof Function) return x.toString();
	if (typeof x === 'bigint') return `${x.toString()}n`;
	if (typeof x === 'number') return x.toString();
	return JSON.stringify(x);
};

const expectedSymbol = (expected) => {
	return expected < 0 ? '<' : expected > 0 ? '>' : '=';
};

macro.title = (title, a, b, expected) =>
	title || `${repr(a)} ${expectedSymbol(expected)} ${repr(b)}`;

test(macro, true, true, 0);
test(macro, true, false, 1);
test(macro, false, true, -1);
test(macro, false, false, 0);
test(macro, true, 1, -1);
test(macro, true, 0, -1);
test(macro, false, 1, -1);
test(macro, false, 0, -1);
test(macro, Number.NaN, Number.NaN, 0);
test(macro, Number.NaN, 0, 1);
test(macro, Number.NaN, 1, 1);
test(macro, Number.NaN, -1, 1);
test(macro, Number.NaN, Infinity, 1);
test(macro, Number.NaN, -Infinity, 1);
test(macro, Infinity, Infinity, 0);
test(macro, -Infinity, -Infinity, 0);
test(macro, -Infinity, Infinity, -1);
test(macro, Infinity, -Infinity, 1);
test(macro, 1, Infinity, -1);
test(macro, -1, -Infinity, 1);
test(macro, -1, Infinity, -1);
test(macro, 1, -Infinity, 1);
test(macro, 1, true, 1);
test(macro, 1, false, 1);
test(macro, 0, true, 1);
test(macro, 0, false, 1);
test(macro, 1, 1, 0);
test(macro, 0, 1, -1);
test(macro, 1, 0, 1);
test(macro, 1, '', -1);
test(macro, '', 1, 1);
test(macro, '', '', 0);
test(macro, '', 'a', -1);
test(macro, 'a', '', 1);
test(macro, 'a', 'a', 0);
test(macro, 'a', undefined, -1);
test(macro, undefined, 'a', 1);
test(macro, undefined, undefined, 0);
test(macro, null, null, 0);
test(macro, null, undefined, -1);
test(macro, undefined, null, 1);
test(macro, undefined, {}, 1);
test(macro, {}, undefined, -1);
test(macro, null, {}, -1);
test(macro, {}, {}, 0);
test(macro, {}, {a: 1}, -1);
test(macro, {a: 1}, {}, 1);
test(macro, {a: 1}, {a: 1}, 0);
test(macro, {a: 1}, {b: 1}, -1);
test(macro, {a: 1, b: 2}, {b: 2, a: 1}, 0);
test(macro, {c: {a: 1, b: 2}}, {c: {b: 2, a: 1}}, 0);
test(macro, /s/, /s/, 0);
test(macro, /s/, /sa/, -1);
test(macro, /sa/, /s/, 1);
test(macro, new Date(0), new Date(0), 0);
test(macro, new Date(0), new Date(1), -1);
test(macro, new Date(1), new Date(0), 1);
test(macro, new Date(1), /s/, -1);
test(macro, /s/, new Date(1), 1);
test(macro, [], [], 0);
test(macro, [], [1], -1);
test(macro, [], [-1], -1);
test(macro, [1, 2, 3], [1, 2, 3], 0);
test(macro, [3, 2, 1], [1, 2, 3], 1);
test(macro, [1, 2, 3, 4], [1, 2, 3], 1);
test(macro, [1, 2, 3, 4], [7, 8, 9], 1);
test(
	macro,
	() => undefined,
	() => undefined,
	0,
);
test(
	macro,
	() => undefined,
	() => 1,
	1,
);
test(
	macro,
	() => 1,
	() => undefined,
	-1,
);
test(
	macro,
	() => 1,
	() => 1,
	0,
);
// Test(macro, function () { return 1 }, () => 1, ?); // babel duplicate

test('circular x = {x: x}', (t) => {
	const x = {};
	x.x = x;
	t.is(0, deepCompare(x, x));
});

test('circular x = y', (t) => {
	const x = {};
	x.x = x;
	const y = {};
	y.x = y;
	t.is(0, deepCompare(x, y));
	t.is(0, deepCompare(y, x));
});

test('circular x < z', (t) => {
	const x = {x: 0, z: 0};
	x.y = x;
	const z = {x: 0, z: 1};
	z.y = z;
	t.is(-1, deepCompare(x, z));
	t.is(1, deepCompare(z, x));
});

test('circular x = z', (t) => {
	const x = {x: 0, z: 0};
	x.y = x;
	const z = {x: 0, z: 0};
	z.y = z;
	t.is(0, deepCompare(x, z));
	t.is(0, deepCompare(z, x));
});

test('circular a = b', (t) => {
	const a = [1, 2, 3];
	const b = [1, 2, 3];
	a[1] = b;
	b[1] = a;
	t.is(0, deepCompare(a, b));
	t.is(0, deepCompare(b, a));
});

test('circular a < b', (t) => {
	const a = [1, 2, 3];
	const b = [1, 2, 4];
	a[1] = b;
	b[1] = a;
	t.is(-1, deepCompare(a, b));
	t.is(1, deepCompare(b, a));
});
