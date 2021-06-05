/// <reference types="@rbxts/testez/globals" />
import { Option, Result } from "@rbxts/rust-classes";
import { match, _select } from "shared/rbxts-pattern";

type Data = { type: "text"; content: string } | { type: "img"; src: string };

type Input = { type: "ok"; data: Data } | { type: "error"; errorMessage: string };

function deepEquals(a: object, b: object) {
	if (typeOf(a) !== typeOf(b)) {
		return false;
	}

	if (typeOf(a) === "table") {
		const visitedKeys = new Map<unknown, boolean>();

		for (const [k, v] of pairs(a)) {
			visitedKeys.set(k, true);

			const ok = deepEquals(v, b[k as never]);
			if (!ok) {
				return false;
			}
		}

		for (const [k, v] of pairs(b)) {
			if (!visitedKeys.get(k)) {
				const ok = deepEquals(v, a[k as never]);
				if (!ok) {
					return false;
				}
			}
		}

		return true;
	}

	if (a === b) return true;

	return false;
}

export = () => {
	describe("pattern", () => {
		it("return hello", () => {
			const value = {
				type: "ok",
				data: {
					type: "text",
					content: "hello",
				},
			};

			const result = match(value as Input)
				.with({ type: "ok", data: { type: "text", content: "hello" } }, (result) => result.data.content)
				.run();

			expect(result).to.equal("hello");
		});
		it("adds to 15", () => {
			enum Expressions {
				Add,
				Sub,
				Div,
				Mul,
				enumMember,
			}
			const expression = Expressions.Add;

			const result = match(expression)
				.with(Expressions.Add, () => 12 + 3)
				.with(Expressions.Sub, () => 12 - 3)
				.with(Expressions.Div, () => 12 / 3)
				.with(Expressions.Mul, () => 12 * 3)
				.otherwise(() => error("This shouldn't happen"));

			expect(result).to.equal(15);
		});
		it("throw when input is of error type", () => {
			const value = {
				type: "error",
				errorMessage: "something went wrong",
			};

			expect(() =>
				match(value as Input)
					.with({ type: "ok", data: { type: "text", content: "hello" } }, (result) => result.data.content)
					.with({ type: "error" }, (result) => error(`Error://${result.errorMessage}`))
					.run(),
			).to.throw;
		});
		it("return 1", () => {
			function checkOptional(optional: Option<number>) {
				return match(optional)
					.with(Option.some(2), () => 2)
					.with(Option.some(1), () => 1)
					.with(Option.none<number>(), () => error("No numbers were put"))
					.run();
			}

			expect(checkOptional(Option.some(1))).to.equal(1);
		});
		it("throw when optional is None", () => {
			function checkOptional(optional: Option<number>) {
				return match(optional)
					.with(Option.some(10), () => print("this shouldn't ever happen"))
					.with(Option.none<number>(), () => error("No numbers were put"))
					.run();
			}

			expect(() => checkOptional(Option.none())).to.throw;
		});
		it("unwrapped result as 1", () => {
			function checkOptional(optional: Option<number>) {
				return match(optional)
					.with(Option.some(1), () => Result.ok(1))
					.with(Option.none<number>(), () => Result.err("No numbers were put"))
					.run();
			}

			expect(checkOptional(Option.some(1)).unwrap()).to.equal(1);
		});
		it("valid version", () => {
			enum Version {
				Version1,
				Version2,
			}

			function parseVersion(header: Array<number>) {
				const getHeader = new Option(header.shift());

				return match(getHeader)
					.with(Option.none<number>(), () => Result.err("Invalid version"))
					.with(Option.some(1), () => Result.ok(Version.Version1))
					.with(Option.some(2), () => Result.ok(Version.Version2))
					.otherwise(() => Result.err("Invalid version length"));
			}

			const version = parseVersion([1, 2, 3, 4]);

			expect(version.isOk()).to.be.ok;
		});
		it("Equal teen!", () => {
			const number = 13;

			const result = match(number)
				.with(1, () => "One!")
				.with(1 || 3 | 5 || 7 || 11, () => "This is a prime!")
				.with(13 || 14 || 14 || 15 || 16 || 17 || 18 || 19, () => "Teen!")
				.otherwise(() => "Ain't special!");

			print(`Tell me about ${result}`);
			expect(result).to.equal("Teen!");
		});

		it("returns none", () => {
			function plusOne(x: Option<number>): Option<number> {
				return match(x)
					.when(
						() => x.isSome(),
						() => Option.some(x.value! + 1),
					)
					.when(
						() => x.isNone(),
						() => Option.none<number>(),
					)
					.run();
			}

			expect(deepEquals(plusOne(Option.none()), Option.none())).to.be.ok;
		});

		it("exhaustive", () => {
			const exhaustiveArray = [1, 2, 3, 4, 5];
			const lastIndex = exhaustiveArray[exhaustiveArray.size()];
			print(lastIndex);
			const result = match(lastIndex)
				.with(1, () => 1)
				.with(2, () => 2).exhaustive;

			expect(result).to.be.ok;
		});
	});
};
