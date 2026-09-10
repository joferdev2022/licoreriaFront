export type CreditPaymentStatus = 'pendiente' | 'parcial' | 'pagado' | 'vencido';

export class PaymentEntryModel {
  id!: string;
  monto!: number;
  fecha!: string;
  metodo!: string;
  referencia?: string;
  observaciones?: string;

  static createFromObject(obj: any): PaymentEntryModel {
    const result = new PaymentEntryModel();
    result.id = obj.id ?? '';
    result.monto = Number(obj.monto ?? 0) / 100;
    result.fecha = obj.fecha?.$date ?? obj.fecha;
    result.metodo = obj.metodo ?? '';
    result.referencia = obj.referencia ?? undefined;
    result.observaciones = obj.observaciones ?? undefined;
    return result;
  }
}

export class PaymentModel {
  tipo!: string;
  total!: number;
  pagado!: number;
  saldoPendiente!: number;
  estadoPago!: Exclude<CreditPaymentStatus, 'vencido'>;
  pagos!: PaymentEntryModel[];

  static createFromObject(obj: any = {}): PaymentModel {
    const result = new PaymentModel();
    result.tipo = obj.tipo ?? '';
    result.total = Number(obj.total ?? 0) / 100;
    result.pagado = Number(obj.pagado ?? 0) / 100;
    result.saldoPendiente = Number(
      obj.saldoPendiente ?? Math.max(Number(obj.total ?? 0) - Number(obj.pagado ?? 0), 0),
    ) / 100;
    result.estadoPago =
      obj.estadoPago ??
      (result.saldoPendiente <= 0
        ? 'pagado'
        : result.pagado > 0
          ? 'parcial'
          : 'pendiente');
    result.pagos = Array.isArray(obj.pagos)
      ? obj.pagos.map(PaymentEntryModel.createFromObject)
      : [];
    return result;
  }
}

export class CreditCustomerModel {
  nombre!: string;
  telefono?: string;

  static createFromObject(obj: any): CreditCustomerModel | undefined {
    if (!obj) {
      return undefined;
    }
    const result = new CreditCustomerModel();
    result.nombre = obj.nombre ?? '';
    result.telefono = obj.telefono ?? undefined;
    return result;
  }
}

export class SaleProductModel {
  productoId!: string;
  skuId!: string;
  nombreProducto!: string;
  marca!: string;
  skuNombre!: string;
  cantidad!: number;
  equivalenciaUnidades!: number;
  unidadesVendidas!: number;
  precioCompraUnitario!: number;
  precioVentaUnitario!: number;
  subtotalCosto!: number;
  subtotalVenta!: number;

  static createFromObject(obj: any): SaleProductModel {
    const result = new SaleProductModel();
    result.productoId = obj.productoId;
    result.skuId = obj.skuId;
    result.nombreProducto = obj.nombreProducto;
    result.marca = obj.marca;
    result.skuNombre = obj.skuNombre;
    result.cantidad = obj.cantidad;
    result.equivalenciaUnidades = obj.equivalenciaUnidades;
    result.unidadesVendidas = obj.unidadesVendidas;
    result.precioCompraUnitario = Number(obj.precioCompraUnitario ?? 0) / 100;
    result.precioVentaUnitario = Number(obj.precioVentaUnitario ?? 0) / 100;
    result.subtotalCosto = Number(obj.subtotalCosto ?? 0) / 100;
    result.subtotalVenta = Number(obj.subtotalVenta ?? 0) / 100;
    return result;
  }
}

export class SaleModel {
  id!: string;
  local!: number;
  fechaVenta!: string;
  estado!: string;
  condicionPago!: 'contado' | 'credito';
  clienteCredito?: CreditCustomerModel;
  fechaVencimiento?: string;
  observacionesCredito?: string;
  estadoCobro?: CreditPaymentStatus;
  pago!: PaymentModel;
  productos!: SaleProductModel[];

  static createFromObject(obj: any): SaleModel {
    const result = new SaleModel();
    result.id = obj._id?.$oid ?? obj._id ?? obj.id;
    result.local = obj.local;
    result.fechaVenta = obj.fechaVenta?.$date ?? obj.fechaVenta;
    result.estado = obj.estado;
    result.condicionPago =
      obj.condicionPago ?? (obj.estado === 'credito' ? 'credito' : 'contado');
    result.clienteCredito = CreditCustomerModel.createFromObject(obj.clienteCredito);
    result.fechaVencimiento = obj.fechaVencimiento?.$date ?? obj.fechaVencimiento;
    result.observacionesCredito = obj.observacionesCredito ?? undefined;
    result.estadoCobro = obj.estadoCobro ?? undefined;
    result.pago = PaymentModel.createFromObject(obj.pago);
    result.productos = Array.isArray(obj.productos)
      ? obj.productos.map(SaleProductModel.createFromObject)
      : [];
    return result;
  }

  static createFromObjects(objects: any): SaleModel[] {
    return Array.isArray(objects)
      ? objects.map((item) => SaleModel.createFromObject(item))
      : [];
  }
}
