import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface PromptOptions {
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ModalState {
  mode: 'confirm' | 'prompt';
  options: ConfirmOptions | PromptOptions;
  resolve: (value: boolean | string | null) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private modalSubject = new Subject<ModalState | null>();
  modal$ = this.modalSubject.asObservable();

  confirm(title: string, message: string, options?: Partial<ConfirmOptions>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalSubject.next({
        mode: 'confirm',
        options: { title, message, type: 'danger', ...options },
        resolve: (val) => resolve(val as boolean),
      });
    });
  }

  prompt(title: string, message: string, options?: Partial<PromptOptions>): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      this.modalSubject.next({
        mode: 'prompt',
        options: { title, message, placeholder: '', ...options },
        resolve: (val) => resolve(val as string | null),
      });
    });
  }

  /** Called by the component to close the modal */
  close(): void {
    this.modalSubject.next(null);
  }
}
