import document from "document";
import * as messaging from "messaging";
import { HeartRateSensor } from "heart-rate";

// Message is received from companion
messaging.peerSocket.onmessage = evt => {
  // is this a check or a post?
  console.log(`lat ${evt.data.latitude}, long ${evt.data.longitude}`);
  if (evt.data.isCheck) {
    console.log("checking database for event");
    postData('http://10.10.99.65:4000/api/events/check', {
      latitude: evt.data.latitude,
      longitude: evt.data.longitude,
      steps: evt.data.steps
    }).then((data) => {
      console.log(data.queryUser);
      // send message to divice to query user
      var myData = {
        steps: evt.data.steps,
        latitude: evt.data.latitude,
        longitude: evt.data.longitude,
        queryUser: data.queryUser
      }
      console.log("printing data being sent to device");
      console.log(myData);
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(myData);
      }
    });
    
  }
  else {
    console.log("posting to database")
    postData('http://10.10.99.65:4000/api/events', {
      latitude: evt.data.latitude,
      longitude: evt.data.longitude,
      steps: evt.data.steps,
      panicAttack: evt.data.isHavingAttack
    }).then((data) => {
      console.log(data);
    });
  }
};

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}
