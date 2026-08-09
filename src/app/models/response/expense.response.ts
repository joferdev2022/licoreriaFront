import { ExpenseModel } from '../internal/expense.model';

export class ExpenseResponse {
  message!: string;
  data!: ExpenseModel[];
  code!: number;
  page?: number;
  total?: number;
  xpage?: number;

  static createFromObject(response: any): ExpenseResponse {
    const result = new ExpenseResponse();
    const responseData = Array.isArray(response.data?.[0])
      ? response.data[0]
      : response.data;

    result.code = response.code;
    result.message = response.message;
    result.page = response.page;
    result.total = response.total;
    result.xpage = response.xpage;
    result.data = ExpenseModel.createFromObjects(responseData);
    return result;
  }
}
