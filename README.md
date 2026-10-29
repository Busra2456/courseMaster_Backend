# STN-7 Assignment 04 — Problem Solving

## Overview

This repository contains solutions to all 20 problems from the STN-7 Problem Solving Assessment List. All solutions are implemented in JavaScript and organized in a single file, `solution.js`, as required by the assignment.

## Technologies Used

- JavaScript (ES6+)
- Node.js
- Git and GitHub

## Project Structure

```text
problem-solving/
├── solution.js
└── README.md
```

## Problems Solved

| No. | Problem Name |
|---:|---|
| 1 | Staircase |
| 2 | Grading Students |
| 3 | Time Conversion |
| 4 | String Repeat |
| 5 | Reversed Strings |
| 6 | Sum of Positive |
| 7 | Grasshopper — Summation |
| 8 | Convert a Boolean to a String |
| 9 | Fizz Buzz |
| 10 | Running Sum of 1D Array |
| 11 | Richest Customer Wealth |
| 12 | Remove Duplicates from Sorted Array |
| 13 | Contains Duplicate |
| 14 | Move Zeroes |
| 15 | Merge Sorted Array |
| 16 | 3Sum |
| 17 | Plus One |
| 18 | Reverse String |
| 19 | Length of Last Word |
| 20 | Longest Common Prefix |

## Requirements

Install [Node.js](https://nodejs.org/) to run the solutions locally.

No external packages are required.

## How to Run

1. Clone this repository or download the source code.
2. Open the project folder in your terminal.
3. Run the following command to load the solutions:

```bash
node -e "require('./solution.js')"
```

The file exports all 20 functions for testing in Node.js. To test individual functions, import them into a test script or use the Node.js console.

Example:

```javascript
const { staircase, gradingStudents, timeConversion } =
  require("./solution.js");

console.log(staircase(4));
console.log(gradingStudents([73, 67, 38, 33]));
console.log(timeConversion("07:05:45PM"));
```

Expected output:

```text
  #
  ##
 ###
####
[ 75, 67, 40, 33 ]
19:05:45
```

## Implementation Notes

- Each solution uses the exact function name and parameter structure specified in the assessment.
- All 20 solutions are contained in one JavaScript file.
- In-place problems modify the original array where required.
- Solutions account for the edge cases described in the problem statements.
- Comments identify each problem by number and title.
- No hardcoded outputs are used.

## Complexity

The implementations use appropriate algorithms for each problem. Examples include:

- Linear-time iteration for array summation and running sums.
- A `Set` for duplicate detection.
- Two-pointer techniques for in-place array operations.
- A two-pointer approach after sorting for the 3Sum problem.
- The arithmetic formula for summation.

## Assignment Information

**Program:** STN-7  
**Assignment:** Assignment 04 — Bug Bashing & Problem Solving  
**Section:** Part 2 — Problem Solving  
**Language:** JavaScript

## Author

Add your name and GitHub profile here before submitting.

