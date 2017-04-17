var builder = require('botbuilder');
var restify = require('restify');

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// create the connector
var connector = new builder.ChatConnector();

//create the bot
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());


//=====================================
// Bots Dialogs
//=====================================

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e56356c4-1ade-49f3-abf4-5f1846e223ee?subscription-key=9aefdc1486b744049db504427816d708');
bot.recognizer(recognizer);

bot.dialog('start', function(session) {
    session.send('Hello Broker!');
    session.beginDialog('productInfo');
}).triggerAction({matches: 'greetings'});

bot.dialog('productInfo', [
    function(session) {
        builder.Prompts.text(session, 'What product are you shipping?');
    },
    function(session, results) {
        session.send('You are shipping a ' + results.response);
    }
]);

//comment