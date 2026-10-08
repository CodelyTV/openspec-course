# 🎯 Documentation Standard

## 💡 Convention

`docs/` only holds what an agent needs to write correct code in this project and cannot infer from the code itself. Human onboarding (setup walkthroughs, troubleshooting, course context) goes in the README.

Every doc is a standalone Markdown file inside `docs/`, organized by area (`architecture/`, `testing/`). There are two kinds:

- **Convention docs** describe how to write code here (e.g. `testing/testing-strategy.md`). They follow a fixed structure with these sections in order: Convention, Benefits, Examples (good and bad), Real world examples, and Related agreements.
- **Reference docs** describe facts about the project (e.g. `architecture/screens.md`, `architecture/project-layout.md`). They skip the fixed structure and stay as lean as possible.

Every doc must be minimal, true and stable: if the code changes, the doc changes in the same commit.

## 🏆 Benefits

- AI agents can consume individual docs without loading the entire knowledge base, reducing token usage.
- Each doc is independently reviewable in PRs, making convention changes easy to track.
- The fixed structure ensures consistency and completeness across convention docs.
- Keeping reference docs lean avoids restating what the code already says, so they don't drift.

## 👀 Examples

### ✅ Good: Well-structured convention document

```markdown
# 🎯 Name of the convention

## 💡 Convention

Convention description.

## 🏆 Benefits

- List of why to use this convention.

## 👀 Examples

### ✅ Good: Definition of a good example

good example

### ❌ Bad: Definition of a bad example

bad example

## 🧐 Real world examples

- Links to files following this convention

## 🔗 Related agreements

- Links to agreements related to this convention if applies
```

### ❌ Bad: Convention buried in a monolithic file

```markdown
# Project Guidelines

## Architecture
We use hexagonal architecture...

## Testing
Use object mothers...

## Database
PostgreSQL...
```

## 🧐 Real world examples

- [Testing strategy convention](testing/testing-strategy.md)
- [Screens reference](architecture/screens.md)

## 🔗 Related agreements

- All docs inside `docs/` must follow this standard.
- `AGENTS.md` keeps the map of `docs/` up to date.
