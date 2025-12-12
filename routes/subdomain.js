import express from "express";
import fs from 'fs-extra';
import path from "path";
import aligoapi from 'aligoapi'
import multer from "multer";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, numberToTime, aligoKakaoNotification_formanager, aligoKakaoNotification_detail } from '../back-lib/lib.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { processImageFile } from "../back-lib/processImageFile.js";


import { Storage } from "@google-cloud/storage"; // 사이트 복사 부분을 위해서 일단 불러오기


// 사이트 복사 함수
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE,
});

async function copyFolder(bucketName, oldFolder, newFolder) {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: oldFolder + '/' });

    for (const file of files) {
        const newFileName = file.name.replace(`${oldFolder}/`, `${newFolder}/`);
        const destFile = bucket.file(newFileName);

        await file.copy(destFile);
        await destFile.makePublic(); // 🔥 이 줄이 포인트

        console.log(`Copied & public: ${file.name} → ${newFileName}`);
    }
}

import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const subdomainRouter = express.Router();


let img_upload_set = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = req.body.folder || 'default';
            const uploadPath = path.join(__dirname, '..', 'subuploads', 'img', folder);

            ensureDirectoryExistence(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
})

let img_upload = multer({
    storage: multer.diskStorage({
        // 경로를 설정
        destination(req, file, cb) {
            const setFolder = imgFolderChk();
            cb(null, setFolder);
        },
        filename(req, file, cb) {
            //파일명 설정
            cb(null, file.originalname);
        },
    }),
    // limits: { fileSize: 10 * 1024 * 1024 },
});

// 폴더 존재 여부 확인 및 생성
const ensureDirectoryExistence = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};


// 이미지 업로드 부분!! (단일 이미지)
subdomainRouter.post('/img_upload_set', img_upload_set.single('onimg'), (req, res, next) => {
    let saveUrl = ""
    saveUrl = `/subimg/${req.body.folder}/${req.file.originalname}`
    res.json({ saveUrl })
})


// 사이트 삭제 부분!!!
// 배열 첫번째에 다 몰리는 경우가 있어서 ㅠ 나눠주는 함수!
function splitArrayElement(arr) {
    if (arr.length === 1 && typeof arr[0] === 'string') {
        return arr[0].split(',');
    }
    return arr;
}
// 절대경로로 이루어진 배열 내 이미지 경로 병렬로 삭제하는 함수!
async function deleteImages(paths) {
    try {
        await Promise.all(
            paths.map(async (path) => {
                await fs.remove(path);  // remove는 파일, 폴더 모두 삭제 가능
            })
        );
    } catch (err) {
        console.error('삭제 중 에러 발생:', err);
    }
}

