import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from '../back-lib/lib.js';
import moment from "moment-timezone";

const adminDbCount = express.Router();




// chkRateMaster
adminDbCount.use('/', async (req, res, next) => {

    let site_list = [];
    const site_count_info_list = [];
    let page_list = [];
    let allPageCount = 0

    const query = req.query
    const body = req.body;
    const nowPage = Number(body.now_page) || 1;



    // 기본 시작 날짜 구하기 (받은 sd 쿼리값 없으면)
    const today = moment().format('YYYY-MM-DD')

    // 기본 끝 날짜 구하기 (받은 ed 쿼리값 없으면)
    const threeDaysAgo = moment().subtract(4, 'days').format('YYYY-MM-DD')


    // 구하기 구하기!!!

    const startSearchDate = body.startDate || threeDaysAgo;
    const endSearchDate = body.endDate || today;

    let addFormQuery = ""
    if (startSearchDate && endSearchDate) {
        addFormQuery = ` AND af_created_at BETWEEN '${startSearchDate} 00:00:00' AND '${endSearchDate} 23:59:59'`;
    }

    const searchStr = body.search;
    let addSearchQuery = ""
    if (searchStr) {
        addSearchQuery = addSearchQuery + ` WHERE sl_site_name LIKE '%${searchStr}%'`
    }

    try {

        const getSiteCountQuery = `SELECT COUNT(*) AS site_count FROM site_list ${addSearchQuery}`
        const [all_count] = await sql_con.promise().query(getSiteCountQuery);

        const allCount = all_count[0]['site_count']
        allPageCount = Math.ceil(allCount / 30);
        const startNum = (nowPage - 1) * 30;

        const getSiteListQuery = `SELECT * FROM site_list ${addSearchQuery} ORDER BY sl_id DESC LIMIT ${startNum}, 15;`
        const [rows] = await sql_con.promise().query(getSiteListQuery);

        site_list = rows;
        page_list = getPaginationArray(nowPage, allPageCount)




        for (let i = 0; i < site_list.length; i++) {
            const siteInfo = site_list[i];
            const getSiteDbQuery = `SELECT * FROM application_form WHERE af_form_name = ? ${addFormQuery};`

            const [dbRows] = await sql_con.promise().query(getSiteDbQuery, [siteInfo.sl_site_name]);


            const result = {
                form_name: siteInfo['sl_site_name'],
                all_count: dbRows.length,
                db_list: []
            };

            result.db_list = processDateCounts(dbRows)

            site_count_info_list.push(result);
        }
    } catch (err) {
        console.error(err.message);

    }



    const dateArrayTemp = getDateRangeArray(startSearchDate, endSearchDate);
    const dateArray = dateArrayTemp.reverse();

    res.json({ site_count_info_list, dateArray, page_list, nowPage, allPageCount });
})


// 시작 일자와 끝 일자 기준으로 날짜 배열 만들어주는 함수
function getDateRangeArray(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];

    while (start <= end) {
        const formattedDate = `${start.getFullYear().toString().slice(2)}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        dateArray.push(formattedDate);

        // 다음 날로 이동
        start.setDate(start.getDate() + 1);
    }

    return dateArray;
}

// 가져온 DB 를 날짜와 갯수를 key로 가진 객체 배열로 만들어주는 함수
function processDateCountsPrev(data) {
    const result = {};

    data.forEach(item => {
        // af_created_at에 9시간을 추가
        const date = new Date(item.af_created_at);
        date.setHours(date.getHours());
        // 날짜를 'YY-MM-DD' 형식으로 변환
        const formattedDate = `${date.getFullYear().toString().slice(2)}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        // 날짜별로 카운트 계산
        if (result[formattedDate]) {
            result[formattedDate]++;
        } else {
            result[formattedDate] = 1;
        }
    });

    // 결과를 원하는 배열 형식으로 변환
    return Object.entries(result).map(([date, count]) => ({ date, count }));
}


function processDateCounts(data) {
    const dateCounts = {};

    data.forEach(item => {
        // 날짜를 'YY-MM-DD' 형식으로 변환
        const date = new Date(item.af_created_at);
        const formattedDate = `${date.getFullYear().toString().slice(2)}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // 날짜별로 중복 제거를 위한 Set을 생성하거나 가져옴
        if (!dateCounts[formattedDate]) {
            dateCounts[formattedDate] = new Set();
        }

        // Set에 af_mb_phone 추가 (중복 제거됨)
        dateCounts[formattedDate].add(item.af_mb_phone);
    });

    // 날짜별로 count를 계산하여 원하는 형식의 배열로 반환
    return Object.entries(dateCounts).map(([date, phonesSet]) => ({
        date,
        count: phonesSet.size
    }));
}

// 페이징 배열 구하는 함수

function getPaginationArray(currentPage, totalPages) {
    const maxVisiblePages = 10;
    let startPage, endPage;

    if (currentPage <= 5) {
        // 첫 5페이지일 경우
        startPage = 1;
        endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage > totalPages - 5) {
        // 마지막 5페이지일 경우
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        endPage = totalPages;
    } else {
        // 중간 페이지들
        startPage = currentPage - 4;
        endPage = currentPage + 5;
    }

    const paginationArray = [];
    for (let i = startPage; i <= endPage; i++) {
        paginationArray.push(i);
    }

    return paginationArray;
}


export { adminDbCount }