const inquirer = require('inquirer');
const files = require('./files');
const utils = require('./utils');

module.exports = {

	addMethod: () => {
	},
	performTest: () => {
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
						answer.methods.push(newMethod);
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
				console.log(k);
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
				console.log(results_questions);
				console.log(resultsAnswer);
				answer.results = resultIndices.map((k) => {
					return resultsAnswer[k][0];
				});
				return answer;
			});
		});
	},

	makeTestReport: (requirements) => {
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
		return inquirer.prompt(questions);
	},
}
