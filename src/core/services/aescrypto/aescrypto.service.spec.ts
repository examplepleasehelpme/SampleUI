import { TestBed } from '@angular/core/testing';

import { AESCryptoService } from './aescrypto.service';

describe('AESCryptoService', () => {
  let service: AESCryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AESCryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
