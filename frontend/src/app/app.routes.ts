import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { authGuard, adminGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'voting', 
        loadComponent: () => import('./features/voting/voting.component').then(m => m.VotingComponent) 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) 
      },
      { 
        path: 'admin', 
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
      },
      {
        path: 'transport',
        loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent),
      },
      {
        path: 'member/:id',
        loadComponent: () => import('./features/member-profile/member-profile.component').then(m => m.MemberProfileComponent),
      },
    ]
  },
  { path: '**', redirectTo: '' }
];