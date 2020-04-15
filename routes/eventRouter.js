const express = require('express');
const fetch = require('node-fetch');

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

function routes(Event) {
  const eventRouter = express.Router();

  // get all events recorded
  eventRouter.route('/events').get((req, res) => {
    Event.find((err, events) => {
      if (err) {
        return res.send(err);
      }
      return res.json(events);
    });
  });

  // post a new event
  eventRouter.route('/events').post((req, res) => {
    // look for exisiting post that is similar
    Event.find((err, events) => {
      if (err) {
        return res.send(err);
      }
      // no problems
      var foundOne = false;
      events.forEach(obj => {
        var record = JSON.parse(JSON.stringify(obj));
        var stepDif = Math.abs(record.steps - req.body.steps);
        var latDif = Math.abs(record.latitude - req.body.latitude);
        var longDif = Math.abs(record.longitude - req.body.longitude);

        if (!foundOne && latDif <= 0.00023 && longDif <= 0.00023 && stepDif <= 100) {
          console.log("found one");
          console.log(record._id);
          Event.findById(record._id, (err, event) => {
            if (err) {
              console.log("Could not re find correct event");
              return res.send(err);
            }
            console.log(event);
            if (req.body.panicAttack) {
              // increase panic probability
              console.log("more panic");
              event.panicProbability = Math.min(event.panicProbability + 0.05, 1.0);
              postData('https://rest.nexmo.com/sms/json', {
                api_key: "fd3b1fdc",
                api_secret: "DWjgqTMSTngfu5IX",
                to: 14252212177,
                from: 17722612575,
                text: "User is having a panic attack and may need assistance"
              }).then((data) => {
                console.log(data);
              });
            }
            else {
              console.log("less panic");
              // decrease panic probability
              event.panicProbability = Math.max(event.panicProbability - 0.05, -1.0);
            }
            console.log(event);
            event.save((err) => {
              if (err) {
                console.log("error in saving change");
                return res.send(err);
              }
              return res.json(event);
            });
          });
          foundOne = true;
        }
      });
      if (!foundOne) {
        // workable event was not found, must create one
        console.log("creating new");
        const event = new Event(req.body);
        if (req.body.panicAttack) {
          // increase panic probability
          event.panicProbability = 0.05;
          postData('https://rest.nexmo.com/sms/json', {
            api_key: "fd3b1fdc",
            api_secret: "DWjgqTMSTngfu5IX",
            to: 14252212177,
            from: 17722612575,
            text: "User is having a panic or anxiety attack and may need assistance"
          }).then((data) => {
            console.log(data);
          });
        }
        else {
          // decrease panic probability
          event.panicProbability = -0.05;
        }
        event.save();
        console.log(event);
        return res.status(201).json(event);
      }
    });
  });

  // check to see if event exists and it's probability
  eventRouter.route('/events/check').post((req, res) => {
    console.log("checking for event");
    // checks to see if the event exists. returns if panic probability is high enough to ask the user
    Event.find((err, events) => {
      if (err) {
        return res.send(err);
      }
      // no problems
      var foundOne = false;
      events.forEach(obj => {
        var record = JSON.parse(JSON.stringify(obj));
        var stepDif = Math.abs(record.steps - req.body.steps);
        var latDif = Math.abs(record.latitude - req.body.latitude);
        var longDif = Math.abs(record.longitude - req.body.longitude);

        if (!foundOne && latDif <= 0.00023 && longDif <= 0.00023 && stepDif <= 100) {
          console.log("found one");
          console.log(record.panicProbability);
          foundOne = true;
          var eventId = record._id;
          var askUser = true;
          if(record.panicProbability < -0.9) {
            // don't need to check
            askUser = false;
          }
          console.log(askUser);
          return res.status(200).json({ queryUser: askUser});
        }
      });
      if (!foundOne) {
        // workable event was not found, must check
        return res.status(200).json({ queryUser: true});
      }
    });
  });

  // find a single event by id
  eventRouter.use('/events/:eventId', (req, res, next) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) {
        return res.send(err);
      }
      if (event) {
        req.event = event;
        return next();
      }
      return res.sendStatus(404);
    });
  });

  // get a specific event by id
  eventRouter.route('/events/:eventId').get((req, res) => res.json(req.event));

  // delete a specific event by id
  eventRouter.route('/events/:eventId').delete((req, res) => {
    req.event.remove((err) => {
      if (err) {
        return res.send(err);
      }
      return res.sendStatus(204);
    });
  });

  return eventRouter;
}

module.exports = routes;