import mysql, {} from "mysql2"
import dotenv from "dotenv"
dotenv.config();


export const sql_con = mysql.createConnection({
    host: process.env.HOST || '127.0.0.1',
    user: 'root',
    password: process.env.DBPWD,
    database: process.env.SCHEMA
})


/*




ALTER TABLE users ADD COLUMN refresh_token TEXT DEFAULT NULL;
ALTER TABLE hy_site MODIFY COLUMN hy_main_image VARCHAR(255);
ALTER TABLE hy_site MODIFY COLUMN hy_card_image VARCHAR(255);


*/