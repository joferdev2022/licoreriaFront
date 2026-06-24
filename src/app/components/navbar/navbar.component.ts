import { Component, HostBinding, HostListener } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @HostBinding('class.navbar-hidden') isNavbarHidden = false;

  private lastScrollTop = 0;
  user: any;

  constructor(private authService: AuthService) { 
    this.user = JSON.parse(localStorage.getItem('user')!) ? JSON.parse(localStorage.getItem('user')!) : '';
  }


  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const isScrollingDown = currentScrollTop > this.lastScrollTop;

    this.isNavbarHidden = currentScrollTop > 20 && isScrollingDown;
    this.lastScrollTop = Math.max(currentScrollTop, 0);
  }

  logout() {
    this.authService.logout();
  }

}
