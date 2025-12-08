import express from "express";
import { Storage } from "@google-cloud/storage";
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import moment from "moment-timezone";

const imageRouter = express.Router();

// GCS 클라이언트 초기화
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Multer 설정 (메모리에 임시 저장)
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
    fileFilter: (req, file, cb) => {
        console.log(file);

        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

// 이미지 업로드시 
imageRouter.post('/gcs_upload_single', imageUpload.single('onimg'), async (req, res, next) => {



    let saveUrl = ""
    const body = req.body;
    const { type, folder } = req.body
    const now = moment().format('YYMMDD')

    console.log(req.file);
    console.log(body);

    console.log('일단 들어와?!?!?!');

    try {
        if (!req.file) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        // 고유한 파일명 생성
        if (type == 'date') {
            saveUrl = `${folder}/imgs${now}/${req.file.originalname}`
        } else {
            saveUrl = `${folder}/${req.file.originalname}`
        }

        // GCS에 파일 업로드
        const blob = bucket.file(saveUrl);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error('업로드 에러:', err);
            res.status(500).json({ error: '업로드 실패' });
        });

        blobStream.on('finish', async () => {
            // 파일을 공개로 설정 (선택사항)
            await blob.makePublic();

            res.status(200).json({
                message: '업로드 성공',
                saveUrl,
            });
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('서버 에러:', error);
        res.status(500).json({ error: '서버 에러 발생' });
    }
})

// 여러 이미지 업로드
imageRouter.post('/gcs_upload_multiple', imageUpload.array('onimg', 10), async (req, res, next) => {

    console.log('일단 멀티플 이미지 업로드 진입은 하니?!??!');

    const body = req.body;
    const { type, folder } = req.body;
    const now = moment().format('YYMMDD');

    console.log(req.files);
    console.log(body);

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        // 모든 파일 업로드를 Promise 배열로 처리
        const uploadPromises = req.files.map((file, index) => {
            return new Promise(async (resolve, reject) => {
                let saveUrl = "";

                // 파일명 생성
                if (type === 'date') {
                    saveUrl = `${folder}/imgs${now}/${file.originalname}`;
                } else {
                    saveUrl = `${folder}/${file.originalname}`;
                }

                // GCS에 파일 업로드
                const blob = bucket.file(saveUrl);
                console.log(saveUrl);

                const blobStream = blob.createWriteStream({
                    resumable: false,
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                blobStream.on('error', (err) => {
                    console.error(`파일 ${index + 1} 업로드 에러:`, err);
                    reject({ error: `파일 ${index + 1} 업로드 실패`, fileName: file.originalname });
                });

                blobStream.on('finish', async () => {
                    try {
                        // signd Url 로 하는거
                        // const [url] = await blob.getSignedUrl({
                        //     action: 'read',
                        //     expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1년
                        // });

                        await blob.makePublic();

                        resolve({
                            saveUrl,
                            originalName: file.originalname,
                        });
                    } catch (err) {
                        reject({ error: '공개 URL 생성 실패', fileName: file.originalname });
                    }
                });

                blobStream.end(file.buffer);
            });
        });

        // 모든 업로드 완료 대기
        const results = await Promise.all(uploadPromises);

        console.log(type);
        console.log(folder);

        res.status(200).json({
            message: '업로드 성공',
            files: results,
            count: results.length,
        });

    } catch (error) {
        console.error('서버 에러:', error);
        res.status(500).json({ error: '서버 에러 발생', details: error.message });
    }
});


imageRouter.post('/delete_gcs_img', async (req, res, next) => {

    console.log('일단 들어 오니?!?!');

    const { delPath } = req.body;

    console.log('delPath는?!?!??!?!?!?!?!!');

    console.log(delPath);

    // 기존 파일 삭제
    if (delPath.includes('subimg')) {
        try {
            const delPathArr = delPath.split('/');
            const delFolder = delPathArr[delPathArr.length - 2];
            const delFileName = delPathArr[delPathArr.length - 1];
            const delPathLocal = path.join('./subuploads', 'img', delFolder, delFileName);

            fs.unlink(delPathLocal, (err) => {
                console.error(err);
            })
        } catch (error) {
            return res.status(400).json({})
        }
    } else {
        const bucketName = process.env.GCS_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);
        try {
            await bucket.file(delPath).delete()
        } catch (error) {
            console.error(error.message);
            return res.status(400).json({})
        }
    }

    return res.status(200).json({})
})


imageRouter.post('/delete_gcs_img_many', async (req, res, next) => {
    const delImgList = req.body.delImgList

    for (let i = 0; i < delImgList.length; i++) {
        const delPath = delImgList[i];

        const bucketName = process.env.GCS_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);
        try {
            await bucket.file(delPath).delete()
        } catch (error) {
            console.error(error.message);
        }
    }
    return res.json({})
})


imageRouter.get('/chk', async (req, res, next) => {
    res.send("asdlfjalsidjfliasj")
})

export { imageRouter }