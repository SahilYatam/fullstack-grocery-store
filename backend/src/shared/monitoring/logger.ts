import fs from "fs";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const LOG_DIR = "logs";
const isProd = process.env.NODE_ENV === "production";

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFormat = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss:SSS",
    }),
    format.errors({ stack: true }),
    format.json(),
);

const logger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new transports.Console({
            format: isProd
                ? format.json()
                : format.combine(
                    format.colorize(),
                    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
                    format.printf(
                        ({ timestamp, level, message }) =>
                            `${timestamp} [${level.toUpperCase()}]: ${message}`,
                    ),
                ),
        }),

        new DailyRotateFile({
            filename: `${LOG_DIR}/app-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m",
            maxFiles: "14d",
            auditFile: `${LOG_DIR}/audit.json`,
        }),

        new DailyRotateFile({
            level: "error",
            filename: `${LOG_DIR}/error-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "5m",
            maxFiles: "30d",
            auditFile: `${LOG_DIR}/error-audit.json`,
        }),
    ],

    exceptionHandlers: [
        new transports.File({ filename: `${LOG_DIR}/exceptions.log` }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: `${LOG_DIR}/rejections.log` }),
    ],
});

export default logger;
