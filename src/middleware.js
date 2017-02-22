var request = require('request');
var debug = require('debug')('botkit:rasa');

module.exports = function(config) {

    if (!config) {
        config = {};
    }

    if (!config.rasa_uri) {
        config.rasa_uri = 'http://localhost:5000';
    }

    var middleware = {
        receive: function(bot, message, next) {
            next();
        },
        hears: function(patterns, message) {
            request({
                            url: config.rasa_uri + '/parse',
                            method: "POST",
                            json: true,
                            body: {q: message.text }
                        }, function(err, res, body) {
                if (typeof(message.text) != "undefined") {
                    if (err) {
                        console.error('rasa middleware error:',err);
                    } else {
                        var json = null;
                        try {
                                json = JSON.stringify(body);
                                json = JSON.parse(json);
                        } catch(err) {
                            console.error('rasa middleware error parsing json:',err);
                        }

                        // copy the entire payload into the message
                        if (json) {
                            message.intent = json.intent;
                            message.entities = json.entities;
                            message.confidence = json.confidence;
                        }
                    }
                }
                next();
            });
        }

    }


    return middleware;


}
