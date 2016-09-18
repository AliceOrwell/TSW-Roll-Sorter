var tswrollsorter = {
	condense: function(rolls) {
		var out = [];
		var len = rolls.length;
		for (var i=0; i < len; i++) {
			var people = [rolls[i].person];
			var roll = rolls[i].roll;
			
			// while not the last roll and the next roll is the same as current
			while (i < len-1 && roll == rolls[i+1].roll) {
				i++;
				people.push(rolls[i].person);
			}
			
			var entry = { people: people, roll: roll };
			out.push(entry);
		}
		return out;
	},

	extract: function(chat_text) {
		var rolls = [];

		var match;
		var pattern = /(\S*) rolled a (\d{1,3})\.\n?/g;
		while (match = pattern.exec(chat_text)) {
			var entry = { person: match[1], roll: match[2] };
			rolls.push(entry);
		}
		return rolls
	},
	
	filter: function(rolls) {
		var out = [];
		var people = [];
		for (var i=0; i < rolls.length; i++) {
			var person = rolls[i].person;
			if (people.indexOf(person) == -1) {
				people.push(person);
				out.push(rolls[i]);
			}
		}
		return out;
	},

	format_roll: function(roll) {
		var people = roll.people;
	
		var output = {
			num_rolls: people.length,
			text: people[0]
		};

		for (var i=1; i < people.length; i++) {
			output.text += " + " + people[i];
		}
		output.text += " (" + roll.roll + ")";
		return output;
	},

	format_rolls: function(rolls) {
		var roll = tswrollsorter.format_roll(rolls[0]);
		var text = roll.text;
		var num_rolls = roll.num_rolls;

		for (var i=1; i < rolls.length; i++) {
			roll = tswrollsorter.format_roll(rolls[i]);
			num_rolls += roll.num_rolls;
			text += " -- " + roll.text;
		}
		
		var output = {
			num_rolls: num_rolls,
			text: text
		}
		return output;
	},

	format: function(rolls) {
		var data = tswrollsorter.format_rolls(rolls);
		var text = data.num_rolls + " Rolls: " + data.text;
		return text;
	},

	process: function() {
		var chat_text = document.getElementById("input").value;
		
		var rolls = tswrollsorter.extract(chat_text);
		if (rolls.length == 0) {
			return;
		}

		rolls = tswrollsorter.filter(rolls);
		rolls = tswrollsorter.sort(rolls);
		var condensed_rolls = tswrollsorter.condense(rolls);
		var formated_text = tswrollsorter.format(condensed_rolls);

		document.getElementById("output").value = formated_text;
	},

	sort: function(data) {
		data.sort(function(a, b) {
			return b.roll - a.roll;
		});
		return data;
	}
};