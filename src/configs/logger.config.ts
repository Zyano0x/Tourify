import pino from "pino";

const logger = pino({
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
});

export default logger;
