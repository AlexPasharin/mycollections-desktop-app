The file documents the validation logic "check_sequential_integers" function executes.

Function "check_sequential_integers" takes an array of integers "numbers" and returns a boolean telling whether these numbers form a sequence of integers starting from 1 without gaps and without duplicates. Unlike most other validation functions it does not accumulate validation error messages - it is up to the caller to produce an error message when the function returns false.

- If "numbers" is NULL or is an empty array, TRUE is returned - having nothing to order is considered valid.
- Otherwise TRUE is returned only if the smallest number is 1, the largest number is equal to the amount of numbers, and all numbers are distinct. Together these three conditions mean the values are exactly 1, 2, ..., n, where n is the amount of numbers.
- The order in which the numbers appear in the array does not matter, only the set of values they form does.
