# Agent development graph

`graph.yaml` declares execution dependencies, model choices, prompt paths relative to this directory, and exclusive ownership paths relative to the repository root. Run `npm run agents:validate` to validate it and print an execution order. The validator also accepts a graph path as its first argument.

The coordinator fixes shared interfaces and assigns non-overlapping files before work starts. Recon precedes design system and booking flow, which may run in parallel; visual QA starts after both finish. `feedback` describes return messages, not execution dependencies: QA routes findings to the appropriate owner and reports to the coordinator, who makes the final decision. Owners must coordinate any changes outside their listed paths before editing; a path assignment is not permission to edit a file concurrently.
