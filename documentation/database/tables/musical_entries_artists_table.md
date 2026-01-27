# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Field "entry_artist_name" is of custom type "non_empty_text", meaning that it's values are not allowed to be empty strings after trimming

# Trigger on insert and on update

- If for corresponding artist value of "part_of_queen_family" is true, but for corresponding entry value of "part_of_queen_collection" is false an exception is thrown and the whole operation is rolled back \*
- Value of "entry_artist_name" is trimmed (with notification about it in case this changes value)
- If (trimmed) "entry_artist_name" is not null, but it does not correspond to one of the names in corresponding artist's "other_names" array, an exception is thrown and the whole operation is rolled back \*

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
