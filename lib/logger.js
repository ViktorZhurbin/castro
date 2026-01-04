// ANSI color codes
const LogColors = {
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

/**
 *
 * @param {string} str
 * @param {'dim' | 'cyan' | 'green'} color
 * @returns
 */
export const colorLog = (str, color) => `${LogColors[color]}${str}${LogColors.reset}`

