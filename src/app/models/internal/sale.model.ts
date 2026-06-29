export class PaymentEntryModel {
  monto!: number;
  fecha!: string;
  metodo!: string;

  static createFromObject(obj: any): PaymentEntryModel {
    const newObj = new PaymentEntryModel();
    newObj.monto = obj.monto/100;
    newObj.fecha = obj.fecha?.$date ?? obj.fecha;
    newObj.metodo = obj.metodo;
    return newObj;
  }
}

export class PaymentModel {
  tipo!: string;
  total!: number;
  pagado!: number;
  saldoPendiente!: number;
  pagos!: PaymentEntryModel[];

  static createFromObject(obj: any): PaymentModel {
    const newObj = new PaymentModel();
    newObj.tipo = obj.tipo;
    newObj.total = obj.total/100;
    newObj.pagado = obj.pagado/100;
    newObj.saldoPendiente = obj.saldoPendiente/100;
    newObj.pagos = Array.isArray(obj.pagos)
      ? obj.pagos.map(PaymentEntryModel.createFromObject)
      : [];
    return newObj;
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
    const newObj = new SaleProductModel();
    newObj.productoId = obj.productoId;
    newObj.skuId = obj.skuId;
    newObj.nombreProducto = obj.nombreProducto;
    newObj.marca = obj.marca;
    newObj.skuNombre = obj.skuNombre;
    newObj.cantidad = obj.cantidad;
    newObj.equivalenciaUnidades = obj.equivalenciaUnidades;
    newObj.unidadesVendidas = obj.unidadesVendidas;
    newObj.precioCompraUnitario = obj.precioCompraUnitario/100;
    newObj.precioVentaUnitario = obj.precioVentaUnitario/100;
    newObj.subtotalCosto = obj.subtotalCosto/100;
    newObj.subtotalVenta = obj.subtotalVenta/100;
    return newObj;
  }
}

export class SaleModel {
  id!: string;
  local!: number;
  fechaVenta!: string;
  estado!: string;
  pago!: PaymentModel;
  productos!: SaleProductModel[];

  static createFromObject(obj: any): SaleModel {
    const newObj = new SaleModel();
    newObj.id = obj._id?.$oid ?? obj._id ?? obj.id;
    newObj.local = obj.local;
    newObj.fechaVenta = obj.fechaVenta?.$date ?? obj.fechaVenta;
    newObj.estado = obj.estado;
    newObj.pago = PaymentModel.createFromObject(obj.pago);
    newObj.productos = Array.isArray(obj.productos)
      ? obj.productos.map(SaleProductModel.createFromObject)
      : [];
    return newObj;
  }

  static createFromObjects(_objs: any): Array<SaleModel> {
    const newObjs: SaleModel[] = [];
    if (_objs instanceof Array) {
      for (const item of _objs) {
        newObjs.push(SaleModel.createFromObject(item));
      }
    }
    return newObjs;
  }
}