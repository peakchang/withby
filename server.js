import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
import { sql_con } from './back-lib/db.js'
import cookieParser from "cookie-parser"

dotenv.config();

import { handler } from "./_front/build/handler.js"

import { mainRouter } from './routes/main.js';
import { minisiteRouter } from './routes/admin_minisite.js'
import { adminBaseRouter } from "./routes/admin_base.js"
import { userManageRouter } from './routes/admin_user.js';
import { adminAllDbRouter } from './routes/admin_alldb.js';
import { adminManagerDbRouter } from './routes/admin_managerdb.js';
import { adminDbCount } from './routes/admin_dbcount.js';

import { apiRouter } from "./routes/api.js"
import { authRouter } from "./routes/auth.js"

import { webhookRouter } from './routes/webhook.js';
import { zapierRouter } from './routes/zapier.js';

import { subdomainRouter } from './routes/subdomain.js';

import { imageRouter } from './routes/image.js'

// import { apiRouter } from "./routes/exapi.js"
app.use(cookieParser());
app.set('port', process.env.PORT || 3060);
app.set('trust proxy', '127.0.0.1');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ESM 오류 해결을 위해 __dirname, __filename 직접 변수 작성
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.use(express.static('public', { ignore: ['favicon.ico'] }));
app.use('/editor', express.static(path.join(__dirname, 'public/uploads/editor')));
app.use('/img', express.static(path.join(__dirname, 'public/uploads/image')));
app.use('/py_img', express.static(path.join(__dirname, 'public/uploads/pyimg')));
app.use('/subimg', express.static(path.join(__dirname, 'subuploads/img')));

// let originLink;


// if (process.env.NODE_ENV === 'production') {
//     let whiteListArr = [];
//     const whiteListStr = process.env.SITE_LINK
//     if (whiteListStr) {
//         whiteListArr = whiteListStr.split(',');
//     }
// } else {
//     originLink = "http://localhost:5173";
// }

let corsOptions = {
    // origin: /\.adpeak\.kr$/,
    origin: true,
    credentials: true
}
app.use(cors(corsOptions));

// app.enable('trust proxy');

app.use('/api/v3', apiRouter);

app.use('/api/v3/main', mainRouter);
app.use('/api/v3/auth', authRouter);
app.use('/api/v3/adminbase', adminBaseRouter);
app.use('/api/v3/minisite', minisiteRouter);
app.use('/api/v3/usermanage', userManageRouter);
app.use('/api/v3/alldb', adminAllDbRouter);
app.use('/api/v3/managerdb', adminManagerDbRouter);
app.use('/api/v3/dbcount', adminDbCount);

app.use('/api/v3/image', imageRouter);

app.use('/webhook', webhookRouter);
app.use('/zapier', zapierRouter);


app.use('/api/subdomain', subdomainRouter);


app.use('/chk', (req, res) => {
    res.send('백엔드 생성 완료~~~~~~~~~!!')
});
app.use(handler);


app.listen(app.get('port'), () => {
    console.log(`server running in port ${app.get('port')}`);
})