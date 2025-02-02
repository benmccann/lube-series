const error = {
	messageId: "not_match",
	type: "Identifier" 
}
/**
 * @param {import("eslint").RuleTester.ValidTestCase[]} valid 
 * @param {import("eslint").RuleTester.InvalidTestCase[]} invalid
 */
exports.module = (valid, invalid) => {
	valid.push(
		{ code: "var s = 'Hello'" },
		{ code: "var snake_case = 'Hello'" },
		{ code: "var snake_case_123 = 'Hello'" },
		{ code: "var snake_case_123 = 'Hello'" },
		{ code: "var snake1_2_3case_4 = 'Hello'" },
		{ code: "var SNAKE_CASE = 'Hello'" },
		{ code: "var SNAKE1_2_3CASE_4 = 'Hello'" },
		{ code: "camelCase = 'Hello'" },
		{ code: "var snake_case = camelCase" },
		{ code: "var PascalCase = 'Hello'" },
		{ code: "var P1ascal2Case345 = 'Hello'" },
	)
	invalid.push(
		{
			code: "var camelCase = 'Hello'",
			errors: [{
				...error,
				line: 1,
				column: 5
			}],
			output: "var camel_case = 'Hello'"
		},
	)
}