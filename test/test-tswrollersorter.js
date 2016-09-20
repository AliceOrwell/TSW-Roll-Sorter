QUnit.module("tswrollsorter.condense");
QUnit.test("group people with same roll", function(assert) {
	var data = [
		{person: "Person1", roll: "28"},
		{person: "Person2", roll: "28"}
	];
	var expected = [
		{people: ["Person1", "Person2"], roll: "28"}
	];
	assert.deepEqual(tswrollsorter.condense(data), expected);
	
	data = [
		{person: "Person1", roll: "100"},
		{person: "Person2", roll: "100"},
		{person: "Person3", roll: "100"}
	];
	expected = [
		{people: ["Person1", "Person2", "Person3"], roll: "100"}
	];
	assert.deepEqual(tswrollsorter.condense(data), expected);
});

QUnit.test("don't group people with different rolls", function(assert) {
	var data = [
		{person: "Person1", roll: "2"},
		{person: "Person2", roll: "20"}
	];
	var expected = [
		{people: ["Person1"], roll: "2"},
		{people: ["Person2"], roll: "20"}
	];
	assert.deepEqual(tswrollsorter.condense(data), expected);
});

QUnit.module("tswrollsorter.extract");
QUnit.test("ignore non-roll string", function(assert) {
	var data = '[04:36] Person rolled a pineapple.';
	var expected = [];
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36] Person rolled a 8b2.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36]Person Hey';
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("ignore roll sent in messages", function(assert) {
	// Tells
	var data = '[04:36][Person] rolled a 1.';
	var expected = [];
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[Person] rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36][Person] I think Person2 rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[Person] I think Person2 rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	// Channels
	data = '[04:36][#event][Person] rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[#event][Person] rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);

	data = '[Channel][Person] I think Person2 rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36][Channel][Person] I think Person2 rolled a 1.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("match rolls in range 1 to 100", function(assert) {
	var data = '[04:36] Person rolled a 1.';
	var expected = [
		{person: "Person", roll: "1"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);

	data = '[04:36] Person rolled a 100.';
	expected = [
		{person: "Person", roll: "100"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36] Person rolled a 50.';
	expected = [
		{person: "Person", roll: "50"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36] Person rolled a 3.\n' +
		'[04:36] Person rolled a 82.\n' +
		'[04:36] Person rolled a 100.';
	expected = [
		{person: "Person", roll: "3"},
		{person: "Person", roll: "82"},
		{person: "Person", roll: "100"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("ignore roll <= 0", function(assert) {
	var data = '[04:36] Person rolled a 0.';
	var expected = [];
	assert.deepEqual(tswrollsorter.extract(data), expected);

	data = '[04:36] Person rolled a -3.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36] Person rolled a -56.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
	
	data = '[04:36] Person rolled a -100.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("ignore roll > 100", function(assert) {
	var data = '[04:36] Person rolled a 123.';
	var expected = [];
	assert.deepEqual(tswrollsorter.extract(data), expected);

	ata = '[04:36] Person rolled a 9001.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("ignore roll padded with zeroes", function(assert) {
	var data = '[04:36] Person rolled a 05.';
	var expected = [];
	assert.deepEqual(tswrollsorter.extract(data), expected);

	data = '[04:36] Person rolled a 007.';
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("match with timestamp", function(assert) {
	var data = '[04:36] Person rolled a 39.\n' +
		'[4:36] Person rolled a 82.';
	var expected = [
		{person: "Person", roll: "39"},
		{person: "Person", roll: "82"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("match without timestamp", function(assert) {
	var data = 'Person rolled a 39.\n' +
		'Person rolled a 82.';
	var expected = [
		{person: "Person", roll: "39"},
		{person: "Person", roll: "82"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.test("match names with numbers and hyphens", function(assert) {
	var data = 'Per-son rolled a 39.\n' +
		'Per100son rolled a 82.';
	var expected = [
		{person: "Per-son", roll: "39"},
		{person: "Per100son", roll: "82"}
	];
	assert.deepEqual(tswrollsorter.extract(data), expected);
});

QUnit.module("tswrollsorter.filter");
QUnit.test("remove duplicate", function(assert) {
	var data = [
		{person: "Person5", roll: "10"},
		{person: "Person", roll: "60"},
		{person: "Person", roll: "20"},
		{person: "Person3", roll: "70"}
	];
	var expected = [
		{person: "Person5", roll: "10"},
		{person: "Person", roll: "60"},
		{person: "Person3", roll: "70"}
	];
	assert.deepEqual(tswrollsorter.filter(data), expected);
});

QUnit.module("tswrollsorter.sort");
QUnit.test("can sort ordered list", function(assert) {
	var data = [
		{person: "Person2", roll: "100"},
		{person: "Person3", roll: "82"},
		{person: "Person1", roll: "3"}
	];
	var expected = [
		{person: "Person2", roll: "100"},
		{person: "Person3", roll: "82"},
		{person: "Person1", roll: "3"}
	];
	assert.deepEqual(tswrollsorter.sort(data), expected);
});

QUnit.test("can sort unordered list", function(assert) {
	var data = [
		{person: "Person2", roll: "10"},
		{person: "Person3", roll: "30"},
		{person: "Person1", roll: "20"}
	];
	var expected = [
		{person: "Person3", roll: "30"},
		{person: "Person1", roll: "20"},
		{person: "Person2", roll: "10"}
	];
	assert.deepEqual(tswrollsorter.sort(data), expected);
});

QUnit.test("number of digits doesn't affect sort", function(assert) {
	var data = [
		{person: "Person2", roll: "28"},
		{person: "Person3", roll: "6"},
		{person: "Person1", roll: "100"}
	];
	var expected = [
		{person: "Person1", roll: "100"},
		{person: "Person2", roll: "28"},
		{person: "Person3", roll: "6"}
	];
	assert.deepEqual(tswrollsorter.sort(data), expected);
});

QUnit.module("tswrollsorter.format_roll");
QUnit.test("can format 1 person with roll value", function(assert) {
	var data = { 
		people: ["Person1"], roll: "28"
	};
	var expected = { 
		text: "Person1 (28)", num_rolls: 1
	};
	assert.deepEqual(tswrollsorter.format_roll(data), expected);
});

QUnit.test("can format 2 people with roll value", function(assert) {
	var data = {
		people: ["Person1", "Person2"], roll: "28"
	};
	var expected = {
		text: "Person1 + Person2 (28)", num_rolls: 2
	};
	assert.deepEqual(tswrollsorter.format_roll(data), expected);
});

QUnit.test("can format 3 people with roll value", function(assert) {
	var data = {
		people: ["Person1", "Person2", "Person3"], roll: "28"
	};
	var expected = {
		text: "Person1 + Person2 + Person3 (28)", num_rolls: 3
	};
	assert.deepEqual(tswrollsorter.format_roll(data), expected);
});

QUnit.module("tswrollsorter.format_rolls");
QUnit.test("1 roll", function(assert) {
	var data = [
		{ people: ["Person1"], roll: "28"}
	];
	var expected = { 
		text: "Person1 (28)", num_rolls: 1
	};
	assert.deepEqual(tswrollsorter.format_rolls(data), expected);
});

QUnit.test("2 rolls", function(assert) {
	var data = [
		{ people: ["Person1"], roll: "28" },
		{ people: ["Person2"], roll: "25" }
	];
	var expected = { 
		text: "Person1 (28) -- Person2 (25)", num_rolls: 2
	};
	assert.deepEqual(tswrollsorter.format_rolls(data), expected);
});

QUnit.module("tswrollsorter.format");
QUnit.test("can format 0 roll", function(assert) {
	var data = [];
	var expected = "0 Rolls found.";
	assert.deepEqual(tswrollsorter.format(data), expected);
});

QUnit.test("can format 1 roll", function(assert) {
	var data = [
		{ people: ["Person1"], roll: "28"}
	];
	var expected = "1 Rolls: Person1 (28)";
	assert.deepEqual(tswrollsorter.format(data), expected);
});

QUnit.test("can format 2 rolls", function(assert) {
	var data = [
		{ people: ["Person1"], roll: "28" },
		{ people: ["Person2"], roll: "25" }
	];
	var expected = "2 Rolls: Person1 (28) -- Person2 (25)";
	assert.deepEqual(tswrollsorter.format(data), expected);
});

QUnit.test("can format 3 rolls", function(assert) {
	var data = [
		{ people: ["Person1"], roll: "28" },
		{ people: ["Person2"], roll: "25" },
		{ people: ["Person3"], roll: "20" }
	];
	var expected = "3 Rolls: Person1 (28) -- Person2 (25) -- Person3 (20)";
	assert.deepEqual(tswrollsorter.format(data), expected);
});

QUnit.module( "tswrollsorter.process" );
QUnit.test("Valid rolls", function(assert) {
	var data = '[04:36] Person rolled a 3.\n' +
		'[04:36] Person rolled a 82.\n' +
		'Person rolled a 100.';
	var expected = "1 Rolls: Person (3)";
	assert.deepEqual(tswrollsorter.process(data), expected);
});

QUnit.test("No text", function(assert) {
	var data = "";
	var expected = "0 Rolls found.";

	assert.deepEqual(tswrollsorter.process(data), expected);
});

QUnit.test("No valid rolls", function(assert) {
	var data = '[04:36] Person rolled a barrel.';
	var expected = "0 Rolls found.";

	assert.deepEqual(tswrollsorter.process(data), expected);
});