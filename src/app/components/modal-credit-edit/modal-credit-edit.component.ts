import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-modal-credit-edit',
  templateUrl: './modal-credit-edit.component.html',
  styleUrls: ['./modal-credit-edit.component.scss'],
})
export class ModalCreditEditComponent implements OnInit {
  creditPaymentForm!: FormGroup;
  isSaving = false;
  readonly paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
  ];

  constructor(
    public dialogRef: MatDialogRef<ModalCreditEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { saleCredit: SaleModel; operation: string },
    private fb: FormBuilder,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.creditPaymentForm = this.fb.group({
      monto: [
        null,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.balance),
        ],
      ],
      metodo: ['efectivo', Validators.required],
      referencia: ['', Validators.maxLength(100)],
      observaciones: ['', Validators.maxLength(500)],
    });
  }

  get sale(): SaleModel {
    return this.data.saleCredit;
  }

  get balance(): number {
    return Number(this.sale?.pago?.saldoPendiente ?? 0);
  }

  get remainingBalance(): number {
    const amount = Number(this.creditPaymentForm?.get('monto')?.value ?? 0);
    return Math.max(this.balance - amount, 0);
  }

  payFullBalance(): void {
    this.creditPaymentForm.get('monto')?.setValue(this.balance);
    this.creditPaymentForm.get('monto')?.markAsTouched();
  }

  submitPayment(): void {
    if (this.isSaving) {
      return;
    }
    if (this.creditPaymentForm.invalid) {
      this.creditPaymentForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const paysFullBalance = this.remainingBalance === 0;
    this.dataService
      .updatePaymentSaleById(this.sale.id, {
        ...this.creditPaymentForm.value,
        fecha: new Date().toISOString(),
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close(true);
          Swal.fire({
            title: 'Pago registrado',
            text:
              paysFullBalance
                ? 'La deuda ha sido cancelada completamente.'
                : 'El abono fue agregado al historial del crédito.',
            icon: 'success',
          });
        },
        error: (error) => {
          this.isSaving = false;
          const detail = error?.error?.detail;
          Swal.fire({
            title: 'No se pudo registrar el pago',
            text: typeof detail === 'string' ? detail : 'Actualiza la deuda e inténtalo nuevamente.',
            icon: 'error',
          });
        },
      });
  }
}
