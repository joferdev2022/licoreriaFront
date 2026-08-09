export class ExpenseRequest {
  fecha!: string;
  categoria!: string;
  descripcion!: string | null;
  proveedor!: string | null;
  metodoPago!: string;
  comprobante!: string | null;
  estado!: string;
  monto!: number;
  local!: number;
  observaciones!: string | null;

  static createFromObject(expense: any): ExpenseRequest {
    const request = new ExpenseRequest();
    request.fecha = expense.fecha;
    request.categoria = expense.categoria;
    request.descripcion = expense.descripcion?.trim() || null;
    request.proveedor = expense.proveedor?.trim() || null;
    request.metodoPago = expense.metodoPago;
    request.comprobante = expense.comprobante?.trim() || null;
    request.estado = expense.estado;
    request.monto = Number(expense.monto);
    request.local = Number(expense.local);
    request.observaciones = expense.observaciones?.trim() || null;
    return request;
  }
}
