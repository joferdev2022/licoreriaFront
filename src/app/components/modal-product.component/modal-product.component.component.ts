import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { ProductRequest } from 'src/app/models/request/product.request';


@Component({
  selector: 'app-modal-product.component',
  templateUrl: './modal-product.component.component.html',
  styleUrls: ['./modal-product.component.component.scss']
})
export class ModalProductComponentComponent implements OnInit, OnDestroy {
  public productForm!: FormGroup;
  local!: any;
  private skuSub!: Subscription;

  selectedValue!: string;

  category = [
    {value: 'cerveza', viewValue: 'Cerveza'},
    {value: 'vino', viewValue: 'Vino'},
    {value: 'whisky', viewValue: 'Whisky'},
    {value: 'ron', viewValue: 'Ron'},
    {value: 'vodka', viewValue: 'Vodka'},
    {value: 'pisco', viewValue: 'Pisco'},
    {value: 'tequila', viewValue: 'Tequila'},
    {value: 'gin', viewValue: 'Gin'},
    {value: 'espumante', viewValue: 'Espumante'},
    {value: 'energizante', viewValue: 'Energizante'},
    {value: 'gaseosa', viewValue: 'Gaseosa'},
    {value: 'agua', viewValue: 'Agua'},
    {value: 'snacks', viewValue: 'Snacks'},
    {value: 'otros', viewValue: 'Otros'},
  ]

  presentations = [
    {value: 'botella', viewValue: 'Botella'},
    {value: 'lata', viewValue: 'Lata'},
    {value: 'tetra pak', viewValue: 'Tetra Pak'},
    {value: 'pack', viewValue: 'Pack'},
    {value: 'caja', viewValue: 'Caja'},
    {value: 'unidad', viewValue: 'Unidad'},
  ]

  contentUnits = [
    {value: 'ml', viewValue: 'ml'},
    {value: 'l', viewValue: 'L'},
    {value: 'g', viewValue: 'g'},
    {value: 'kg', viewValue: 'kg'},
    {value: 'und', viewValue: 'und.'},
  ]

  constructor(public dialogRef: MatDialogRef<ModalProductComponentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog) {
          
        this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';  

              }

  ngOnInit(): void {

    this.createForm();

  }

  createForm() {
    this.productForm = this.fb.group({
      nameProduct: [ this.data.product ? this.data.product.name : '' , Validators.required ],
      description: [ this.data.product ? this.data.product.description : '' ],
      category: [ this.data.product ? this.data.product.category : '', Validators.required ],
      brand: [ this.data.product ? this.data.product.brand : '', Validators.required ],
      content: [ this.data.product ? this.data.product.content : '', [Validators.required, Validators.min(0)] ],
      contentUnit: [ this.data.product ? this.data.product.contentUnit : 'ml', Validators.required ],
      presentation: [ this.data.product ? this.data.product.presentation : 'botella', Validators.required ],
      barcode: [ this.data.product ? this.data.product.barcode : '' ],
      buyPrice: [ this.data.product ? this.data.product.priceBuy : '', [Validators.required, Validators.min(0)] ],
      salePrice: [ this.data.product ? this.data.product.priceSale : '' ],
      Stock: [ this.data.product ? this.data.product.stock : '', [Validators.required, Validators.min(0)] ],
      provId: [ this.data.product ? this.data.product.proovId : '' ],
      endDate: [ this.data.product ? this.data.product.expirationDate : '' ],
      local: [ this.local ],
      skus: this.fb.array(this.getInitialSkus().map((sku: any) => this.createSkuFormGroup(sku)))
    });
    console.log(this.data.product);

    // Auto-generar skuId cuando cambian los campos relevantes
    this.skuSub = combineLatest([
      this.productForm.get('category')!.valueChanges.pipe(startWith(this.productForm.get('category')!.value)),
      this.productForm.get('nameProduct')!.valueChanges.pipe(startWith(this.productForm.get('nameProduct')!.value)),
      this.productForm.get('content')!.valueChanges.pipe(startWith(this.productForm.get('content')!.value)),
      this.productForm.get('contentUnit')!.valueChanges.pipe(startWith(this.productForm.get('contentUnit')!.value)),
    ]).subscribe(([category, name, content, unit]) => {
      this.updateAllSkuIds(category, name, content, unit);
    });
  }

