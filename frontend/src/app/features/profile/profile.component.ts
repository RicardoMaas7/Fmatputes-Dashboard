import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, BankAccount } from '../../shared/models';
import { BankAccountsComponent } from '../../shared/components/bank-accounts/bank-accounts.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BankAccountsComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  loading = true;
  saving = false;
  uploadingPhoto = false;
  user: User | null = null;
  msg: { text: string; type: 'ok' | 'err' } | null = null;
  photoPreview: string | null = null;
  bankAccounts: BankAccount[] = [];

  form = {
    displayName: '',
    birthday: '',
    profilePhotoUrl: '',
  };

  /* ─── Change Password ─── */
  showPasswordForm = false;
  changingPassword = false;
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordMsg: { text: string; type: 'ok' | 'err' } | null = null;

  constructor(
    private dashboard: DashboardService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.dashboard.getMe().subscribe({
      next: (u) => {
        this.user = u;
        this.form.displayName = u.displayName || '';
        this.form.birthday = u.birthday || '';
        this.form.profilePhotoUrl = u.profilePhotoUrl || '';
        this.bankAccounts = u.bankAccounts || [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  save(): void {
    this.saving = true;
    this.http.put(`${environment.apiUrl}/users/${this.user!.id}`, this.form).subscribe({
      next: (updated: Partial<User>) => {
        this.saving = false;
        this.user = { ...this.user!, ...updated } as User;
        this.msg = { text: 'Perfil actualizado correctamente.', type: 'ok' };
        setTimeout(() => (this.msg = null), 4000);
      },
      error: (e) => {
        this.saving = false;
        this.msg = { text: e.error?.message || 'Error al guardar.', type: 'err' };
        setTimeout(() => (this.msg = null), 4000);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordMsg = { text: 'Las contraseñas no coinciden.', type: 'err' };
      setTimeout(() => (this.passwordMsg = null), 4000);
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordMsg = { text: 'La contraseña debe tener al menos 6 caracteres.', type: 'err' };
      setTimeout(() => (this.passwordMsg = null), 4000);
      return;
    }
    this.changingPassword = true;
    this.dashboard.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordMsg = { text: 'Contraseña cambiada correctamente.', type: 'ok' };
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => (this.passwordMsg = null), 4000);
      },
      error: (e) => {
        this.changingPassword = false;
        this.passwordMsg = { text: e.error?.message || 'Error al cambiar contraseña.', type: 'err' };
        setTimeout(() => (this.passwordMsg = null), 4000);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    this.uploadingPhoto = true;
    const formData = new FormData();
    formData.append('photo', file);

    this.http.post<User>(`${environment.apiUrl}/users/me/photo`, formData).subscribe({
      next: (updated) => {
        this.uploadingPhoto = false;
        this.user = { ...this.user!, ...updated } as User;
        this.form.profilePhotoUrl = updated.profilePhotoUrl || '';
        this.photoPreview = null;
        this.msg = { text: 'Foto de perfil actualizada.', type: 'ok' };
        setTimeout(() => (this.msg = null), 4000);
      },
      error: (e) => {
        this.uploadingPhoto = false;
        this.photoPreview = null;
        this.msg = { text: e.error?.message || 'Error al subir foto.', type: 'err' };
        setTimeout(() => (this.msg = null), 4000);
      },
    });
  }

  getPhotoUrl(): string {
    if (this.photoPreview) return this.photoPreview;
    if (this.form.profilePhotoUrl) {
      // If it's a relative path from our backend, prepend the API base
      if (this.form.profilePhotoUrl.startsWith('/uploads/')) {
        return environment.apiUrl.replace('/api', '') + this.form.profilePhotoUrl;
      }
      return this.form.profilePhotoUrl;
    }
    return '';
  }
}
