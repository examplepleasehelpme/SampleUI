import { Component, OnInit } from '@angular/core';
import { ApiHttpService } from 'src/core/services/apihttp/apihttp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Sample-UI';

  constructor(private api: ApiHttpService) { }

  ngOnInit(): void {
    this.testApi();
  }

  testApi() {
    this.api.execSv<any>("Sample", "Sample", "SampleBusiness", "GetAsync", '0001').subscribe(res => {
      console.log(res);
    })
  }
}
