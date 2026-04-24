const axios = require("../../utils/axios");
const utils = require('../../utils/UtilFunctions');
const yaml = require("js-yaml");
const fs = require("fs");
const config = yaml.load(fs.readFileSync(process.argv[2], 'utf8'));

exports.postToPartnerService = async (requestUrl, payload, token) => {
    let serviceResponseObject = {};
    console.debug(`postToPartnerService: partnerConfigURL=${requestUrl}`);
    console.debug(`postToPartnerService: payload=${utils.convertJSONToString(payload)}`);
    let headers = {'Content-Type': 'application/json'};
    if (config.env !== 'Team14') {
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    await axios.post(`${requestUrl}`, payload, {
        headers: headers
    })
        .then((response) => {
            serviceResponseObject = response;
        })
        .catch((e) => {
            console.debug(e);
            throw e;
        })

    return serviceResponseObject;
};