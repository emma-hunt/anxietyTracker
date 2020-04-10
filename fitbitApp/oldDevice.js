let document = require("document");
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import {minuteHistory} from "user-activity";
import { vibration } from "haptics";
import { geolocation } from "geolocation";
import * as messaging from "messaging";
import document from "document";

// Fetch UI elements we will need to change
let myPopup = document.getElementById("my-popup");

let above120 = false;

// Create a new instance of the HeartRateSensor object
var hrm = new HeartRateSensor();

// Declare an event handler that will be called every time a new HR value is received.
hrm.onreading = function() {
  // Peek the current sensor values
  if(hrm.heartRate >= 120) {
    if(above120 == false) {
      console.log("high hr");
      above120 = true;
      
      // need to ask if this is a panic attack
      // Show the popup
      myPopup.style.display = "inline";
      vibration.start("bump");
      
      //gather needed data
      // query the previous 5 minutes step data
       const minuteRecords = minuteHistory.query({ limit: 5 });
       let recentSteps = 0;
       minuteRecords.forEach((minute, index) => {
         recentSteps += (minute.steps || 0);
       })
      console.log("steps: " + recentSteps);
      
      // query location
      var latitude;
      var longitude;
      geolocation.getCurrentPosition(function(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      })
      
        console.log("lat: " + latitude);
    
      let btnLeft = myPopup.getElementById("btnLeft");
      let btnRight = myPopup.getElementById("btnRight");
      
      btnLeft.onclick = function(evt) {
        vibration.stop();
        console.log("Yes panic");
        console.log("lat: " + latitude);
        var myData = {
          currentHR: hrm.heartRate,
          isHavingAttack: true,
          steps: recentSteps,
          latitude: latitude,
          longitude: longitude,
        }
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          messaging.peerSocket.send(myData);
        }
        myPopup.style.display = "none";
      }

      btnRight.onclick = function(evt) {
        vibration.stop();
        console.log("No panic");
        console.log("lat: " + latitude);        
        var myData = {
          currentHR: hrm.heartRate,
          isHavingAttack: false,
          steps: recentSteps,
          latitude: latitude,
          longitude: longitude,
        }
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          messaging.peerSocket.send(myData);
        }
        myPopup.style.display = "none";
      }
      
    }
    
  }
  else if (hrm.heartRate < 120 && above120 == true) {
    above120 = false;
    console.log("back in safe range");
  }
}

// Begin monitoring the sensor
hrm.start();
