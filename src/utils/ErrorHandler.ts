class ErrorHandler extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
