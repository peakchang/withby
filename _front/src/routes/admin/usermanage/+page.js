import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"


// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    const nowPage = url.searchParams.get('page') || 1;

    let userRate = url.searchParams.get('user_rate') || "";
    let searchName = url.searchParams.get('search_name') || "";
    let searchEmail = url.searchParams.get('search_email') || "";

    let pageArr = []
    let user_datas = [];
    let manager_datas = [];
    let allPage = 0;
    try {
        const res = await axios.post(`${back_api}/usermanage/load_users`, { nowPage, userRate, searchName, searchEmail })
        if (res.status == 200) {
            user_datas = res.data.user_datas
            manager_datas = res.data.manager_datas
            pageArr = getPagination(parseInt(nowPage), res.data.allPage);
            allPage = res.data.allPage;
        }
    } catch (error) {

    }
    return { user_datas, manager_datas, pageArr, allPage }
}