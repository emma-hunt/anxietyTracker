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
      console.log(events);
      console.log(typeof events)
      console.log("SPLIT!!!!")
      events.forEach(event => {
        var obj = JSON.parse(JSON.stringify(event));
        console.log(obj._id);
      })
      return res.json(events);
    });
  });

  // post a new event
  eventRouter.route('/events').post((req, res) => {
    const event = new Event(req.body);
    event.save();
    console.log(event);
    if (event.panicAttack) {
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
    return res.status(201).json(event);
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