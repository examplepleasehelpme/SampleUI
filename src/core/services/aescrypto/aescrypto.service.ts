import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AESCryptoService {
    dfPe = 'IWVybUBsYWN2aWV0LnZuIQ==';

    constructor() { }

    // The set method is use for encrypt the value.
    encrypt(value: string, password = null) {
        if (password == null) {
            password = this.decode(environment.dfPe || this.dfPe);
        }

        const key = CryptoJS.enc.Utf8.parse(password);
        const iv = CryptoJS.enc.Utf8.parse(password);
        const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
            {
                keySize: 128 / 8,
                iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        return encrypted.toString();
    }

    // The get method is use for decrypt the value.
    decrypt(value: string, password = null) {
        if (password == null) {
            password = this.decode(environment.dfPe || this.dfPe);
        }

        const key = CryptoJS.enc.Utf8.parse(password);
        const iv = CryptoJS.enc.Utf8.parse(password);
        const decrypted = CryptoJS.AES.decrypt(value, key, {
            keySize: 128 / 8,
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encode(text: string) {
        // PROCESS
        const encodedWord = CryptoJS.enc.Utf8.parse(text);
        const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
        return encoded;
    }

    decode(encoded: string) {
        const encodedWord = CryptoJS.enc.Base64.parse(encoded);
        return CryptoJS.enc.Utf8.stringify(encodedWord);
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
