
export class DashboardModel {


    totalSales!: number;
    topProducts!: Array<TopProduct>;
    lowProducts!: Array<LowProduct>;
    totalProducts!: number;
    AmountSales!: number;
    monthlyProfit!: number;
    comparacion!: DashboardComparison;


    static createFromObject(obj: any): DashboardModel {
        console.log("data model", obj);
        const newObj = new DashboardModel();
        newObj.totalSales = obj.totalSales;
        newObj.topProducts = TopProduct.createFromObjects(obj.topProducts);
        newObj.lowProducts = LowProduct.createFromObjects(obj.lowProducts);
        newObj.totalProducts = obj.totalProducts;
        newObj.AmountSales = obj.AmountSales;
        newObj.monthlyProfit = obj.ingresoNeto;
        newObj.comparacion = DashboardComparison.createFromObject(obj?.comparacion);
        return newObj;
      }
    
    //   static createFromObjects(_objs: any): Array<DashboardModel> {
    //     // console.log(_objs)
    //     const newObjs = [];
    //     if (_objs instanceof Array) {
    //       for (const item of _objs) {
    //         // console.log("item",item);
    //         newObjs.push(DashboardModel.createFromObject(item));
    //         // console.log(newObjs);
            
    //       }
    //     }

    //     return newObjs;
    //   }
    
}



export class DashboardComparison {

  ingresoNeto!: number | null;
  AmountSales!: number | null;
  totalSales!: number | null;

  static createFromObject(obj: any): DashboardComparison {

    const newObj = new DashboardComparison();

    newObj.ingresoNeto = obj?.ingresoNeto ?? null;
    newObj.AmountSales = obj?.AmountSales ?? null;
    newObj.totalSales = obj?.totalSales ?? null;

    return newObj;
  }
}


export class TopProduct {
    productoId!: string;
    productName!: string;
    cantidad_vendida!: number;
    
  
  
    static createFromObject(obj: any): TopProduct {
      const newObj = new TopProduct();
      newObj.productoId = obj.productoId;
      newObj.productName = obj.nombreProducto;
      newObj.cantidad_vendida = obj.cantidad_vendida;
      return newObj;
    }
  
    static createFromObjects(_objs: any): Array<TopProduct> {
      const newObjs = [];
      if (_objs instanceof Array) {
        for (const item of _objs) {
            newObjs.push(TopProduct.createFromObject(item));
          
        }
      }
      return newObjs;
    }
  }
export class LowProduct {
    nombre!: string;
    categoria!: string;
    cantidadEnStock!: number;
    
  
  
    static createFromObject(obj: any): LowProduct {
      const newObj = new LowProduct();
      newObj.nombre = obj.nombre;
      newObj.categoria = obj.categoria;
      newObj.cantidadEnStock = obj.cantidadEnStock;
      
      return newObj;
    }
  
    static createFromObjects(_objs: any): Array<LowProduct> {
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
              newObjs.push(LowProduct.createFromObject(item));
            
          }
        }
        return newObjs;
      }
  }