import { Injectable } from '@angular/core';
import { NgxLoadingConfig, ngxLoadingAnimationTypes } from 'ngx-loading';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {  
  loading: boolean = false;
  config: NgxLoadingConfig = {
    animationType: ngxLoadingAnimationTypes.chasingDots
  }
}
