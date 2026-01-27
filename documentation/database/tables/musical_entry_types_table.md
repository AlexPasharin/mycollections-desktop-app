# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "name" and "comment" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming

# Trigger on insert and on update

- Value of "name" is trimmed (with notification about it in case this changes value)
- Value of "comment" is trimmed, if given (with notification about it in case this changes value)
