import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { ModalExpensesComponent } from 'src/app/components/modal-expenses/modal-expenses.component';
import { ExpenseModel } from 'src/app/models/internal/expense.model';
import { DataService } from 'src/app/services/data.service';

interface ExpenseFilters {
  search: string;
  category: string;
  paymentMethod: string;
  status: string;
  startDate: number | null;
  endDate: number | null;
}

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'fecha',
    'categoria',
    'descripcion',
    'proveedor',
    'metodoPago',
    'comprobante',
    'estado',
    'monto',
    'acciones',
  ];

  dataSource = new MatTableDataSource<ExpenseModel>([]);
  expenses: ExpenseModel[] = [];
  isLoading = false;
  loadError = '';
  totalRecords = 0;
  local: number;
  permissions: number;

  searchValue = '';
  selectedCategory = '';
  selectedPaymentMethod = '';
  selectedStatus = '';

  monthlyTotal = 0;
  dailyTotal = 0;
  pendingTotal = 0;
  pendingCount = 0;
  mainCategory = 'Sin datos';
  mainCategoryTotal = 0;

  readonly categories = [
    { value: 'publicidad', label: 'Publicidad' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'internet', label: 'Internet' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'compras', label: 'Compras' },
    { value: 'otros', label: 'Otros' },
  ];

  readonly paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'yape', label: 'Yape' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'debito_automatico', label: 'Débito automático' },
    { value: 'otro', label: 'Otro' },
  ];

  readonly statuses = [
    { value: 'pagado', label: 'Pagado' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dataService: DataService,
    private paginatorIntl: MatPaginatorIntl,
    public dialog: MatDialog,
  ) {
    this.local = this.readStoredNumber('local', 1);
    this.permissions = this.readStoredNumber('permissions', 0);
    this.configurePaginatorLabels();
    this.configureTableFiltering();
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  ngAfterViewInit(): void {
    this.attachTableControls();
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('es-PE', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('es-PE').format(new Date());
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.loadError = '';

    this.dataService.loadExpenses(1, 100, this.local).subscribe({
      next: (response) => {
        console.log(response);
        this.expenses = response.data ?? [];
        this.totalRecords = response.total ?? this.expenses.length;
        this.dataSource.data = this.expenses;
        this.calculateSummary();
        this.attachTableControls();
        this.applyCombinedFilters();
        this.isLoading = false;
      },
      error: () => {
        this.expenses = [];
        this.dataSource.data = [];
        this.calculateSummary();
        this.loadError = 'No se pudieron cargar los gastos. Intenta nuevamente.';
        this.isLoading = false;
      },
    });
  }

  onSearch(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.applyCombinedFilters();
  }

  applyCombinedFilters(): void {
    const start = this.range.controls.start.value;
    const end = this.range.controls.end.value;

    const filters: ExpenseFilters = {
      search: this.searchValue.trim().toLowerCase(),
      category: this.selectedCategory,
      paymentMethod: this.selectedPaymentMethod,
      status: this.selectedStatus,
      startDate: start ? this.startOfDay(start).getTime() : null,
      endDate: end ? this.endOfDay(end).getTime() : null,
    };

    this.dataSource.filter = JSON.stringify(filters);
    this.dataSource.paginator?.firstPage();
  }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedCategory = '';
    this.selectedPaymentMethod = '';
    this.selectedStatus = '';
    this.range.setValue({ start: null, end: null });
    this.applyCombinedFilters();
  }

  openDialogCreate(): void {
    this.openExpenseDialog('create');
  }

  openDialogUpdate(expense: ExpenseModel): void {
    this.openExpenseDialog('update', expense);
  }

  openDialogView(expense: ExpenseModel): void {
    this.openExpenseDialog('view', expense);
  }

  openDeleteExpenseSwal(expense: ExpenseModel): void {
    const expenseReference = expense.descripcion || this.categoryLabel(expense.categoria);
    Swal.fire({
      title: 'Eliminar gasto',
      text: `¿Deseas eliminar "${expenseReference}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b8952e',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.dataService.deleteExpenseById(expense.id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Gasto eliminado',
            text: 'El gasto se eliminó correctamente.',
            icon: 'success',
            confirmButtonColor: '#b8952e',
          });
          this.loadExpenses();
        },
        error: () => {
          Swal.fire({
            title: 'No se pudo eliminar',
            text: 'Ocurrió un problema al eliminar el gasto.',
            icon: 'error',
            confirmButtonColor: '#b8952e',
          });
        },
      });
    });
  }

  categoryLabel(value: string): string {
    return this.categories.find((category) => category.value === value)?.label
      ?? this.toTitleCase(value || 'Otros');
  }

  paymentMethodLabel(value: string): string {
    return this.paymentMethods.find((method) => method.value === value)?.label
      ?? this.toTitleCase(value || 'No especificado');
  }

  categoryTone(value: string): string {
    const tones: Record<string, string> = {
      publicidad: 'purple',
      servicios: 'blue',
      alquiler: 'green',
      internet: 'teal',
      transporte: 'amber',
      limpieza: 'purple',
      mantenimiento: 'amber',
      compras: 'slate',
      otros: 'slate',
    };
    return tones[value] ?? 'slate';
  }

  private openExpenseDialog(
    operation: 'create' | 'update' | 'view',
    expense?: ExpenseModel,
  ): void {
    const dialogRef = this.dialog.open(ModalExpensesComponent, {
      data: { expense, operation, local: this.local },
      width: '680px',
      maxWidth: '94vw',
      maxHeight: '88vh',
      panelClass: 'expense-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((saved: boolean | undefined) => {
      if (saved) {
        if (operation === 'create') {
          this.clearFilters();
        }
        this.loadExpenses();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: operation === 'update' ? 'Gasto actualizado' : 'Gasto creado',
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
        });
      }
    });
  }

  private configureTableFiltering(): void {
    this.dataSource.filterPredicate = (expense, rawFilter) => {
      const filters = JSON.parse(rawFilter) as ExpenseFilters;
      const expenseDate = this.startOfDay(new Date(expense.fecha)).getTime();
      const searchableText = [
        expense.descripcion,
        expense.proveedor,
        expense.comprobante,
        this.categoryLabel(expense.categoria),
        this.paymentMethodLabel(expense.metodoPago),
      ].join(' ').toLowerCase();

      return (!filters.search || searchableText.includes(filters.search))
        && (!filters.category || expense.categoria === filters.category)
        && (!filters.paymentMethod || expense.metodoPago === filters.paymentMethod)
        && (!filters.status || expense.estado === filters.status)
        && (filters.startDate === null || expenseDate >= filters.startDate)
        && (filters.endDate === null || expenseDate <= filters.endDate);
    };

    this.dataSource.sortingDataAccessor = (expense, property) => {
      switch (property) {
        case 'fecha': return new Date(expense.fecha).getTime();
        case 'categoria': return this.categoryLabel(expense.categoria);
        case 'metodoPago': return this.paymentMethodLabel(expense.metodoPago);
        case 'monto': return expense.monto;
        default: return String((expense as unknown as Record<string, unknown>)[property] ?? '');
      }
    };
  }

  private attachTableControls(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private calculateSummary(): void {
    const now = new Date();
    const monthlyExpenses = this.expenses.filter((expense) => {
      const date = new Date(expense.fecha);
      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth();
    });
    const dailyExpenses = monthlyExpenses.filter((expense) => {
      const date = new Date(expense.fecha);
      return date.getDate() === now.getDate();
    });
    const pendingExpenses = monthlyExpenses.filter(
      (expense) => expense.estado.toLowerCase() === 'pendiente',
    );

    this.monthlyTotal = this.sumExpenses(monthlyExpenses);
    this.dailyTotal = this.sumExpenses(dailyExpenses);
    this.pendingTotal = this.sumExpenses(pendingExpenses);
    this.pendingCount = pendingExpenses.length;

    const totalsByCategory = new Map<string, number>();
    monthlyExpenses.forEach((expense) => {
      const current = totalsByCategory.get(expense.categoria) ?? 0;
      totalsByCategory.set(expense.categoria, current + expense.monto);
    });

    let topCategory = '';
    let topTotal = 0;
    totalsByCategory.forEach((total, category) => {
      if (total > topTotal) {
        topCategory = category;
        topTotal = total;
      }
    });

    this.mainCategory = topCategory ? this.categoryLabel(topCategory) : 'Sin datos';
    this.mainCategoryTotal = topTotal;
  }

  private sumExpenses(expenses: ExpenseModel[]): number {
    return expenses.reduce((total, expense) => total + Number(expense.monto || 0), 0);
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private configurePaginatorLabels(): void {
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
    this.paginatorIntl.nextPageLabel = 'Página siguiente';
    this.paginatorIntl.previousPageLabel = 'Página anterior';
    this.paginatorIntl.firstPageLabel = 'Primera página';
    this.paginatorIntl.lastPageLabel = 'Última página';
  }

  private readStoredNumber(key: string, fallback: number): number {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }

    try {
      const parsedValue = Number(JSON.parse(storedValue));
      return Number.isFinite(parsedValue) ? parsedValue : fallback;
    } catch {
      return fallback;
    }
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}
