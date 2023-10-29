import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectComponent } from './components/select/select.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Select2Component } from './components/select-2/select-2.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [SearchInputComponent, SelectComponent, Select2Component],
  imports: [CommonModule, FormsModule, NgbModule, FontAwesomeModule],
  exports: [SearchInputComponent, SelectComponent, Select2Component, FontAwesomeModule],
})
export class SharedModule {}
