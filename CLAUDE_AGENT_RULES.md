# Claude Agent Rules

This file contains behavioral guidelines for Claude Code when working on this project.

## Communication Style

### Be Concise
- Avoid long-winded explanations after completing tasks
- Don't list every single file changed or detail of what was done unless explicitly asked
- Focus on what matters: did it work? are there issues?

### Summary Format
After implementing a feature, provide a brief summary:
```
✓ Feature implemented successfully
✓ Build passed
✓ Translations added

Ready for testing.
```

NOT this:
```
I have successfully implemented the feature by:
1. First, I updated model X in file Y at line Z
2. Then I modified the service in file A at line B
3. After that, I changed the component in file C
4. Next, I updated the template...
[10 more lines of unnecessary detail]
```

### When Details ARE Needed
Provide detailed information only when:
- There are errors or warnings that need attention
- There are breaking changes that affect other parts of the codebase
- The user explicitly asks for details
- There are important architectural decisions that need user input
- Something failed or didn't work as expected

## Task Execution

### Don't Over-Explain
- Don't announce every single step you're about to take
- Just do the work and report the outcome
- Trust that the user understands the general process

### Proactive Building
- After making changes, build the project once to verify compilation
- Report only if there are errors
- If build succeeds, just mention "Build passed" in the summary

### Focus on Outcomes
Instead of:
```
Now I'm going to update the interface...
I've updated the interface successfully at line X.
Next, I'll update the service...
I've successfully updated the service at line Y.
Now I need to update the component...
```

Just do:
```
[Makes all the changes]

Done. Build passed. Ready to test.
```

## Translation Guidelines

### When Adding Translations
- Add both Georgian (GE) and English (EN) translations
- Use the existing translation structure in `src/app/core/translation.service.ts`
- Update both the TypeScript interface and the implementation
- No need to explain how the translation system works unless asked

## Testing & Verification

### Build Process
- Run `npm run build` after significant changes
- Only mention build output if there are errors or warnings
- "Build passed" is sufficient for success

### What to Report
**DO Report:**
- Compilation errors
- Runtime errors
- Breaking changes
- Missing dependencies
- Test failures

**DON'T Report:**
- Every file you touched (unless there's an issue)
- Line-by-line changes (unless debugging)
- Successful operations (just summarize)

## Code Changes

### File References
- Use the pattern `filename:line` only when pointing out specific issues or answering questions
- Don't list every file and line number after making routine changes

### Commit Messages
When asked to commit:
- Write clear, concise commit messages
- Focus on WHAT changed and WHY
- Follow conventional commit format: `feat:`, `fix:`, `refactor:`, etc.

## General Principles

1. **Assume Competence**: The user understands development. Don't over-explain basic concepts.
2. **Be Efficient**: Fewer words, more action.
3. **Focus on Value**: What does the user need to know?
4. **Report Problems**: Always surface issues immediately and clearly.
5. **Skip the Obvious**: If something worked as expected, just note it briefly.

## Examples

### Good Response
```
Added initial_cost field to products:
- Updated models and types
- Added form field with validation
- Added table column with currency formatting
- Added translations (GE/EN)

Build passed. Ready for testing.
```

### Bad Response
```
I'll help you add the initial_cost field. Let me start by exploring the codebase structure.

[Long exploration output]

Now I understand the structure. I'll make the following changes:
1. First, I'll update the Item interface in src/app/core/models.ts
2. Then I'll update the ProductFormData interface
3. After that, I'll modify the component...

[Makes changes]

I've successfully updated the Item interface at line 13 of src/app/core/models.ts by adding initial_cost?: number | null.

Next, I updated the ProductFormData interface at line 14 of...

[Continues for 50+ lines]

The implementation is now complete. All changes have been made successfully.
```

## Remember
**The user hired Claude to code, not to narrate.**
