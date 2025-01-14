import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"
import moment from "moment-timezone";
import { user_info } from "$src/lib/store.js";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    let site_count_info_list = [];
    let dateArr = [];
    // let nowPage = 
    let pageList = [];

    let now_page = url.searchParams.get('page')

    let startDate = url.searchParams.get('sd');
    let endDate = url.searchParams.get('ed');
    let search = url.searchParams.get('search');

    let allPageCount = 0;

    let loading = false;
    try {
        const res = await axios.post(`${back_api}/dbcount`, { now_page, startDate, endDate, search })
        if (res.status === 200) {
            site_count_info_list = res.data.site_count_info_list;
            dateArr = res.data.dateArray;
            pageList = res.data.page_list;
            allPageCount = res.data.allPageCount

        }
    } catch (error) {

    }
    return { site_count_info_list, dateArr, pageList, loading, allPageCount }
}

