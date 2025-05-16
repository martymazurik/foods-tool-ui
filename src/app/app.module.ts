import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app.component';
import { AuthModule } from '@auth0/auth0-angular'
import { LoginComponent } from './login/login.component';
import { FoodsComponent } from './foods/foods.component';
import { FoodsApiService } from './services/foods-api.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FoodsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatButtonModule,
    MatListModule,
    AuthModule.forRoot({
      domain: 'dev-d71v6o5mhyfosv50.us.auth0.com',
      clientId: 'EyUz3CunpJtd4ZRsn0XyUdR07UVi6R1D'
    })
  ],
  providers: [FoodsApiService],
  bootstrap: [AppComponent],
  exports: [LoginComponent]
})
export class AppModule { }
