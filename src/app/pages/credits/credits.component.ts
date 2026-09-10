import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { timer } from 'rxjs';

import { ModalCreditEditComponent } from 'src/app/components/modal-credit-edit/modal-credit-edit.component';
import { ModalInfoSaleComponent } from 'src/app/components/modal-info-sale/modal-info-sale.component';
import {
  CreditPaymentStatus,
  SaleModel,
} from 'src/app/models/internal/sale.model';
import { CreditSummaryModel } from 'src/app/models/response/credit.response';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
})
export class CreditsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'cliente',
    'fechaVenta',
    'total',
    'pagado',
    'saldo',
    'vencimiento',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<SaleModel>([]);
  summary = new CreditSummaryModel();
  searchControl = new FormControl('', { nonNullable: true });
  statusControl = new FormControl('todos', { nonNullable: true });
  isLoading = false;
  totalCredits = 0;
  local: any;
  permissions: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dataService: DataService,
    private paginatorIntl: MatPaginatorIntl,
    public dialog: MatDialog,
  ) {
    paginatorIntl.itemsPerPageLabel = 'Créditos por página';
    this.local = JSON.parse(localStorage.getItem('local') || '1');
    this.permissions = JSON.parse(localStorage.getItem('permissions') || '0');

    this.dataSource.filterPredicate = (sale, rawFilter) => {
      const filter = JSON.parse(rawFilter) as { search: string; status: string };
      const customer = `${sale.clienteCredito?.nombre ?? ''} ${sale.clienteCredito?.telefono ?? ''}`
        .trim()
        .toLowerCase();
      const matchesSearch = !filter.search || customer.includes(filter.search);
      const matchesStatus =
        filter.status === 'todos' || this.getPaymentStatus(sale) === filter.status;
      return matchesSearch && matchesStatus;
    };
    this.dataSource.sortingDataAccessor = (sale, column) => {
      switch (column) {
        case 'cliente':
          return sale.clienteCredito?.nombre?.toLowerCase() ?? '';
        case 'fechaVenta':
          return new Date(sale.fechaVenta).getTime();
        case 'total':
          return sale.pago.total;
        case 'pagado':
          return sale.pago.pagado;
        case 'saldo':
          return sale.pago.saldoPendiente;
        case 'vencimiento':
          return sale.fechaVencimiento
            ? new Date(sale.fechaVencimiento).getTime()
            : Number.MAX_SAFE_INTEGER;
        default:
          return '';
      }
    };
  }

  ngOnInit(): void {
    this.loadCreditSales();
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCreditSales(): void {
    this.isLoading = true;
    this.dataService.loadSalesWithCredit(1, 5000, this.local).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.summary = response.summary;
        this.totalCredits = response.total ?? response.data.length;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error(error);
        this.dataSource.data = [];
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      search: this.searchControl.value.trim().toLowerCase(),
      status: this.statusControl.value,
    });
    this.dataSource.paginator?.firstPage();
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusControl.setValue('todos', { emitEvent: false });
    this.applyFilters();
  }

  getPaymentStatus(sale: SaleModel): CreditPaymentStatus {
    if (sale.estadoCobro) {
      return sale.estadoCobro;
    }
    if (sale.pago.saldoPendiente <= 0) {
      return 'pagado';
    }
    if (sale.fechaVencimiento && new Date(sale.fechaVencimiento).getTime() < Date.now()) {
      return 'vencido';
    }
    return sale.pago.pagado > 0 ? 'parcial' : 'pendiente';
  }

  getStatusLabel(sale: SaleModel): string {
    const labels: Record<CreditPaymentStatus, string> = {
      pendiente: 'Pendiente',
      parcial: 'Pago parcial',
      pagado: 'Pagado',
      vencido: 'Vencido',
    };
    return labels[this.getPaymentStatus(sale)];
  }

  openDialogPayment(sale: SaleModel): void {
    if (sale.pago.saldoPendiente <= 0) {
      return;
    }
    const dialogRef = this.dialog.open(ModalCreditEditComponent, {
      data: { saleCredit: sale, operation: 'payment' },
      width: '560px',
      maxWidth: '96vw',
      panelClass: 'credit-payment-dialog',
    });
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved === true) {
        timer(350).subscribe(() => this.loadCreditSales());
      }
    });
  }

  openDialogInfoSale(sale: SaleModel): void {
    this.dialog.open(ModalInfoSaleComponent, {
      data: { data: sale, operation: 'info' },
      width: '620px',
      maxWidth: '96vw',
      maxHeight: '90vh',
    });
  }
}
