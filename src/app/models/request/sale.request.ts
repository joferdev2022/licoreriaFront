export class ProductoVentaRequest {
  productoId!: string;
  skuId!: string;
  cantidad!: number;
  equivalenciaUnidades!: number;
  precioCompraUnitario!: number;
  precioVentaUnitario!: number;
  nombreProducto!: string;
  marca!: string;
  skuNombre!: string;

  static createFromObject(obj: any): ProductoVentaRequest {
    const newObj = new ProductoVentaRequest();
    newObj.productoId = obj.productoId;
    newObj.skuId = obj.skuId;
    newObj.cantidad = obj.cantidad;
    newObj.equivalenciaUnidades = obj.equivalenciaUnidades;
    newObj.precioCompraUnitario = Math.round(obj.precioCompraUnitario * 100);
    newObj.precioVentaUnitario = Math.round(obj.precioVentaUnitario * 100);
    newObj.nombreProducto = obj.nombreProducto;
    newObj.marca = obj.marca;
    newObj.skuNombre = obj.skuNombre;
    return newObj;
  }
}

export class PagoRequest {
  tipo!: string;
  total!: number;
  pagado!: number;
  pagos!: PagoEntradaRequest[];

  static createFromObject(obj: any): PagoRequest {
    const newObj = new PagoRequest();
    newObj.tipo = obj.tipo;
    newObj.total = Math.round(obj.total * 100);
    newObj.pagado = Math.round(obj.pagado * 100);
    newObj.pagos = Array.isArray(obj.pagos)
      ? obj.pagos.map(PagoEntradaRequest.createFromObject)
      : [];
    return newObj;
  }
}

export class PagoEntradaRequest {
  monto!: number;
  fecha!: string;
  metodo!: string;

  static createFromObject(obj: any): PagoEntradaRequest {
    const newObj = new PagoEntradaRequest();
    newObj.monto = Math.round(obj.monto * 100);
    newObj.fecha = obj.fecha;
    newObj.metodo = obj.metodo;
    return newObj;
  }
}

export class SaleRequest {
  local!: number;
  fechaVenta!: string;
  estado!: string;
  pago!: PagoRequest;
  productos!: ProductoVentaRequest[];

  static createFromObject(obj: any): SaleRequest {
    const newObj = new SaleRequest();
    newObj.local = obj.local;
    newObj.fechaVenta = obj.fechaVenta ?? new Date().toISOString();
    newObj.estado = obj.estado;
    newObj.pago = PagoRequest.createFromObject(obj.pago);
    newObj.productos = Array.isArray(obj.productos)
      ? obj.productos.map(ProductoVentaRequest.createFromObject)
      : [];
    return newObj;
  }
}
