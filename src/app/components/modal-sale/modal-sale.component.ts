import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { SaleRequest } from 'src/app/models/request/sale.request';
import { ProductModel, ProductSkuModel } from 'src/app/models/internal/product.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-sale',
  templateUrl: './modal-sale.component.html',
  styleUrls: ['./modal-sale.component.scss']
})
export class ModalSaleComponent implements OnInit{

  public saleForm!: FormGroup;

  public totalPriceView = 0;

  // selected = 'option2';

  displayedColumns: string[] = ['name', 'category', 'measure', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?:number;
  products!:Array<ProductModel>;
  productsTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  local!: number;

  isSaving = false;

  // vendedores: any[] = [
  //   {value: 'Vendedor1', viewValue: 'Vendedor1'},
  //   {value: 'Vendedor2', viewValue: 'Vendedor2'},
  //   {value: 'Vendedor3', viewValue: 'Vendedor3'},
  // ];

  vendedores: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  constructor(public dialogRef: MatDialogRef<ModalSaleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog,
              private paginatorIntl: MatPaginatorIntl,) {

      this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';                 
      this.loadAllProducts();

      paginatorIntl.itemsPerPageLabel = 'items por página';

      this.saleForm = this.fb.group({
      
        

        estado: ['cancelado', Validators.required],
        local: [this.local],
        pago: this.fb.group({
          tipo: ['efectivo', Validators.required],
          total: [0, Validators.min(0)],
          pagado: [0, Validators.min(0)],
          pagos: this.fb.array([])
        }),
        productos: this.fb.array([])
    });
              }
  

  ngOnInit(): void {

    // this.addProducto();

    this.loadVendedores();

  }

  loadVendedores() {
    this.dataService.loadAllSellers(1, 100, this.local).subscribe({
      next: (res:any) => {
        console.log(res);
        this.vendedores = res.data;
        
      },
      error: (err) => {
        console.log(err);
        
      }
    })
  }
  
  loadAllProducts() {
    this.dataService.loadProducts(this.currentPage, this.itemsPerPage, this.local).subscribe({
      next: (res) => {
        console.log(res);
        
        this.products = res.data;
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalProducts = res.total;
        this.itemsPerPage = res.xpage;
        this.currentPage = res.page! ;
        // console.log(res);
      },
      error: (e) => {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
        console.log(e);
      }
    })

  }

  get productos() {
    return this.saleForm.get('productos') as FormArray;
  }

  addProducto(productItem:any) {
    console.log(productItem);
    console.log(productItem.stock);
    if(productItem.stock <= 0) {
      console.log("no hay stock");
      alert("No hay stock disponible");
      return;
    }

    const sku = this.getDefaultSku(productItem);
    const productoForm = this.fb.group({
      productoId: [productItem ? productItem.id : '' , Validators.required],
      skuId: [sku.skuId, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      equivalenciaUnidades: [sku.unitEquivalence, [Validators.required, Validators.min(1)]],
      precioCompraUnitario: [productItem ? productItem.priceBuy : 0, [Validators.required, Validators.min(0)]],
      precioVentaUnitario: [sku.priceSale, [Validators.required, Validators.min(0)]],
      nombreProducto: [productItem ? productItem.name : '', Validators.required],
      marca: [productItem ? productItem.brand : ''],
      skuNombre: [sku.name, Validators.required],
      skus: [productItem?.skus?.length ? productItem.skus : [sku]],

    });

    this.productos.push(productoForm);
    this.updatePrecioTotal();
    console.log(this.productos.value);
    
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
    this.updatePrecioTotal();
  }

  incrementCantidad(index: number) {
    console.log(this.productos.at(index));
    
    const control = this.productos.at(index).get('cantidad')!;
    const productoId = this.productos.at(index).get('productoId')!.value;
    const product = this.products.find(p => p.id === productoId);
    const equivalenciaUnidades = this.productos.at(index).get('equivalenciaUnidades')!.value || 1;
    const unidadesSolicitadas = (control.value + 1) * equivalenciaUnidades;

    if(product && unidadesSolicitadas > product.stock) {
      alert("No hay suficiente stock disponible");
      return;

    }
    

    control.setValue(control.value + 1);
    this.updatePrecioTotal();
  }

  // Disminuye la cantidad de un producto
  decrementCantidad(index: number) {
    const control = this.productos.at(index).get('cantidad')!;
    if (control.value > 1) {
      control.setValue(control.value - 1);
      this.updatePrecioTotal();
    }
  }

  updatePrecioTotal() {
    const total = this.productos.controls.reduce((sum, control) => {
      return sum + (control.get('cantidad')?.value * control.get('precioVentaUnitario')?.value);
    }, 0);

    this.totalPriceView = total;

    // Actualizar el total y pagado dentro del grupo pago
    this.saleForm.get('pago')!.patchValue({
      total: total,
      pagado: total
    });
  }

  onCreate() {

    if (this.isSaving) {
      return;
    }
    console.log(this.saleForm.value);
    
    if (this.productos.length === 0) {
      Swal.fire({
        title: 'Atención',
        text: 'Debe agregar al menos un producto a la venta.',
        icon: 'warning'
      });
      return;
    }

    if (!this.saleForm.valid) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor complete todos los campos requeridos.',
        icon: 'warning'
      });
      return;
    }

