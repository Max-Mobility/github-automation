// library code
const fs = require('fs');
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

handlebars.registerHelper('resultsPass', function(results, options) {
	if (results.indexOf('FAIL') > -1) {
		return 'FAIL';
	} else {
		return 'PASS';
	}
});

handlebars.registerHelper('resultColor', function(results, options) {
	if (results.indexOf('FAIL') > -1) {
		return 'red';
	} else {
		return 'green';
	}
});

handlebars.registerHelper('testColor', function(tests, options) {
	var passes = tests.reduce((p, t) => {
		return p && (t.results.indexOf('FAIL') == -1);
	}, true);
	if (passes) {
		return 'green';
	} else {
		return 'red';
	}
});

handlebars.registerHelper('reportResults', function(tests, options) {
	var passes = tests.reduce((p, t) => {
		return p && (t.results.indexOf('FAIL') == -1);
	}, true);
	if (passes) {
		return 'PASS';
	} else {
		return 'FAIL';
	}
});

handlebars.registerHelper('add', function(a, b, options) {
	return `${a+b}`;
});

// requirements
//   templates
const requirementTableTemplateText = fs.readFileSync('./static/requirements-table.html').toString();
const requirementTableTemplate = handlebars.compile(requirementTableTemplateText);

// testing
//   partials
const reportTableText = fs.readFileSync('./static/report-table.html').toString();
handlebars.registerPartial('report-table', reportTableText);
//   templates
const testReportText = fs.readFileSync('./static/test-report.html').toString();
const testReportTemplate = handlebars.compile(testReportText);


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
		labels = _labels;
		var tasks = labels.map((l) => {
			return gh.scrapeIssues({
				owner,
				repo,
				filters: gh.buildFilters({ state: 'ALL', labels: [l.name] })
			}).then((issues) => gh.makeRequirement(pattern, l, issues));
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
function generateRequirementTable(owner, repo, pattern) {
	return generateMap(owner, repo, pattern).then((reqs) => {
		return requirementTableTemplate({ requirements: reqs });
	});
}

// takes as input a list of labels - finds all the issues that have
// labels matching pattern and puts them into a table
function generateTestReportTable(owner, repo, pattern, revision, softwareName) {
	return generateMap(owner, repo, pattern).then((reqs) => {
		// tests should be for a requirement and should have reports
		return testReportTemplate({
			revision,
			softwareName,
			tests: reqs
		});
	});
}

// what are we exporting
module.exports = {
	generateRequirementTable,
	generateTestReportTable,
};

