import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { FetchService } from '../fetch.service';
import { AuthCode, AuthDto, TokenDto } from 'src/dtos/AuthDto';
import { Token } from '@angular/compiler';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private fetchService : FetchService
    ) {}

    getHeader(authorization : string) {
      return {
        headers: {
          Authorization: 'Bearer ' + authorization,
        }
        }
    }

  async ngOnInit() {
    //const code = this.route.snapshot.queryParamMap.get('code');
    //console.log("token =" + code);
    let data: TokenDto;
    await axios.post<TokenDto>('http://localhost:3001/login')
    .then(function (response) {
      data = response.data;
      localStorage.setItem('42_token', data.access_token);
      console.log(data);
    })
    this.router.navigateByUrl('/users');
  }
}
