import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { UserRole } from '../../core/enums/user-role.enum';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent, LoaderComponent, ToastContainerComponent],
  template: `
    <app-loader />
    <app-toast-container />
    <div class="page-wrapper">
      <app-sidebar [role]="role" />
      <div class="main-content" style="margin-left: 260px;">
        <app-header [role]="role" />
        <div class="content-area">
          <router-outlet />
        </div>
        <app-footer />
      </div>
    </div>
  `
})
export class CustomerLayoutComponent {
  readonly role = UserRole.Customer;
}
