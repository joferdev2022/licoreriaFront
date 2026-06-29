
export class ProductSkuModel {
    skuId!: string;
    name!: string;
    unitEquivalence!: number;
    priceSale!: number;

    static createFromObject(obj: any): ProductSkuModel {
        const newObj = new ProductSkuModel();
        newObj.skuId = obj.skuId;
        newObj.name = obj.nombre;
        newObj.unitEquivalence = obj.equivalenciaUnidades;
        newObj.priceSale = ProductModel.priceInSoles(obj.precioVenta);
        return newObj;
    }

    static createFromObjects(_objs: any): Array<ProductSkuModel> {
        const newObjs = [];
        if (_objs instanceof Array) {
            for (const item of _objs) {
                newObjs.push(ProductSkuModel.createFromObject(item));
            }
        }

        return newObjs;
    }
}

export class ProductModel {

    id!: string;
    name!: string;
    description!: string;
    category!: string;
    brand!: string;
    content!: string;
    contentUnit!: string;
    presentation!: string;
    barcode!: string;
    priceBuy!: number;
    priceSale!: number;
    stock!: number;
    skus: Array<ProductSkuModel> = [];
    
    measure!: string;
    proovId!: string;
    expirationDate!: string;
    creationDate!: string;

    static priceInSoles(price: any): number {
        const numericPrice = Number(price);
        return Number.isFinite(numericPrice) ? numericPrice / 100 : 0;
    }

    static createFromObject(obj: any): ProductModel {
        const newObj = new ProductModel();
        newObj.id = obj.id;
        newObj.name = obj.nombre;
        newObj.description = obj.descripcion;
        newObj.category = obj.categoria;
        newObj.brand = obj.marca;
        newObj.content = obj.contenido;
        newObj.contentUnit = obj.unidadContenido;
        newObj.presentation = obj.presentacion;
        newObj.barcode = obj.barcode;
        newObj.priceBuy = ProductModel.priceInSoles(obj.precioCompra);
        newObj.skus = ProductSkuModel.createFromObjects(obj.sku);
        newObj.priceSale = newObj.skus[0]?.priceSale ?? ProductModel.priceInSoles(obj.precioVenta);
        newObj.stock = obj.cantidadEnStock;
        newObj.measure = obj.unidadDeMedida ?? [obj.presentacion, obj.contenido, obj.unidadContenido].filter(Boolean).join(' ');
        newObj.proovId = obj.proveedorId;
        newObj.expirationDate = obj.fechaDeCaducidad;
        newObj.creationDate = obj.fechaDeCreacion;
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<ProductModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(ProductModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}
