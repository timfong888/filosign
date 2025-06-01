# Task Management Prompt
## Goal
- To create clear task management plans that align with the PRDs as well as with new User input via chat directly to the agent.
- To create a place where the agent can update progress against tasks and be clear on what the next steps are.
- To identify potential tasks that are ambiguous or too large and need to be decomposed.

## How to Build the Task Management List
The *thinking* process should be based on the following context:

1. The related PRD that is defining the User Journey, goals, requirements;
2. The `engineering_design` document that is a high-level view of the entire systems design.  This document must include a Mermaid `sequence diagram` before proceeding to a task list.
3. The `engineering_design` document can be split into multiple documents if a given section is too complicated and in a completely different domain (e.g. encryption flow before storage and a subsequent storage flow)
4. The `engineering_design` document should be reviewed and inspected by a human before you start your task management list.
5. The `enginering_design` document should have a section at the very bottom called Changelog, and the date and changes should be recorded there.
6. Create the `execution` folder where the `task_lists` will go.
7. After the `engineering_design` has been signed off, build the `task_list.md` file.  Name it `task_list_[milestone_name]`.

## How to Interact with GitHub
Once a clearly defined milestone and its corresponding tasks are identified, a specific branch should be set up.

The branch name should correspond to the name of the milestone found in the Task Management document being executed.

When the branch is considered completed and ready for a PR, review and merge back to main, that branch URL should be added to the Task List in the related Milestone section.

No further work on the additional milestones should be addressed by the same agent till the PR is merged; the PR should not be merged unless all of the task items are completed.

NEVER delete the branch.  Even after merged, this is helpful to see the work.
KEEP ALL branches.


