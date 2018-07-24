const inquirer = require('inquirer');
const moment = require('moment');
const files = require('./files');
const utils = require('./utils');

const fuzzy = require('fuzzy');
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

module.exports = {
	selectTest: function(tests) {
		const getTest = (answer) => {
			return tests.filter((t) => t.number === answer.number)[0] || answer;
		}
		const questions = [
			{
				name: 'number',
				type: 'autocomplete',
				message: 'Enter the test number:',
				suggestOnly: true,
				source: function(answersSoFar, input) {
					var vals = tests.map((t) => t.number);
					input = input || '';
					return new Promise((resolve, reject) => {
						var fuzzyResult = fuzzy.filter(input, vals);
						var data = fuzzyResult.map((e) => {
							var t = tests[e.index];
							return {
								"name": `${t.number}: ${t.name}`,
								"short": `${t.number}`,
								"value": t
							};
						});
						resolve(data);
					});
				},
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test number.';
					}
				}
			},
			{
				name: 'name',
				type: 'input',
				message: 'Enter the test name:',
				when: function(ctx) {
					var t = getTest(ctx);
					var exists = t.name && t.name.length > 0;
					return !exists;
				},
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test name.';
					}
				},
			}
		];
		return inquirer.prompt(questions).then((answer) => {
			const test = getTest(answer);
			if (test.reports === undefined) {
				// make a reports field if one doesn't exist - this is a new test!
				console.log("Making new test '"+test.number+":"+test.name+"'");
				test.reports = [];
			} else {
				console.log("Loaded test "+test.number+":"+test.name);
			}
			return test;
		});
	},
	performTest: function() {
		const questions = [
			{
				name: 'name',
				type: 'input',
				message: 'Enter the test name:',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test name.';
					}
				}
			},
			{
				name: 'preconditions',
				type: 'input',
				message: 'Enter the test preconditions:',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter the test preconditions.';
					}
				}
			},
		];
		return inquirer.prompt(questions).then((answer) => {
			const method_questions = [
				{
					name: 'method',
					type: 'input',
					message: 'Add a method (leave blank to finish):',
					validate: function(value) {
						if (value.length || answer.methods.length) {
							return true;
						} else {
							return 'You must add at least one method!';
						}
					}
				},
				{
					name: 'criteria',
					type: 'input',
					when: (ctx) => {
						if (ctx.method.length) {
							return true;
						} else {
							return false;
						}
					},
					message: 'What is the acceptance criteria?',
					validate: function(value) {
						if (value.length) {
							return true;
						} else {
							return 'You must enter acceptance criteria for the method.';
						}
					}
				},
			];
			answer.methods = [];
			answer.acceptanceCriteria = [];
			function addMethod() {
				return inquirer.prompt(method_questions).then((methodAnswer) => {
					var newMethod = methodAnswer.method;
					if (newMethod.length) {
						// copy methods into answer
						answer.methods.push(newMethod);
						// copy acceptance criteria into answer
						answer.acceptanceCriteria.push(methodAnswer.criteria);
						return addMethod();
					} else {
						return answer;
					}
				});
			}
			return addMethod();
		}).then((answer) => {
			const resultIndices = [...Array(7).keys()];
			const results_questions = resultIndices.map((k) => {
				return {
					name: `${k}`,
					type: 'checkbox-plus',
					message: 'Enter result for Test ' + k + ':',
					highlight: true,
					searchable: true,
					source: function(answersSoFar, input) {
						input = input || '';
						return new Promise((resolve, reject) => {
							var fuzzyResult = fuzzy.filter(input, ['PASS','FAIL','SKIP']);
							var data = fuzzyResult.map((e) => e.original);
							resolve(data);
						});
					},
					validate: function( value ) {
						if (typeof value === 'string' || value.length == 1) {
							return true;
						} else {
							return 'You must select exactly one option!';
						}
					}
				};
			});
			answer.results = [];
			return inquirer.prompt(results_questions).then((resultsAnswer) => {
				// copy results into answer
				answer.results = resultIndices.map((k) => {
					return resultsAnswer[k][0];
				});
				// have final result from test
				answer.finalResult = answer.results.reduce((fr, r) => {
					return fr && r.indexOf('FAIL') == -1;
				}, true);
				return answer;
			});
		});
	},

	makeTestReport: function(existingReports, requirements) {
		requirements = requirements
			.sort((a,b) => utils.naturalCompare(a.name, b.name));
		var start = moment().format("YYYY-MM-DD");
		var defaultNumber = parseInt(existingReports.map((r) => r.number).sort().reverse()[0]) || 0;
		defaultNumber = `${defaultNumber + 1}`;
		const questions = [
			{
				name: 'number',
				type: 'input',
				message: 'Enter new report number:',
				default: defaultNumber,
				validate: function( value ) {
					var exists = existingReports.map((r) => r.number).indexOf(value) > -1;
					if (value.length) {
						if (exists) {
							return "A report with that number already exists!";
						} else {
							return true;
						}
					} else {
						return 'Please enter a report number.';
					}
				}
			},
			{
				name: 'revision',
				type: 'input',
				message: 'Enter the report revision:',
				default: 'A',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a revision code.';
					}
				}
			},
			{
				name: 'description',
				type: 'input',
				message: 'Enter the report description:',
				default: '',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a report description.';
					}
				}
			},
			{
				name: 'testerName',
				type: 'autocomplete',
				message: 'Who is performing the test:',
				suggestOnly: true,
				source: function(answersSoFar, input) {
					const names = [
						"William Emfinger",
						"Liyun Guo",
						"Ken Shafer",
						"Ben Hemkens",
						"Ben Gasser",
						"Dexter Watkins",
						"Brad Martin",
						"Devon Doebele",
						"Swapnil Pande",
					];
					input = input || '';
					return new Promise((resolve, reject) => {
						var fuzzyResult = fuzzy.filter(input, names);
						var data = fuzzyResult.map((e) => e.original);
						resolve(data);
					});
				},
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a tester name.';
					}
				}
			},
			{
				name: 'testLevel',
				type: 'list',
				message: 'Select the appropriate test level:',
				default: ["System"],
				choices: ['Software Item', 'External Software Interface', 'System']
			},
			{
				name: 'requirements',
				type: 'checkbox-plus',
				message: 'Select the requirements associated with this test:',
				default: [],
				highlight: true,
				searchable: true,
				source: function(answersSoFar, input) {
					input = input || '';
					return new Promise((resolve, reject) => {
						var fuzzyResult = fuzzy.filter(
							input,
							requirements.map((r) => r.name)
						)
						var data = fuzzyResult.map((e) => {
							console.log(e);
							return requirements[e.index];
						});
						resolve(data);
					});
				},
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'You must select at least one requirement.';
					}
				}
			}
		];
		return inquirer.prompt(questions).then((answer) => {
			// add tests here
			answer.tests = [];
			const test_questions = [
				{
					name: 'addTest',
					type: 'checkbox',
					message: 'Add a test?',
					choices: ['YES', 'NO'],
					default: ['YES'],
					validate: function( value ) {
						if (value.length == 1) {
							if (answer.tests.length || value.indexOf('YES') > -1) {
								return true;
							} else {
								return 'You must have at least one test!';
							}
						} else {
							return "You must select exactly one option!";
						}
					}
				},
			];
			var addTest = async () => {
				return inquirer.prompt(test_questions).then((testAnswer) => {
					if (testAnswer.addTest.indexOf('YES') > -1) {
						return this.performTest().then((test) => {
							answer.tests.push(test);
							return addTest();
						});
					} else {
						return answer;
					}
				});
			}
			return addTest();
		}).then((answer) => {
			// add notes here
			answer.notes = "";
			const notes_questions = [
				{
					name: 'notes',
					type: 'input',
					message: 'Record any notes from the test (optional):'
				},
			];
			return inquirer.prompt(notes_questions).then((notesAnswer) => {
				answer.notes = notesAnswer.notes;
				return answer;
			});
		}).then((answer) => {
			// finish
			var end = moment().format("YYYY-MM-DD");
			answer.startDate = start;
			answer.endDate = end;
			return answer;
		});
	},
}
