import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { ToastService } from '../../../core/services/toast.service';
import { AddressDto, CreateAddressDto } from '../../../core/models/address.model';

@Component({
  selector: 'app-customer-addresses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './addresses.component.html'
})
export class CustomerAddressesComponent implements OnInit {
  private addressService = inject(AddressService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  addresses: AddressDto[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editingId: number | null = null;
  deleteTarget: AddressDto | null = null;
  showDeleteConfirm = false;

  readonly labelOptions = ['Home', 'Work', 'Other'];

  form = this.fb.group({
    label: ['Home', [Validators.required, Validators.maxLength(50)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: ['', Validators.maxLength(20)],
    addressLine1: ['', [Validators.required, Validators.maxLength(250)]],
    addressLine2: ['', Validators.maxLength(250)],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(20)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
    setAsDefault: [false]
  });

  get firstName() { return this.form.get('firstName')!; }
  get lastName() { return this.form.get('lastName')!; }
  get addressLine1() { return this.form.get('addressLine1')!; }
  get city() { return this.form.get('city')!; }
  get state() { return this.form.get('state')!; }
  get postalCode() { return this.form.get('postalCode')!; }
  get country() { return this.form.get('country')!; }

  ngOnInit(): void { this.loadAddresses(); }

  loadAddresses(): void {
    this.loading = true;
    this.addressService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        this.addresses = res.success && res.data ? res.data : this.getMockAddresses();
      },
      error: () => {
        this.loading = false;
        this.addresses = this.getMockAddresses();
      }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({
      label: 'Home', firstName: '', lastName: '', phoneNumber: '',
      addressLine1: '', addressLine2: '', city: '', state: '',
      postalCode: '', country: '', setAsDefault: this.addresses.length === 0
    });
    this.showModal = true;
  }

  openEdit(address: AddressDto): void {
    this.editingId = address.id;
    this.form.patchValue({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      phoneNumber: address.phoneNumber ?? '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      setAsDefault: address.isDefault
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.getRawValue();
    const dto: CreateAddressDto = {
      label: raw.label!,
      firstName: raw.firstName!,
      lastName: raw.lastName!,
      phoneNumber: raw.phoneNumber || undefined,
      addressLine1: raw.addressLine1!,
      addressLine2: raw.addressLine2 || undefined,
      city: raw.city!,
      state: raw.state!,
      postalCode: raw.postalCode!,
      country: raw.country!,
      setAsDefault: raw.setAsDefault ?? false
    };

    const req = this.editingId !== null
      ? this.addressService.update(this.editingId, dto)
      : this.addressService.create(dto);

    req.subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.toast.success(this.editingId !== null ? 'Address updated.' : 'Address added.', 'Success');
          this.closeModal();
          this.loadAddresses();
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.saving = false; }
    });
  }

  setDefault(address: AddressDto): void {
    this.addressService.setDefault(address.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(`"${address.label}" set as default.`, 'Updated');
          this.loadAddresses();
        }
      },
      error: () => {}
    });
  }

  confirmDelete(address: AddressDto): void { this.deleteTarget = address; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.deleteTarget = null; this.showDeleteConfirm = false; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.addressService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Address removed.', 'Deleted');
        this.cancelDelete();
        this.loadAddresses();
      },
      error: () => { this.cancelDelete(); }
    });
  }

  formatAddress(a: AddressDto): string {
    const parts = [a.addressLine1];
    if (a.addressLine2) parts.push(a.addressLine2);
    parts.push(`${a.city}, ${a.state} ${a.postalCode}`);
    parts.push(a.country);
    return parts.join(', ');
  }

  getLabelIcon(label: string): string {
    const map: Record<string, string> = { Home: 'bi-house', Work: 'bi-building', Other: 'bi-geo-alt' };
    return map[label] ?? 'bi-geo-alt';
  }

  private getMockAddresses(): AddressDto[] {
    return [
      { id: 1, label: 'Home', firstName: 'John', lastName: 'Doe', phoneNumber: '+1-555-0100', addressLine1: '123 Main Street', city: 'New York', state: 'NY', postalCode: '10001', country: 'United States', isDefault: true },
      { id: 2, label: 'Work', firstName: 'John', lastName: 'Doe', phoneNumber: '+1-555-0200', addressLine1: '456 Office Park', addressLine2: 'Suite 300', city: 'New York', state: 'NY', postalCode: '10002', country: 'United States', isDefault: false },
    ];
  }
}
