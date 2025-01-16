import express from "express";
import { sql_con } from '../back-lib/db.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment-timezone";
import multer from "multer";
import path from "path";
import fs from "fs";

const SECRET_KEY = "yourSecretKey"; // JWT 서명 키

// JWT 생성 함수
function generateToken(user_info) {
    return jwt.sign({ id: user_info.userid }, SECRET_KEY, {
        expiresIn: "3h", // 토큰 만료 시간 설정
    });
}

// 인증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token required" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user; // 인증된 사용자 정보 저장
        next();
    });
}


const authRouter = express.Router();

authRouter.get("/token", async (req, res) => {
    const cookies = req.cookies

    res.json({ status: true })
})


authRouter.post("/logout", async (req, res) => {
    const token = req.cookies.tk;
    const userid = req.body.userid;



    try {
        res.clearCookie("tk", {
            httpOnly: true,
            secure: false, // HTTPS 환경에서는 true로 설정
            sameSite: "Lax",
        });
        const logoutQuery = "UPDATE users SET refresh_token = ? WHERE userid = ?"
        await sql_con.promise().query(logoutQuery, [null, userid]);
    } catch (err) {
        console.error(err.message);
    }


    res.json({})
})

// 회원가입 엔드포인트
authRouter.post("/register", async (req, res) => {


    const { userid, user_email, user_phone, nick, password } = req.body;

    try {
        // 먼저 유저 아이디 중복 체크 (프론트에서 했지만 추가로 확인)
        const existingUserChkQuery = "SELECT * FROM users WHERE userid = ?";
        const [existUserRows] = await sql_con.promise().query(existingUserChkQuery, [userid]);

        // 유저 아이디 있으면 리턴
        if (existUserRows.length > 0) {
            return res.status(400).json({ message: "유저 아이디가 중복됩니다. 아이디를 확인 해주세요" });
        }

        // 이메일도 중복체크
        const existingEmailChkQuery = "SELECT * FROM users WHERE user_email = ?";
        const [existingEmail] = await sql_con.promise().query(existingEmailChkQuery, [user_email]);

        if (existingEmail.length > 0) {
            return res.status(400).json({ message: "유저 이메일이 중복됩니다. 이메일을 확인 해주세요" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = "INSERT INTO users (userid, user_email, user_phone, nick, password) VALUES (?,?,?,?,?)";
        await sql_con.promise().query(insertUserQuery, [userid, user_email, user_phone, nick, hashedPassword]);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ message: "오류가 발생 했습니다." });
    }

});



authRouter.post("/login", async (req, res) => {

    const { userid, password } = req.body;


    try {
        // 유저 아이디 있는지 확인
        const getUserInfoQuery = "SELECT * FROM users WHERE userid = ?";
        const [userRows] = await sql_con.promise().query(getUserInfoQuery, [userid]);

        // 있으면 작업 GO / 없으면 리턴~
        if (userRows.length > 0) {

            // 비밀번호 동일한지 체크
            const userInfo = userRows[0];
            const pwdChkBool = bcrypt.compareSync(password, userInfo.password)
            // 동일하면 GO / 없으면 리턴~
            if (pwdChkBool) {

                // 액세스 토큰과 리프레쉬 토큰 발행
                const token = jwt.sign({ id: userInfo.id }, SECRET_KEY, { expiresIn: "7d" });

                const updateQuery = "UPDATE users SET refresh_token = ? WHERE id = ?";
                await sql_con.promise().query(updateQuery, [token, userInfo.id]);

                console.log('여기까지는 오지??!1');
                
                // if(process.env.NODE_ENV == 'production') {
                //     res.cookie("tk", refreshToken, { httpOnly: true, secure: true });
                // }else{
                //     res.cookie("tk", token, { httpOnly: true, secure: false, sameSite: 'lax' });
                // }

                res.cookie("tk", token, { httpOnly: true, secure: false, sameSite: 'lax' });
                
                return res.json({});

            } else {
                return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
            }

        } else {
            return res.status(400).json({ message: "가입된 아이디가 없습니다." });
        }

    } catch (err) {
        console.error(err.message);
    }
    return res.json({});
});

authRouter.post('/id_duplicate_chk', async (req, res) => {
    const { userId } = req.body;
    try {
        const chkUserQuery = "SELECT * FROM users WHERE userid = ?";
        const [userRows] = await sql_con.promise().query(chkUserQuery, [userId]);
        const exists = userRows.length > 0;
        res.json({ exists });
    } catch (error) {
        console.error("오류 발생:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
})

authRouter.get('/', (req, res) => {
    res.send('asldfjalisjdfliajsdf')
})





export { authRouter }