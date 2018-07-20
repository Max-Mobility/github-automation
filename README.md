# github-automation
Automation tools for Design Control Procedures and Documents with
Github Integration

## Installation

```bash
git clone https://github.com/max-mobility/github-automation
cd github-automation
npm install # installs github-api, underscore, argparse
```

## Usage

Right now it just scrapes and filters the repository's issues based on
provided arugments.

```bash
$ node index.js --help
usage: index.js [-h] [-v] [-r REPO] [-o OWNER] [-s {all,open,closed}]
                [-p PATTERN]
                

Github Automation

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -r REPO, --repo REPO  Repository to scrape
  -o OWNER, --owner OWNER
                        Owner of the repository
  -s {all,open,closed}, --state {all,open,closed}
                        The state of the issues
  -p PATTERN, --pattern PATTERN
                        A pattern that the labels on the issues should match
```
Which will produce a table that is properly formatted into a PDF at
`${date}.${pattern}.pdf` and HTML at `${date}.${pattern}.html`.

The `PDF` file will be automatically opened by the default pdf viewer
on the system.

Example table produced:

<table>
<tr>
<th>Software Requirement</th>
<th>Github Issues</th>
<th>Creation</th>
<th>Completion</th>
</tr>
<tr>
<th rowspan=1>requirement-SRS-1-A</th>
<td>6: Implement bluetooth connectivity to PT and SD</td>
<td>2018-03-05</td>
<td>2018-07-02</td></tr>
<tr>
<th rowspan=1>requirement-SRS-2-A</th>
<td>6: Implement bluetooth connectivity to PT and SD</td>
<td>2018-03-05</td>
<td>2018-07-02</td></tr>
<tr>
<th rowspan=1>requirement-SRS-3-A</th>
<td>6: Implement bluetooth connectivity to PT and SD</td>
<td>2018-03-05</td>
<td>2018-07-02</td></tr>
<tr>
<th rowspan=1>requirement-SRS-4-A</th>
<td>6: Implement bluetooth connectivity to PT and SD</td>
<td>2018-03-05</td>
<td>2018-07-02</td></tr>
<tr>
<th rowspan=1>requirement-SRS-5-A</th>
<td>6: Implement bluetooth connectivity to PT and SD</td>
<td>2018-03-05</td>
<td>2018-07-02</td></tr>
<tr>
<th rowspan=1>requirement-SRS-6-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<th rowspan=1>requirement-SRS-7-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<th rowspan=2>requirement-SRS-8-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=2>requirement-SRS-9-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=1>requirement-SRS-10-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<th rowspan=1>requirement-SRS-11-A</th>
<td>4: Set up Kinvey integration</td>
<td>2018-03-05</td>
<td>2018-03-27</td></tr>
<tr>
<th rowspan=2>requirement-SRS-12-A</th>
<td>29: Flesh out the UI and refactor the dashboard</td>
<td>2018-04-16</td>
<td>2018-04-16</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=2>requirement-SRS-13-A</th>
<td>29: Flesh out the UI and refactor the dashboard</td>
<td>2018-04-16</td>
<td>2018-04-16</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=2>requirement-SRS-14-A</th>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<td>1: Stub out Evaluation pages</td>
<td>2018-02-05</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=1>requirement-SRS-15-A</th>
<td>1: Stub out Evaluation pages</td>
<td>2018-02-05</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=2>requirement-SRS-16-A</th>
<td>33: Add PT connectivity and interfaces to Trial pages</td>
<td>2018-05-14</td>
<td>2018-05-22</td></tr>
<tr>
<td>1: Stub out Evaluation pages</td>
<td>2018-02-05</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=2>requirement-SRS-17-A</th>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<td>1: Stub out Evaluation pages</td>
<td>2018-02-05</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=2>requirement-SRS-18-A</th>
<td>39: LMN Generation</td>
<td>2018-05-22</td>
<td>2018-06-06</td></tr>
<tr>
<td>1: Stub out Evaluation pages</td>
<td>2018-02-05</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=2>requirement-SRS-19-A</th>
<td>17: OTA Page Implementation and Use Cases</td>
<td>2018-03-27</td>
<td>2018-06-18</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=1>requirement-SRS-20-A</th>
<td>17: OTA Page Implementation and Use Cases</td>
<td>2018-03-27</td>
<td>2018-06-18</td></tr>
<tr>
<th rowspan=2>requirement-SRS-21-A</th>
<td>13: Integrate barcode scanner for scanning SmartDrives and PushTrackers</td>
<td>2018-03-09</td>
<td>2018-06-26</td></tr>
<tr>
<td>2: Stub out top-level menu pages</td>
<td>2018-02-05</td>
<td>2018-03-05</td></tr>
<tr>
<th rowspan=2>requirement-SRS-22-A</th>
<td>38: Set up ngx-translate for NS app</td>
<td>2018-05-16</td>
<td>2018-05-16</td></tr>
<tr>
<td>14: Translation functionality</td>
<td>2018-03-09</td>
<td>2018-07-11</td></tr>
<tr>
<th rowspan=1>requirement-SRS-23-A</th>
<td>118: Release beta onto iOS App Store and Google Play Store</td>
<td>2018-07-16</td>
<td>Invalid date</td></tr>
<tr>
<th rowspan=1>requirement-SRS-24-A</th>
<td>5: Push Notifications from Kinvey</td>
<td>2018-03-05</td>
<td>Invalid date</td></tr>
<tr>
<th rowspan=1>requirement-SRS-25-A</th>
<td>5: Push Notifications from Kinvey</td>
<td>2018-03-05</td>
<td>Invalid date</td></tr>
<tr>
<th rowspan=1>requirement-SRS-26-A</th>
<td>5: Push Notifications from Kinvey</td>
<td>2018-03-05</td>
<td>Invalid date</td></tr>
</table>
