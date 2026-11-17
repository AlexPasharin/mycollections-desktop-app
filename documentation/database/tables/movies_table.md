# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "name", "original_release_date", "comment", "imdb_url" and "relation_to_queen" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming

# Trigger on insert and on update

- Value of "name" is trimmed (with notification about it in case this changes value)
- Value of "original_release_date" is validated, if given, using "validate_generalised_date" function, with default false value for "allow_feature_dates" parameter (see /documentation/database/validation_functions/generalized_date_field_validation). If validation returns errors they are added to final exception thrown and the whole operation is rolled back \*. If validation succeeds and final validated value is different from the original value a notification about it is generated (for the changes validation does at this case see /documentation/database/validation_functions/generalized_date_field_validation).
- Value of "comment" is trimmed, if given (with notification about it in case this changes value)
- Value of "imdb_url" is trimmed, if given (with notification about it in case this changes value). The trimmed value is validated as follows - it must confirm to regex ^https://www.imdb.com/title/tt\d+$, in other words should be "https://www.imdb.com/title/tt" followed by some number and nothing else. If validation does not come through, an exception is thrown and the whole operation is rolled back \*.
- Value of "relation_to_queen" is trimmed, if given (with notification about it in case this changes value). If value of "part_of_queen_collection" is not true, but "relation_to_queen" is given, an exception is thrown and the whole operation is rolled back \*.
- For every release of the movie (via "movie_release_movies" table): the release's "release_date", if given, can not indicate time before value of movie's "original_release_date", and if movie's "part_of_queen_collection" is true, release's "part_of_queen_collection" must also be true. If this is violated an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
