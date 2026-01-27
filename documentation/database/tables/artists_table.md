# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "name" and "name_for_sorting" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming
- Field "other_names" is optional (this is prisma bug, it always treats fields of array type as mandatory in schema but in fact generates them as optional in database)
- Field "other_names" is of custom type "non_empty_text_array", meaning that it's value cannot be an empty array and also each value in it must be a non-empty string after trimming

# Trigger on insert and on update

- Value of "name" is trimmed (with notification about it in case this changes value)
- Value of "name_for_sorting" is trimmed (with notification about it in case this changes value)
- None of "other_names" values can be same as "name" (both considered trimmed) - if happens exception is thrown and operation is rolled back \*
- Duplicate values are removed from "other_names" (with notification about it). Note that values are considered the same if they are same after trimming
- Remaining values in "other_names" arrays are trimmed (with notification about every value in case trimming changes it)
- If value of "part_of_queen_family" is true, but for some entry corresponding to the artist in "musical_entries_artists" table it is true that entry's "part_of_queen_collection" is false, an exception is thrown and the whole operation is rolled back \*.
- If some entry corresponding to the artist in "musical_entries_artists" table has "entry_artist_name", that name must be in artist's (final) "other_names" array (determined as above). If not, an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
