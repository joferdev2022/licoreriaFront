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
    const result = new ProductoVentaRequest();
    result.productoId = obj.productoId;
    result.skuId = obj.skuId;
    result.cantidad = obj.cantidad;
    result.equivalenciaUnidades = obj.equivalenciaUnidades;
    result.precioCompraUnitario = Math.round(obj.precioCompraUnitario * 100);
    result.precioVentaUnitario = Math.round(obj.precioVentaUnitario * 100);
    result.nombreProducto = obj.nombreProducto;
    result.marca = obj.marca;
    result.skuNombre = obj.skuNombre;
    return result;
  }
}

export class PagoEntradaRequest {
  monto!: number;
  fecha!: string;
  metodo!: string;
  referencia?: string;
  observaciones?: string;

  static createFromObject(obj: any): PagoEntradaRequest {
    const result = new PagoEntradaRequest();
    result.monto = Math.round(obj.monto * 100);
    result.fecha = obj.fecha;
    result.metodo = obj.metodo;
    result.referencia = obj.referencia || undefined;
    result.observaciones = obj.observaciones || undefined;
    return result;
  }
}

export class PagoRequest {
  tipo!: string;
  total!: number;
  pagado!: number;
  saldoPendiente!: number;
  estadoPago!: 'pendiente' | 'parcial' | 'pagado';
  pagos!: PagoEntradaRequest[];

  static createFromObject(obj: any): PagoRequest {
    const result = new PagoRequest();
    result.tipo = obj.tipo;
    result.total = Math.round(obj.total * 100);
    result.pagado = Math.round((obj.pagado ?? 0) * 100);
    result.saldoPendiente = Math.round((obj.saldoPendiente ?? 0) * 100);
    result.estadoPago = obj.estadoPago;
    result.pagos = Array.isArray(obj.pagos)
      ? obj.pagos.map(PagoEntradaRequest.createFromObject)
      : [];
    return result;
  }
}

export class ClienteCreditoRequest {
  nombre!: string;
  telefono?: string;

  static createFromObject(obj: any): ClienteCreditoRequest | undefined {
    if (!obj) {
      return undefined;
    }

    const result = new ClienteCreditoRequest();
    result.nombre = String(obj.nombre ?? '').trim();
    result.telefono = String(obj.telefono ?? '').trim() || undefined;
    return result;
  }
}

export class SaleRequest {
  local!: number;
  fechaVenta!: string;
  estado!: string;
  condicionPago!: 'contado' | 'credito';
  clienteCredito?: ClienteCreditoRequest;
  fechaVencimiento?: string;
  observacionesCredito?: string;
  pago!: PagoRequest;
  productos!: ProductoVentaRequest[];

  static createFromObject(obj: any): SaleRequest {
    const result = new SaleRequest();
    result.local = obj.local;
    result.fechaVenta = obj.fechaVenta ?? new Date().toISOString();
    result.estado = obj.estado;
    result.condicionPago = obj.condicionPago ?? 'contado';
    result.clienteCredito = ClienteCreditoRequest.createFromObject(obj.clienteCredito);
    result.fechaVencimiento = obj.fechaVencimiento || undefined;
    result.observacionesCredito =
      String(obj.observacionesCredito ?? '').trim() || undefined;
    result.pago = PagoRequest.createFromObject(obj.pago);
    result.productos = Array.isArray(obj.productos)
      ? obj.productos.map(ProductoVentaRequest.createFromObject)
      : [];
    return result;
  }
}
