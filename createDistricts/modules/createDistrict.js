const partnerService = require('../../services/services/partnerService');
const utils = require('../../utils/UtilFunctions');
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync(process.argv[2], 'utf8'));
exports.execute = async (input, token) => {
    let districtGeography = utils.isEmptyOrNull(input.districtGeography) ? constants.NOT_FOUND : input.districtGeography;
    districtGeography = districtGeography.substring(0, 50);
    const districtCreationPayload = {
        partner: {
            customName: input.agencyName,
            ncesName: input.agencyName,
            organizationNumber: input.agencyCode,
            districtGeography: input.districtGeography,
            timeZone: input.timeZone,
            editedBy: config.scriptConfig.EDITED_BY_LABEL,
        },
    };
    const createDistrictResponse = await createDistrict(districtCreationPayload, token);
    return createDistrictResponse;

};

async function createDistrict(districtCreationPayload, token) {
    let responseData = {};
    await partnerService.postToPartnerService(config.py.coloGatewayUrl + '/partnerConfig/partners', districtCreationPayload, token)
        .then((response) => {
            if (response.status === 201 && (response.data && response.data.businessIdentifier !== null)) {
                responseData = {
                    businessIdentifier: response.data.businessIdentifier, status: 'SUCCESS',
                };
            } else {
                console.error(`Creation of district failed with response=${utils.convertJSONToString(response)}`);
            }
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
    return responseData;
}