  generateSkuId(category: string, name: string, content: any, contentUnit: string, skuName?: string): string {
    const cat = (category || '').toLowerCase().trim();
    const prodName = (name || '').toLowerCase().replace(/\s+/g, '').trim();
    const cont = content != null && content !== '' ? content : '';
    const unit = (contentUnit || '').toLowerCase().trim();

    let skuId = `${cat}_${prodName}${cont}${unit}`;
    if (skuName && skuName.toLowerCase() !== 'unidad') {
      skuId += `_${skuName.toLowerCase().replace(/\s+/g, '')}`;
    }
    return skuId;
  }

  updateAllSkuIds(category: string, name: string, content: any, contentUnit: string): void {
    this.skus.controls.forEach((skuGroup) => {
      const skuName = skuGroup.get('name')!.value;
      const newSkuId = this.generateSkuId(category, name, content, contentUnit, skuName);
      skuGroup.get('skuId')!.setValue(newSkuId, { emitEvent: false });
    });
  }

  get skus(): FormArray {
    return this.productForm.get('skus') as FormArray;
  }

  get skuControls() {
    return this.skus.controls;
  }

  getInitialSkus(): any[] {
    if (this.data.product?.skus?.length) {
      return this.data.product.skus.map((sku: any) => ({
        skuId: sku.skuId,
        name: sku.name,
        unitEquivalence: sku.unitEquivalence,
        priceSale: sku.priceSale
      }));
    }

    return [
      { skuId: 'unidad', name: 'Unidad', unitEquivalence: 1, priceSale: '' },
    ];
  }

  createSkuFormGroup(sku?: any): FormGroup {
    const group = this.fb.group({
      skuId: [ sku?.skuId ?? '', Validators.required ],
      name: [ sku?.name ?? '', Validators.required ],
      unitEquivalence: [ sku?.unitEquivalence ?? 1, [Validators.required, Validators.min(1)] ],
      priceSale: [ sku?.priceSale ?? '', [Validators.required, Validators.min(0)] ],
    });

    // Cuando cambia el nombre del SKU, regenerar su skuId
    group.get('name')!.valueChanges.subscribe((skuName: string) => {
      if (this.productForm) {
        const category = this.productForm.get('category')!.value;
        const name = this.productForm.get('nameProduct')!.value;
        const content = this.productForm.get('content')!.value;
        const contentUnit = this.productForm.get('contentUnit')!.value;
        const newSkuId = this.generateSkuId(category, name, content, contentUnit, skuName);
        group.get('skuId')!.setValue(newSkuId, { emitEvent: false });
      }
    });

    return group;
  }

  addSku() {
    const category = this.productForm.get('category')!.value;
    const name = this.productForm.get('nameProduct')!.value;
    const content = this.productForm.get('content')!.value;
    const contentUnit = this.productForm.get('contentUnit')!.value;

    const newSku = this.createSkuFormGroup({
      skuId: '',
      name: '',
      unitEquivalence: 1,
      priceSale: ''
    });

    this.skus.push(newSku);

    // Generar skuId inicial para el nuevo SKU
    const skuName = newSku.get('name')!.value;
    const newSkuId = this.generateSkuId(category, name, content, contentUnit, skuName);
    newSku.get('skuId')!.setValue(newSkuId, { emitEvent: false });
  }

  removeSku(index: number) {
    if (this.skus.length > 1) {
      this.skus.removeAt(index);
    }
  }

  onCreate() {
    if(this.productForm.valid) {
      // console.log(this.userForm.value);

      // this.newUser = this.userForm.value;
      // this.newUser.idCustomer = "653d2bc24044f178f6d347e0";
      // console.log(this.newUser);
      console.log(this.productForm.value);
      
      this.dataService.saveProduct(ProductRequest.createFromObject(this.productForm.value)).subscribe({
        next: (res) => {
          console.log(res);
          this.dialogRef.close(true);
        },
        error: (e) => {
          console.log(e);
          this.dialogRef.close(false);
        }
      });
      
    } else {
      this.productForm.markAllAsTouched();
    }
    
  }

  onUpdate() {
    console.log("vamos a updatear");
    if(this.productForm.valid){
      this.dataService.updateProductById(this.data.product.id, ProductRequest.createFromObject(this.productForm.value)).subscribe({
        next: (res) => {
          console.log(res);
          this.dialogRef.close(true);
        },
        error: (e) => {
          console.log(e);
          this.dialogRef.close(false);
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    if (this.skuSub) {
      this.skuSub.unsubscribe();
    }
  }

}
