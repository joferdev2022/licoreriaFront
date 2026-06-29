import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';


import { ProductResponse } from '../models/response/product.response';
import { SaleResponse } from '../models/response/sale.response';
import { DashboardResponse } from '../models/response/dashboard.response';
import { ProductRequest } from '../models/request/product.request';
import { SaleRequest } from '../models/request/sale.request';
import { SellerResponse } from '../models/response/seller.response';
import { SellerRequest } from '../models/request/seller.request';
import { ProviderResponse } from '../models/response/provider.response';
import { ProviderRequest } from '../models/request/provider.request';
import { SellerMonthlyStatsResponse } from '../models/request/seller_monthly_stats.response';



const base_url = "http://localhost:8000/api";
// const base_url = "https://almacenback.onrender.com/api";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  excelUploadResponse$ = new Subject<any>();

  constructor(private http: HttpClient) { }



  loadProducts(page: number = 1, perPage: number = 2000, local: any):Observable<ProductResponse> {
    const url = `${ base_url }/productsliquor?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<ProductResponse>(url).pipe(map(res => ProductResponse.createFromObject(res)));
  }

  
  loadAllSellers(page: number = 1, perPage: number = 5000, local:any):Observable<any> {
    const url = `${ base_url }/sellersliquor?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SellerResponse>(url).pipe(map(res => SellerResponse.createFromObject(res)));
  }

  loadAllProviders(page: number = 1, perPage: number = 5000, local:any):Observable<any> {
    const url = `${ base_url }/providersliquor?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<ProviderResponse>(url).pipe(map(res => ProviderResponse.createFromObject(res)));
  }

  loadSales(page: number = 1, perPage: number = 5000, local:any):Observable<SaleResponse> {
    const url = `${ base_url }/salesliquor?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SaleResponse>(url).pipe(map(res => SaleResponse.createFromObject(res)));
  }

  loadSalesWithCredit(page: number = 1, perPage: number = 5000, local:any):Observable<SaleResponse> {
    const url = `${ base_url }/salesliquor/credits?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SaleResponse>(url).pipe(map(res => SaleResponse.createFromObject(res)));
  }

  loadDashboard(fechaInicio?: Date, fechaFin?: Date, local?: any) {

    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio.toISOString());
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin.toISOString());
    }

    if(local) {
      params = params.set('local', local);
    }

    const url = `${ base_url }/dashboardliquor`;
    return this.http.get<DashboardResponse>(url,  { params }).pipe(map(res => DashboardResponse.createFromObject(res)));
  }


  saveProduct(productData: ProductRequest):Observable<any> {

    const url = `${ base_url }/productsliquor`;
    console.log(productData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, productData ).pipe(map(res => res));
  }

  saveSeller(sellerData: SellerRequest):Observable<any> {

    const url = `${ base_url }/sellersliquor`;
    console.log(sellerData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, sellerData ).pipe(map(res => res));
  }

  saveProvider(providerData: ProviderRequest):Observable<any> {

    const url = `${ base_url }/providersliquor`;
    console.log(providerData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, providerData ).pipe(map(res => console.log(res)));
  }

  updateProductById(productId: any , productData:ProductRequest):Observable<any> {
    const url = `${ base_url }/productsliquor/${productId}`;
    return this.http.put<any>( url, productData ).pipe(map(res => res));
  }

  updateSellerById(sellerId: any , sellerData:SellerRequest):Observable<any> {
    const url = `${ base_url }/sellersliquor/${sellerId}`;
    return this.http.put<any>( url, sellerData ).pipe(map(res => res));
  }

  updateProviderById(providerId: any , providerData:ProviderRequest):Observable<any> {
    const url = `${ base_url }/providersliquor/${providerId}`;
    return this.http.put<any>( url, providerData ).pipe(map(res => console.log(res)));
  }

  updatStateSaleById(saleId: any , state: any):Observable<any> {
    const url = `${ base_url }/salesliquor/state/${saleId}?state=${state}`;
    return this.http.put<any>( url, {} ).pipe(map(res => res));
  }

  updatePaymentSaleById(saleId: any , payment: any):Observable<any> {
    const url = `${ base_url }/salesliquor/payment/${saleId}?payment=${payment}`;
    return this.http.put<any>( url, {} ).pipe(map(res => res));
  }

  updateProviderDebtById(providerId: any, deuda: number, monto: number): Observable<any> {
  const url = `${base_url}/providersliquor/${providerId}/debt`;
  return this.http.put<any>(url, { deuda, monto }).pipe(map(res => res));
}

  deleteProductById(productId: any):Observable<any> {
    const url = `${ base_url }/productsliquor/${productId}`;
    return this.http.delete<any>(url).pipe(map(res => res));
  }

  deleteSellerById(sellerId: any):Observable<any> {
    const url = `${ base_url }/sellersliquor/${sellerId}`;
    return this.http.delete<any>(url).pipe(map(res => res));
  }

  deleteProviderById(providerId: any):Observable<any> {
    const url = `${ base_url }/providersliquor/${providerId}`;
    return this.http.delete<any>(url).pipe(map(res => res));
  }

  getSellerMonthlyStats(sellerName: string, month: number, year: number, local: any): Observable<SellerMonthlyStatsResponse> {
      const url = `${base_url}/sellersliquor/${encodeURIComponent(sellerName)}/monthly-stats?local=${local}&year=${year}&month=${month}`;
      return this.http.get<SellerMonthlyStatsResponse>(url)
          .pipe(map(res => SellerMonthlyStatsResponse.createFromObject(res)));
  }

  
  saveSale(saleData: SaleRequest):Observable<any> {

    const url = `${ base_url }/salesliquor`;
    console.log(saleData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, saleData ).pipe(map(res => res));
  }
  deleteSaleById(saleId: any):Observable<any> {
    const url = `${ base_url }/salesliquor/${saleId}`;
    return this.http.delete<any>(url).pipe(map(res => res));
  }

  dayliSalesByLocal(local: any):Observable<any> {
    // localhost:8000/api/sales/summary/daily
    const url = `${ base_url }/salesliquor/summary/daily?local=${local}`;
    return this.http.get<any>(url).pipe(map(res => {return res;}));
  }

  uploadProductsExcel(file: File, local: any): Observable<any> {
    const url = `${base_url}/productsliquor/upload-excel`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('local', local);
    
    return this.http.post<any>(url, formData);
  }

  DownloadProductsExcel(local: any){
    const url = `${base_url}/productsliquor/download-excel?local=${local}`;

    this.http.get(url, { responseType: 'blob' }).subscribe((data: Blob) => {
      const objectUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `productos_local_${local}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    });
  }
}
