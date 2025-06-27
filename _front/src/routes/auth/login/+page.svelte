<script>
    import axios from "axios";
    import { back_api } from "$lib/const.js";
    import { goto } from "$app/navigation";
    import { user_info } from "$lib/store.js";
    import { page } from "$app/stores";

    let userId = $state("");
    let userIdInput = $state();
    let userPwd = $state("");

    let moveUrl = $state("");

    $effect(() => {
        moveUrl = $page.url.searchParams.get("url");
        console.log(moveUrl);
        
        if ($user_info.id) {
            alert("이미 로그인 되어 있습니다.");
            goto("/");
        }else{
            userIdInput.focus();
        }
    });

    async function loginSubmit(e) {
        e.preventDefault();
        console.log(moveUrl);
        
        if (!userId || !userPwd) {
            alert("아이디와 비밀번호를 모두 입력하세요.");
            return;
        }
        try {
            const res = await axios.post(
                `${back_api}/auth/login`,
                {
                    userid: userId,
                    password: userPwd,
                },
                { withCredentials: true },
            );
            if (res.status === 200) {
             
                const moveUrl = $page.url.searchParams.get("url");
                console.log(moveUrl);
                
                if (moveUrl) {
                    location.href = moveUrl
                } else {
                    console.log($user_info);
                    
                    goto("/");
                }
            }
        } catch (err) {
            if (err.response) {
                alert(err.response.data.message);
            } else {
                console.error("네트워크 에러 발생! 잠시 후 다시 시도해주세요!");
            }
        }
    }
</script>

<div class=" mt-20 max-w-96 mx-auto suit-font">
    <div class="text-center text-gray-600 text-2xl mb-6 kbo-font">
        위드분양 로그인
    </div>

    <!-- svelte-ignore event_directive_deprecated -->
    <form on:submit={loginSubmit}>
        <label
            class="input input-bordered flex items-center gap-2 text-sm mb-5"
        >
            <span class="min-w-4 flex justify-center">
                <i class="fa fa-id-card-o opacity-70" aria-hidden="true"></i>
            </span>

            <input
                type="text"
                class="grow"
                placeholder="아이디를 입력하세요"
                bind:this={userIdInput}
                bind:value={userId}
            />
        </label>

        <label
            class="input input-bordered flex items-center gap-2 text-sm mb-5"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="h-4 w-4 opacity-70"
            >
                <path
                    fill-rule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clip-rule="evenodd"
                />
            </svg>
            <input
                type="password"
                class="grow"
                placeholder="비밀번호를 입력하세요"
                bind:value={userPwd}
            />
        </label>
        <button class="btn btn-info min-h-11 h-11 text-white w-full">
            로그인
        </button>
    </form>

    <div class="mt-3 text-xs text-center text-blue-600">
        <a href="/auth/join">회원이 아니라면? 회원 가입 하기</a>
    </div>
    
</div>
