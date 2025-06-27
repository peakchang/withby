import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    console.log('불러오기!!!!');
    
    const nowPage = url.searchParams.get('page') || 1;
    const search = url.searchParams.get('search');
    let pageArr = []
    let minisiteData = [];
    let allPageCount = 0;
    let siteList = []
    try {
        const res = await axios.post(`${back_api}/minisite/load_minisite`, { nowPage, search })

        console.log(res.data);
        
        if (res.status == 200) {
            minisiteData = res.data.minisiteData;
            allPageCount = res.data.allPage;
            siteList = res.data.site_list
            pageArr = getPagination(parseInt(nowPage), res.data.allPage);
        }
    } catch (error) {

    }

    


    return { minisiteData, pageArr, allPageCount, siteList }
}