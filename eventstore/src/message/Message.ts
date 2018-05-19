export abstract class Message {
  public readonly $message: string;

  constructor(message: string) {
    this.$message = message;
  }
}
