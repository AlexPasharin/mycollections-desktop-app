The file documents the validation logic "validate_generalised_date" function executes.

A "generalized" date is a form of text value, corresponding to a date in format YYYY-MM-DD, except that MM and DD parts are optional and also are allowed to contain only one digit. In other words string is either in one of the following forms: YYYY, YYYY-M, YYYY-MM, YYYY-MM-D, YYYY-MM-DD, where Y, M and D stand for digits.

Moreover the value of "generalized" date has to make sense as a date in a certain year range. The means precisely the following:

- "YYYY" part has to be an integer in the range 1900-2099
- "M" or "MM" part has to be an integer in the range 1-12, with leading 0 permitted, if present
- "D" or "DD" part is an integer in the range 1-31, with leading 0 permitted, if present
- The whole value has to correspond to an real existing date
- If "allow_feature_dates" extra boolean parameter of function is false (which it is by default), the value is also not allowed to represent a date in the future (relative to the moment function is called)

In case validation errors are found, function returns them all as array of text values. Otherwise a validated value is returned.
