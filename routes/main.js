import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, aligoKakaoNotification_formanager } from '../back-lib/lib.js';


const mainRouter = express.Router();


mainRouter.post('/chk_ex_file', async (req, res, next) => {

    console.log('들어는 오는거니?!?!??!');
    
    let status = true;
    let chkDbBool = true; // DB가 있으면 true, 없으면 false;
    const body = req.body;
    try {
        const chkDbQuery = `SELECT * FROM application_form WHERE af_mb_phone = ? AND af_form_name LIKE '%${body.form_name}%'`;
        const chkDb = await sql_con.promise().query(chkDbQuery, [body.ph_num])
        if (!chkDb[0][0]) {
            chkDbBool = false;
            // const insertChkDb = "INSERT INTO application_form (af_form_name,af_form_type_in,af_mb_name,af_mb_phone) VALUES (?,?,?,?)";
            // await sql_con.promise().query(insertChkDb, [body.form_name, 'fb', body.full_name, body.ph_num])
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    return res.json({ status, chkDbBool })
});



mainRouter.post('/send_kakao_and_dbinput', async (req, res, next) => {
    let status = true;

    const allData = JSON.parse(req.body.all_data_json);



    for (let i = 0; i < allData.length; i++) {
        const inData = allData[i];
        const location = inData.location;
        let userData = "\n"
        let managerPhone = ""

        for (let j = 0; j < inData.data.length; j++) {
            const userDataInfo = inData.data[j];
            let etc1Data = ""
            if (userDataInfo['etc1'] && userDataInfo['etc1'] != 'None') {
                etc1Data = ` / ${userDataInfo['etc1']}`
            }
            let etc2Data = ""
            if (userDataInfo['etc2'] && userDataInfo['etc2'] != 'None') {
                etc2Data = ` / ${userDataInfo['etc2']}`
            }
            const userDataInfoStr = `${userDataInfo['name']} / ${userDataInfo['phone']} ${etc1Data} ${etc2Data}`
            userData = userData + userDataInfoStr + '\n'

            try {
                const insertDbQuery = "INSERT INTO application_form (af_form_name,af_form_type_in,af_mb_name,af_mb_phone) VALUES (?,?,?,?)";
                await sql_con.promise().query(insertDbQuery, [location, 'fb', userDataInfo['name'], userDataInfo['phone']])
            } catch (error) {
                console.error(error.message);
            }
        }


        try {
            const getManagerPhoneQuery = `SELECT * FROM users WHERE manage_estate LIKE '%${location}%'`;
            const getManagerPhone = await sql_con.promise().query(getManagerPhoneQuery)
            managerPhone = getManagerPhone[0][0]['user_phone']

            var customerInfo = { ciPhone: managerPhone, ciSite: location, ciName: '추가DB', ciReceiver: userData }
            console.log(customerInfo);
            aligoKakaoNotification_formanager(req, customerInfo)
        } catch (error) {
            console.error(error.message);
        }

    }

    return res.json({ status })
});


mainRouter.post('/update_normal', async (req, res) => {
    const updateList = req.body.copyList;
    console.log(updateList);

    let normalVal = "접수완료";
    try {
        const getStatusStr = "SELECT fs_estate_status FROM form_status;";
        const [statusRows] = await sql_con.promise().query(getStatusStr);
        normalVal = statusRows[0]['fs_estate_status'].split(',')[0]
    } catch (error) {

    }

    console.log(normalVal);
    for (let i = 0; i < updateList.length; i++) {
        try {
            const data = updateList[i];
            const updateDateNormal = "UPDATE application_form SET af_mb_status = ? WHERE af_id = ?";
            await sql_con.promise().query(updateDateNormal, [normalVal, data.af_id]);
        } catch (err) {
            console.error(err.message);

        }
    }

    res.json({})
})
mainRouter.post('/load_minisite_info', async (req, res) => {
    const hyId = req.body.hy_id;
    const userStatus = req.body.user_status;

    let minisite_data = {};

    res.cookie('visit', 'ok')

    try {
        const getMinisiteDataQuery = "SELECT * FROM hy_site WHERE hy_num = ?"
        const [minisiteDataRows] = await sql_con.promise().query(getMinisiteDataQuery, [hyId]);
        minisite_data = minisiteDataRows[0]
        if (!userStatus && !req.cookies.visit) {
            console.log('들어와?!');

            let count = 1;
            if (Number(minisite_data.hy_counter) > 0) {
                count = Number(minisite_data.hy_counter) + 1
            }
            const updateCounerPage = `UPDATE hy_site SET hy_counter = ? WHERE hy_num = ?`;
            await sql_con.promise().query(updateCounerPage, [count, minisite_data.hy_num]);

        } else {
            console.log('안들어와?!');
        }
    } catch (err) {
        console.error(err.message);
    }

    res.json({ minisite_data })
})

mainRouter.get('/load_footer', async (req, res) => {
    let footerData = {};
    try {
        const getFooterDataQuery = "SELECT * FROM form_status"
        const [footerDataRows] = await sql_con.promise().query(getFooterDataQuery);
        footerData = footerDataRows[0]

    } catch (error) {

    }
    res.json({ footerData })
})


export { mainRouter }