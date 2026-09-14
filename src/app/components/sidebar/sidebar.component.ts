import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Input() sideNavStatus: boolean = false;
  @Output() navigationSelected = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();
  collapse = false;
  public user: any;
  // public user: any;

  constructor() { 
    
  }
}
