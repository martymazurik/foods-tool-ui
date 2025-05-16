import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//const routes: Routes = [{ path: 'CreateAccount', loadChildren: () => import('./create-account/create-account.module').then(m => m.CreateAccountModule) }];
//const routes: Routes = [{ path: 'Login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) }];

@NgModule({
  //imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
