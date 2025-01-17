import express from "express";

import { mailSender } from "../back-lib/lib.js";
import { sql_con } from "../back-lib/db.js";
import { aligoKakaoNotification_detail, aligoKakaoNotification_formanager } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const zapierRouter = express.Router();
const AuthData = {
    key: 'jt7j3tl1dopaogmoauhoc68wrry0wswc',
    // 이곳에 발급받으신 api key를 입력하세요
    user_id: 'adpeaka',
    // 이곳에 userid를 입력하세요
}

zapierRouter.get('/', (req, res) => {
    let status = true;
    res.json({ status })
});

zapierRouter.post('/', async (req, res) => {
    let status = true;
    const body = req.body;
    try {
        const get_temp_phone = body['raw__phone_number'];
        let get_phone = get_temp_phone
        try {
            get_phone = get_temp_phone.replace('+82', '').replace(/[^0-9]/g, "");
            if (get_phone.charAt(0) != '0') {
                get_phone = `0${get_phone}`
            }
        } catch (error) {
            console.error(error.message);
        }

        const nowStr = moment().format('YYYY-MM-DD HH:mm:ss');

        const get_form_name = body['form_name']
        var reFormName = get_form_name.replace(/[a-zA-Z\(\)\-\s]/g, '')

        // 조회 먼저 해 보고 만약 기존 DB와 겹치면 패스하기

        try {
            const chkFor2WeeksDataQuery = "SELECT * FROM application_form WHERE af_mb_phone = ? AND af_form_name = ? AND af_created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);"
            const chkFor2WeeksData = await sql_con.promise().query(chkFor2WeeksDataQuery, [get_phone]);

            // 테스트때는 잠시 주석!
            // if (chkFor2WeeksData[0].length > 0) {
            //     return res.sendStatus(200);
            // }
        } catch (error) {
            console.error(error.message);
        }

        // 사이트 리스트에 조회해서 먼저 넣기

        const chkFormInSiteListSql = `SELECT * FROM site_list WHERE sl_site_name = ?`;
        const chkFormInSiteListData = await sql_con.promise().query(chkFormInSiteListSql, [reFormName]);
        const chkFormInSiteList = chkFormInSiteListData[0][0]

        console.log(chkFormInSiteList);
        


        if (!chkFormInSiteList) {
            const addFormInSiteList = `INSERT INTO site_list (sl_site_name, sl_created_at) VALUES (?, ?)`
            await sql_con.promise().query(addFormInSiteList, [reFormName, nowStr]);
        }

        // etc 리스트 찾기
        let etcInsertStr = '';
        let etcValuesStr = '';
        let addEtcMessage = '';

        for (const key in body) {
            if (key.includes('raw__etc1')) {
                etcInsertStr = etcInsertStr + `, af_mb_etc1`;
                etcValuesStr = etcValuesStr + `, '${body[key]}'`;
                addEtcMessage = addEtcMessage + `// 기타 정보1 : ${body[key]}`
            } else if (key.includes('raw__etc2')) {
                etcInsertStr = etcInsertStr + `, af_mb_etc2`;
                etcValuesStr = etcValuesStr + `, '${body[key]}'`;
                addEtcMessage = addEtcMessage + `// 기타 정보2 : ${body[key]}`
            } else if (key.includes('raw__etc3')) {
                etcInsertStr = etcInsertStr + `, af_mb_etc3`;
                etcValuesStr = etcValuesStr + `, '${body[key]}'`;
                addEtcMessage = addEtcMessage + `// 기타 정보3 : ${body[key]}`
            }
        }

        const values = [reFormName, '분양', 'FB', body['raw__full_name'], get_phone, '', nowStr]

        // 폼 insert 하기!!
        formInertSql = `INSERT INTO application_form (af_form_name, af_form_type_in, af_form_location, af_mb_name, af_mb_phone, af_mb_status ${etcInsertStr}, af_created_at) VALUES (?,?,?,?,?,? ${etcValuesStr},?);`;
        await sql_con.promise().query(formInertSql, values)

        // 해당 폼네임에 저장된 담당자 리스트 찾기
        const userFindSql = `SELECT * FROM users WHERE manage_estate LIKE '%${reFormName}%';`;
        const findUserData = await sql_con.promise().query(userFindSql);
        const findUser = findUserData[0];

        // 담당자들 에게 이메일 발송
        for await (const goUser of findUser) {
            const mailSubjectManager = `${reFormName} / ${body['raw__full_name']} 고객 DB 접수되었습니다.`;
            const mailContentManager = `현장 : ${reFormName} / 이름 : ${body['raw__full_name']} / 전화번호 : ${get_phone} ${addEtcMessage}`;
            mailSender.sendEmail(goUser.user_email, mailSubjectManager, mailContentManager);
        }

        // 최고관리자에게 이메일 발송
        const mailSubject = `(리치분양 접수) ${reFormName} 고객명 ${body['raw__full_name']} 접수되었습니다.`;
        const mailContent = `현장: ${reFormName} / 이름 : ${body['raw__full_name']} / 전화번호 : ${get_phone} ${addEtcMessage}`;
        mailSender.sendEmail('adpeak@naver.com', mailSubject, mailContent);
        mailSender.sendEmail('changyong112@naver.com', mailSubject, mailContent);

        // 현장명 찾기!!!
        const getSiteInfoSql = `SELECT * FROM site_list WHERE sl_site_name = ?`
        const getSiteInfoData = await sql_con.promise().query(getSiteInfoSql, [reFormName])
        const getSiteInfo = getSiteInfoData[0][0];


        if (getSiteInfo.sl_site_link) {
            var siteList = getSiteInfo.sl_site_link
        } else {
            var siteList = '정보없음'
        }

        const receiverStr = `${get_phone} ${addEtcMessage}`

        let dbName = body['raw__full_name']
        const cleanText = dbName.replace(/[^\w\s.,!@#$%^&*()_\-+=\[\]{}|;:'"<>?\\/가-힣]/g, '');
        const containsKoreanOrEnglish = /[A-Za-z\uAC00-\uD7A3]/.test(cleanText);

        if (containsKoreanOrEnglish) {
            dbName = cleanText
        } else {
            dbName = '성함 미입력'
        }

        var customerInfo = { ciName: dbName, ciCompany: '리치분양', ciSite: getSiteInfo.sl_site_name, ciSiteLink: siteList, ciReceiver: receiverStr }

        // 매니저한테 알림톡 / 문자 발송
        for (let oo = 0; oo < findUser.length; oo++) {
            const managerPhone = findUser[oo].user_phone
            if (managerPhone.includes('010')) {
                customerInfo['ciPhone'] = managerPhone
                // console.log(customerInfo);
                try {
                    aligoKakaoNotification_formanager(req, customerInfo)
                } catch (e) {
                    console.error(e.message);
                }


                // const resMessage = `리치분양 고객 인입 안내! ${getSiteInfo.sl_site_name} 현장 / ${dbName}님 접수되었습니다! 고객 번호 : ${receiverStr}`

                // req.body = {
                //     sender: '010-3124-1105',
                //     receiver: managerPhone,
                //     msg: resMessage,
                //     msg_type: 'LMS'
                // }

                // try {
                //     const aligo_res = await aligoapi.send(req, AuthData)
                //     console.log(aligo_res);

                // } catch (err) {
                //     console.error(err.message);
                // }

            }
        }


        // 여기서 고객에게 보낼 알림톡 발송!!!

        // try {
        //     const getSendContentQuery = "SELECT * FROM site_list WHERE sl_site_name = ?"
        //     const getSendContent = await sql_con.promise().query(getSendContentQuery, [getSiteInfo.sl_site_name])
        //     const sendRealSiteName = getSendContent[0][0]['sl_site_realname']
        //     const sendContent = getSendContent[0][0]['sl_sms_content']
        //     if (sendRealSiteName && sendContent) {
        //         const detailSendContent = {
        //             receiver: get_phone,
        //             ciName: body['raw__full_name'],
        //             ciCompany: "리치분양",
        //             ciSite: sendRealSiteName,
        //             smsContent: sendContent
        //         }
        //         // aligoKakaoNotification_detail(req, detailSendContent)
        //     }

        // } catch (error) {
        //     console.error(error.message);
        // }

        // 알림톡 발송 끝~~~~
        return res.sendStatus(200);

    } catch (err) {
        console.error(err.message);
        status = false;
    }


    res.json({ status })
});



export { zapierRouter }