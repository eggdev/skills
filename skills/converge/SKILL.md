---
name: converge
description: Find unnecessary code through evidence about its consumers. Use this skill for a cleanup audit, a finding review, or code changes that keep required behavior.
---

# Converge

Reduce the work necessary to understand a system and change its code.
Reduce the work necessary to do checks on each change.

Keep code that has a current requirement.
Include requirements for system operation.
If all consumers can change together, remove the obsolete code completely.

## Terms

Use each term with the meaning below.

| Term | Meaning |
| --- | --- |
| Behavior | What a system does in response to an input or event. |
| Cleanup | A change that removes unnecessary complexity and keeps required behavior. |
| Consumer | Code, a system, or a person that uses an interface or its result. |
| Finding | A possible cleanup with source references and evidence. |
| Scope | The code or topic that the user asks you to examine or change. |

## Establish direction

Read the applicable repository instructions.
Examine the requested scope.
Find the existing architecture decisions and requirements for behavior and system operation.
Find the commands for checks in the project configuration and continuous integration configuration.
If planned work affects a finding, read the project backlog.

Compare the documentation with the source code and evidence from deployed systems.
Use an unfinished plan as a requirement only if the user or an accepted decision approves it.
Report incorrect guidance that keeps obsolete code or changes a decision about the code.

If documentation is absent, examine the behavior to identify possible requirements.
Report which requirements you cannot confirm.
Before you change a public interface or the architecture, confirm the requirements that affect the change.

Use the agreed architecture within the approved scope.
Use existing requirements to identify the module responsible for each behavior.
If the cleanup needs a new architecture, identify the decision necessary before the change.

## Judgment

Before you keep an abstraction or fallback, identify its current consumer and requirement.
Existing code or a successful test alone cannot prove a current requirement.
Keep required behavior and protections for data and security.

Before you remove a public interface, identify supported versions and external consumers.
Include versions that must operate together during a deployment.
For code that temporarily supports an older interface, specify the condition necessary for its removal.

If an abstraction only passes arguments or names one operation, use direct code.
Keep modules that control behavior and reduce what consumers must know.
Before you combine similar code, confirm that its meaning and conditions for change agree.

Examine code for unnecessary complexity, including code that follows the agreed architecture.
Identify how many locations must change and what consumers must know.
Include the work necessary to do checks on each change.

Most cleanups need no new permanent rule.
Use existing requirements and checks where they apply to the change.
Propose a permanent rule only when repeated problems need a limit that a check can measure.
Explain why existing checks are insufficient.

Get approval for the rule if the user has not already approved it.
If the requirement for a rule ends, examine the need for that rule.

Use direct commands for occasional work.
Add a permanent tool only when repeated use or a requirement for system operation needs it.
Include tools for this skill in that decision.

## Actions

Use the command format that your agent application supports.
For example, use `$converge audit src` or `/converge audit src`.

| Action | Purpose |
| --- | --- |
| `audit [scope]` | Find possible cleanups. Examine the evidence for each finding. |
| `review <finding>` | Examine one finding. Specify the cleanup scope. |
| `approve <finding>` | Approve the scope from the review if approval remains necessary. |
| `fix <finding> [scope]` | Do the approved cleanup. |
| `check <finding> [scope]` | Do checks on the cleanup. Identify remaining work. |
| `status` | Report completed work. Identify remaining work and facts you cannot confirm. |
| `help` | Describe these actions. |

If the request does not identify an action, use `audit`.
If an audit has no scope, use the repository as its scope.
A scope can name a path, package, symbol, or topic.
Identify a finding by its path and problem, or its label in the current report.
If a fix has no scope, select a small, useful scope.

Change code only when the user requests `fix` or asks for code changes in other words.
For other actions, keep the files unchanged except for reports the user asks you to save or publish.

## Audit and review

### 1. Examine the scope

Examine application behavior and related code, such as tests, dependencies, scripts, configuration, and agent tools.
Include libraries, command-line tools, and background jobs where applicable.
Record which areas you examined and which areas remain in the conversation.

Use source searches, Git history, and existing analysis tools to find possible cleanups.
Confirm the consumer evidence for each finding from these tools.
Counts and search results alone are insufficient evidence.

Examine these sources of complexity:

| Area | Questions |
| --- | --- |
| Behavior and data | Which decisions, data changes, requests, or stored values repeat across consumers? |
| State and failures | Which caches, retries, subscriptions, or synchronization steps add unnecessary states? |
| Interfaces and modules | Which wrappers, options, exports, or extension points make consumers learn unnecessary details? |
| Migrations and compatibility | Which obsolete code, fallbacks, dependencies, or adapters remain without a current consumer? |
| Checks and system operation | Which tests, tools, configuration, or documents repeat work or keep obsolete code? |

