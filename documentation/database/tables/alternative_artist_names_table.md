# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Field "name" is of custom type "non_empty_text", meaning that it's values are not allowed to be empty strings after trimming
- There is a custom GIST index on expression "LOWER("name")", with operator class gist_trgm_ops. This is used for faster "similarity" fuzzy case-insensitive search on "name" field.

# Trigger on insert and on update

- Value of "name" is trimmed (with notification about it in case this changes value)
- (Trimmed) value of "name" cannot be same as "name" of a corresponding "artist" in "artists" table- if happens exception is thrown and operation is rolled back.
