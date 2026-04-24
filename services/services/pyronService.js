const axios = require("../../utils/axios");
let pyToken = null;
const createToken = async (config) => {
    console.debug('Starting of getPyronToken method');
    const response = await axios.post(`${config.pyron.tokenUrl}`, {
        'client_id': config.pyron.clientId,
        'client_secret': config.pyron.clientSecret,
        'grant_type': 'client_credentials'
    }, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    const token = response?.data?.access_token || '';
    if (token === '') {
        console.debug('getPyronToken - Unable to get the token');
    }
    return `${token}`;
};

async function getPyronToken(config) {
    if (pyToken == null) {
        pyToken = await createToken(config);
    }
    return pyToken;
}

module.exports = {
    getPyronToken,
};