# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "name" and "name_for_sorting" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming
- There is a custom GIST index on expression "LOWER("name")", with operator class gist_trgm_ops. This is used for faster "similarity" fuzzy case-insensitive search on "name" field.
- There is a custom index on expression "(LOWER(COALESCE(name_for_sorting, name)), (artist_id::text))" used for pagination ordering.

# Trigger on insert and on update

- Value of "name" is trimmed (with notification about it in case this changes value)
- Value of "name_for_sorting" is trimmed (with notification about it in case this changes value)
- If value of "part_of_queen_family" is true, but for some entry corresponding to the artist in "musical_entries_artists" table it is true that entry's "part_of_queen_collection" is false, an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
