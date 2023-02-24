import { Component, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";
import { environment } from "../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from "@angular/common/http";
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { Camera, CameraOptions } from "@ionic-native/Camera/ngx";
import { appendFile } from "fs";

const API_URL = environment.API_URL;

@Component({
  selector: "app-pallets",
  templateUrl: "./pallets.page.html",
  styleUrls: ["./pallets.page.scss"],
})
export class PalletsPage implements OnInit {
  scannedData: any;
  encodedData: "";
  encodeData: any;
  inputData: any;

  headers: any;

  bestelnummer: any;
  artikelCode: any;
  palletNr: any;
  brNummer: any;

  stelling: any;
  vak: any;
  positie: any;
  schap: any;
  // stellingen: any;
  // vakken: any;
  // posities: any;
  // schappen: any;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    public httpClient: HttpClient,
    private platform: Platform
  ) {}

  ngOnInit() {}

  scanBarcode() {
    const options: BarcodeScannerOptions = {
      preferFrontCamera: false,
      torchOn: false,
      prompt: "",
      resultDisplayDuration: 500,
      formats: "EAN_13,EAN_8,QR_CODE,PDF_417 ",
      orientation: "portrait",
    };

    this.barcodeScanner
      .scan(options)
      .then((barcodeData) => {
        console.log("QR code data", barcodeData);
        this.scannedData = barcodeData;

        var text = this.scannedData.text;

        var positie1 = getPosition(text, "|", 1);
        var positie2 = getPosition(text, "|", 2);
        var positie3 = getPosition(text, "|", 3);
        var positie4 = getPosition(text, "|", 4);

        var bestelnummer = text.substring(0, positie1);
        this.bestelnummer = bestelnummer;

        var artikelCode = text.substring(positie1 + 1, positie2);
        this.artikelCode = artikelCode;

        var brNummer = text.substring(positie2 + 1, positie3);
        this.brNummer = brNummer;

        var palletNr = text.substring(positie3 + 1, positie4);
        this.palletNr = palletNr;

        // show the divs
        document.getElementById("pasteCard").style.display = "block";
        document.getElementById("sendDataCard").style.display = "block";
        document.getElementById("dataRecievedCard").style.display = "none";

        //printData(this.scannedData, this.bestelnummer, this.artikelCode, this.palletNr);

        this.makeInput();
      })
      .catch((err) => {
        console.log("Error", err);
      });
  }

  createBarcode() {
    this.barcodeScanner
      .encode(this.barcodeScanner.Encode.TEXT_TYPE, this.inputData)
      .then(
        (encodedData) => {
          console.log(encodedData);
          this.encodedData = encodedData;
        },
        (err) => {
          console.log("Error occured : " + err);
        }
      );
  }

  stellingen = ["SP", "AA", "AB", "BA", "BB", "BC", "LM"];

  vakken = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  posities = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  schappen = ["1", "2", "3", "4", "5"];

  makeInput() {
    // show the magazijnLocatie id
    document.getElementById("magazijnLocatie").style.display = "block";

    this.headers = {
      "Content-Type": "application/json",
    };
    this.headers["refresh-cache"] = "1";
    this.headers["X-Auth-Token"] =
      "Engineer|2|132254573446463639|YuEdXWXAxw1m87wnoDeukg==|SHA512:B40doiwaNItg9mlrc6gUZZ5/F5o4Wl9fXk8srdD4WHVvSUvg3YXhCh+7N/vy0xUnAu8tBVOdnbb1427s5w5TVg==";
  }

  sendData() {
    // Authentication headers
    var http = this.httpClient;
    var headersATH = this.headers;

    //complete log
    console.log("Bestelnummer: " + this.bestelnummer);
    console.log("Artikel_Code: " + this.artikelCode);
    console.log("BrNummer: " + this.brNummer);
    console.log("PalletNr: " + this.palletNr);
    console.log("LocatieCodeA: " + this.stelling);
    console.log("LocatieCodeB: " + this.vak);
    console.log("LocatieCodeC: " + this.positie);
    console.log("LocatieCodeD: " + this.schap);
    console.log("ModifiedBy: Tablet");

    // retrieve auth token from headers or return null if login was not successful.
    return http
      .post(
        environment.API_URL + "setWarehouseLocation",
        {
          Bestelnummer: this.bestelnummer,
          Artikel_Code: this.artikelCode,
          BrNummer: this.brNummer,
          PalletNr: this.palletNr,
          LocatieCodeA: this.stelling,
          LocatieCodeB: this.vak,
          LocatieCodeC: this.positie,
          LocatieCodeD: this.schap,
          ModifiedBy: "Tablet",
        },
        {
          observe: "response",
          headers: new HttpHeaders(headersATH),
        }
      )
      .toPromise()
      .then((result: HttpResponse<any>) => {
        // request was successful, check for status code 200 (OK)
        if (result.status === 200) {
          console.log("request was successful");
          console.log(result);

          var confirm = document.getElementById("sendDataCard");
          confirm.style.display = "none";

          var confirm = document.getElementById("dataRecievedCard");
          confirm.style.display = "block";

          var p = document.getElementsByTagName("ion-input");
          for (var i = 2; i < p.length; i++) {
            p.item(i).readonly = true;
          }

          // return auth token from headers
          return result.headers.get("x-auth-token");
        }
        return null;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        // If error status code is not 401 (unauthorized) console log error.
        if (err.status !== 401) {
          console.error("Error whilst trying to login: ", err);
        }
        return null;
      });
  }
}
function getPosition(string, subString, index) {
  var newstring = string.split(subString, index).join(subString).length;
  console.log(newstring);

  return newstring;
}
