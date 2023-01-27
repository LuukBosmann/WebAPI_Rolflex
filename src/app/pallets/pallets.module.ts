import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PalletsPageRoutingModule } from './pallets-routing.module';

import { PalletsPage } from './pallets.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PalletsPageRoutingModule
  ],
  declarations: [PalletsPage]
})
export class PalletsPageModule {}
