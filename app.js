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

//setup LUIS
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e56356c4-1ade-49f3-abf4-5f1846e223ee?subscription-key=9aefdc1486b744049db504427816d708');
bot.recognizer(recognizer);

//=====================================
// Bots Dialogs
//=====================================

bot.dialog('start', function(session) {
    session.send('Hello Broker!');
    session.beginDialog('productInfo');
}).triggerAction({matches: 'greetings'});

bot.dialog('productInfo', [
    function(session) {
        builder.Prompts.text(session, 'What kind of product are you shipping?');
    },
    function(session, results) {
        session.send("I'm sorry, I could not find a chapter that corresponds to the product description you entered: " + results.response + ".");
        builder.Prompts.choice(session, "Here is a list of chapters you can choose from:", 'Article of Clothing, Chapter 61|Edible Fruit and Nuts, Chapter 8', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('articleClothing');
                break;
            case 1:
                session.beginDialog('edibleFruitAndNuts');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]);

bot.dialog('articleClothing', [
    function(session) {
        builder.Prompts.text(session, "The HS code chapter for 'Article of Clothing' is 61. What kind of article of clothing are you shipping?");
    },
    function(session, results) {
        session.send('The HS Code for ' + results.response + ' is: ' + '601020');
    }
]).triggerAction({matches: 'articleClothing'});

bot.dialog('edibleFruitAndNuts', [
    function(session) {
        builder.Prompts.choice(session, "The HS code chapter for 'Edible Fruit and Nuts' is 08. What kind of edible fruit are you shipping?", 'Apple|Banana|Orange', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.send('The HS Code for ' + results.response.entity + ' is: ' + '080810');
                break;
            case 1:
                session.send('The HS Code for ' + results.response.entity + ' is: ' + '081190');
                break;
            case 2:
                session.send('The HS Code for ' + results.response.entity + ' is: ' + '081400');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'edibleFruitAndNuts'});
