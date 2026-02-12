# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "release_alternative_name", "release_date", "release_version", "discogs_url", "comment", "condition_problems" and "relation_to_queen" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming

# Trigger on insert and on update

- Value of "release_version" is trimmed (with notification about it in case this changes value)
- Value of "release_alternative_name" is trimmed (with notification about it in case this changes value). If trimmed value is same as release's entry's "main_name" or is not one of entry's "alternative_names" an exception is thrown and the whole operation is rolled back \*.
- Value of "release_date" is validated, if given, using "validate_generalised_date" function, with default false value for "allow_feature_dates" parameter (see /documentation/database/validation_functions/generalized_date_field_validation). If validation returns errors they are added to final exception thrown and the whole operation is rolled back \*. If validation succeeds and final validated value is different from the original value a notification about it is generated (for the changes validation does at this case see /documentation/database/validation_functions/generalized_date_field_validation).
- Value of "release_date" can not indicate time before value of release entry's "original_release_date". If this is violated an exception is thrown and the whole operation is rolled back \*.
- Value of "comment" is trimmed, if given (with notification about it in case this changes value)
- Value of "discogs_url" is trimmed, if given (with notification about it in case this changes value). The trimmed value is validated as follows - it must confirm to regex ^https://www.discogs.com/release/\d+-., in other words should start with https://www.discogs.com/. If validation does not come through, an exception is thrown and the whole operation is rolled back \*.
- Value of "condition_problems" is trimmed, if given (with notification about it in case this changes value)
- Value of "relation_to_queen" is trimmed, if given (with notification about it in case this changes value). If value of "part_of_queen_collection" is not true, but "relation_to_queen" is given, an exception is thrown and the whole operation is rolled back \*.
- If release entry's "part_of_queen_collection" is true, value of release's "part_of_queen_collection" must also be true, otherwise an exception is thrown and the whole operation is rolled back \*.
- Value of "countries" is validated using "validate_release_countries_jsonb" function (see documentation/database/validation_functions/release_countries_jsonb_validation). If validation fails an exception is thrown and the whole operation is rolled back \*.
- Value of "cat_numbers" is validated using "validate_release_cat_numbers_jsonb" function (see documentation/database/validation_functions/release_cat_numbers_jsonb_validation). If validation fails an exception is thrown and the whole operation is rolled back \*.
- Value of "matrix_runout" is validated using "validate_release_matrix_runout_jsonb" function (see documentation/database/validation_functions/release_matrix_runout_jsonb_validation). If validation fails an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
