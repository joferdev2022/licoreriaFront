import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent {
  private readonly mobileBreakpoint = 900;

  isMobile = window.innerWidth <= this.mobileBreakpoint;
  isSidebarOpen = !this.isMobile;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const isNowMobile = window.innerWidth <= this.mobileBreakpoint;

    if (isNowMobile !== this.isMobile) {
      this.isMobile = isNowMobile;
      this.isSidebarOpen = !isNowMobile;
    }
  }
}
