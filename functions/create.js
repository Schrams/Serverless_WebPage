'use strict';

const AWS = require('aws-sdk');
const querystring = require('querystring');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const data = querystring.parse(event.body);
  if (typeof data.userId !== 'string') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the user.',
    });
    return;
  }

  // Preparem l'objecte per fer la creació o l'update a la taula
  var params = {
    TableName: process.env.VOTES_TABLE,
    Key:{
        "userId": data.userId
    },
    UpdateExpression: "ADD numVotes :votes",
    ExpressionAttributeValues:{
        ':votes': 1
    },
  };

/*
  const params = {
    TableName: process.env.VOTES_TABLE,
    Item: {
      userId: data.userId,
      numVotes: 1,
    },
  };
*/

  // insertItem
  dynamoDb.update(params, (error) => {
    // tractament d'errors i cas en que ja existeix
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the user.',
      });
      return;
    }

    // resposta
    const response = {
      statusCode: 200,
      body: "The user with name " + params.Key.userId + " has been created/updated!",
    };
    callback(null, response);
  });
};