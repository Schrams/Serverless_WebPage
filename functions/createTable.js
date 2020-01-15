var AWS = require('aws-sdk');
const waterfall = require('async-waterfall');
const s3 = new AWS.S3();

exports.createTable = function (event, context, callback) {

    waterfall([function(callback) {
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
            callback(null, votes);
        }
        });

        // Tenim ja vots i html només cal retornar el html amb la llista de vots corresponent
    }, function(votes, callback) {
        var index;
        var votesHTML = "";
        for (index = 0; index < votes.length; ++index) {
        votesHTML = votesHTML + "<tr><td>" + votes[index].userId + "</td><td>" + votes[index].numVotes + "</td></tr>";
        }
        callback(null, votesHTML);
    }, function putObjectToS3(votesHTML){        
        
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: "vots.txt",
            Body: votesHTML
        }
            s3.putObject(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
    }], callback);
}