    this.isSaving = true;

    const saleData = this.buildSaleData();
    const saleRequest = SaleRequest.createFromObject(saleData);
    console.log('Sale request:', saleRequest);

    this.dataService.saveSale(saleRequest).subscribe({
      next: (res) => {
        console.log(res);

        this.isSaving = false;


        Swal.fire({
          title: 'Hecho!',
          text: 'La venta se ha realizado correctamente.',
          icon: 'success'
        });
        this.dialogRef.close(true);
      },
      error: (e) => {
        console.log(e);

        this.isSaving = false;

        
        Swal.fire({
          title: 'ERROR!',
          text: 'La venta no se pudo realizar.',
          icon: 'error'
        });
      }
    });
  }

  getDefaultSku(productItem: ProductModel): ProductSkuModel {
    if (productItem?.skus?.length) {
      return productItem.skus[0];
    }

    return {
      skuId: productItem?.id,
      name: productItem?.measure || productItem?.name,
      unitEquivalence: 1,
      priceSale: productItem?.priceSale || 0
    } as ProductSkuModel;
  }

  onSkuChange(index: number) {
    const control = this.productos.at(index);
    const skuId = control.get('skuId')!.value;
    const skus = control.get('skus')!.value as ProductSkuModel[];
    const sku = skus.find(item => item.skuId === skuId);

    if (!sku) {
      return;
    }

    control.patchValue({
      skuNombre: sku.name,
      equivalenciaUnidades: sku.unitEquivalence,
      precioVentaUnitario: sku.priceSale
    });

    const productoId = control.get('productoId')!.value;
    const product = this.products.find(p => p.id === productoId);
    const cantidad = control.get('cantidad')!.value;
    if (product && cantidad * sku.unitEquivalence > product.stock) {
      control.get('cantidad')!.setValue(Math.max(1, Math.floor(product.stock / sku.unitEquivalence)));
    }

    this.updatePrecioTotal();
  }

  private buildSaleData() {
    const total = this.totalPriceView;
    const metodoPago = this.saleForm.get('pago.tipo')!.value;
    const now = new Date().toISOString();

    const productos = this.productos.value.map(({ skus, ...producto }: any) => {
      const unidadesVendidas = producto.cantidad * producto.equivalenciaUnidades;
      const subtotalCosto = producto.cantidad * producto.precioCompraUnitario;
      const subtotalVenta = producto.cantidad * producto.precioVentaUnitario;

      return {
        ...producto,
        unidadesVendidas,
        subtotalCosto,
        subtotalVenta
      };
    });

    return {
      local: this.saleForm.get('local')!.value,
      fechaVenta: now,
      estado: this.saleForm.get('estado')!.value,
      productos,
      pago: {
        tipo: metodoPago,
        total,
        pagado: total,
        saldoPendiente: 0,
        pagos: [
          {
            monto: total,
            fecha: now,
            metodo: metodoPago
          }
        ]
      }
    };
  }

  onUpdate() {

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
