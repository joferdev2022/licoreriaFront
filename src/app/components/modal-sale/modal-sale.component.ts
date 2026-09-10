import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { SaleRequest } from 'src/app/models/request/sale.request';
import {
  ProductModel,
  ProductSkuModel,
} from 'src/app/models/internal/product.model';
import Swal from 'sweetalert2';

type ScanState = 'loading' | 'ready' | 'success' | 'error';

@Component({
  selector: 'app-modal-sale',
  templateUrl: './modal-sale.component.html',
  styleUrls: ['./modal-sale.component.scss'],
})
export class ModalSaleComponent implements OnInit, OnDestroy {
  public saleForm!: FormGroup;

  public totalPriceView = 0;
  products: ProductModel[] = [];

  local!: number;

  isSaving = false;
  showScannerTest = false;
  testBarcodeControl = new FormControl('', { nonNullable: true });
  scanState: ScanState = 'loading';
  scanTitle = 'Cargando productos';
  scanDetail = 'El lector estará disponible en un momento.';

  private barcodeBuffer = '';
  private lastBarcodeKeyAt = 0;
  private scanFeedbackTimer?: ReturnType<typeof setTimeout>;
  private readonly scannerKeyTimeout = 180;

  // vendedores: any[] = [
  //   {value: 'Vendedor1', viewValue: 'Vendedor1'},
  //   {value: 'Vendedor2', viewValue: 'Vendedor2'},
  //   {value: 'Vendedor3', viewValue: 'Vendedor3'},
  // ];

