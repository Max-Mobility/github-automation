// library code
const moment = require('moment');
const fs = require('fs');
const _ = require('underscore');
const handlebars = require('handlebars');

// get our install folder
var path = require('path') // npm install path
var packagePath = __dirname;

// our code
const gh = require('./github');
const utils = require('./lib/utils');

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
	} else if (results.indexOf('PASS') > -1) {
		return 'green';
	} else {
		return 'gray';
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

handlebars.registerHelper('initials', function(name, options) {
	name = name || '';
	return name.split(' ').reduce((i, n) => {
		return i + n[0].toUpperCase();
	}, '');
});

handlebars.registerHelper('startDate', function(tests, options) {
	if (this.startDate) return this.startDate;
	if (tests && tests.length) {
		return moment.min(tests.map((t) => moment(t.startDate))).format("YYYY-MM-DD");
	} else {
		return 'N/A';
	}
});

handlebars.registerHelper('endDate', function(tests, options) {
	if (this.endDate) return this.endDate;
	if (tests && tests.length) {
		return moment.max(tests.map((t) => moment(t.endDate))).format("YYYY-MM-DD");
	} else {
		return 'N/A';
	}
});

handlebars.registerHelper('reportResults', function(tests, options) {
	var passes = tests.reduce((p, t) => {
		return t.finalResult && p;
	}, true);
	if (passes) {
		return 'PASS';
	} else {
		return 'FAIL';
	}
});

handlebars.registerHelper('testResult', function(reports, options) {
	if (!reports || !reports.length) return 'N/A';
	var passes = reports.reduce((p, r) => {
		return p && r.tests.reduce((_p, t) => t.finalResult && _p, true);
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
const requirementTableTemplateText = fs.readFileSync(packagePath + '/static/requirements-table.html').toString();
const requirementTableTemplate = handlebars.compile(requirementTableTemplateText);

// testing
//   partials
const reportTableText = fs.readFileSync(packagePath+'/static/report-table.html').toString();
handlebars.registerPartial('report-table', reportTableText);
//   templates
const testReportText = fs.readFileSync(packagePath+'/static/test-report.html').toString();
const testReportTemplate = handlebars.compile(testReportText);
const testTableText = fs.readFileSync(packagePath+'/static/test-table.html').toString();
const testTableTemplate = handlebars.compile(testTableText);

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
			return utils.naturalCompare(a.label, b.label);
		});
	});
}

// takes as input a list of labels - finds all the issues that have
// labels matching pattern and puts them into a table
function scrapeRequirementHtml(owner, repo, pattern) {
	return generateMap(owner, repo, pattern).then((reqs) => {
		return requirementTableTemplate({ requirements: reqs });
	});
}

// takes as input a list of labels - finds all the issues that have
// labels matching pattern and puts them into a table
function scrapeReportHtml(owner, repo, pattern) {
	return generateMap(owner, repo, pattern).then((reqs) => {
		// tests should be for a requirement and should have reports
		return testReportTemplate({
			tests: reqs
		});
	});
}

function generateReportHtml(reports) {
	return new Promise((resolve, reject) => {
		resolve(testReportTemplate({
			tests: reports
		}));
	});
}

function generateTestHtml(reports) {
	return new Promise((resolve, reject) => {
		resolve(testTableTemplate({
			tests: reports
		}));
	});
}

// what are we exporting
module.exports = {
	scrapeRequirementHtml,
	scrapeReportHtml,
	generateReportHtml,
	generateTestHtml,
	generateMap,
};

