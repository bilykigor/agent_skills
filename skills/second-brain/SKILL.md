---
name: second-brain
description: Add notes, create source entries, and search the Obsidian second brain vault at ~/Documents/second-brain/
user_invocable: true
---

# Second Brain Skill

Manage the Obsidian second brain vault at `~/Documents/second-brain/`.

## Vault Structure
- `0-inbox/` — Quick capture, unsorted notes
- `1-sources/` — Videos, articles, papers, podcasts
- `2-concepts/` — Atomic ideas (one idea per note)
- `3-patterns/` — Reusable design patterns
- `4-tools/` — Tools and frameworks
- `5-projects/` — Agent projects
- `6-people/` — Key people
- `maps/` — Maps of Content (index notes)
- `_templates/` — Note templates (source, concept, pattern, tool)

## Commands

### Quick note to inbox
When the user wants to capture a quick thought:
1. Create a file in `~/Documents/second-brain/0-inbox/` with a kebab-case filename
2. Add today's date in frontmatter
3. Write the note content
4. If it clearly belongs in a category, suggest moving it later

### Create source note
When the user provides a URL or mentions a video/article/paper:
1. Create a file in `~/Documents/second-brain/1-sources/` using the source template
2. Fill in metadata (type, url, author, date)
3. If transcript/content is available (e.g., via yt-transcript skill), summarize it into:
   - 3-5 bullet summary
   - Key takeaways with `[[links]]` to concept notes
   - Notable quotes
4. Create any new concept notes referenced in takeaways in `~/Documents/second-brain/2-concepts/`
5. Update `~/Documents/second-brain/maps/agent-building.md` if relevant

### Search vault
When the user wants to find something in the vault:
1. Use Grep to search `~/Documents/second-brain/` for the query
2. Read matching files and summarize findings
3. Show which notes are related via `[[links]]`

### Create concept note
When the user identifies an atomic idea:
1. Create in `~/Documents/second-brain/2-concepts/` using the concept template
2. Add bidirectional links to related concepts
3. Link back to source notes

### Create pattern note
When the user identifies a reusable pattern:
1. Create in `~/Documents/second-brain/3-patterns/` using the pattern template
2. Fill in problem, solution, trade-offs
3. Link to related concepts and tools

## Linking Convention
- Use `[[kebab-case-filename]]` for all internal links (no folder prefix needed)
- Obsidian resolves links by filename across the whole vault
- Always add backlinks in related notes when creating a new note
