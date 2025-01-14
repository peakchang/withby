import fs from 'fs'
import moment from "moment-timezone";
import path from 'path';
import nodemailer from 'nodemailer';
import aligoapi from 'aligoapi'
moment.tz.setDefault("Asia/Seoul");

export const getQueryStr = (data, type, addTimeStr = '') => {
    let returnData = {
        str: '',
        question: '',
        values: []
    }
    if (type == 'insert') {

        for (const key in data) {
            returnData['str'] = returnData['str'] + `${key},`
            returnData['question'] = returnData['question'] + `?,`
            returnData['values'].push(data[key])
        }

        if (addTimeStr) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss')

            console.log(returnData['str']);
            returnData['str'] = returnData['str'] + addTimeStr;
            console.log(returnData['str']);
            returnData['question'] = returnData['question'] + '?';
            returnData['values'].push(now)
        } else {
            returnData['str'] = returnData['str'].replace(/,$/, '');
            returnData['question'] = returnData['question'].replace(/,$/, '');
        }

    } else if (type == 'update') {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        for (const key in data) {
            returnData['str'] = returnData['str'] + `${key}=?,`
            returnData['values'].push(data[key])
        }

        if (addTimeStr) {
            returnData['str'] = returnData['str'] + `${addTimeStr} = ?`;
            returnData['values'].push(now)
        } else {
            returnData['str'] = returnData['str'].replace(/,$/, '');
        }

    }

    return returnData;
}


export function deleteFolder(folderPath) {
    const targetPath = path.resolve(folderPath);

    if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`${targetPath} 폴더를 삭제했습니다.`);
    } else {
        console.log(`${targetPath} 폴더가 존재하지 않습니다.`);
    }
}


export function mailSender(reciever, subject, content) {

    var transporter = nodemailer.createTransport({
        service: 'naver',   // 메일 보내는 곳
        prot: 465,
        host: 'smtp.naver.com',
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.N_MAIL_ID,
            pass: process.env.N_MAIL_PWD
        }
    });
    // 메일 옵션
    var mailOptions = {
        from: `${process.env.N_MAIL_ID}@naver.com`, // 보내는 메일의 주소
        to: reciever, // 수신할 이메일
        subject: subject, // 메일 제목
        text: content // 메일 내용
    };

    // 메일 발송    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


export async function aligoKakaoNotification_formanager(req, customerInfo) {

    console.log('Kakao Message Send Is Started!!!!!!!!!!!!!!!!');
    console.log(process.env.ALIGOKEY);
    console.log(process.env.ALIGOID);
    console.log(process.env.ALIGO_SENDERKEY);

    try {
        const AuthData = {
            apikey: process.env.ALIGOKEY,
            // 이곳에 발급받으신 api key를 입력하세요
            userid: process.env.ALIGOID,
            // 이곳에 userid를 입력하세요
        }

        req.body = {
            type: 'i',  // 유효시간 타입 코드 // y(년), m(월), d(일), h(시), i(분), s(초)
            time: 1, // 유효시간
        }
        // console.log('req.body', req.body)

        const result = await new Promise((resolve, reject) => {
            if (true) {
                aligoapi.token(req, AuthData)
                    .then((r) => {
                        // console.log('alligo', r);
                        resolve(r);
                    })
                    .catch((e) => {
                        // console.error('err', e)
                        reject(e)
                    })
            } else {
                // console.log(2)
                resolve(true)
            }
        })

        console.log(result);


        console.log(customerInfo);

        req.body = {
            senderkey: process.env.ALIGO_SENDERKEY,
            tpl_code: 'TX_0641',
            token: result.token,
            sender: '010-6628-6651',
            receiver_1: customerInfo.ciPhone,
            subject_1: '분양정보 신청고객 알림톡',
            message_1: `고객 접수 안내!\n${customerInfo.ciSite} ${customerInfo.ciName} 접수되었습니다.\n고객 번호 : ${customerInfo.ciReceiver}`,

        }



        // console.log(req.body);

        let resultSend = await new Promise((resolve, reject) => {
            if (true) {

                // console.log('kakao send arrived~~!!');
                // console.log(req.body);
                // console.log(AuthData);
                aligoapi.alimtalkSend(req, AuthData).then((r) => {
                    // console.log('alligo', r);
                    console.log('kakao send is success!!!!!!!!!!!!');
                    resolve(true);
                }).catch((e) => {
                    console.error('err', e)
                    console.log('kakao send is false T.T');
                    reject(false);
                })
            } else {
                console.log('kakao send is false T.T');
                // console.log(2)
                resolve(true)
            }
        })
    } catch (e) {
        // await db.rollback(connection);
        // next(e);
        console.error(e.message);
        console.log('kakao send is error!!!! (in back lib) T.T');

    }
}


export async function aligoKakaoNotification_detail(req, sendMessageObj) {
    try {
        const AuthData = {
            apikey: process.env.ALIGOKEY,
            // 이곳에 발급받으신 api key를 입력하세요
            userid: process.env.ALIGOID,
            // 이곳에 userid를 입력하세요
        }

        req.body = {
            type: 'i',  // 유효시간 타입 코드 // y(년), m(월), d(일), h(시), i(분), s(초)
            time: 1, // 유효시간
        }
        // console.log('req.body', req.body)

        const result = await new Promise((resolve, reject) => {
            if (true) {
                aligoapi.token(req, AuthData)
                    .then((r) => {
                        // console.log('alligo', r);
                        resolve(r);
                    })
                    .catch((e) => {
                        // console.error('err', e)
                        reject(e)
                    })
            } else {
                // console.log(2)
                resolve(true)
            }
        })

        req.body = {
            senderkey: process.env.ALIGO_SENDERKEY,
            tpl_code: 'TQ_7435',
            token: result.token,
            sender: '010-4478-1127',
            receiver_1: sendMessageObj.receiver,
            subject_1: '분양정보 신청고객 알림톡',
            message_1: `${sendMessageObj.customerName}님!
  안녕하세요. [${sendMessageObj.company}] 입니다 !
  ${sendMessageObj.siteRealName}에 문의 주셧네요!
        
  ${sendMessageObj.smsContent}
        
  현장 "무료상담"은 정상적으로 접수 되셧구요!
  부동산 정보는 많이 알아두시는게 좋습니다!
  잠시 후 연락드리겠습니다!
  
  `,
        }

        // console.log(req.body);

        let resultSend = await new Promise((resolve, reject) => {
            if (true) {
                console.log('kakao send arrived~~!!');
                console.log(req.body);
                console.log(AuthData);
                aligoapi.alimtalkSend(req, AuthData).then((r) => {
                    // console.log('alligo', r);
                    console.log('kakao send is success!!!!!!!!!!!!');
                    resolve(true);
                }).catch((e) => {
                    console.error('err', e)
                    console.log('kakao send is false T.T');
                    reject(false);
                })
            } else {
                console.log('kakao send is false T.T');
                // console.log(2)
                resolve(true)
            }
        })
    } catch (e) {
        // await db.rollback(connection);
        // next(e);
        console.error(e);
    }
}