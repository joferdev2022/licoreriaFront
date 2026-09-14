import { Component, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @HostBinding('class.navbar-hidden') isNavbarHidden = false;
  @Output() menuToggle = new EventEmitter<void>();

  private lastScrollTop = 0;
  user = '';
  local = '';

  constructor(private authService: AuthService) { 
    this.user = this.getStoredUser();
    this.local = this.getStoredLocal();
  }

  get localLabel(): string {
    if (!this.local) {
      return 'Local —';
    }

    return /^local\b/i.test(this.local) ? this.local : `Local ${this.local}`;
  }


  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (window.innerWidth <= 900) {
      this.isNavbarHidden = false;
      this.lastScrollTop = Math.max(currentScrollTop, 0);
      return;
    }

    const isScrollingDown = currentScrollTop > this.lastScrollTop;

    this.isNavbarHidden = currentScrollTop > 20 && isScrollingDown;
    this.lastScrollTop = Math.max(currentScrollTop, 0);
  }

  logout() {
    this.authService.logout();
  }

  private getStoredUser(): string {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return '';
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (typeof parsedUser === 'string') {
        return parsedUser;
      }

      return parsedUser?.name || parsedUser?.username || parsedUser?.email || 'Usuario';
    } catch {
      return storedUser;
    }
  }

  private getStoredLocal(): string {
    const storedLocal = localStorage.getItem('local');

    if (!storedLocal) {
      return '';
    }

    try {
      const parsedLocal = JSON.parse(storedLocal);

      if (typeof parsedLocal === 'string' || typeof parsedLocal === 'number') {
        return String(parsedLocal);
      }

      return String(parsedLocal?.name || parsedLocal?.id || '');
    } catch {
      return storedLocal;
    }
  }

}
