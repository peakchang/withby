import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from '../back-lib/lib.js';
import moment from "moment-timezone";
import bcrypt from "bcrypt";
const adminBaseRouter = express.Router();



// 내 정보 변경 부분!!!!

adminBaseRouter.post('/update_user_info', async (req, res) => {
    const body = req.body;
    try {
        let addQuery = ""
        if (body.newPassword) {
            const hashedPassword = await bcrypt.hash(body.newPassword, 10);
            addQuery = `, password = '${hashedPassword}'`
        }

        const updateUserQuery = `UPDATE users SET user_email =?, nick =? ${addQuery} WHERE userid =?`;
        await sql_con.promise().query(updateUserQuery, [body.email, body.name, body.id]);
    } catch (error) {

    }


    res.json({})
})


adminBaseRouter.post('/password_chk', async (req, res) => {
    const chkPwd = req.body.passwordChk;
    const id = req.body.id;
    let errorMessage = ""

    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE userid =?";
        const [userInfoTemp] = await sql_con.promise().query(getUserInfoQuery, [id]);

        const getPassword = userInfoTemp[0].password;
        const pwdChkBool = bcrypt.compareSync(chkPwd, getPassword)
        if (!pwdChkBool) {
            errorMessage = "비밀번호가 일치하지 않습니다.";
            throw new Error('패스워드 불일치!')
        }
    } catch (err) {
        console.error(err.message);
    }

    res.json({ errorMessage })
})


// DB 업로드 부분!!!
adminBaseRouter.post('/upload_db_data', async (req, res) => {
    const uploadDbData = req.body.uploadDbDate
    const setSite = req.body.setSite
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    for (let i = 0; i < uploadDbData.length; i++) {
        const data = uploadDbData[i];
        try {
            const updateDataQuery = "INSERT INTO application_form (af_mb_phone,af_mb_name,af_form_name,af_created_at) VALUES (?,?,?,?)";
            await sql_con.promise().query(updateDataQuery, [data.af_mb_phone, data.af_mb_name, setSite, now]);
        } catch (err) {
            console.error(err.message);

        }
    }
    res.json({})
})

adminBaseRouter.post('/dbupload_site_list', async (req, res) => {
    const filterSiteVal = req.body.filterSiteVal;
    let addQuery = ""
    if (filterSiteVal) {
        addQuery = `WHERE sl_site_name LIKE '%${filterSiteVal}%'`;
    }

    let site_list = [];
    try {
        const getSiteListQuery = `SELECT * FROM site_list ${addQuery} ORDER BY sl_id DESC`
        const [siteListRows] = await sql_con.promise().query(getSiteListQuery);
        site_list = siteListRows;
    } catch (error) {

    }
    res.json({ site_list })
})

// 기본설정!!!!!!!!!!
adminBaseRouter.post('/update_form_status', async (req, res) => {
    const body = req.body;
    const fsId = body.fs_id;
    delete body.fs_id;
    const queryStr = getQueryStr(body, 'update');
    queryStr.values.push(fsId)
    try {
        const updateFormStatusQuery = `UPDATE form_status SET ${queryStr.str} WHERE fs_id=?`;
        await sql_con.promise().query(updateFormStatusQuery, queryStr.values);
    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})


adminBaseRouter.post('/get_form_status', async (req, res) => {
    let form_status_data = {}
    try {
        const formStatusDataQuery = "SELECT * FROM form_status;"
        const [formStatusData] = await sql_con.promise().query(formStatusDataQuery);
        form_status_data = formStatusData[0]
    } catch (err) {
        console.error(err.message);
    }
    res.json(form_status_data)
})

adminBaseRouter.get('/', (req, res) => {
    res.send('asldfjalisjdfliajsdf')
})


export { adminBaseRouter }