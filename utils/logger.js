require('path');
const { AsyncLocalStorage } = require('async_hooks');
const config = require('../config');

const asyncLocalStorage = new AsyncLocalStorage();

let isPretty = config.logging.isPretty; // Flag to toggle pretty JSON output

function formatJson(data) {
  return isPretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

// ANSI Escape Codes for terminal colors
const colors = {
  reset: '\x1b[0m',
  info: '\x1b[32m',   // Green
  warn: '\x1b[33m',   // Yellow
  error: '\x1b[31m',  // Red
  table: '\x1b[36m'   // Cyan
};

// Helper function to extract file path and line number from the stack trace
function getCallerInfo() {
  const err = new Error();
  const stackLines = err.stack.split('\n');
  
  // stackLines[0] = "Error"
  // stackLines[1] = "at getCallerInfo (...)"
  // stackLines[2] = "at Object.info/warn/error (...)"
  // stackLines[3] = The actual file where the logger was called
  const callerLine = stackLines[3];
  
  if (callerLine) {
    // Regex to match the file path and line number out of the stack trace string
    const match = callerLine.match(/(?:at\s+.+\s+\(|at\s+)(.+?):(\d+):(\d+)/);
    if (match) {
      const fullPath = match[1];
      const line = match[2];
      return `[${fullPath}:${line}]`;
    }
  }
  return '[unknown path]';
}

const logger = {
  setPretty: (flag) => {
    isPretty = !!flag;
  },

  runWithTraceId: (traceId, callback) => {
    asyncLocalStorage.run({ traceId }, callback);
  },

  info: (...args) => {
    const store = asyncLocalStorage.getStore();
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      traceId: store ? store.traceId : undefined,
      caller: getCallerInfo(),
      message: args.length === 1 ? args[0] : args
    };
    console.log(`${colors.info}%s${colors.reset}`, formatJson(logData));
  },
  
  warn: (...args) => {
    const store = asyncLocalStorage.getStore();
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      traceId: store ? store.traceId : undefined,
      caller: getCallerInfo(),
      message: args.length === 1 ? args[0] : args
    };
    console.warn(`${colors.warn}%s${colors.reset}`, formatJson(logData));
  },
  
  error: (...args) => {
    const store = asyncLocalStorage.getStore();
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      traceId: store ? store.traceId : undefined,
      caller: getCallerInfo(),
      message: args.length === 1 ? args[0] : args
    };
    console.error(`${colors.error}%s${colors.reset}`, formatJson(logData));
  },
  
  table: (data) => {
    const store = asyncLocalStorage.getStore();
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'TABLE',
      traceId: store ? store.traceId : undefined,
      caller: getCallerInfo(),
      data: data
    };
    console.log(`${colors.table}%s${colors.reset}`, formatJson(logData));
  }
};

module.exports = logger;