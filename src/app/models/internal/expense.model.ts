export class ExpenseModel {
  id!: string;
  fecha!: string;
  categoria!: string;
  descripcion!: string;
  proveedor!: string;
  metodoPago!: string;
  comprobante!: string;
  estado!: string;
  monto!: number;
  local!: number;
  observaciones!: string;

  static createFromObject(expense: any): ExpenseModel {
    const newExpense = new ExpenseModel();
    newExpense.id = expense._id?.$oid ?? expense._id ?? expense.id;
    newExpense.fecha = expense.fecha?.$date ?? expense.fecha;
    newExpense.categoria = expense.categoria ?? '';
    newExpense.descripcion = expense.descripcion ?? '';
    newExpense.proveedor = expense.proveedor ?? '';
    newExpense.metodoPago = expense.metodoPago ?? '';
    newExpense.comprobante = expense.comprobante ?? '';
    newExpense.estado = expense.estado ?? '';
    newExpense.monto = Number(expense.monto ?? 0);
    newExpense.local = Number(expense.local ?? 0);
    newExpense.observaciones = expense.observaciones ?? '';
    return newExpense;
  }

  static createFromObjects(expenses: any): ExpenseModel[] {
    if (!Array.isArray(expenses)) {
      return [];
    }
    return expenses.map((expense) => ExpenseModel.createFromObject(expense));
  }
}
