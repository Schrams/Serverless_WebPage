const AWS = require('aws-sdk');
const waterfall = require('async-waterfall');
const s3 = new AWS.S3();


exports.handler = function (event, context, callback) {
  
  //Paràmetres del nostre bucket i html que hi tenim guardat
  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: "index.html"
  }
  console.log(params.Key, params.Bucket);
  
  
  waterfall([function(callback) {
    
    s3.getObject(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      var web = data.Body.toString('ascii');
      callback(null, web);
    }
  });

  //cridem a la Lambda que ens retornara la llista de vots
  }, function(web, callback) {
    var lambda = new AWS.Lambda({
      region: process.env.region
    });
    
    lambda.invoke({
      FunctionName: process.env.LAMBDA_LIST,
      InvocationType: "RequestResponse",
    }, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        callback(err);
      }
      else {
        console.log(data.Payload);
        var jsonData = JSON.parse(data.Payload);
        console.log(jsonData.body);
        var votes = jsonData.body;
        callback(null, web, votes);
      }
    });

    // Tenim ja vots i html només cal retornar el html amb la llista de vots corresponent
  }, function(web, votes, callback) {
    var index;
    var votesHTML = "";
    for (index = 0; index < votes.length; ++index) {
      votesHTML = votesHTML + "<tr><td>" + votes[index].userId + "</td><td>" + votes[index].numVotes + "</td></tr>";
    }
    var re = /#FilesDeVots#/;
    var webReemplacadaAmbVots = web.replace(re, votesHTML);
    console.log(webReemplacadaAmbVots);
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: webReemplacadaAmbVots,
    };
    // callback enviarà l'html
    callback(null, response);
  }], callback);

};