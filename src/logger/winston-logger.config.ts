import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

const getCallerInfo = () => {
  const error = new Error();
  const stackLines = error.stack?.split('\n') || [];
  //console.log('Stack Trace:', stackLines); // Debugging - Remove in production

  let lastNodeModulesCaller = 'unknown';
  let callingFunction = 'unknownFunction';

  for (let line of stackLines) {
    // Extract function name if available
    const functionMatch = line.match(/at (.+?) \(/);
    if (functionMatch && functionMatch[1] !== 'Error') {
      callingFunction = functionMatch[1]; // Get the function name
    }

    const match = line.match(/\((.*):(\d+):\d+\)/);
    if (match) {
      let filePath = match[1];
      const lineNumber = match[2];

      // Trim absolute path, keep only from `src/`
      const projectRoot = path.resolve(__dirname, '..', '..');
      filePath = path.relative(projectRoot, filePath);
      filePath = filePath.replace(/\\/g, '/'); // Convert Windows \ to Unix /

      // If it's inside node_modules, store it as a fallback (last occurrence)
      if (filePath.includes('node_modules')) {
        lastNodeModulesCaller = `${filePath}:${lineNumber}`;
      }

      // If it's outside node_modules and not this config file, return it immediately
      if (!filePath.includes('node_modules') && !filePath.includes('winston-logger.config')) {
        return `${callingFunction} [${filePath}:${lineNumber}]`;
      }
    }
  }

  // If no valid caller found, return the last found node_modules caller
  return `${callingFunction} [${lastNodeModulesCaller}]`;
};

// Common log format (Ensures both Console & File logs are formatted the same way)
const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  const callerInfo = getCallerInfo(); // Get the correct file & line number
  return stack
    ? `${timestamp} [${level}] [${callerInfo}]: ${message} - ${stack}`
    : `${timestamp} [${level}] [${callerInfo}]: ${message}`;
});

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log', // Log file pattern
  datePattern: 'YYYY-MM-DD', // Rotate logs daily
  zippedArchive: true, // Compress old logs
  maxSize: '100m', // Max log file size before rotation
  maxFiles: '14d', // Keep logs for 14 days
  level: 'info', // Set log level
});

export const Logger = winston.createLogger({
  level: 'info', // Set logging level (error, warn, info, debug, etc.)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat // Apply the common log format
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(), // Adds color coding for console
        //logFormat // Ensure console logs show file & line number too
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    dailyRotateTransport,
  ],
});