  vendedores: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService,
    public dialog: MatDialog,
  ) {
    this.local = JSON.parse(localStorage.getItem('local')!)
      ? JSON.parse(localStorage.getItem('local')!)
      : '';
    this.saleForm = this.fb.group({
      estado: ['cancelado', Validators.required],
      local: [this.local],
      pago: this.fb.group({
        tipo: ['efectivo', Validators.required],
        total: [0, Validators.min(0)],
        pagado: [0, Validators.min(0)],
        pagos: this.fb.array([]),
      }),
      productos: this.fb.array([]),
    });

    this.loadAllProducts();
  }

  ngOnInit(): void {
    this.loadVendedores();
  }

  ngOnDestroy(): void {
    if (this.scanFeedbackTimer) {
      clearTimeout(this.scanFeedbackTimer);
    }
  }

  loadVendedores() {
    this.dataService.loadAllSellers(1, 100, this.local).subscribe({
      next: (res: any) => {
        console.log(res);
        this.vendedores = res.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  loadAllProducts() {
    this.setScanFeedback(
      'loading',
      'Cargando productos',
      'El lector estará disponible en un momento.',
      false,
    );

    this.dataService
      .loadProducts(1, 5000, this.local)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.setScannerReady();
        },
        error: (e) => {
          console.log(e);
          this.setScanFeedback(
            'error',
            'No se pudo preparar el lector',
            'Cierra el modal e inténtalo nuevamente.',
            false,
          );
        },
      });
  }

  get productos() {
    return this.saleForm.get('productos') as FormArray;
  }

  get totalUnits(): number {
    return this.productos.controls.reduce(
      (total, control) => total + Number(control.get('cantidad')?.value ?? 0),
      0,
    );
  }

  get scannerIcon(): string {
    if (this.scanState === 'success') {
      return 'check_circle';
    }

    if (this.scanState === 'error') {
      return 'error_outline';
    }

    if (this.scanState === 'loading') {
      return 'sync';
    }

    return 'qr_code_scanner';
  }

  selectPaymentMethod(method: string): void {
    this.saleForm.get('pago.tipo')?.setValue(method);
  }

  get hasTestableProduct(): boolean {
    return this.products.some(
      (product) => Boolean(String(product.barcode ?? '').trim()) && product.stock > 0,
    );
  }

  toggleScannerTest(): void {
    this.showScannerTest = !this.showScannerTest;
    this.testBarcodeControl.setValue('');
  }

  simulateBarcodeScan(): void {
    const barcode = this.testBarcodeControl.value.trim();
    if (!barcode) {
      this.setScanFeedback(
        'error',
        'Ingresa un código',
        'Escribe o pega un código de barras para simular la lectura.',
      );
      return;
    }

    this.processBarcode(barcode);
    this.testBarcodeControl.setValue('');
  }

  testAvailableProduct(): void {
    const product = this.products.find(
      (item) => Boolean(String(item.barcode ?? '').trim()) && item.stock > 0,
    );

    if (!product) {
      this.setScanFeedback(
        'error',
        'No hay un producto disponible',
        'Registra un código de barras y stock antes de realizar la prueba.',
      );
      return;
    }

    this.testBarcodeControl.setValue(String(product.barcode));
    this.simulateBarcodeScan();
  }

  addProducto(productItem: ProductModel): boolean {
    if (productItem.stock <= 0) {
      return false;
    }

    const sku = this.getDefaultSku(productItem);
    if (sku.unitEquivalence > productItem.stock) {
      return false;
    }

    const existingProductIndex = this.productos.controls.findIndex(
      (control) => control.get('productoId')!.value === productItem.id,
    );

    if (existingProductIndex >= 0) {
      return this.incrementCantidad(existingProductIndex, false);
    }

    const productoForm = this.fb.group({
      productoId: [productItem ? productItem.id : '', Validators.required],
      skuId: [sku.skuId, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      equivalenciaUnidades: [
        sku.unitEquivalence,
        [Validators.required, Validators.min(1)],
      ],
      precioCompraUnitario: [
        productItem ? productItem.priceBuy : 0,
        [Validators.required, Validators.min(0)],
      ],
      precioVentaUnitario: [
        sku.priceSale,
        [Validators.required, Validators.min(0)],
      ],
      nombreProducto: [
        productItem ? productItem.name : '',
        Validators.required,
      ],
      marca: [productItem ? productItem.brand : ''],
      barcode: [productItem ? productItem.barcode : ''],
      skuNombre: [sku.name, Validators.required],
      skus: [productItem?.skus?.length ? productItem.skus : [sku]],
    });

    this.productos.push(productoForm);
    this.updatePrecioTotal();
    return true;
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
    this.updatePrecioTotal();
  }

  incrementCantidad(index: number, showAlert = true): boolean {
    const control = this.productos.at(index).get('cantidad')!;
    const productoId = this.productos.at(index).get('productoId')!.value;
    const product = this.products.find((p) => p.id === productoId);
    const equivalenciaUnidades =
      this.productos.at(index).get('equivalenciaUnidades')!.value || 1;
    const unidadesSolicitadas = (control.value + 1) * equivalenciaUnidades;

    if (product && unidadesSolicitadas > product.stock) {
      if (showAlert) {
        alert('No hay suficiente stock disponible');
      }
      return false;
    }

    control.setValue(control.value + 1);
    this.updatePrecioTotal();
    return true;
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
      return (
        sum +
        control.get('cantidad')?.value *
          control.get('precioVentaUnitario')?.value
      );
    }, 0);

    this.totalPriceView = total;

    // Actualizar el total y pagado dentro del grupo pago
    this.saleForm.get('pago')!.patchValue({
      total: total,
      pagado: total,
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
        icon: 'warning',
      });
      return;
    }

    if (!this.saleForm.valid) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor complete todos los campos requeridos.',
        icon: 'warning',
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
          icon: 'success',
        });
        this.dialogRef.close(true);
      },
      error: (e) => {
        console.log(e);

        this.isSaving = false;

        Swal.fire({
          title: 'ERROR!',
          text: 'La venta no se pudo realizar.',
          icon: 'error',
        });
      },
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
      priceSale: productItem?.priceSale || 0,
    } as ProductSkuModel;
  }

  onSkuChange(index: number) {
    const control = this.productos.at(index);
    const skuId = control.get('skuId')!.value;
    const skus = control.get('skus')!.value as ProductSkuModel[];
    const sku = skus.find((item) => item.skuId === skuId);

    if (!sku) {
      return;
    }

    control.patchValue({
      skuNombre: sku.name,
      equivalenciaUnidades: sku.unitEquivalence,
      precioVentaUnitario: sku.priceSale,
    });

    const productoId = control.get('productoId')!.value;
    const product = this.products.find((p) => p.id === productoId);
    const cantidad = control.get('cantidad')!.value;
    if (product && cantidad * sku.unitEquivalence > product.stock) {
      control
        .get('cantidad')!
        .setValue(Math.max(1, Math.floor(product.stock / sku.unitEquivalence)));
    }

    this.updatePrecioTotal();
  }

  private buildSaleData() {
    const total = this.totalPriceView;
    const metodoPago = this.saleForm.get('pago.tipo')!.value;
    const now = new Date().toISOString();

    const productos = this.productos.value.map(({ skus, ...producto }: any) => {
      const unidadesVendidas =
        producto.cantidad * producto.equivalenciaUnidades;
      const subtotalCosto = producto.cantidad * producto.precioCompraUnitario;
      const subtotalVenta = producto.cantidad * producto.precioVentaUnitario;

      return {
        ...producto,
        unidadesVendidas,
        subtotalCosto,
        subtotalVenta,
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
            metodo: metodoPago,
          },
        ],
      },
    };
  }

  onUpdate() {}

  @HostListener('document:keydown', ['$event'])
  onScannerKeydown(event: KeyboardEvent): void {
    if (
      this.isSaving ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      this.isEditableElement(event.target)
    ) {
      return;
    }

    const now = Date.now();

    if (event.key === 'Enter') {
      const barcode = this.barcodeBuffer.trim();
      this.barcodeBuffer = '';

      if (!barcode) {
        return;
      }

      event.preventDefault();
      this.processBarcode(barcode);
      return;
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      this.barcodeBuffer = '';
      return;
    }

    if (event.key.length !== 1 || event.repeat) {
      return;
    }

    if (now - this.lastBarcodeKeyAt > this.scannerKeyTimeout) {
      this.barcodeBuffer = '';
    }

    this.barcodeBuffer += event.key;
    this.lastBarcodeKeyAt = now;
    event.preventDefault();
  }

  private processBarcode(rawBarcode: string): void {
    if (this.scanState === 'loading') {
      this.setScanFeedback(
        'loading',
        'Cargando productos',
        'Espera un momento y vuelve a escanear.',
        false,
      );
      return;
    }

    const barcode = rawBarcode.toLowerCase();
    const product = this.products.find(
      (item) => String(item.barcode ?? '').trim().toLowerCase() === barcode,
    );

    if (!product) {
      this.setScanFeedback(
        'error',
        'Producto no encontrado',
        `No existe un producto con el código ${rawBarcode}.`,
      );
      return;
    }

    if (!this.addProducto(product)) {
      this.setScanFeedback(
        'error',
        'Stock insuficiente',
        `${product.name} no tiene unidades disponibles para esta venta.`,
      );
      return;
    }

    this.setScanFeedback(
      'success',
      'Producto agregado',
      `${product.name} se añadió a la venta.`,
    );
  }

  private isEditableElement(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const editableElement = target.closest(
      'input, textarea, select, [contenteditable="true"]',
    );

    if (editableElement instanceof HTMLInputElement) {
      return !['radio', 'checkbox', 'button', 'submit', 'reset'].includes(
        editableElement.type,
      );
    }

    return Boolean(editableElement);
  }

  private setScannerReady(): void {
    this.setScanFeedback(
      'ready',
      'Lector listo',
      'Escanea un producto para agregarlo a la venta.',
      false,
    );
  }

  private setScanFeedback(
    state: ScanState,
    title: string,
    detail: string,
    resetToReady = true,
  ): void {
    if (this.scanFeedbackTimer) {
      clearTimeout(this.scanFeedbackTimer);
    }

    this.scanState = state;
    this.scanTitle = title;
    this.scanDetail = detail;

    if (resetToReady) {
      this.scanFeedbackTimer = setTimeout(() => this.setScannerReady(), 2600);
    }
  }
}
