import { SaleModel } from '../internal/sale.model';

export class CreditSummaryModel {
  totalCredito = 0;
  totalPagado = 0;
  saldoPendiente = 0;
  creditosPendientes = 0;
  creditosVencidos = 0;

  static createFromObject(obj: any = {}): CreditSummaryModel {
    const result = new CreditSummaryModel();
    result.totalCredito = Number(obj.totalCredito ?? 0) / 100;
    result.totalPagado = Number(obj.totalPagado ?? 0) / 100;
    result.saldoPendiente = Number(obj.saldoPendiente ?? 0) / 100;
    result.creditosPendientes = Number(obj.creditosPendientes ?? 0);
    result.creditosVencidos = Number(obj.creditosVencidos ?? 0);
    return result;
  }
}

export class CreditResponse {
  message!: string;
  data: SaleModel[] = [];
  code!: number;
  page?: number;
  total?: number;
  xpage?: number;
  summary = new CreditSummaryModel();

  static createFromObject(response: any): CreditResponse {
    const result = new CreditResponse();
    result.code = response.code;
    result.message = response.message;
    result.page = response.page;
    result.total = response.total;
    result.xpage = response.xpage;
    result.data = SaleModel.createFromObjects(response.data?.[0]);
    result.summary = CreditSummaryModel.createFromObject(response.summary);
    return result;
  }
}
