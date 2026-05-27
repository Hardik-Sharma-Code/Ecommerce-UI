import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, ToastContainerComponent],
  template: `
    <app-loader />
    <app-toast-container />
    <router-outlet />
  `
})
export class AuthLayoutComponent {}
