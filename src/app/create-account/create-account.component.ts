import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {

  public loginName: string;


  constructor() { 
    this.loginName = "mtmazurik";
  }

  ngOnInit(): void {
  }

}