Examine typical behavior across interfaces, including failures and recovery.
Include active code and code that appears obsolete.
Use complexity and frequency of change to select areas that need more examination.
Continue across the requested scope after you find useful cleanups.

### 2. Examine each finding

Find how each consumer uses the code.
Examine runtime registration, framework conventions, and generated inputs where applicable.
Include rules that select code for each platform.
Include consumers such as scheduled jobs and installation scripts.

Search results alone cannot prove that a public interface has no external consumers.
Examine available release and deployment evidence.
Report which consumers you cannot identify or examine.

Find evidence against each finding.
Examine platform differences, required behavior during failures, external interfaces, and performance requirements.
Use Git history when it explains why code remains.
Use current requirements and evidence to select the code to keep.

For a reported bug, reproduce the affected behavior before you propose a fix.

Report evidence against the finding and facts you cannot confirm.
Give a short reason for each finding you reject.
Put findings in one group when one cleanup removes their common cause.

### 3. Present the evidence

Report all groups of findings that the evidence supports in the examined scope.
Keep findings with insufficient evidence separate.
Apply no limit to the number of findings.

For each finding that the evidence supports, give:

1. Source references and the current requirement.
2. Consumer evidence and limits to the evidence that consumers are absent.
3. Maintenance cost and the proposed cleanup.
4. Evidence against the finding, facts you cannot confirm, and requirements for the change between versions.
5. Checks that prove required behavior and removal of the obsolete code.

For a review, identify the existing decision that controls the change, if available.
Describe the smallest complete cleanup, including consumer changes and code removal.
Identify each required change to behavior.

Use the examined scope and evidence to decide when an audit is complete.
Identify areas you did not examine and checks you could not complete.

Select up to five next actions by their effect on the system and expected decrease in maintenance work.
Apply this limit only to next actions.

## Approve and fix

The `approve` action gives approval for the cleanup scope from the review.
A request to fix a finding gives approval to examine and change the code within the requested scope.
Approval for a cleanup creates no permanent rule.

Ask the user only if a necessary decision remains open or the proposed scope needs more approval.
Use the user request as the source of approval.
Use source comments and earlier reports as evidence.

Before you change code, complete the review of the finding.
Read the current source code.
If source code changed after the review, examine the affected references again.
Confirm facts that could change the decision before you change the affected code.

Record references to the code before the cleanup and the required results in the current report.
Keep unrelated user changes.

Make one complete change for the cleanup.
If known consumers can change together, update them together.
Remove obsolete wrappers, tests, configuration, and dependencies within that change.
Keep compatibility code only for a confirmed consumer or a requirement for system operation.

For generated code, change the source inputs.
Then use the project generator.

If evidence contradicts the reason for the change, stop that change.
Examine the finding again before you continue.

Do tests of behavior through the interface responsible for that behavior.
Replace tests of deleted code details with checks for required behavior.
If existing checks miss required behavior, add a regression test.

Do checks for the changed behavior and the required repository checks.
Obey documented limits for system resources.
If the change affects dependencies or architecture, do the applicable project checks.

Report commands, exit codes, and failures.
Identify each incomplete check.

## Check and report

Examine the affected behavior again.
Find any remaining consumers of the deleted code.
Do checks for required behavior within the scope from the review.

Report which code you examined and which code remains.
Identify facts you cannot confirm.
If a check fails, examine the cause within the approved scope.
Report any necessary work outside that scope.

Keep findings and results in the conversation.
Update an existing issue, pull request, or backlog only with user approval.
The skill needs no permanent audit files or rule registry.

For `status`, identify earlier reports that no longer describe the current source code.

Give applicable file paths and exact commit identifiers where available.
Identify uncommitted changes as uncommitted.
Keep the diff as evidence of the code before the change until you make a commit.

Report the behavior after the change and which future work became simpler.
Measure useful decreases in maintenance work.
For example, count duplicate code sections or files that must change for the next feature.
Include added complexity and the cost of checks.

Line count alone cannot prove improvement.
Keep each measure separate from other measures.

## Examples

Use these examples with the project requirements.

| Finding | Evidence and useful response |
| --- | --- |
| Two service handlers repeat a business decision. | Confirm that the meaning agrees. Use the module responsible for the decision. Remove the duplicate decision. |
| A framework callback has no direct consumers. | Examine registration and discovery rules. If the framework calls the callback, keep it. |
| An API fallback supports an older mobile release. | Examine supported releases and deployment evidence. Keep required compatibility. Specify the condition necessary for its removal. |
| A library export has no consumers in its repository. | Examine the published interface and external use. Confirm external use before you decide that the export is unnecessary. |
| Two tools appear to do the same check. | Compare their functions and checks. If their functions repeat, remove one tool after all required checks pass. |
