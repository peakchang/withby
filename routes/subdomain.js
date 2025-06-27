import express from "express";
import fs from 'fs-extra';
import path from "path";

import multer from "multer";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, aligoKakaoNotification_formanager, aligoKakaoNotification_detail } from '../back-lib/lib.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { processImageFile } from "../back-lib/processImageFile.js";

import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const subdomainRouter = express.Router();


let img_upload_set = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = req.body.folder || 'default';
            console.log(__dirname);

            console.log(folder);

            const uploadPath = path.join(__dirname, '..', 'subuploads', 'img', folder);
            console.log(uploadPath);

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
        console.log('이미지 모두 삭제 완료!');
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
                    // console.log(val);
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
            console.log('여기 아노아?');
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

    console.log('안들어오니?');

    const body = req.body
    console.log(body);
    let copyData = {}

    // 데이터 불러오기
    try {
        const getCopyDataQuery = "SELECT * FROM land WHERE ld_domain = ?";
        const [getCopyData] = await sql_con.promise().query(getCopyDataQuery, [body.oldDomain]);
        copyData = getCopyData[0]
    } catch (error) {
        return res.status(400).json({ message: '데이터 불러오기 실패! 다시 시도해주세요!' })
    }

    // 기존 폴더 있는지 체크

    const oldFolderPath = path.join(__dirname, '..', 'subuploads', 'img', body.oldDomain);
    const newFolderPath = path.join(__dirname, '..', 'subuploads', 'img', body.copyDomain);


    console.log(fs.existsSync(oldFolderPath));

    try {
        if (fs.existsSync(oldFolderPath)) {
            fs.copySync(oldFolderPath, newFolderPath);
        }
    } catch (error) {
        console.log('카피에서 에러 나나?');

        return res.status(400).json({ message: '중복된 아이디값(도메인)이 있습니다.' })
    }


    try {

        // 불러온 데이터 가공 & 구버전 이미지 복붙 하기!
        for (const key in copyData) {
            const val = copyData[key];
            if (val && typeof val === 'string') {
                if (copyData[key].includes('http') && copyData[key].includes('img')) {
                    const imageUrls = copyData[key].match(/https?:\/\/[^\s'"]+\.(jpg|jpeg|png|webp|gif)(\?[^\s'"]*)?/gi);
                    if (imageUrls) {
                        for (let i = 0; i < imageUrls.length; i++) {
                            try {
                                const us = imageUrls[i].split('/');
                                // 기존 이미지 절대경로 따기
                                const oldImagePath = path.join(__dirname, '..', 'subuploads', 'img', us[us.length - 2], us[us.length - 1]);
                                // 이미지 복붙 하기
                                const newImagePath = path.join(__dirname, '..', 'subuploads', 'img', body.copyDomain, us[us.length - 1]);
                                fs.copyFileSync(oldImagePath, newImagePath);

                                // 기존 데이터를 새로운 경로 데이터로 변경하기
                                const newPath = `/subimg/${body.copyDomain}/${us[us.length - 1]}`
                                copyData[key] = copyData[key].replace(imageUrls[i], newPath)
                            } catch (error) {
                                console.error(error.message);

                            }

                        }
                    }

                } else if (copyData[key].includes(body.oldDomain)) {
                    copyData[key] = copyData[key].replaceAll(body.oldDomain, body.copyDomain)
                }
            }
        }

        delete copyData.ld_id;
        delete copyData.ld_created_at;

        const queryStr = getQueryStr(copyData, 'insert', 'ld_created_at');
        console.log(queryStr);

        const insertCopyData = `INSERT INTO land (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(insertCopyData, queryStr.values);


    } catch (error) {
        console.error(error.message);

        return res.status(400).json({ message: '중복된 아이디값(도메인)이 있습니다.' })

    }


    // const getOldFolder = `./public/uploads/image/${body.copyData.hy_num}`
    //         const getNewFolder = `./public/uploads/image/${body.copyId}`;
    //         if (fs.existsSync(getOldFolder)) {
    //             fs.copySync(getOldFolder, getNewFolder);
    //         } else {
    //         }

    // >> 기존폴더 있으면 복사

    // 데이터 가공
    // 혹시 모르니까 돌면서 겸사겸사 구버전 (http 붙어있는거) 이미지 경로 체크, 있으면 리스트 만들어서 복붙 밑 문자열 변경 해주기
    // 1. 리스트로 변환 / 2. 새 값으로 만들기 / 3. 직접적으로 하나씩 replace >> 저장





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
    console.log('going to chkeck~~~~~~~~~~~~~~~~~~~~~~!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('방문자의 IP 주소:', ipAddress);
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
    console.log(body);

    let siteSetData = {}

    try {
        const loadSiteSetQuery = `SELECT * FROM land WHERE ld_domain = ?`;
        const [loadSiteSet] = await sql_con.promise().query(loadSiteSetQuery, [body.getId]);
        console.log(loadSiteSet);
        siteSetData = loadSiteSet[0]

    } catch (error) {
        console.error(error.message);

    }
    res.json({ siteSetData })
})

subdomainRouter.post('/update_site_set', async (req, res, next) => {
    console.log('들어와써?!?!');

    const body = req.body;
    console.log(body);
    try {
        const queryData = getQueryStr(body.uploadDataObj, 'update')
        console.log(queryData);
        const updateSiteSetQuery = `UPDATE land SET ${queryData.str} WHERE ld_domain = ?`

        console.log(updateSiteSetQuery);

        queryData.values.push(body.get_id)
        await sql_con.promise().query(updateSiteSetQuery, queryData.values);

    } catch (error) {
        console.error(error.message);
    }
    res.json({})
})


subdomainRouter.post('/delete_single_image_only', async (req, res, next) => {

    const delPath = req.body.deleteImagePath;
    console.log(delPath);

    try {
        fs.unlink(delPath, (err) => {
            console.log(err);
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
                console.log(err);
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
    let status = true;

    const body = req.body;

    const now = moment().format('YY/MM/DD HH:mm:ss');
    try {
        // DB 입력하기~~~
        const insertCustomerQuery = "INSERT INTO application_form (af_form_name, af_form_type_in, af_form_location, af_mb_name, af_mb_phone, af_created_at) VALUES (?,?,?,?,?,?)";
        await sql_con.promise().query(insertCustomerQuery, [body.siteName, "분양", "DB", body.name, body.phone, now]);

    } catch (error) {
        status = false;
    }

    try {
        // 매니저들에게 카톡 발송~~
        const getManagerListQuery = `SELECT * FROM users WHERE manage_estate LIKE "%${body.siteName}%"`;
        const getManagerList = await sql_con.promise().query(getManagerListQuery);
        const manager_list = getManagerList[0];
        if (manager_list && manager_list.length > 0) {
            for (let i = 0; i < manager_list.length; i++) {
                const manager = manager_list[i];
                let customerInfo = {
                    ciPhone: manager['user_phone'],
                    ciSite: body.siteName,
                    ciName: body.name,
                    ciReceiver: body.phone
                }
                aligoKakaoNotification_formanager(req, customerInfo)
            }
        }

        // 고객에게 카톡 발송~~~
        const getSiteInfoQuery = "SELECT * FROM site_list WHERE sl_site_name = ?";
        const getSiteInfo = await sql_con.promise().query(getSiteInfoQuery, [body.siteName]);
        const site_info = getSiteInfo[0][0]

        if (site_info) {
            let sendMessageObj = {
                receiver: body.phone,
                customerName: body.name,
                company: "탑분양",
                siteRealName: site_info['sl_site_realname'],
                smsContent: site_info['sl_sms_content'],
            }

            aligoKakaoNotification_detail(req, sendMessageObj)
        }
    } catch (error) {

    }
    res.json({ status })
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


