import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { FetchService } from '../fetch.service';
import { AuthDto } from 'src/dtos/AuthDto';

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

    getHeader(code : string) {
      return {
        headers: {
          'Authorization': 'Bearer ' + code,
        }
        }
    }

  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    let res;
    console.log("token =" + code);
    if (code)
    {
      localStorage.setItem('42_token', code);
      await axios.get<AuthDto>('https://api.intra.42.fr/oauth/token/info', this.getHeader(code))
      .then(function (response) {
        res = response.data;
        console.log(res);
      })
      .catch(function (error) { console.log(error); })
      .finally(function () {});
    }
    this.router.navigateByUrl('/users');
  }

}
