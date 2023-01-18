import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActionSheetController, AlertController } from '@ionic/angular';

const API_URL = environment.API_URL;

@Component({
  selector    : 'app-home',
  templateUrl : 'home.page.html',
  styleUrls   : ['home.page.scss'],
})

export class HomePage {
  bestelnummer: any;
  bestelInfo  : any;

  bstlNummer  : any;
  bstlDatum   : any;
  lvrNaam     : any;
  lvrTel      : any;
  referentie  : any;
  omschrijving: any;
  bstlAantal  : 0;

  headers : any;

  constructor(public httpClient:HttpClient, private alertController: AlertController, private actionSheetCtrl: ActionSheetController) {}

  getBestelnummer( bestelnummer: string ) {
    // Empty this so it is clean for reusing
    document.getElementById("alleArtikels").innerHTML = "";

    // Authentication headers
    this.headers = {
      "Content-Type": "application/json",
    };
    this.headers["refresh-cache"]  = "1";
    this.headers["X-Auth-Token"]   = "Engineer|2|132254573446463639|YuEdXWXAxw1m87wnoDeukg==|SHA512:B40doiwaNItg9mlrc6gUZZ5/F5o4Wl9fXk8srdD4WHVvSUvg3YXhCh+7N/vy0xUnAu8tBVOdnbb1427s5w5TVg==";
    
    // Get the data from the API
    this.httpClient.get(`${API_URL}getorderdata/${bestelnummer}`, {
      headers: new HttpHeaders(this.headers),
      observe: "response",
    }).subscribe(async result => {
      try {
        // Show the button that was hidden before
        var y            = document.getElementById("buttonRegel");
        y.style.display  = "block";

        // Log the results
        console.log(result); 
        this.bestelInfo = result.body[0];
        console.log(this.bestelInfo);

        // Put the results in the variables that are used in the HTML
        this.bstlNummer = "Bestelnummer - "       + this.bestelInfo.Bestelnummer;
        this.bstlDatum  = "Besteldatum - "        + this.bestelInfo.Besteldatum;
        this.lvrNaam    = "Leveranciernaam - "    + this.bestelInfo.LeverancierNaam;
        this.lvrTel     = "Leveranciernummer - "  + this.bestelInfo.LeverancierTelefoon;
        this.referentie = "Referentie - "         + this.bestelInfo.Referentie;

      } catch (error) {
        // Log the error
        console.log(error);

        // Hide the button that was shown before
        var y           = document.getElementById("buttonRegel");
        y.style.display = "none";

        // Empty the fields of the order
        this.bstlNummer = "";
        this.bstlDatum  = "";
        this.lvrNaam    = "";
        this.lvrTel     = "";
        this.referentie = "";

        // Make an alert to show to the user, telling them what's wrong
        const alert = await this.alertController.create({
          header    : 'Foutmelding',
          subHeader : 'Ongeldig bestelnummer',
          message   : 'Vul een geldig bestelnummer in en probeer het opnieuw.',
          buttons   : ['OK'],
        });
        // Show the alert
        await alert.present();
      }
    });
  }

