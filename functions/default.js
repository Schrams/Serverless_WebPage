const AWS = require('aws-sdk');
const waterfall = require('async-waterfall');
const s3 = new AWS.S3();


exports.default = function (event, context, callback) {
  
  //Paràmetres del nostre bucket i html estàtic que hi tenim guardat
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

  //Agafem la llista de vots del fitxer d'S3
  }, function(web, callback) {
    
    s3.getObject({
      Bucket: process.env.BUCKET_NAME,
      Key: "vots.txt"
    }, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        callback(err);
      }
      else {
        var taulaVots = data.Body.toString('ascii');
        callback(null, web, taulaVots);
      }
    });

    // Tenim ja la taula amb els vots pasada a String i l'html. Només cal retornar el html amb la llista de vots corresponent sustituint una etiqueta
  }, function(web, taulaVots, callback) {
    var re = /#FilesDeVots#/;
    var webReemplacadaAmbVots = web.replace(re, taulaVots);
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