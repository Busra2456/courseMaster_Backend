
 // Problem 1: Staircase
var staircase = function(n) {
  const rows = [];
  for (let i = 1; i <= n; i++) {
    rows.push(" ".repeat(n - i) + "#".repeat(i));
  }
  return rows.join("\n");
};

// Problem 2: Grading Students
var gradingStudents = function(grades) {
  return grades.map((grade) => {
    if (grade < 38) return grade;
    const next = Math.ceil(grade / 5) * 5;
    return next - grade < 3 ? next : grade;
  });
};

// Problem 3: Time Conversion
var timeConversion = function(s) {
  const period = s.slice(-2);
  const parts = s.slice(0, -2).split(":");
  let hour = Number(parts[0]);

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return `${String(hour).padStart(2, "0")}:${parts[1]}:${parts[2]}`;
};

// Problem 4: String Repeat
var repeatStr = function(n, s) {
  return s.repeat(n);
};

// Problem 5: Reversed Strings
var solution = function(str) {
  return str.split("").reverse().join("");
};

// Problem 6: Sum of Positive
var positiveSum = function(arr) {
  return arr.reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
};

// Problem 7: Grasshopper — Summation
var summation = function(num) {
  return (num * (num + 1)) / 2;
};

// Problem 8: Boolean to String
var booleanToString = function(b) {
  return String(b);
};

// Problem 9: Fizz Buzz
var fizzBuzz = function(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
};

// Problem 10: Running Sum
var runningSum = function(nums) {
  const result = [];
  let sum = 0;
  for (const n of nums) {
    sum += n;
    result.push(sum);
  }
  return result;
};

// Problem 11: Richest Customer Wealth
var maximumWealth = function(accounts) {
  let maximum = 0;
  for (const account of accounts) {
    const wealth = account.reduce((sum, amount) => sum + amount, 0);
    maximum = Math.max(maximum, wealth);
  }
  return maximum;
};

// Problem 12: Remove Duplicates from Sorted Array
var removeDuplicates = function(nums) {
  if (nums.length === 0) return 0;

  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }
  return k;
};

// Problem 13: Contains Duplicate
var containsDuplicate = function(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
};

// Problem 14: Move Zeroes — in-place, returns undefined
var moveZeroes = function(nums) {
  let write = 0;
  for (const n of nums) {
    if (n !== 0) nums[write++] = n;
  }
  while (write < nums.length) nums[write++] = 0;
};

// Problem 15: Merge Sorted Array — in-place, returns undefined
var merge = function(nums1, m, nums2, n) {
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
};

// Problem 16: 3Sum
var threeSum = function(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    if (nums[i] > 0) break;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
};

// Problem 17: Plus One
var plusOne = function(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  digits.unshift(1);
  return digits;
};

// Problem 18: Reverse String — in-place, returns undefined
var reverseString = function(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
};

// Problem 19: Length of Last Word
var lengthOfLastWord = function(s) {
  let i = s.length - 1;
  let length = 0;

  while (i >= 0 && s[i] === " ") i--;
  while (i >= 0 && s[i] !== " ") {
    length++;
    i--;
  }
  return length;
};

// Problem 20: Longest Common Prefix
var longestCommonPrefix = function(strs) {
  if (strs.length === 0) return "";

  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
};

// Node.js exports for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    staircase, gradingStudents, timeConversion, repeatStr,
    solution, positiveSum, summation, booleanToString,
    fizzBuzz, runningSum, maximumWealth, removeDuplicates,
    containsDuplicate, moveZeroes, merge, threeSum, plusOne,
    reverseString, lengthOfLastWord, longestCommonPrefix
  };
}
