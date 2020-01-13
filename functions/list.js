'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.VOTES_TABLE,
};

module.exports.list = (event, context, callback) => {
  //Agafem tots els usuaris de la BD amb vots
  dynamoDb.scan(params, (error, result) => {
    // Tractament d'errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'No s ha pogut obtenir els usuaris.',
      });
      return;
    }

    // resposta
    const response = {
      statusCode: 200,
      //body: JSON.stringify(result.Items),
      body: result.Items,
    };
    callback(null, response);
  });
};