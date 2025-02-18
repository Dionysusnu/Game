import { BuildMany } from "./BuildMany";
import type { IsAny, Cast, Values, Flatten, IsUnion, IsPlainObject, Length, UnionToTuple } from "./helpers";
import { IsMatching } from "./IsMatching";

/**
 * DistributeMatchingUnions takes two arguments:
 * - a data structure of type `a` containing unions
 * - a pattern `p`, matching this data structure
 * and turns it into a union of all possible
 * combination of each unions contained in `a` that matches `p`.
 *
 * It does this in 3 main steps:
 *  - 1. Find all unions contained in the data structure, that matches `p`
 *    with `FindUnions<a, p>`. It returns a tree of [union, path] pairs.
 *  - 2. this tree is passed to the `Distribute` type level function,
 *    Which turns it into a union of list of `[singleValue, path]` pairs.
 *    Each list correspond to one of the possible combination of the unions
 *    found in `a`.
 *  - 3. build a data structure with the same shape as `a` for each combination
 *    and return the union of these data structures.
 *
 * @example
 * type t1 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', 1]>;
 * // => ['a', 1] | ['a', 2] | ['b', 1] | ['b', 2]
 *
 * type t2 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', unknown]>;
 * // => ['a', 1 | 2] | ['b', 1 | 2]
 */
export type DistributeMatchingUnions<a, p> = IsAny<a> extends true
	? any
	: BuildMany<a, Distribute<FindUnionsMany<a, p>>>;

// FindUnionsMany :: a -> Union<a> -> PropertyKey[] -> UnionConfig[]
export type FindUnionsMany<a, p, path extends any[] = []> = UnionToTuple<
	(p extends any ? (IsMatching<a, p> extends true ? FindUnions<a, p, path> : []) : never)[number] // using [number] to flatten everything to the same level
>;

/**
 * The reason we don't look further down the tree with lists,
 * Set and Maps is that they can be heterogeneous,
 * so matching on a A[] for a in input of (A|B)[]
 * doesn't rule anything out. You can still have
 * a (A|B)[] afterward. The same logic goes for Set and Maps.
 *
 * Kinds are types of types.
 *
 * kind UnionConfig = {
 *  cases: Union<{
 *    value: b,
 *    subUnions: UnionConfig[]
 *  }>,
 *  path: string[]
 * }
 * FindUnions :: Pattern a p => a -> p -> UnionConfig[]
 */
export type FindUnions<a, p, path extends any[] = []> = unknown extends p
	? []
	: IsAny<p> extends true
	? [] // Don't try to find unions after 5 levels
	: Length<path> extends 5
	? []
	: IsUnion<a> extends true
	? [
			{
				cases: a extends any
					? {
							value: a;
							subUnions: FindUnionsMany<a, p, path>;
					  }
					: never;
				path: path;
			},
	  ]
	: [a, p] extends [readonly any[], readonly any[]]
	? [a, p] extends [
			readonly [infer a1, infer a2, infer a3, infer a4, infer a5],
			readonly [infer p1, infer p2, infer p3, infer p4, infer p5],
	  ]
		? [
				...FindUnions<a1, p1, [...path, 0]>,
				...FindUnions<a2, p2, [...path, 1]>,
				...FindUnions<a3, p3, [...path, 2]>,
				...FindUnions<a4, p4, [...path, 3]>,
				...FindUnions<a5, p5, [...path, 4]>
		  ]
		: [a, p] extends [
				readonly [infer a1, infer a2, infer a3, infer a4],
				readonly [infer p1, infer p2, infer p3, infer p4],
		  ]
		? [
				...FindUnions<a1, p1, [...path, 0]>,
				...FindUnions<a2, p2, [...path, 1]>,
				...FindUnions<a3, p3, [...path, 2]>,
				...FindUnions<a4, p4, [...path, 3]>
		  ]
		: [a, p] extends [readonly [infer a1, infer a2, infer a3], readonly [infer p1, infer p2, infer p3]]
		? [
				...FindUnions<a1, p1, [...path, 0]>,
				...FindUnions<a2, p2, [...path, 1]>,
				...FindUnions<a3, p3, [...path, 2]>
		  ]
		: [a, p] extends [readonly [infer a1, infer a2], readonly [infer p1, infer p2]]
		? [...FindUnions<a1, p1, [...path, 0]>, ...FindUnions<a2, p2, [...path, 1]>]
		: [a, p] extends [readonly [infer a1], readonly [infer p1]]
		? FindUnions<a1, p1, [...path, 0]>
		: []
	: a extends Set<any>
	? []
	: a extends Map<any, any>
	? []
	: [IsPlainObject<a>, IsPlainObject<p>] extends [true, true]
	? Flatten<
			Values<
				{
					// we use Required to remove the optional property modifier (?:).
					// Optional properties aren't considered as union types to avoid
					// generating a huge union.
					[k in keyof Required<a> & keyof p]: FindUnions<NonNullable<a[k]>, p[k], [...path, k]>;
				}
			>
	  >
	: [];

// Distribute :: UnionConfig[] -> Union<[a, path][]>
export type Distribute<unions extends any[]> = unions extends [{ cases: infer cases; path: infer path }, ...infer tail]
	? cases extends { value: infer value; subUnions: infer subUnions }
		? [[value, path], ...Distribute<Cast<subUnions, any[]>>, ...Distribute<tail>]
		: never
	: [];
