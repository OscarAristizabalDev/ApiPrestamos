export class ListLoansCommand {
  constructor(
    public readonly page: number,
    public readonly limit?: number,
  ) {}
}
