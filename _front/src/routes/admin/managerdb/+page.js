import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"
import moment from "moment-timezone";
import { user_info } from "$src/lib/store.js";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    let manager_id = ""
    user_info.subscribe((e) => {
        if (e.rate == '5') {
            manager_id = 'masters'
        } else {
            manager_id = e.id
        }
    })





    const start_date = url.searchParams.get('sd') || moment().startOf("month").format('YYYY-MM-DD')
    const end_date = url.searchParams.get('ed') || moment().format('YYYY-MM-DD')
    const nowPage = url.searchParams.get('page') || 1;
    const one_page_count = url.searchParams.get('pagecount') || 30;
    const filterSite = url.searchParams.get('filtersite') || "";
    const setSite = url.searchParams.get('setsite') || "";
    const setStatus = url.searchParams.get('setstatus') || "";
    let reverseIdxArr = [];

    // const search = url.searchParams.get('search');
    let pageArr = []
    let datas = [];
    let allPage = 0;
    let allCount = 0;

    let statusArr = [];
    let colorArr = [];

    let site_list = [];


    try {
        const res = await axios.post(`${back_api}/managerdb/load_data`, { start_date, end_date, nowPage, one_page_count, filterSite, setSite, setStatus, manager_id })
        if (res.status == 200) {
            datas = res.data.datas;
            allPage = res.data.allPage;
            pageArr = getPagination(parseInt(nowPage), allPage);
            allCount = res.data.allCount;
            const reverseStartCount = allCount - ((nowPage - 1) * one_page_count)
            reverseIdxArr = Array.from({ length: one_page_count }, (_, i) => reverseStartCount - i);

            statusArr = res.data.status_list;
            colorArr = res.data.status_color_list;

            site_list = res.data.site_list;

        }
    } catch (error) {

    }


    // 객체에 색깔 지정해서 넣기
    for (let i = 0; i < datas.length; i++) {
        if (datas[i]['af_mb_status']) {
            datas[i]['bg_color'] = getColorByStatus(datas[i]['af_mb_status'], statusArr, colorArr)
        }
    }
    return { datas, pageArr, reverseIdxArr, site_list, statusArr, allPage }
}



function getColorByStatus(status, statusArr, colorArr) {
    const index = statusArr.indexOf(status);
    return index !== -1 ? colorArr[index] : null;
}