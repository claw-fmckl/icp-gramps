~~~
Read the implementation plan at:
  ~/gh/icp-gramps/specs/Phase 2/PLAN.md

Find the first spec group that has incomplete tasks (unchecked `- [ ]` items).
Read the corresponding spec file in:
  ~/gh/icp-gramps/specs/Phase 2/

Study the relevant source files in the target codebase at:
  ~/gh/icp-gramps/

Read SESSION.md in the same directory as PLAN.md if it exists, for notes from previous sessions.

Then implement the tasks for that ONE spec group, in order. Follow these rules:

1. Implement tasks sequentially — no skipping, no reordering.
2. After each task, run the verification command.
3. Mark each task complete in PLAN.md (`- [x]`) as you finish it.
4. If verification fails, fix the issue and retry. If it fails twice on the same task, mark it with `- [!]` in PLAN.md, git commit partial work, and STOP.
5. Only modify files in the target codebase (~/gh/icp-gramps/), PLAN.md, and SESSION.md. Do not modify spec files.
6. When all tasks in the spec group are done, run the group verification commands.
7. Git commit all changes with a descriptive message.
8. APPEND a session summary to the END of SESSION.md (do NOT overwrite — read first, then append). Use heading `## Session N: Spec X.Y — <title>` (increment N). Include: what was accomplished, obstacles encountered, out-of-scope observations.
9. STOP. Do not continue to the next spec group.

When completely finished with the session, run this command to notify the orchestrator:
openclaw system event --text "Done: icp-gramps Phase 2 session complete — see SESSION.md" --mode now
~~~
