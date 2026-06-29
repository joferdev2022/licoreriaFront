
export class ProductSkuRequest {
    skuId!: string;
    nombre!: string;
    equivalenciaUnidades!: number;
    precioVenta!: number;
}

export class ProductRequest {
    nombre!: string;
    descripcion!: string;
    categoria!: string;
    marca!: string;
    contenido!: string;
    unidadContenido!: string;
    presentacion!: string;
    barcode!: string;
    precioCompra!: number;
    precioVenta!: number;
    cantidadEnStock!: number;
    unidadDeMedida!: string;
    proveedorId!: string | null;
    fechaDeCaducidad!: Date | null;
    local!: number;
    sku!: ProductSkuRequest[];

    static priceInCents(price: any): number {
      const numericPrice = Number(price);
      return Number.isFinite(numericPrice) ? Math.round(numericPrice * 100) : 0;
    }
  
    static createFromObject(product: any): ProductRequest {
      const newObj = new ProductRequest();
      newObj.nombre = product.nameProduct;
      newObj.descripcion = product.description ?? '';
      newObj.categoria = product.category;
      newObj.marca = product.brand;
      newObj.contenido = product.content;
      newObj.unidadContenido = product.contentUnit;
      newObj.presentacion = product.presentation;
      newObj.barcode = product.barcode;
      newObj.precioCompra = ProductRequest.priceInCents(product.buyPrice);
      newObj.sku = (product.skus ?? []).map((sku: any) => ({
        skuId: sku.skuId,
        nombre: sku.name,
        equivalenciaUnidades: Number(sku.unitEquivalence),
        precioVenta: ProductRequest.priceInCents(sku.priceSale)
      }));
      newObj.precioVenta = newObj.sku[0]?.precioVenta ?? ProductRequest.priceInCents(product.salePrice);
      newObj.cantidadEnStock = Number(product.Stock);
      newObj.unidadDeMedida = [product.presentation, product.content, product.contentUnit].filter(Boolean).join(' ');
      newObj.proveedorId = product.provId || null;
      newObj.fechaDeCaducidad = product.endDate || null;
      newObj.local = product.local;
   
      return newObj;
    }
  }
  