subdomainRouter.post('/delete_site', async (req, res, next) => {
    const deleteList = req.body.checkedList;

    for (let i = 0; i < deleteList.length; i++) {
        const d = deleteList[i];
        let deleteData = {}

        try {
            const getDeleteDataQuery = "SELECT * FROM land WHERE ld_id = ?"
            const [getDeleteData] = await sql_con.promise().query(getDeleteDataQuery, [d]);
            deleteData = getDeleteData[0]
        } catch (error) {
            return res.status(400).json({ message: '데이터 불러오기 에러!' })
        }

        try {
            // 폴더에 셋팅 되어 있는 경우 말고 구버전 (http 포함) 이미지 삭제하기!!
            let delImgList = [];
            let delImgListTemp = [];

            for (const key in deleteData) {
                const val = deleteData[key];
                if (val && typeof val === 'string') {
                    let imageUrls = val.match(/https?:\/\/[^\s'"]+\.(jpg|jpeg|png|webp|gif)(\?[^\s'"]*)?/gi);
                    if (imageUrls) {
                        imageUrls = splitArrayElement(imageUrls)
                        delImgListTemp = [...delImgListTemp, imageUrls]
                    }
                }
            }
            if (delImgListTemp.length > 0) {
                delImgListTemp = delImgListTemp.flat();
                for (let i = 0; i < delImgListTemp.length; i++) {
                    const t = delImgListTemp[i].split('/');
                    const deletePath = path.join(__dirname, '..', 'subuploads', 'img', t[t.length - 2], t[t.length - 1]);
                    delImgList.push(deletePath)
                }
                deleteImages(delImgList)
            }
            // 구버전 이미지 삭제 끝!!

        } catch (error) {
            console.error(error.message);
        }

        try {
            const deleteFolderPath = path.join(__dirname, '..', 'subuploads', 'img', deleteData.ld_domain);
            await fs.remove(deleteFolderPath);
        } catch (error) {
            console.error(error.message);
        }

        try {
            const deleteQuery = "DELETE FROM land WHERE ld_id = ?"
            await sql_con.promise().query(deleteQuery, [d]);
        } catch (error) {
            return res.status(400).json({ message: '이미지 삭제 에러! 다시 시도해주세요!' })
        }
    }

    return res.json({})
})



// 사이트 카피 부분!!!

subdomainRouter.post('/copy_site', async (req, res, next) => {

    const body = req.body
    let copyData = {}
    let insertData = {}

    // 데이터 불러오기
    try {
        const getCopyDataQuery = "SELECT * FROM land WHERE ld_domain = ?";
        const [getCopyData] = await sql_con.promise().query(getCopyDataQuery, [body.oldDomain]);
        copyData = getCopyData[0]
    } catch (error) {
        return res.status(400).json({ message: '데이터 불러오기 실패! 다시 시도해주세요!' })
    }

    try {
        // 불러온 데이터 가공 & 구버전 이미지 복붙 하기!
        for (const key in copyData) {
            const val = copyData[key];
            if (val && typeof val === 'string') {
                insertData[key] = val.replace(new RegExp(body.oldDomain, 'g'), body.copyDomain);
            }
        }

        delete insertData.ld_id;
        delete insertData.ld_created_at;

        delete insertData.ld_visit_count;
        delete insertData.ld_call_clickcount;
        delete insertData.ld_sms_clickcount;

        const queryStr = getQueryStr(insertData, 'insert', 'ld_created_at');

        const insertCopyData = `INSERT INTO land (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(insertCopyData, queryStr.values);
    } catch (error) {
        console.error(error.message);

        return res.status(400).json({ message: '중복된 아이디값(도메인)이 있습니다.' })

    }

    copyFolder(process.env.GCS_BUCKET_NAME, body.oldDomain, body.copyDomain);

    // local 환경에서 기존 폴더 있는지 체크
    const oldFolderPath = path.join(__dirname, '..', 'subuploads', 'img', body.oldDomain);
    const newFolderPath = path.join(__dirname, '..', 'subuploads', 'img', body.copyDomain);

    try {
        if (fs.existsSync(oldFolderPath)) {
            fs.copySync(oldFolderPath, newFolderPath);
        }
    } catch (error) {
        return res.status(400).json({ message: '중복된 아이디값(도메인)이 있습니다.' })
    }



    return res.json({})
})




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 여기는 visit!!!!!!!!!!!!!!!

subdomainRouter.post('/get_visit_list', async (req, res, next) => {
    let status = true;

    let visit_list = [];
    try {
        const getVisitListQuery = "SELECT * FROM subdomain_visit WHERE sv_domain = ? ORDER BY sv_id DESC"
        const getVisitList = await sql_con.promise().query(getVisitListQuery, [req.body.getId]);
        visit_list = getVisitList[0];
    } catch (error) {
        status = false;
    }

    res.json({ status, visit_list })
})



subdomainRouter.post('/get_menu', async (req, res, next) => {
    let status = true;
    const subDomainName = req.body.subDomainName
    let menuList = "";
    try {
        const getSubDomainQuery = "SELECT ld_menu FROM land WHERE ld_domain = ?";
        const getSubDomainCon = await sql_con.promise().query(getSubDomainQuery, [subDomainName]);
        menuList = getSubDomainCon[0][0]['ld_menu']
    } catch (error) {

    }
    res.json({ status, menuList })
})

subdomainRouter.post('/add_call_count', async (req, res, next) => {
    let status = true;
    const callCount = req.body.callCount + 1
    const ld_id = req.body.ld_id;
    try {
        const updateCallCountQuery = "UPDATE land SET ld_call_clickcount = ? WHERE ld_id = ?";
        await sql_con.promise().query(updateCallCountQuery, [callCount, ld_id]);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})

subdomainRouter.post('/add_sms_count', async (req, res, next) => {
    let status = true;
    const smsCount = req.body.smsCount + 1
    const ld_id = req.body.ld_id;
    try {
        const updateSmsCountQuery = "UPDATE land SET ld_sms_clickcount = ? WHERE ld_id = ?";
        await sql_con.promise().query(updateSmsCountQuery, [smsCount, ld_id]);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})

subdomainRouter.post('/subview', async (req, res, next) => {
    let status = true;
    const subDomainName = req.body.subDomainName

    let subView = "";
    try {
        const getSubDomainQuery = "SELECT * FROM land WHERE ld_domain = ?";
        const getSubDomainCon = await sql_con.promise().query(getSubDomainQuery, [subDomainName]);
        subView = getSubDomainCon[0][0]
    } catch (error) {

    }

    res.json({ status, subDomainName, subView })
})


// 카운트로 쓰려고 했는데 걍 안씀
subdomainRouter.post('/update_visit_count', async (req, res, next) => {
    let status = true;

    const body = req.body;


    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ipAddress != process.env.SERVER_IP) {

        const userAgent = req.get('user-agent');


        const ldVisitCount = body.ld_visit_count + 1;
        try {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            const insertVisitList = "INSERT INTO subdomain_visit (sv_domain, sv_ip, sv_ua, sv_referrer, sv_created_at) VALUES (?,?,?,?,?)";
            await sql_con.promise().query(insertVisitList, [body.ld_domain, ipAddress, userAgent, body.referrer, now]);

            const getVisitCountQuery = "UPDATE land SET ld_visit_count = ? WHERE ld_id = ?";
            await sql_con.promise().query(getVisitCountQuery, [ldVisitCount, body.ld_id]);
        } catch (error) {
            status = false;
        }

    }
    res.json({ status })
})


subdomainRouter.post('/load_land_modify', async (req, res, next) => {
    let status = true;
    const getId = req.body.getId;
    let land_modify_val = {}
    try {
        const loadLandModifyQuery = "SELECT * FROM land WHERE ld_domain = ?"
        const loadLandModify = await sql_con.promise().query(loadLandModifyQuery, [getId]);
        land_modify_val = loadLandModify[0][0]
    } catch (err) {
        console.error(err.message);
        status = false;
    }

    res.json({ status, land_modify_val })
})


subdomainRouter.post('/upload_data', async (req, res, next) => {
    let status = true;
    let body = req.body.allData;

    const ld_domain = body['ld_domain'];
    delete body['ld_domain'];
    delete body['ld_created_at'];

    try {
        const queryData = getQueryStr(body, 'update');
        queryData.values.push(ld_domain);;
        const updateLandQuery = `UPDATE land SET ${queryData.str} WHERE ld_domain = ?`;
        await sql_con.promise().query(updateLandQuery, queryData.values);
    } catch (err) {
        console.error(err.message);
        status = false;
    }

    res.json({ status })
})





subdomainRouter.post('/img_upload', img_upload.single('onimg'), (req, res, next) => {
    let status = true;
    let baseUrl
    let saveUrl

    try {
        const lastFolderArr = req.file.destination.split('/');
        const lastFolder = lastFolderArr[lastFolderArr.length - 1];
        var origin = req.get('host');
        baseUrl = req.protocol + '://' + origin + '/subimg/' + lastFolder + '/' + req.file.filename;
        saveUrl = req.file.path

    } catch (error) {
        status = false;
    }

    res.json({ status, baseUrl, saveUrl })
})


// ------------------------------------------ 시자악~

subdomainRouter.post('/load_site_set', async (req, res, next) => {
    const body = req.body;

    let siteSetData = {}

    try {
        const loadSiteSetQuery = `SELECT * FROM land WHERE ld_domain = ?`;
        const [loadSiteSet] = await sql_con.promise().query(loadSiteSetQuery, [body.getId]);
        siteSetData = loadSiteSet[0]

    } catch (error) {
        console.error(error.message);

    }
    res.json({ siteSetData })
})

subdomainRouter.post('/update_site_set', async (req, res, next) => {
    const body = req.body;
    try {
        const queryData = getQueryStr(body.uploadDataObj, 'update')
        const updateSiteSetQuery = `UPDATE land SET ${queryData.str} WHERE ld_domain = ?`
        queryData.values.push(body.get_id)
        await sql_con.promise().query(updateSiteSetQuery, queryData.values);
        return res.status(200).json({})
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message })
    }

})


subdomainRouter.post('/delete_single_image_only', async (req, res, next) => {

    const delPath = req.body.deleteImagePath;

    try {
        fs.unlink(delPath, (err) => {
            console.error(err);
        })
    } catch (error) {
        console.error(error);
    }
    res.json({})
})

subdomainRouter.post('/delete_many_image', async (req, res, next) => {
    const deleteImgArr = req.body.deleteImgArr;
    deleteImgArr.forEach(delPath => {
        try {
            fs.unlink(delPath, (err) => {
                console.error(err);
            })
        } catch (error) {
            console.error(error);
        }
    });


    res.json({})
})


// ------------------------------------------ 끄읕~~~

subdomainRouter.post('/delete_single_image', async (req, res, next) => {

    const delPath = req.body.deleteImagePath;
    const dbType = req.body.imgActType
    const ldId = req.body.ld_id;
    try {
        await fs.unlink(delPath, (err) => {
        })
        const deleteLogoQuery = `UPDATE land SET ${dbType} = '' WHERE ld_id = ?`;
        await sql_con.promise().query(deleteLogoQuery, [ldId]);
    } catch (error) {
        console.error(error);
    }
    res.json({})
})




subdomainRouter.post('/delete_img', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const delPath = `subuploads/img/${body.getFolder}/${body.getImgName}`
    try {
        await fs.unlink(delPath, (err) => {
            console.error(err);
        })
    } catch (error) {
        status = false
        console.error(error);
    }
    res.json({ status })
})

subdomainRouter.post('/update_customer', async (req, res, next) => {
    const body = req.body;
    console.log(body);
    const now = moment().format('YY/MM/DD HH:mm:ss');

    let reserveTime = ""
    if (body.time) {
        reserveTime = numberToTime(body.time)
    }

    let addQuery = "";
    let addValues = [];
    let addSms = ""
    if (body.name) {
        addQuery = addQuery + ", af_mb_name"
        addValues.push(body.name);
    }
    if (body.phone) {
        addQuery = addQuery + ", af_mb_phone"
        addValues.push(body.phone);
    }

    if (body.date && !body.time) {
        addQuery = addQuery + ", af_mb_reserve_time"
        addValues.push(body.date);
    }

    if (body.date && body.time != 'base') {
        addQuery = addQuery + ", af_mb_reserve_time"
        const dateTime = `${body.date} ${reserveTime}:00`
        addValues.push(dateTime);
    }

    if (body.memo1) {
        addQuery = addQuery + ", af_mb_etc1"
        addValues.push(body.memo1);
        addSms = `/ ${body.memo1_q} : ${body.memo1}`
    }

    if (body.memo2) {
        addQuery = addQuery + ", af_mb_etc2"
        addValues.push(body.memo2);
        addSms = `/ ${body.memo2_q} : ${body.memo2}`
    }

    if (body.memo3) {
        addQuery = addQuery + ", af_mb_etc3"
        addValues.push(body.memo3);
        addSms = `/ ${body.memo3_q} : ${body.memo3}`
    }
    addValues.push(now);
    const placeholders = Array(addValues.length).fill('?').join(',');

    try {
        // DB 입력하기~~~
        const insertCustomerQuery = `INSERT INTO application_form (af_form_name, af_form_type_in, af_form_location${addQuery}, af_created_at) VALUES (?,?,?,${placeholders})`;

        await sql_con.promise().query(insertCustomerQuery, [body.siteName, "분양", "DB", ...addValues]);
    } catch (error) {
        console.error(error.message);
    }

    try {
        // 매니저들에게 카톡 발송~~
        const getManagerListQuery = `SELECT * FROM users WHERE manage_estate LIKE "%${body.siteName}%"`;
        const getManagerList = await sql_con.promise().query(getManagerListQuery);
        const manager_list = getManagerList[0];

        const AuthData = {
            apikey: process.env.ALIGOKEY,
            // 이곳에 발급받으신 api key를 입력하세요
            userid: process.env.ALIGOID,
            // 이곳에 userid를 입력하세요
        }
        if (manager_list && manager_list.length > 0) {
            for (let i = 0; i < manager_list.length; i++) {
                const manager = manager_list[i];
                let customerInfo = {
                    ciPhone: manager['user_phone'],
                    ciSite: body.siteName,
                    ciName: body.name,
                    ciReceiver: body.phone
                }
                // aligoKakaoNotification_formanager(req, customerInfo)
                // 알리고 카톡 발송!!!
                try {

                    console.log(`${manager['user_phone']} 에게 ${body.name} / ${body.phone} 알리고 카톡 발송!!!`);

                    req.body = {
                        type: 'i',  // 유효시간 타입 코드 // y(년), m(월), d(일), h(시), i(분), s(초)
                        time: 1, // 유효시간
                    }

                    const result = await aligoapi.token(req, AuthData);
                    req.body = {
                        senderkey: process.env.ALIGO_SENDERKEY,
                        token: result.token,
                        tpl_code: 'UA_7717',
                        sender: '010-6628-6651',
                        receiver_1: manager['user_phone'],
                        subject_1: '분양정보 신청고객 알림톡',
                        message_1: `${body.siteName}고객 유입 알림!\n\n고객명:${body.name}\n연락처:${`${body.phone} ${addSms}`}\n\n※ 상담 대기 상태입니다.\n빠르게 컨택 진행 부탁 드립니다.`,
                    }

                    const aligo_res = await aligoapi.alimtalkSend(req, AuthData)
                    console.log(`알리고 발송 : ${aligo_res.message}`);
                } catch (err) {
                    console.error(err.message);

                }
            }
        }

        // 고객에게 카톡 발송~~~
        // const getSiteInfoQuery = "SELECT * FROM site_list WHERE sl_site_name = ?";
        // const getSiteInfo = await sql_con.promise().query(getSiteInfoQuery, [body.siteName]);
        // const site_info = getSiteInfo[0][0]

        // if (site_info) {
        //     let sendMessageObj = {
        //         receiver: body.phone,
        //         customerName: body.name,
        //         company: "위드분양",
        //         siteRealName: site_info['sl_site_realname'],
        //         smsContent: site_info['sl_sms_content'],
        //     }

        //     aligoKakaoNotification_detail(req, sendMessageObj)
        // }
    } catch (error) {

    }
    res.json({})
})


subdomainRouter.get('/', (req, res, next) => {
    let status = true;
    res.json({ status })
})


function imgFolderChk() {
    let setFolder
    const now = moment().format('YYMMDD')

    try {
        fs.readdirSync(`subuploads`);
    } catch (error) {
        fs.mkdirSync(`subuploads`);
    }

    try {
        fs.readdirSync(`subuploads/img`);
    } catch (error) {
        fs.mkdirSync(`subuploads/img`);
    }

    try {
        fs.readdirSync(`subuploads/img/img${now}`);
    } catch (error) {
        fs.mkdirSync(`subuploads/img/img${now}`);
    }
    setFolder = `subuploads/img/img${now}`


    return setFolder;
}


export { subdomainRouter }


