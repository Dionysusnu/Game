/// <reference types="@rbxts/testez/globals" />
import { Option, Result, Vec } from "@rbxts/rust-classes";
import { match, when, _select, __ } from "shared/match";

export = () => {
	describe("match number utility", () => {
		it("it is a prime", () => {
			const number = 5;

			const result = match(number)
				.numberSet([1, 3, 5, 7, 11], (value) => `${value} is a prime number`)
				.run();

			expect(result).to.equal(`5 is a prime number`);
		});

		it("it is a Teen", () => {
			const number = 13;

			const result = match(number)
				.numberRange([13, 19], (value) => `${value} is a teen number`)
				.run();

			expect(result).to.equal("13 is a teen number");
		});
	});

	describe("partial match", () => {
		it("player team", () => {
			const brick = new BrickColor("Really black");

			const playerTeam = {
				marcus: "bye",
				brick: brick,
			};

			const matchedPlayerTeam = match(playerTeam)
				.with({ marcus: "bye", brick: brick }, () => true)
				.run();
			expect(matchedPlayerTeam).to.be.ok();
		});

		it("adds to 15", () => {
			enum Operator {
				Add,
				Sub,
				Div,
				Mul,
			}

			const sum = { operator: Operator.Add, left: 12, right: 3 };
			print(sum);
			const result = match({ left: 12, operator: Operator.Add, right: 3 })
				.with({ operator: Operator.Add }, ({ left, right }) => left + right)
				.with({ operator: Operator.Sub }, ({ left, right }) => left - right)
				.with({ operator: Operator.Div }, ({ left, right }) => left / right)
				.with({ operator: Operator.Mul }, ({ left, right }) => left * right)
				.run();

			expect(result).to.equal(15);
		});
	});

	it("get most accurate option", () => {
		const result = match({ field1: 1, field2: "test" })
			.with({ field1: 1 }, () => "a")
			.with({ field1: 1, field2: "test" }, () => "b")
			.with({ field1: 1 }, () => "c")
			.run();

		expect(result).to.equal("b");
	});

	it("2 is even", () => {
		const isOdd = (x: number) => x % 2 === 1;

		const result = match({ x: 2 })
			.with({ x: when(isOdd) }, ({ x }) => `${x} is odd`)
			.with(__, ({ x }) => `${x} is even`)
			.exhaustive();

		expect(result).to.equal("2 is even");
	});

	it("7 is odd", () => {
		const isOdd = (x: number) => x % 2 === 1;

		const result = match({ x: 7 })
			.with({ x: when(isOdd) }, ({ x }) => `${x} is odd`)
			.with(__, ({ x }) => `${x} is even`)
			.exhaustive();

		expect(result).to.equal("7 is odd");
	});
};
