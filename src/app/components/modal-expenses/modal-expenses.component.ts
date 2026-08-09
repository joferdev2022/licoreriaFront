import { Component, HostListener, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExpenseRequest } from 'src/app/models/request/expense.request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-modal-expenses',
  templateUrl: './modal-expenses.component.html',
  styleUrls: ['./modal-expenses.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalExpensesComponent implements OnInit {
  expenseForm!: FormGroup;
  showMoreInfo = false;
  openDropdown: string | null = null;
  isSaving = false;
  saveError = '';
  local: number;

  readonly categories = [
    { value: 'publicidad', label: 'Publicidad', icon: 'campaign', tone: 'purple' },
    { value: 'servicios', label: 'Servicios', icon: 'lightbulb', tone: 'blue' },
    { value: 'alquiler', label: 'Alquiler', icon: 'home_work', tone: 'green' },
    { value: 'internet', label: 'Internet', icon: 'wifi', tone: 'teal' },
    { value: 'transporte', label: 'Transporte', icon: 'local_shipping', tone: 'amber' },
    { value: 'limpieza', label: 'Limpieza', icon: 'cleaning_services', tone: 'purple' },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: 'build', tone: 'amber' },
    { value: 'compras', label: 'Compras', icon: 'shopping_bag', tone: 'green' },
    { value: 'otros', label: 'Otros', icon: 'category', tone: 'slate' },
  ];

  readonly statusOptions = [
    { value: 'pagado', label: 'Pagado', tone: 'green' },
    { value: 'pendiente', label: 'Pendiente', tone: 'amber' },
  ];

  readonly paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: 'payments', tone: 'green' },
    { value: 'yape', label: 'Yape', icon: 'phone_android', tone: 'purple' },
    { value: 'transferencia', label: 'Transferencia', icon: 'account_balance', tone: 'blue' },
    { value: 'tarjeta', label: 'Tarjeta', icon: 'credit_score', tone: 'slate' },
    { value: 'debito_automatico', label: 'Débito automático', icon: 'sync', tone: 'teal' },
    { value: 'otro', label: 'Otro', icon: 'more_horiz', tone: 'slate' },
  ];

  constructor(
    public dialogRef: MatDialogRef<ModalExpensesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService,
  ) {
    this.local = Number(data?.local ?? this.readLocal());
  }

  ngOnInit(): void {
    this.createForm();
  }

  get isViewMode(): boolean {
    return this.data?.operation === 'view';
  }

  get isUpdateMode(): boolean {
    return this.data?.operation === 'update';
  }

  get dialogTitle(): string {
    if (this.isViewMode) {
      return 'Detalle del gasto';
    }
    return this.isUpdateMode ? 'Editar gasto' : 'Nuevo gasto';
  }

  get saveButtonLabel(): string {
    return this.isUpdateMode ? 'Actualizar gasto' : 'Guardar gasto';
  }

  get selectedCategory() {
    return this.categories.find(
      (category) => category.value === this.expenseForm.get('category')?.value,
    ) || this.categories[this.categories.length - 1];
  }

  get selectedStatus() {
    return this.statusOptions.find(
      (status) => status.value === this.expenseForm.get('status')?.value,
    ) || this.statusOptions[0];
  }

  get selectedPaymentMethod() {
    return this.paymentMethods.find(
      (method) => method.value === this.expenseForm.get('paymentMethod')?.value,
    ) || this.paymentMethods[this.paymentMethods.length - 1];
  }

  toggleMoreInfo(): void {
    this.showMoreInfo = !this.showMoreInfo;
  }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    if (this.isViewMode) {
      return;
    }
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  selectOption(controlName: string, value: string): void {
    if (this.isViewMode) {
      return;
    }
    this.expenseForm.get(controlName)?.setValue(value);
    this.openDropdown = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdown = null;
  }

  onSave(): void {
    console.log(this.expenseForm);
    if (this.isViewMode) {
      this.dialogRef.close();
      return;
    }

    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    if (this.isSaving) {
      return;
    }

    const formValue = this.expenseForm.getRawValue();
    const request = ExpenseRequest.createFromObject({
      fecha: this.toApiDate(formValue.date),
      categoria: formValue.category,
      descripcion: formValue.description?.trim(),
      proveedor: formValue.provider?.trim(),
      metodoPago: formValue.paymentMethod,
      comprobante: formValue.voucher?.trim(),
      estado: formValue.status,
      monto: formValue.amount,
      local: this.local,
      observaciones: formValue.notes?.trim(),
    });

    this.isSaving = true;
    this.saveError = '';
    const request$ = this.isUpdateMode
      ? this.dataService.updateExpenseById(this.data.expense.id, request)
      : this.dataService.saveExpense(request);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => {
        this.isSaving = false;
        this.saveError = this.getApiErrorMessage(error);
      },
    });
  }

  private createForm(): void {
    const expense = this.data?.expense;
    this.expenseForm = this.fb.group({
      date: [this.toDateInputValue(expense?.fecha), Validators.required],
      category: [expense?.categoria ?? 'servicios', Validators.required],
      description: [
        expense?.descripcion ?? '',
        Validators.maxLength(180),
      ],
      status: [expense?.estado ?? 'pagado', Validators.required],
      amount: [expense?.monto ?? null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [expense?.metodoPago ?? 'efectivo', Validators.required],
      provider: [expense?.proveedor ?? '', Validators.maxLength(120)],
      voucher: [expense?.comprobante ?? '', Validators.maxLength(80)],
      notes: [expense?.observaciones ?? '', Validators.maxLength(500)],
    });

    this.showMoreInfo = Boolean(
      expense?.proveedor || expense?.comprobante || expense?.observaciones || this.isViewMode,
    );

    if (this.isViewMode) {
      this.expenseForm.disable();
    }
  }

  private toDateInputValue(value?: string): string {
    const date = value ? new Date(value) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toApiDate(value: string): string {
    return `${value}T12:00:00-05:00`;
  }

  private getApiErrorMessage(error: any): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => item?.msg)
        .filter((message: unknown) => typeof message === 'string')
        .join(' · ') || 'Hay datos inválidos en el formulario.';
    }
    return 'No se pudo guardar el gasto. Revisa los datos e intenta nuevamente.';
  }

  private readLocal(): number {
    const value = localStorage.getItem('local');
    if (!value) {
      return 1;
    }
    try {
      return Number(JSON.parse(value)) || 1;
    } catch {
      return 1;
    }
  }
}
