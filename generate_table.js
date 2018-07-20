// library code
const _ = require('underscore');
const handlebars = require('handlebars');

// our code
const gh = require('./github');

handlebars.registerHelper('not-equals', function(a,b, options) {
	if (a != b) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

handlebars.registerHelper('equals', function(a,b, options) {
	if (a == b) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

handlebars.registerPartial('issueTemplate', [
	"<td>{{number}}: {{title}}</td>",
	"<td>{{created}}</td>",
	"<td>{{closed}}</td>",
].join('\n'));

handlebars.registerPartial('requirementTemplate', [
	"<tr>",
	"<th rowspan={{issues.length}}>{{label}}</th>",
	"{{#each issues}}",
	"{{#not-equals @index 0}}",
	"<tr>",
	"{{/not-equals}}",
	"{{#> issueTemplate}}",
	"</tr><tr><th colspan=4>ERROR: Couldn't find issueTemplate!</th>",
	"{{/issueTemplate}}",
	"</tr>",
	"{{/each}}",
].join('\n'));

tableTemplate = handlebars.compile([
	"<table>",
	"<tr>",
	"<th>Software Requirement</th>",
	"<th>Github Issues</th>",
	"<th>Creation</th>",
	"<th>Completion</th>",
	"</tr>",
	"{{#each requirements}}",
	"{{#> requirementTemplate}}",
	"<tr><th colspan=4>ERROR: Couldn't find requirementTemplate!</th></tr>",
	"{{/requirementTemplate}}",
	"{{/each}}",
	"</table>",
].join('\n'));

function naturalCompare(a, b) {
	var ax = [], bx = [];

	a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
	b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
	while(ax.length && bx.length) {
		var an = ax.shift();
		var bn = bx.shift();
		var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
		if(nn) return nn;
	}

	return ax.length - bx.length;
}

function generateMap(owner, repo, pattern) {
	let labels = [];
	return gh.scrapeLabels({
		owner,
		repo,
		patterns: {
			labels: pattern
		}
	}).then((_labels) => {
		labels = _labels.map((l) => l.name);
		var tasks = labels.map((l) => {
			return gh.scrapeIssues({
				owner,
				repo,
				filters: gh.buildFilters({ state: 'ALL', labels: [l] })
			}).then((issues) => {
				// requirement definition here
				return {
					label: l,
					issues: issues.map((i) => gh.transformIssue(i))
				};
			});
		});
		return Promise.all(tasks); // returns array of requirements
	}).then((reqs) => {
		return reqs.sort((a,b) => {
			return naturalCompare(a.label, b.label);
		});
	});
}

// takes as input a list of labels - finds all the issues that have
// labels matching pattern and puts them into a table
function generateTable(owner, repo, pattern) {
	return generateMap(owner, repo, pattern).then((reqs) => {
		return tableTemplate({ requirements: reqs });
	});
}

// what are we exporting
module.exports = {
	tableTemplate,
	generateTable,
	generateMap
};

