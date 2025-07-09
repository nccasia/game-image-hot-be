import rTracer from "cls-rtracer";
import { format } from "winston";

const loggerFormatter = format.printf(
  ({ level, message, originalTimestamp, ...metadata }): string => {
    const rid = rTracer.id();
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      "@timestamp": timestamp,
      level,
      traceId: rid,
      message,
      ...metadata,
    });
  }
);

export default loggerFormatter;
