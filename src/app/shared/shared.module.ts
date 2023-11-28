import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectComponent } from './components/select/select.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Select2Component } from './components/select-2/select-2.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuComponent } from './components/menu/menu.component';
import { MenuItemComponent } from './components/menu/menu-item.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { TreeViewItemComponent } from './components/tree-view/tree-view-item.component';
import { TreeViewItemDropDownComponent } from './components/tree-view/tree-view-item-dropdown.component';
import { ListViewComponent } from './components/list-view/list-view.component';

@NgModule({
  declarations: [
    SearchInputComponent,
    SelectComponent,
    Select2Component,
    MenuComponent,
    MenuItemComponent,
    TreeViewComponent,
    TreeViewItemDropDownComponent,
    TreeViewItemComponent,
    ListViewComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, FontAwesomeModule],
  exports: [
    SearchInputComponent,
    SelectComponent,
    Select2Component,
    FontAwesomeModule,
    MenuComponent,
    MenuItemComponent,
    TreeViewComponent,
    ListViewComponent,
  ],
})
export class SharedModule {}
