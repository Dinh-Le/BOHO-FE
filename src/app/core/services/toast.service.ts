import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ToastInfo {
  className: string;
  message: string;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts: ToastInfo[] = [];

  get toasts(): ToastInfo[] {
    return [...this._toasts];
  }

  showError(message: string, delaySec: number = 3) {
    this._toasts.push({
      className: 'bg-danger text-light',
      message,
      delay: delaySec * 1000,
    });
  }

  showHttpError(error: HttpErrorResponse, delaySec: number = 3) {
    this._toasts.push({
      className: 'bg-danger text-light',
      message: error.error?.message ?? error.message,
      delay: delaySec * 1000,
    });
  }

  showSuccess(message: string, delaySec: number = 3) {
    this._toasts.push({
      className: 'bg-success text-light',
      message,
      delay: delaySec * 1000,
    });
  }

  showWarning(message: string, delaySec: number = 3) {
    this._toasts.push({
      className: 'bg-warning text-light',
      message,
      delay: delaySec * 1000,
    });
  }

  showInfo(message: string, delaySec: number = 3) {
    this._toasts.push({
      className: 'bg-info text-light',
      message,
      delay: delaySec * 1000,
    });
  }

  remove(toast: ToastInfo) {
    this._toasts = this._toasts.filter((e) => toast === e);
  }
}
