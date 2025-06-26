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


0626
ALTER TABLE hy_site ADD COLUMN hy_manage_site VARCHAR(100) AFTER hy_title;



CREATE TABLE IF NOT EXISTS land (
    ld_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ld_domain VARCHAR(50),
    ld_site VARCHAR(100),
    ld_menu VARCHAR(255),
    ld_name VARCHAR(100),
    ld_location VARCHAR(50),
    ld_description VARCHAR(255),
    ld_add_scripts TEXT,
    ld_db_input_subject VARCHAR(10),
    ld_invite_message TEXT,
    ld_logo VARCHAR(100),
    ld_ph_img VARCHAR(100),
    ld_bgcolor VARCHAR(50),
    ld_txtcolor VARCHAR(50),
    ld_manager_email VARCHAR(100),
    ld_phone_num VARCHAR(100),
    ld_sms_num VARCHAR(100),
    ld_kakao VARCHAR(255),
    ld_banner_img TEXT,
    ld_main_img TEXT,
    ld_card_image TEXT,
    ld_invite_image VARCHAR(250),
    ld_pg0 TEXT,
    ld_pg1 TEXT,
    ld_pg2 TEXT,
    ld_pg3 TEXT,
    ld_pg4 TEXT,
    ld_popup_img VARCHAR(255),
    ld_mobile_bt_event_img VARCHAR(255),
    ld_mobile_bt_phone_img VARCHAR(255),
    ld_event_img VARCHAR(255),
    ld_db_location VARCHAR(10),
    ld_visit_count INT DEFAULT 0,
    ld_call_clickcount INT DEFAULT 0,
    ld_sms_clickcount INT DEFAULT 0,
    ld_sms_content VARCHAR(255),
    ld_footer TEXT,
    ld_ft_name VARCHAR(50),
    ld_ft_phone VARCHAR(50),
    ld_ft_address VARCHAR(50),
    ld_json_header TEXT,
    ld_json_main TEXT,
    ld_json_menus TEXT,
    ld_personal_info_view VARCHAR(10),
    ld_view_type VARCHAR(10),
    ld_created_at DATETIME DEFAULT NULL
);


*/