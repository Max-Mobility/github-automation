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

function generateMap(owner, repo, labels) {
	let map = {};
	var tasks = labels.map((l) => {
		return gh.scrapeIssues({
			owner,
			repo,
			filters: gh.buildFilters({ labels: [l], state: 'ALL' })
		}).then((issues) => {
			map[l] = issues.map((i) => gh.transformIssue(i));
		});
	});
	return Promise.all(tasks).then(() => {
		return map;
	});
}

// takes as input the output of generateMap
function makeRequirements(map) {
	return Object.keys(map).map((k) => {
		return {
			label: k,
			issues: map[k]
		};
	}).sort((a,b) => {
		return a.label.localeCompare(b.label);
	});
}

// takes as input a list of labels - finds all the issues that have
// those labels and puts them into a table
function generateTable(owner, repo, labels) {
	return generateMap(owner, repo, labels).then((map) => {
		return makeRequirements(map);
	}).then((reqs) => {
		console.log(reqs);
		return tableTemplate({ requirements: reqs });
	});
}

// what are we exporting
module.exports = {
	tableTemplate,
	generateTable,
	generateMap,
	makeRequirements
};