  getRegels( bestelnummer: string) {
    // Authentication headers
    var http        = this.httpClient;
    var headersATH  = this.headers;
    var bestelInfoPlc  = this.bestelInfo;
    var bstlAantalPlc  = this.bstlAantal;

    // Clear the HTML
    console.log(this.bestelInfo.Bestelregel.length);
    document.getElementById("alleArtikels").innerHTML = "";

    // Loop through all articles until all are shown
    for (let i = 0; i < this.bestelInfo.Bestelregel.length; i++) {
      // Log the results
      console.log(i + "] BrNummer "                   + this.bestelInfo.Bestelregel[i].BrNummer);
      console.log(i + "] Aantal "                     + this.bestelInfo.Bestelregel[i].Aantal);
      console.log(i + "] AantalReedsGeleverd "        + this.bestelInfo.Bestelregel[i].AantalReedsGeleverd);
      console.log(i + "] Artikel_Code "               + this.bestelInfo.Bestelregel[i].Artikel_Code);
      console.log(i + "] InkoopeenheidOmschrijving "  + this.bestelInfo.Bestelregel[i].InkoopeenheidOmschrijving);
      console.log(i + "] Omschrijving "               + this.bestelInfo.Bestelregel[i].Omschrijving);

      // Create new items for the HTML
      // These items will be added using .appendChild()
      // These lines will be looped through as many times as there are articles
      // First, I create a card for each new article
      var card = document.createElement("ion-card");
      card.id = "regels" + i;
      document.getElementById("alleArtikels").appendChild(card);

      // Then, I put the information in said card
      var regel = document.createElement("ion-item");
      var brNummer = this.bestelInfo.Bestelregel[i].BrNummer;
      regel.innerHTML = "<b>BrNummer - " + brNummer + "</b>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.innerHTML = "Aantal - " + this.bestelInfo.Bestelregel[i].Aantal + "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.lines = "none";
      regel.innerHTML = "Aantal reeds geleverd - " + this.bestelInfo.Bestelregel[i].AantalReedsGeleverd + "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      var artikelCode = this.bestelInfo.Bestelregel[i].Artikel_Code;
      regel.innerHTML = "Artikelcode - " + artikelCode + "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.innerHTML = "InkoopeenheidOmschrijving - " + this.bestelInfo.Bestelregel[i].InkoopeenheidOmschrijving + "<br/>";
      document.getElementById("regels" + i).appendChild(regel);

      var regel = document.createElement("ion-item");
      regel.innerHTML = "Omschrijving - " + this.bestelInfo.Bestelregel[i].Omschrijving;
      document.getElementById("regels" + i).appendChild(regel);

      // Create a button to add the amount of articles to the order
      var btnBinnen = document.createElement("ion-button");
      btnBinnen.innerHTML = "Aantal in deze bestelling";
      btnBinnen.id = "buttonArtikel" + i;
      btnBinnen.expand = "block";
      document.getElementById("regels" + i).appendChild(btnBinnen);
      btnBinnen.addEventListener("click", function() {
        btnBinnenOnClick(i, bestelInfoPlc, bstlAantalPlc)
      });

      // make a button to add the order to the database
      var bstlInfo = bestelInfoPlc;
      var btnBestel = document.createElement("ion-button");
      btnBestel.innerHTML = "Bevestig dit artikel";
      btnBestel.id = "buttonBestel" + i;
      btnBestel.expand = "block";

      document.getElementById("regels" + i).appendChild(btnBestel);
      btnBestel.addEventListener("click", function() {
        // ask the user if he is sure
        const alerting    = document.createElement('ion-alert');
        alerting.header   = 'Bevestiging'
        alerting.message  = 'Weet u zeker dat u dit artikel wilt bestellen?'

        // yes and no buttons
        alerting.buttons  =
        [
          {
            text: 'Nee',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          },
          {
            text: 'Ja',
            handler: () => {
              console.log('Confirm Okay');
              // send the request
              sendRequest(bstlInfo.Bestelnummer, bstlInfo.Bestelregel[i].Artikel_Code, bstlInfo.Bestelregel[i].BrNummer, bstlAantalPlc, i)
              // remove the buttons
              document.getElementById("buttonBestel" + i).remove();
              document.getElementById("buttonArtikel" + i).remove();
            }
          }
        ];
        document.body.appendChild(alerting);
        return alerting.present();
      });
    }

    // Make an eventListener for the button
    function btnBinnenOnClick(i: number, bestelInfoPlc: any, bstlAantal: any)
    {
      var placeholderAantalBinnen: any;
      console.log("btnBinnenOnClick");
      const alerting    = document.createElement('ion-alert');
      alerting.header   = 'Aantal in deze bestelling'
      alerting.message  = 'Vul de hoeveelheid in'
      // Here we can add the input fields
      alerting.inputs   = 
      [
        {
          name: 'aantal',
          type: 'number',
          placeholder: 'Vul hier het aantal in',
          min: 0
        }
      ];
      alerting.buttons = 
      [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => 
          {
            console.log('Confirm Cancel');
          }
        }, 
        {
          text: 'Ok',
          handler: (alertData) => 
          {
            // if there is already a regel with the amount of articles, remove it
            if (document.getElementById("aantal_regel" + i) != null)
            {
              document.getElementById("aantal_regel" + i).remove();
            }

            // Log the results
            console.log('Confirm Ok', alertData);
            var aantal_regel = document.createElement("ion-item");
            placeholderAantalBinnen = alertData.aantal;
            aantal_regel.id = "aantal_regel" + i;
            aantal_regel.innerHTML = "Aantal in deze bestelling - " + placeholderAantalBinnen + "<br/>";
            document.getElementById("regels" + i).appendChild(aantal_regel);
          }
        }
      ];
      document.body.appendChild(alerting);
      return alerting.present();
    }

    function sendRequest(bestelnummer, artikelCode, brNummer, aantal, i): Promise<string> {
      console.log("sendRequest");
      // retrieve auth token from headers or return null if login was not successful.
      return http.post(environment.API_URL + "partdelivery", {
        Bestelnummer          : bestelnummer,
        Artikel_Code          : artikelCode,
        BrNummer              : brNummer,
        AantalOntvangen       : aantal,
        OpmerkingBijOntvangst : "test"
      }, 
      {
        observe: "response",
        headers: new HttpHeaders(headersATH),
      }).toPromise().then((result: HttpResponse<any>) => 
      {
        // request was successful, check for status code 200 (OK)
        if (result.status === 200) 
        {
          console.log("request was successful");
          console.log(result);
          
          // return auth token from headers
            return result.headers.get("x-auth-token");
        }
        return null;
      }).catch((err: HttpErrorResponse) => 
      {
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