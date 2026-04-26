const yaml = require('js-yaml');
const fs = require('fs');
const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const config = yaml.load(fs.readFileSync(process.argv[2], 'utf8'));
const createDistrict = require('./modules/createDistrict');
const utils = require('../utils/UtilFunctions');
const excelPath = process.argv[3];
const {getPyToken} = require("../services/services/pyService");

async function processDistrict(districtInfo) {
    try {
        const token = await getPyToken(config);
        let responseData = await createDistrict.execute(districtInfo, token)
        if (responseData.status === 'SUCCESS') {
            await utils.sleep(5000);
        }
    } catch (err) {
        console.log(err);
    }
}

workbook.xlsx.readFile(excelPath).then(async () => {
    const worksheet = workbook.getWorksheet('template');
    const totalRows = worksheet.actualRowCount;
    let agencyCode = '';
    let schools = [];
    let districtGeography = '';
    let timeZone = '';
    let agencyName = '';
    let distData = [];
    worksheet.eachRow(async (row, rowNumber) => {
        if (rowNumber > 1) {
            if ((agencyCode !== '') && (agencyCode !== row.values[1])) {
                const districtInfo = {
                    agencyCode: agencyCode,
                    districtGeography: districtGeography,
                    timeZone: timeZone,
                    agencyName: agencyName,
                    schools: schools,
                }
                distData.push(districtInfo);
            }
            if (row.values[3] === 'District') {
                agencyCode = row.values[1];
                agencyName = row.values[2];
                districtGeography = row.values[4];
                timeZone = row.values[5];
                schools = [];
            }
            if (row.values[3] === 'School') {
                schools.push(row.values[2]);
            }
            if (rowNumber === totalRows) {
                const districtInfo = {
                    agencyCode: agencyCode,
                    districtGeography: districtGeography,
                    timeZone: timeZone,
                    agencyName: agencyName,
                    schools: schools,
                }
                distData.push(districtInfo);
            }
        }
    });
    for (let i = 0; i < distData.length; i++) {
        console.log('--------------starting process of ', (i + 1), 'of', distData.length, '--------------');
        await processDistrict(distData[i]);
        console.log('--------------process end of ', (i + 1), 'of', distData.length, '--------------');
        await utils.sleep(5000);
    }
});