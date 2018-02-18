'use strict';

const AWS = require('aws-sdk');
const randomstring = require('randomstring');
const chalk = require('chalk');

class CloudfrontInvalidate {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};

        this.commands = {
            cloudfrontInvalidate: {
              usage: "Invalidate Cloudfront Cache",
              lifecycleEvents: [
                'invalidate'
              ]
            }
          };

        this.hooks = {
            'after:deploy:deploy': this.invalidate.bind(this),
            'cloudfrontInvalidate:invalidate': this.invalidate.bind(this),
        };
    }

    invalidate() {
        const cli = this.serverless.cli;
        let cloudfrontInvalidate = this.serverless.service.custom.cloudfrontInvalidate;
        let awsCredentials = this.serverless.getProvider('aws').getCredentials()
        let cloudfront = new AWS.CloudFront({
            credentials: awsCredentials.credentials
        });
        let reference = randomstring.generate(16); 
        let params = {
            DistributionId: cloudfrontInvalidate.distributionId, /* required */
            InvalidationBatch: { /* required */
                CallerReference: reference, /* required */
                Paths: { /* required */
                    Quantity: cloudfrontInvalidate.items.length, /* required */
                    Items: cloudfrontInvalidate.items
                }
            }
        };
        cloudfront.createInvalidation(params, function (err, data) {
            
            if(!err){
                cli.consoleLog(`CloudfrontInvalidate: ${chalk.yellow('Invalidation started')}`);            
            }else{
                cli.consoleLog(`CloudfrontInvalidate: ${chalk.yellow('Invalidation failed')}`);            
            }
        });
    }

}

module.exports = CloudfrontInvalidate;