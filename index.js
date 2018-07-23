#!/usr/bin/node

// libraries
const sys = require('util');
const exec = require('child_process').exec;
const ArgumentParser = require('argparse').ArgumentParser;
const moment = require('moment');
const fs = require('fs');
const pdf = require('html-pdf');
const handlebars = require('handlebars');
const toc = require('html-toc');

// our code
const github = require('./github');
const generate_table = require('./generate_table');

function getCommandLine() {
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}

// set up command line arg parsing
let parser = new ArgumentParser({
	version: '0.0.1',
	addHelp: true,
	description: 'Github Automation'
});
parser.addArgument(
	[ '-r', '--repo' ],
	{
		defaultValue: 'EvalApp',
		help: 'Repository to scrape'
	}
);
parser.addArgument(
	[ '-o', '--owner' ],
	{
		defaultValue: 'PushTracker',
		help: 'Owner of the repository'
	}
);
parser.addArgument(
	[ '-s', '--state' ],
	{
		defaultValue: 'all',
		help: 'The state of the issues',
		choices: ['all', 'open', 'closed']
	}
);
parser.addArgument(
	[ '-p', '--pattern' ],
	{
		defaultValue: 'SEA-SRS',
		help: 'A pattern that the labels on the issues should match'
	}
);

// load the templates
var indexTempl = fs.readFileSync('./static/index.html', 'utf8');
var style = fs.readFileSync('./static/style.css', 'utf8');

// parse the arguments
var args = parser.parseArgs();

var reqHtml = null;
var reportHtml = null;

// generate requirement table
generate_table.generateRequirementHtml(args.owner, args.repo, args.pattern).then((_reqHtml) => {
	reqHtml = _reqHtml;
	// generate reports
	return generate_table.generateReportHtml(args.owner, args.repo, args.pattern);
}).then((_reportHtml) => {
	reportHtml = _reportHtml;
	// now render everything
	var date = moment().format("YYYY-MM-DD");
	const title = `${moment().format("YYYY-MM-DD")}.${args.pattern}`;
	let html = handlebars.compile(indexTempl)({
		title,
		style,
		date,
		reqHtml,
		reportHtml
	});
	html = toc(html, {
		selectors: 'h3,h4,h5,h6',
		minLength: 3
	});
	const options = { format: 'Letter' };
	const htmlName = `./${title}.html`;
	fs.writeFileSync(htmlName, html);
	console.log(`Wrote ${htmlName}.`);
	const pdfName = `./${title}.pdf`;
	pdf.create(html, options).toFile(pdfName, function(err, res) {
		if (err) return console.log(err);
		console.log(`Wrote ${pdfName}`);
		//exec(getCommandLine() + ' ' + pdfName);
	});
});
