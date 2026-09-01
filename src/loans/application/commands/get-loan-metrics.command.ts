export class GetLoanMetricsCommand {
  constructor(
    /** Rango sobre la fecha de inicio del préstamo; ambos opcionales. */
    public readonly from?: Date,
    public readonly to?: Date,
    /** Rol de quien consulta: decide hasta dónde llega el detalle. */
    public readonly role?: string,
  ) {}
}
