const inquirer = require('inquirer');
const moment = require('moment');
const files = require('./files');
const utils = require('./utils');

module.exports = {

	addMethod: function() {
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
					type: 'checkbox',
					message: 'Enter result for Test ' + k + ':',
					choices: ['PASS', 'FAIL', 'SKIP'],
					default: [],
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

	makeTestReport: function(requirements) {
		var start = moment().format("YYYY-MM-DD");
		const questions = [
			{
				name: 'testNumber',
				type: 'input',
				message: 'Enter the test number:',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test number.';
					}
				}
			},
			{
				name: 'revision',
				type: 'input',
				message: 'Enter the test revision:',
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
				message: 'Enter the test description:',
				default: '',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test description.';
					}
				}
			},
			{
				name: 'requirements',
				type: 'checkbox',
				message: 'Select the requirements associated with this test:',
				choices: requirements.sort((a,b) => utils.naturalCompare(a.name, b.name)),
				default: [],
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
					console.log(testAnswer);
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
			// finish
			var end = moment().format("YYYY-MM-DD");
			answer.startDate = start;
			answer.endDate = end;
			return answer;
		});
	},
}
