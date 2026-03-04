import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  // Terminal boot sequence lines
  bootLines = [
    'FMAPUTES SYSTEM v1.0.0',
    'Initializing secure connection...',
    'Loading kernel modules... OK',
    'Establishing encrypted tunnel... OK',
    'Authentication required.',
  ];
  visibleLines: string[] = [];
  bootComplete = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.runBootSequence();
  }

  private runBootSequence(): void {
    let i = 0;
    const interval = setInterval(() => {
      if (i < this.bootLines.length) {
        this.visibleLines.push(this.bootLines[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          this.bootComplete = true;
        }, 300);
      }
    }, 400);
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'ERROR: Missing credentials';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'ERROR: Authentication failed. Access denied.';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
