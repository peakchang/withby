import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, deleteFolder } from '../back-lib/lib.js';
import moment from "moment-timezone";
import fs from "fs-extra";


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const minisiteRouter = express.Router();

minisiteRouter.post('/add_sub_domain', async (req, res) => {
    const body = req.body;

    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const addSubDomainQuery = "INSERT INTO land (ld_domain, ld_created_at) VALUES (?,?)";
        await sql_con.promise().query(addSubDomainQuery, [body.addSubDomainVal, now]);
    } catch (error) {

    }
    res.json({})

})

minisiteRouter.post('/add_hy_site', async (req, res) => {
    const hy_num = req.body.hy_num;
    const hy_site_name = req.body.hy_site_name;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    let err_message = "";
    try {
        const addHySiteQuery = `INSERT INTO hy_site (hy_num, hy_title, hy_creted_at) VALUES (?,?,?)`;
        await sql_con.promise().query(addHySiteQuery, [hy_num, hy_site_name, now]);
    } catch (err) {
        err_message = err.message;
        console.error(err_message);

    }

    res.json({ err_message })
})


minisiteRouter.post('/apply_site', async (req, res) => {
    const ldId = req.body.ld_id
    const setSite = req.body.setSite
    try {
        const updateLandSiteQuery = "UPDATE land SET ld_site = ? WHERE ld_id = ?";
        await sql_con.promise().query(updateLandSiteQuery, [setSite, ldId]);
    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})
minisiteRouter.post('/load_site_list', async (req, res) => {
    const filterKeyword = req.body.filter_keyword;
    let addQuery = ""
    let site_list = [];
    if (filterKeyword) {
        addQuery = `WHERE sl_site_name LIKE '%${filterKeyword}%'`
    }

    try {
        const getSiteListQuery = `SELECT * FROM site_list ${addQuery}`;

        const [siteListRows] = await sql_con.promise().query(getSiteListQuery);
        site_list = siteListRows;
    } catch (error) {

    }
    res.json({ site_list });
})

minisiteRouter.post('/load_land_minisite', async (req, res) => {

    let land_minisite_data = [];
    // let allCount = 0;
    // let allPage = 0;
    // let onePageCount = 10;
    // const nowPage = req.body.nowPage || 1;
    try {
        // const getLandMinisiteCountQuery = "SELECT count(*) AS m1Count FROM hy_site";
        // const [countRows] = await sql_con.promise().query(getLandMinisiteCountQuery);
        // allCount = countRows[0].m1Count;
        // allPage = Math.ceil(allCount / onePageCount);
        // const startCount = (nowPage - 1) * onePageCount;


        const getLandMinisiteQuery = `SELECT * FROM land ORDER BY ld_id DESC`;
        const [landMiniSiteRows] = await sql_con.promise().query(getLandMinisiteQuery);
        land_minisite_data = landMiniSiteRows;
    } catch (err) {
        console.error(err.message);
    }



    res.json({ land_minisite_data })
})

minisiteRouter.get('/', (req, res) => {
    res.send('asldfjalisjdfliajsdf')
})


// 아래는 미니 사이트1 !!!!!!!!!!!!

minisiteRouter.post('/copy_hy_data', async (req, res) => {
    const body = req.body;

    try {
        const getHyDataQuery = "SELECT * FROM hy_site WHERE hy_id = ?";
        const [getHyDataRow] = await sql_con.promise().query(getHyDataQuery, body.copyData.hy_id);
        const getHyData = getHyDataRow[0];

        delete getHyData.hy_id;

        let keyStr = "";
        let questions = "";
        let values = [];
        for (const key in getHyData) {
            keyStr += `${key},`;
            questions += `?,`;

            if (key == 'hy_creted_at') {
                const getTime = moment(getHyData[key]).format('YYYY-MM-DD HH:mm:ss');
                values.push(getTime)
            } else if (key == 'hy_num') {
                values.push(body.copyId)
            } else if (key.includes('image')) {
                const getImgPath = getHyData[key].replaceAll(body.copyData.hy_num, body.copyId)
                values.push(getImgPath);
            } else {
                values.push(getHyData[key])
            }

        }

        if (keyStr.endsWith(',')) {
            keyStr = keyStr.slice(0, -1);
        }

        if (questions.endsWith(',')) {
            questions = questions.slice(0, -1);
        }

        const getOldFolder = `./public/uploads/image/${body.copyData.hy_num}`
        const getNewFolder = `./public/uploads/image/${body.copyId}`;
        if (fs.existsSync(getOldFolder)) {
            fs.copySync(getOldFolder, getNewFolder);
        } else {
        }

        const addHyDataQuery = `INSERT INTO hy_site (${keyStr}) VALUES (${questions})`;
        await sql_con.promise().query(addHyDataQuery, values);
    } catch (err) {
        console.error(err.message);
    }

    res.json({})
})


minisiteRouter.post('/delete_hy_raw', async (req, res) => {
    const deleteData = req.body.deleteData;
    for (let i = 0; i < deleteData.length; i++) {
        const data = deleteData[i];
        const deletePath = `./public/uploads/image/${data.hy_num}`
        deleteFolder(deletePath)
        try {
            const deleteHyRawQuery = "DELETE FROM hy_site WHERE hy_id = ?";
            await sql_con.promise().query(deleteHyRawQuery, data.hy_id);
        } catch (error) {
        }
    }
    res.json({})
})
minisiteRouter.post('/update_hy_raw', async (req, res) => {
    const updateData = req.body.updateData;
    let duplication_num = 0;
    for (let i = 0; i < updateData.length; i++) {
        const data = updateData[i];
        const hyId = data.hy_id;
        delete data.hy_id;
        const queryStr = getQueryStr(data, 'update');
        queryStr.values.push(hyId);

        try {
            const updateHyRawQuery = `UPDATE hy_site SET ${queryStr.str} WHERE hy_id = ?`;
            await sql_con.promise().query(updateHyRawQuery, queryStr.values);
        } catch (error) {
            console.error(error.message);

            duplication_num++
        }
    }

    res.json({ duplication_num })
})


minisiteRouter.post('/update_hy_data', async (req, res) => {
    const hySiteData = req.body

    const hyId = hySiteData.hy_id;
    delete hySiteData.hy_id;
    hySiteData.hy_creted_at = moment(hySiteData.hy_creted_at).format('YYYY-MM-DD HH:mm:ss');
    const queryStr = getQueryStr(hySiteData, 'update');
    queryStr.values.push(hyId)

    try {
        const hySiteUpdateQuery = `UPDATE hy_site SET ${queryStr.str} WHERE hy_id = ?`;
        await sql_con.promise().query(hySiteUpdateQuery, queryStr.values);
    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})

minisiteRouter.post('/load_hy_data', async (req, res) => {
    const hyId = req.body.getHyId;
    let hyData = {}
    try {
        const getHyDattaQuery = "SELECT * FROM hy_site WHERE hy_id = ? ";

        const [hyDataRows] = await sql_con.promise().query(getHyDattaQuery, [hyId.id]);
        hyData = hyDataRows[0]
    } catch (err) {
        console.error(err.message);
    }

    res.json({ hyData })
})

minisiteRouter.post('/load_minisite', async (req, res) => {

    let minisiteData = [];
    let allCount = 0;
    let allPage = 0;
    let onePageCount = 10;
    const nowPage = req.body.nowPage || 1;
    const search = req.body.search || "";
    let searchStr = "";
    if (search) {
        searchStr = `WHERE hy_title LIKE '%${search}%'`;
    }

    try {
        const getMinisite1CountQuery = `SELECT count(*) AS m1Count FROM hy_site ${searchStr}`;

        const [countRows] = await sql_con.promise().query(getMinisite1CountQuery);
        allCount = countRows[0].m1Count;
        allPage = Math.ceil(allCount / onePageCount);
        const startCount = (nowPage - 1) * onePageCount;


        const getMinisite1Query = `SELECT hy_id,hy_num,hy_title,hy_counter FROM hy_site ${searchStr} ORDER BY hy_id DESC LIMIT ${startCount}, ${onePageCount}`;
        const [miniSiteRows] = await sql_con.promise().query(getMinisite1Query);
        minisiteData = miniSiteRows;
    } catch (err) {
        console.error(err.message);
    }

    res.json({ minisiteData, allPage })
})

minisiteRouter.get('/', (req, res) => {
    res.send('asldfjalisjdfliajsdf')
})


export { minisiteRouter }