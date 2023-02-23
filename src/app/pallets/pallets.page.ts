import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { appendFile } from 'fs';

@Component({
  selector: 'app-pallets',
  templateUrl: './pallets.page.html',
  styleUrls: ['./pallets.page.scss'],
})
export class PalletsPage implements OnInit {
  scannedData: any;
  encodedData: '';
  encodeData: any;
  inputData: any;

  bestelnummer: any;
  artikelCode: any;
  palletNr: any;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    private platform: Platform,) {
  }

  ngOnInit() {
  }

  scanBarcode() {
    const options: BarcodeScannerOptions = {
      preferFrontCamera: false,
      torchOn: false,
      prompt: '',
      resultDisplayDuration: 500,
      formats: 'EAN_13,EAN_8,QR_CODE,PDF_417 ',
      orientation: 'portrait',
    };

    this.barcodeScanner.scan(options).then(barcodeData => {
      console.log('QR code data', barcodeData);
      this.scannedData = barcodeData;

      var text = this.scannedData.text;
      var bestelnummer = text.substring(0, text.indexOf('|'));
      this.bestelnummer = bestelnummer;

      // parse text to get the text between the first and second |
      var artikelCode = text.substring(text.indexOf('|') + 1, text.lastIndexOf('|'));
      this.artikelCode = artikelCode;

      // parse text to get the text before the last | and after the second to last |
      var palletNr = text.substring(text.lastIndexOf('|') + 1, text.lastIndexOf('|') + 2);
      this.palletNr = palletNr;

      // show the div pastecard
      document.getElementById('pasteCard').style.display = 'block';

      //printData(this.scannedData, this.bestelnummer, this.artikelCode, this.palletNr);

    }).catch(err => {
      console.log('Error', err);
    });
  }

  createBarcode() {
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.inputData).then((encodedData) => {
      console.log(encodedData);
      this.encodedData = encodedData;
    }, (err) => {
      console.log('Error occured : ' + err);
    });
  }
}
// function printData(scannedData: any, bestelnummer: any, artikelCode: any, palletNr: any) {

//   var text = scannedData.text;
//   // parse text to get the text before the first |
//   var textBefore = text.substring(0, text.indexOf('|'));
//   bestelnummer = textBefore;
//   // // append it in the table
//   // table.appendChild(th);

//   // create a table row element
//   const trAC = document.createElement('tr');
//   trAC.id = 'pasteTr';
//   // // append it in the table
//   // table.appendChild(trAC);

//   const tdAC1 = document.createElement('td');
//   tdAC1.id = 'pasteTd';
//   const tdAC2 = document.createElement('td');
//   tdAC2.id = 'pasteTd';

//   var text = scannedData.text;
//   // parse text to get the text between the first and second |
//   var textBetween = text.substring(text.indexOf('|') + 1, text.lastIndexOf('|'));

//   tdAC1.innerHTML = 'Artikel-code: ';
//   tdAC2.innerHTML = textBetween;
//   // // append it in the table
//   // trAC.appendChild(tdAC1);
//   // trAC.appendChild(tdAC2);

//   // create a table row element
//   const trPN = document.createElement('tr');
//   trPN.id = 'pasteTr';
//   // // append it in the table
//   // table.appendChild(trPN);

//   // create a table data element
//   const tdPN1 = document.createElement('td');
//   tdPN1.id = 'pasteTd';
//   const tdPN2 = document.createElement('td');
//   tdPN2.id = 'pasteTd';
//   var text = scannedData.text;
//   // parse text to get the text before the last | and after the second to last |
//   var textAfter = text.substring(text.lastIndexOf('|') + 1, text.lastIndexOf('|') + 2);
//   tdPN1.innerHTML = 'Pallet nr: ';
//   tdPN2.innerHTML = textAfter;
//   // // append it in the table
//   // trPN.appendChild(tdPN1);
//   // trPN.appendChild(tdPN2);

//   //append it in paste div
//   document.getElementById('pasteDiv').appendChild(table);
//   document.getElementById('pasteDiv').appendChild(card);
// }

