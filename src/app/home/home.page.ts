import { Component } from "@angular/core";
import { environment } from "../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from "@angular/common/http";
import { ActionSheetController, AlertController } from "@ionic/angular";
import { PhotoService } from "../services/photo.service";
import { Camera, CameraOptions } from "@ionic-native/Camera/ngx";

const API_URL = environment.API_URL;

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  bestelnummer: any;
  bestelInfo: any;

  bstlNummer: any;
  bstlDatum: any;
  lvrNaam: any;
  lvrTel: any;
  referentie: any;
  omschrijving: any;

  headers: any;

  constructor(
    private camera: Camera,
    private alertController: AlertController,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService,
    public httpClient: HttpClient
  ) {}

  // Make an empty variable to store the base64 string
  croppedImagepath = "";
  picCount = 0;

  // This will be called when the user wants to take a picture
  pickImage(sourceType) {
    var headersATH = this.headers;
    var http = this.httpClient;

    // Define the options for the Camera
    const options: CameraOptions = {
      quality: 50,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
    };
    this.camera.getPicture(options).then(
      (imageData) => {
        // imageData is a base64 encoded string
        this.croppedImagepath = imageData;

        // Log it to see the base64 string
        console.log(this.croppedImagepath);

        this.picCount = this.picCount + 1;

        // Call the function to upload the image
        uploadImage(this.bestelnummer, this.croppedImagepath, this.picCount);
      },
      (err) => {
        // Handle error
        console.log("Camera issue:" + err);
      }
    );

    // Function to upload the image
    function uploadImage(bestelnummer, pakbon, picCount): Promise<string> {
      console.log("sendRequest");
      // retrieve auth token from headers or return null if login was not successful.
      return http
        .post(
          environment.API_URL + "DeliveryNoteImage",
          {
            Bestelnummer: bestelnummer,
            pakbonImage: pakbon,
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

            var x = document.getElementById("cameraLog");
            x.style.color = "green";
            x.style.marginLeft = "55px";

            if (picCount == 1) {
              x.innerHTML = "Er is " + picCount + " foto geupload!";
            } else {
              x.innerHTML = "Er zijn " + picCount + " foto's geupload!";
            }

            x.style.color = "green";

            // return auth token from headers
            return result.headers.get("x-auth-token");
          }
          return null;
        })
        .catch((err: HttpErrorResponse) => {
          var x = document.getElementById("cameraLog");
          x.innerHTML = "Er is iets fout gegaan!";
          x.style.color = "red";

          console.log(err);
          // If error status code is not 401 (unauthorized) console log error.
          if (err.status !== 401) {
            console.error("Error whilst trying to login: ", err);
          }
          return null;
        });
    }
  }

  // This will be called when the user clicks the icon
  // It will show the action sheet
  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      cssClass: "my-custom-alert",
      buttons: [
        {
          text: "Use Camera",
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.CAMERA);
          },
        },
        {
          text: "Cancel",
          handler: () => {
            console.log("Cancel clicked");
            // put a message in the cameraLog
            var x = document.getElementById("cameraLog");
            x.innerHTML = "Er is geen foto geupload!";
            x.style.color = "red";
            x.style.marginLeft = "55px";
          },
        },
      ],
    });
    await actionSheet.present();
  }

  // Get information about the order
  getBestelnummer(bestelnummer: string) {
    this.picCount = 0;

    // check if cameralog exists, if so, empty it
    if (document.getElementById("cameraLog") != null) {
      document.getElementById("cameraLog").innerHTML = "";
    }

    // if cameraBtn is visible, hide it
    if (document.getElementById("cameraBtn") != null) {
      document.getElementById("cameraBtn").style.display = "none";
    }

    // Empty this so it is clean for reusing
    document.getElementById("alleArtikels").innerHTML = "";

    // If bestelnummer has no "-" in it, add one at the right place
    if (bestelnummer.indexOf("-") == -1) {
      bestelnummer =
        bestelnummer.substring(0, 4) + "-" + bestelnummer.substring(4);

      //rewrite the bestelnummer with the added "-"
      this.bestelnummer = bestelnummer;
    }

    // Authentication headers
    this.headers = {
      "Content-Type": "application/json",
    };
    this.headers["refresh-cache"] = "1";
    this.headers["X-Auth-Token"] =
      "Engineer|2|132254573446463639|YuEdXWXAxw1m87wnoDeukg==|SHA512:B40doiwaNItg9mlrc6gUZZ5/F5o4Wl9fXk8srdD4WHVvSUvg3YXhCh+7N/vy0xUnAu8tBVOdnbb1427s5w5TVg==";

    // Get the data from the API
    this.httpClient
      .get(`${API_URL}getorderdata/${bestelnummer}`, {
        headers: new HttpHeaders(this.headers),
        observe: "response",
      })
      .subscribe(async (result) => {
        try {
          // Show the button that was hidden before
          var y = document.getElementById("buttonRegel");
          y.style.display = "block";

          // Log the results
          console.log(result);
          this.bestelInfo = result.body[0];
          console.log(this.bestelInfo);

          // Show the card
          var x = document.getElementById("orderInformatie");
          x.style.display = "block";

          // Show the table
          var x = document.getElementById("bestellingTable");
          x.style.display = "block";

          // Put the results in the variables that are used in the HTML
          this.bstlNummer = this.bestelInfo.Bestelnummer;
          this.bstlDatum = this.bestelInfo.Besteldatum;
          this.lvrNaam = this.bestelInfo.LeverancierNaam;
          this.lvrTel = this.bestelInfo.LeverancierTelefoon;
          this.referentie = this.bestelInfo.Referentie;

          // display block on id cameraBtn
          document.getElementById("cameraBtn").style.display = "block";
          document.getElementById("cameraLog").style.display = "block";
        } catch (error) {
          // Log the error
          console.log(error);

          // Hide the button that was shown before
          var y = document.getElementById("buttonRegel");
          y.style.display = "none";

          // Empty the fields of the order
          var x = document.getElementById("orderInformatie");
          x.style.display = "none";

          // Make an alert to show to the user, telling them what's wrong
          const alert = await this.alertController.create({
            header: "Foutmelding",
            subHeader: "Ongeldig bestelnummer",
            message: "Vul een geldig bestelnummer in en probeer het opnieuw.",
            buttons: ["OK"],
            cssClass: "my-custom-alert",
          });
          // Show the alert
          await alert.present();
        }
      });
  }

  getRegels(bestelnummer: string) {
    // Make the button invisible
    var x = document.getElementById("buttonRegel");
    x.style.display = "none";

    // Authentication headers
    var http = this.httpClient;
    var headersATH = this.headers;
    var bestelInfoPlc = this.bestelInfo;
    var bstlAantalPlc = [];
    var bstlPalletsPlc = [];

    // Clear the HTML
    console.log(this.bestelInfo.Bestelregel.length);
    document.getElementById("alleArtikels").innerHTML = "";

    // Log the results
    console.log(this.bestelInfo.Bestelregel);

    // Loop through all articles until all are shown
    for (let i = 0; i < this.bestelInfo.Bestelregel.length; i++) {
      // Create new items for the HTML
      // These items will be added using .appendChild()
      // These lines will be looped through as many times as there are articles
      // First, I create a card for each new article
      var card = document.createElement("ion-card");
      card.id = "regels" + i;
      document.getElementById("alleArtikels").appendChild(card);

      // Then, I put the information in said card
      var regel = document.createElement("ion-item");
      regel.style.fontSize = "x-large";
      var artikelCode = this.bestelInfo.Bestelregel[i].Artikel_Code;
      regel.innerHTML = "<b>Artikelcode " + artikelCode + "</b>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.style.fontSize = "x-large";
      regel.innerHTML =
        "Aantal besteld: " + this.bestelInfo.Bestelregel[i].Aantal + "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.style.fontSize = "x-large";
      regel.innerHTML =
        "Reeds geleverd: " +
        this.bestelInfo.Bestelregel[i].AantalReedsGeleverd +
        "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.style.fontSize = "x-large";
      regel.innerHTML =
        "Eenheid: " +
        this.bestelInfo.Bestelregel[i].InkoopeenheidOmschrijving +
        "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.style.fontSize = "x-large";
      regel.innerHTML =
        "Omschrijving: " + this.bestelInfo.Bestelregel[i].Omschrijving;
      document.getElementById("regels" + i).appendChild(regel);

      //

      // store the value of the input when the user starts typing
      // inputAantal.addEventListener("keyup", function() {

      // });

      // store the value of the input when the user starts typing
      // inputPallets.addEventListener("keyup", function() {
      //   aantalPalletsBinnen = (<HTMLInputElement>document.getElementById("inputPallets" + i)).value;
      //   console.log(aantalPalletsBinnen);
      // });

      // Create a button to add the amount of articles to the order
      var btnBinnen = document.createElement("ion-button");
      btnBinnen.style.margin = "10px";
      btnBinnen.style.height = "50px";
      btnBinnen.style.fontSize = "x-large";
      btnBinnen.innerHTML = "Artikel inboeken";
      btnBinnen.id = "buttonArtikel" + i;
      btnBinnen.expand = "block";
      document.getElementById("regels" + i).appendChild(btnBinnen);
      btnBinnen.addEventListener("click", function () {
        btnBinnenOnClick(i, bestelInfoPlc, bstlAantalPlc[i], bstlPalletsPlc[i]);
      });

      if (i == this.bestelInfo.Bestelregel.length - 1) {
        // make a button to add the order to the database
        var bstlInfo = bestelInfoPlc;

        var btnBestel = document.createElement("ion-button");
        btnBestel.style.margin = "10px";
        btnBestel.style.height = "50px";
        btnBestel.style.fontSize = "x-large";
        btnBestel.innerHTML = "Bevestig alle artikelen";
        btnBestel.id = "buttonBestel" + i;
        btnBestel.expand = "block";

        var checkLength = this.bestelInfo.Bestelregel.length;

        document.getElementById("alleArtikels").appendChild(btnBestel);
        btnBestel.addEventListener("click", function () {
          // check if the user has entered a valid amount
          if (
            bstlAantalPlc.includes(undefined) ||
            bstlPalletsPlc.includes(undefined) ||
            bstlAantalPlc.includes("") ||
            bstlPalletsPlc.includes("") ||
            bstlAantalPlc.length == 0 ||
            bstlPalletsPlc.length == 0 ||
            bstlAantalPlc.length != bstlPalletsPlc.length ||
            bstlPalletsPlc.length != bstlAantalPlc.length ||
            bstlAantalPlc.length != checkLength ||
            bstlPalletsPlc.length != checkLength ||
            bstlAantalPlc.length != bstlPalletsPlc.length ||
            bstlPalletsPlc.length != bstlAantalPlc.length
          ) {
            // if not, show an alert
            const alert = document.createElement("ion-alert");
            alert.cssClass = "my-custom-alert";
            alert.header = "Fout";
            alert.message =
              "U heeft geen geldig aantal ingevoerd. Check uw invoer en probeer het opnieuw.";
            alert.buttons = ["OK"];

            document.body.appendChild(alert);
            return alert.present();
          }

          // ask the user if he is sure
          const alerting = document.createElement("ion-alert");
          alerting.header = "Bevestiging";
          alerting.message = "Weet u zeker dat u de artikelen wilt bevestigen?";
          alerting.cssClass = "my-custom-alert";

          // yes and no buttons
          alerting.buttons = [
            {
              text: "Nee",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah) => {
                console.log("Confirm Cancel: blah");
              },
            },
            {
              text: "Ja",
              handler: () => {
                console.log("Confirm Okay");
                var aantalArtikelBinnen = bstlAantalPlc[i];
                var aantalPalletsBinnen = bstlPalletsPlc[i];
                // send the request
                sendRequest(
                  bstlInfo.Bestelnummer,
                  bstlInfo,
                  bstlAantalPlc,
                  bstlPalletsPlc
                );
                // remove the buttons
                //document.getElementById("buttonBestel" + i).remove();
                //document.getElementById("buttonArtikel" + i).remove();
                // log everything that would be sent to the database
                // console.log("Bestelnummer: " + bstlInfo.Bestelnummer);
                // console.log("Artikelcode: " + bstlInfo.Bestelregel[i].Artikel_Code);
                // console.log("BrNummer: " + bstlInfo.Bestelregel[i].BrNummer);
                // console.log("Aantal: " + aantalArtikelBinnen);
                // console.log("Pallets: " + aantalPalletsBinnen);
                // console.log("i: " + i);
                // console.log("bstlAantalPlc: " + bstlAantalPlc);
                // console.log("bstlPalletsPlc: " + bstlPalletsPlc);
              },
            },
          ];
          document.body.appendChild(alerting);
          return alerting.present();
        });
      }
    }

    // Make an eventListener for the button
    function btnBinnenOnClick(
      i: number,
      bestelInfoPlc: any,
      bstlAantal: number,
      bstlPallet: number
    ) {
      console.log("btnBinnenOnClick");

      const alerting = document.createElement("ion-alert");
      alerting.header = "Artikel inboeken";
      alerting.message = "Vul de velden in";
      alerting.cssClass = "my-custom-alert";
      // Here we can add the input fields
      alerting.inputs = [
        {
          name: "aantalArtikelen",
          type: "number",
          placeholder: "Hoeveel artikelen?",
          min: 0,
        },
        {
          name: "aantalPallets",
          type: "number",
          placeholder: "Op hoeveel pallets?",
          min: 0,
        },
      ];
      alerting.buttons = [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "Ok",
          handler: (alertData) => {
            // if there is already a regel with the amount of articles, remove it
            if (document.getElementById("aantalInput" + i) != null) {
              document.getElementById("aantalInput" + i).remove();
            }

            // if there is already a regel with the amount of pallets, remove it
            if (document.getElementById("palletInput" + i) != null) {
              document.getElementById("palletInput" + i).remove();
            }

            // Log the results
            console.log("Confirm Ok", alertData);
            // Create a text input to add the amount of articles to the order
            var regel = document.createElement("ion-item");
            regel.id = "aantalInput" + i;
            regel.style.fontSize = "x-large";
            regel.innerHTML = "Aantal ingeboekt: ";
            document.getElementById("regels" + i).appendChild(regel);

            // Create a text input to add the amount of articles to the order
            var inputAantal = document.createElement("ion-input");
            inputAantal.style.margin = "10px";
            inputAantal.style.height = "50px";
            inputAantal.style.fontSize = "x-large";
            inputAantal.id = "inputAantal" + i;
            inputAantal.type = "number";
            inputAantal.value = alertData.aantalArtikelen;
            inputAantal.disabled = true;
            inputAantal.readonly = true;
            document.getElementById("aantalInput" + i).appendChild(inputAantal);

            var regel = document.createElement("ion-item");
            regel.id = "palletInput" + i;
            regel.style.fontSize = "x-large";
            regel.innerHTML = "Aantal pallets: ";
            document.getElementById("regels" + i).appendChild(regel);

            // Create a text input to add the amount of pallets to the order
            var inputPallets = document.createElement("ion-input");
            inputPallets.style.margin = "10px";
            inputPallets.style.height = "50px";
            inputPallets.style.fontSize = "x-large";
            inputPallets.id = "inputPallets" + i;
            inputPallets.type = "number";
            inputPallets.value = alertData.aantalPallets;
            inputPallets.disabled = true;
            inputPallets.readonly = true;
            document
              .getElementById("palletInput" + i)
              .appendChild(inputPallets);

            var aantalArtikelBinnen = (<HTMLInputElement>(
              document.getElementById("inputAantal" + i)
            )).value;
            bstlAantalPlc[i] = aantalArtikelBinnen;

            var aantalPalletsBinnen = (<HTMLInputElement>(
              document.getElementById("inputPallets" + i)
            )).value;
            bstlPalletsPlc[i] = aantalPalletsBinnen;
          },
        },
      ];
      document.body.appendChild(alerting);
      return alerting.present();
    }

    function sendRequest(
      bestelnummer: string,
      bestelInfo: any,
      bstlAantalPlc: any,
      bstlPalletsPlc: any
    ) {
      //: Promise<string>
      console.log(bstlInfo);
      // create a log that shows all data of all articles

      for (var i = 0; i < bestelInfo.Bestelregel.length; i++) {
        console.log("----------------------------------------------------");

        console.log("Bestelnummer: " + bestelnummer);
        console.log("Artikel_Code: " + bestelInfo.Bestelregel[i].Artikel_Code);
        console.log("BrNummer: " + bestelInfo.Bestelregel[i].BrNummer);
        console.log("Besteld: " + bestelInfo.Bestelregel[i].Aantal);
        console.log(
          "ReedsOntvangen: " + bestelInfo.Bestelregel[i].AantalReedsGeleverd
        );
        console.log("AantalOntvangen: " + bstlAantalPlc[i]);
        console.log("AantalPallets: " + bstlPalletsPlc[i]);
        console.log("OpmerkingBijOntvangst: " + "geen opmerking");

        console.log("----------------------------------------------------");
      }

      // create a copy of bestelInfo.Bestelregel
      var bestelregelUpdated = bestelInfo.Bestelregel;

      // update the bestelregel with the new values
      for (var i = 0; i < bestelInfo.Bestelregel.length; i++) {
        bestelregelUpdated[i].AantalOntvangen = bstlAantalPlc[i];
        bestelregelUpdated[i].AantalPallets = bstlPalletsPlc[i];
        bestelregelUpdated[i].OpmerkingBijOntvangst = "";
        bestelregelUpdated[i].Besteld = bestelInfo.Bestelregel[i].Aantal;
        bestelregelUpdated[i].ReedsOntvangen =
          bestelInfo.Bestelregel[i].AantalReedsGeleverd;

        delete bestelregelUpdated[i].Aantal;
        delete bestelregelUpdated[i].AantalReedsGeleverd;
      }

      console.log(bestelregelUpdated);

      // retrieve auth token from headers or return null if login was not successful.
      return http
        .post(
          environment.API_URL + "partdelivery",
          {
            Bestelnummer: bestelnummer,
            Bestelregel: bestelInfo.Bestelregel,
            // Artikel_Code          : artikelCode,
            // BrNummer              : brNummer,
            // AantalOntvangen       : aantal,
            // OpmerkingBijOntvangst : ""
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
}
