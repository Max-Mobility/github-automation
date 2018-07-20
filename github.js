const GitHub = require('github-api');
const moment = require('moment');

let GITHUB_USERNAME = process.env.GITHUB_USERNAME;
let GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

if (!GITHUB_USERNAME || !GITHUB_PASSWORD) {
	// DO SOMETHING HERE
}

let gh = new GitHub({
	username: GITHUB_USERNAME,
	password: GITHUB_PASSWORD
});

// utility functions
function buildFilters(args) {
	let filters = [];
	filters.push({ key: 'state', value: args.state });
	if (args.labels && args.labels.length) {
		filters = filters.concat(args.labels.map(l => { return { key: 'labels', value: l }; }));
	}
	return filters;
}

function issueContainsLabel(issue, label) {
	return issue.labels.reduce((a, e) => {
		return a || e.name == label;
	}, false);
}

function scrapeLabels(opts) {
	let owner = opts.owner;
	let repo = opts.repo;
	let listOpts = {
		per_page: 10000
	};
	return gh.getIssues(owner, repo).listLabels(listOpts).then((labels) => {
		labels = labels.data;
		if (opts.patterns) {
			if (opts.patterns.labels) {
				return labels.filter((l) => {
					let pattern = new RegExp(opts.patterns.labels);
					let test = pattern.test(l.name);
					return test;
				});
			}
		}
		return labels;
	}).catch((err) => {
		console.log(`Couldn not get issues: ${err}`);
		return [];
	});
}

function scrapeIssues(opts) {
	let owner = opts.owner;
	let repo = opts.repo;
	let listOpts = {
		state: 'all',
		labels: opts.filters.filter((f) => f.key == 'labels').map((f) => f.value).join()
	};
	return gh.getIssues(owner, repo).listIssues(listOpts).then((issues) => {
		issues = issues.data;
		if (opts.patterns) {
			if (opts.patterns.labels) {
				return issues.filter((i) => {
					return i.labels.reduce((t, l) => {
						let pattern = new RegExp(opts.patterns.labels);
						return t || pattern.test(l.name);
					}, false);
				});
			}
		}
		return issues;
	}).catch((err) => {
		console.log(`Couldn not get issues: ${err}`);
		return [];
	});
}

function transformIssue(issue) {
	return {
		title: issue.title,
		number: issue.number,
		labels: issue.labels.map(l => l.name),
		state: issue.state,
		created: moment(issue.created_at).format("YYYY-MM-DD"),//.calendar(),
		last_updated: moment(issue.updated_at).format("YYYY-MM-DD"),//.calendar(),
		closed: moment(issue.closed_at).format("YYYY-MM-DD")//.calendar(),
	};
}

// what we're exporting:
module.exports = {
	gh,
	buildFilters,
	issueContainsLabel,
	scrapeIssues,
	scrapeLabels,
	transformIssue
};
