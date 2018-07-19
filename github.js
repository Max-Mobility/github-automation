const GitHub = require('github-api');

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
	filters = filters.concat(args.labels.map(l => { return { key: 'labels', value: l }; }));
	return filters;
}

function issueContainsLabel(issue, label) {
	return issue.labels.reduce((a, e) => {
		return a || e.name == label;
	}, false);
}

function scrapeIssues(opts) {
	let owner = opts.owner;
	let repo = opts.repo;
	let listOpts = {
		state: 'all',
		labels: opts.filters.filter((f) => f.key == 'labels').map((f) => f.value).join()
	};
	console.log(listOpts);
	return gh.getIssues(owner, repo).listIssues(listOpts).then((issues) => {
		issues = issues.data;
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
		created: issue.created_at,
		last_updated: issue.updated_at,
		closed: issue.closed_at
	};
}

// what we're exporting:
module.exports = {
	gh,
	buildFilters,
	issueContainsLabel,
	scrapeIssues,
	transformIssue
};
