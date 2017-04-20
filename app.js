var builder = require('botbuilder');
var restify = require('restify');
var prompts = require('./prompts');

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// create the connector
var connector = new builder.ChatConnector({
    appId: 'fb41aaa7-c510-4c86-bbc2-a8b84f43fbf9',
    appPassword: 'ZSfXhbWQW53FB61wZptjEWf'
});

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
        builder.Prompts.text(session, prompts.askProductDescriptionMessage);
    },
    function(session, results) {
        session.send(prompts.productDescriptionErrorMessage + results.response);
        builder.Prompts.choice(session, prompts.chaptersChoiceMessage, 'Article of Clothing, Chapter 61|Edible Fruit and Nuts, Chapter 8', {listStyle:3});
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
        builder.Prompts.text(session, prompts.chapter61Message);
    },
    function(session, results) {
        session.send('The HS Code for ' + results.response + ' is: ' + '601020');
    }
]).triggerAction({matches: 'articleClothing'});

bot.dialog('edibleFruitAndNuts', [
    function(session) {
        builder.Prompts.choice(session, prompts.chapter8Message, 'Apple|Banana|Orange', {listStyle:3});
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

bot.dialog('test', [
    function(session){
        session.send('This is a test dialog');
        console.log('test dialog started');
    }
]).triggerAction({matches: /^test/i});

//*******************
//Banana
//******************* 

bot.dialog('banana', [
    function(session) {
        builder.Prompts.choice(session, 'What type of banana are you shiping?', 'Fresh or Dried|Cooked or Uncooked', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('bananasFreshOrDried');
                break;
            case 1:
                session.beginDialog('bananasCookedOrUncooked');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'banana'});

bot.dialog('bananasFreshOrDried',
    function(session) {
        session.send('The HS code for Fresh or Dried banana(s) is 080390');
    }
).triggerAction({matches: 'bananasFreshOrDried'});

bot.dialog('bananasCookedOrUncooked',
    function(session) {
        session.send('The HS code for Cooked or Uncooked banana(s) is 081190');
    }
).triggerAction({matches: 'bananasCookedOrUncooked'});
