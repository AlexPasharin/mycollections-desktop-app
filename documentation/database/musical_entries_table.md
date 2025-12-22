# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "main_name", "original_release_date", "comment", "discogs_url", "relation_to_queen" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming
- Field "alternative_names" is optional (this is prisma bug, it always treats fields of array type as mandatory in schema but in fact generates them as optional in database)
- Field "alternative_names" is of type "non_empty_text_array", meaning that it's value cannot be an empty array and also each value in it must be a non-empty string after trimming

# Trigger on insert and on update

- Value of "main_name" is trimmed (with notification about it in case this changes value)
- Each element of "alternative_names" array is trimmed (with notification about it in case this changes value). If element after trimming is identical to "main name" (after trimming) an exception is thrown and the whole operation is rolled back \*. If element after trimming has already occurred in array (after trimming) i.e. is a duplicate, it is skipped i.e. not added to the final value of "alternative_names".
- Value of "release_date" is validated, if given, using "validate_generalised_date" function, with default false value for "allow_feature_dates" parameter (see /documentation/generalized_date_field_validation). If validation returns errors they are added to final exception thrown and the whole operation is rolled back \*. If validation succeeds and final validated value is different from the original value a notification about it is generated (for the changes validation does at this case see /documentation/generalized_date_field_validation).
- Value of "comment" is trimmed, if given (with notification about it in case this changes value)
- Value of "discogs_url" is trimmed, if given (with notification about it in case this changes value). The trimmed value is validated as follows - it must confirm to regex ^https://www.discogs.com/(master|release)/\d+-., in other words should start with https://www.discogs.com/, following words "master" or "release" and then follow with "/", some number, "-" and then arbitrary text. If validation does not come through, an exception is thrown and the whole operation is rolled back \*.
- Value of "relation_to_queen" is trimmed, if given (with notification about it in case this changes value). If value of "part_of_queen_collection" is not true, but "relation_to_queen" is given, an exception is thrown and the whole operation is rolled back \*.
- If value of "part_of_queen_collection" is false, but for some artist corresponding to the entry in "musical_entries_artists" table it is true that artist's "part_of_queen_family" is true, an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
