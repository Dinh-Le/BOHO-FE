import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notEmptyArrayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (Array.isArray(value) && value.length > 0) {
      return null;
    }

    return { required: true };
  };
}
