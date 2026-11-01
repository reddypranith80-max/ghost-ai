# How to read this book

This book is generated from the Ghost AI repository by `node scripts/build-book.mjs`. Every listing, table, count and command result in it is read from the repository or captured when the book was built; nothing is copied by hand except the narrative paragraphs, which are kept in `docs/book/chapters/` and `docs/book/file-notes.json`. If the code changes, rebuild the book and it changes with it.

## Who it is for

- **A newcomer** who wants to understand what Ghost AI is and how it was made: read Part I, then the "Explain like I'm 5" and "Run me" chapters in Part II.
- **A developer** who wants to change the code: read the architecture and code-tour chapters in Part II, then use Part III as an annotated reference. Each file has a short "what, why, how it connects" note before its full listing.
- **A reviewer or operator** who wants to know what has actually been checked: go straight to Part V, which separates what was verified (with the command and result) from what was not.

## How the parts fit together

| Part | Question it answers |
|---|---|
| I. The story | What was built, by whom, in what order, and what went wrong on the way? |
| II. Architecture and design | How is the system put together, and how do you run, operate and review it? |
| III. Complete source code | What is in every tracked source and configuration file? |
| IV. Layout and structure | Where is everything: directories, routes, data model, design tokens, components, API? |
| V. Execution log | Which commands were run, what happened, and what has not been verified? |
| Appendices | Environment variables, troubleshooting, glossary, license note, changelog, file index. |

## Conventions

- File paths are relative to the repository root (the folder that contains `package.json`).
- Code listings in Part III have line numbers; long lines wrap, and the wrapped continuation carries no number.
- A line such as "Exports: ..." is detected automatically from the source text; it is a convenience, not a full type analysis.
- "Demo mode" means the app runs without Clerk keys and, in the static build, simulates the backend in the browser.
- The product's agents are simulated. That is stated in the changelog's known gaps and repeated here so nobody reads this book as a claim that real model calls happen inside the app.

## What this book is not

It is not a tutorial that you can follow line by line to recreate the project from an empty folder: the repository is the tutorial, and the book is its annotated mirror. Length comes from the content that actually exists (roughly eleven thousand lines of source, configuration, tests and documentation). The PDF page count is measured from the generated file and reported in the build summary rather than promised in advance.
