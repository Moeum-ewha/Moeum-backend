export default class ServerError extends Error {
  code: number; // HTTP Status code

  constructor(message: string, code: number = 500) {
    super(message);
    this.code = code;
  }
}
