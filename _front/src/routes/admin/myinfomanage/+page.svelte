<script>
    import { back_api } from "$src/lib/const.js";
    import { user_info } from "$src/lib/store.js";
    import axios from "axios";


    let name = $state("");
    let email = $state("");
    let passwordChk = $state("");
    let newPassword = $state("");

    let pwdBool = $state(true);
    name = $user_info.name || "";
    email = $user_info.email || "";

    async function passwordChkSubmit() {
        try {
            const res = await axios.post(`${back_api}/adminbase/password_chk`, {
                id: $user_info.id,
                passwordChk,
            });

            if (res.status == 200) {
                if (res.data.errorMessage) {
                    alert(res.data.errorMessage);
                } else {
                    pwdBool = false;
                }
            }
        } catch (error) {}
    }

    async function updateUserInfo() {
        try {
            const res = await axios.post(
                `${back_api}/adminbase/update_user_info`,
                { id: $user_info.id, name, email, newPassword },
            );
            if(res.status == 200){
                alert('회원 정보가 수정되었습니다.');
            }
        } catch (error) {}
    }
</script>

<div class="max-w-[900px] border p-5">
    <div class="font-bold text-lg text-center mb-5">회원 정보 변경</div>
    <div>
        <table class="w-full">
            <tbody>
                <tr>
                    <th class="in-th w-1/4"> 아이디 </th>
                    <td class="in-td w-3/4 px-3">
                        {$user_info.id}
                    </td>
                </tr>
                <tr>
                    <th class="in-th w-1/4"> 이름 </th>
                    <td class="in-td w-3/4 p-1.5">
                        <input
                            type="text"
                            class="input input-bordered input-success w-full input-sm"
                            bind:value={name}
                        />
                    </td>
                </tr>
                <tr>
                    <th class="in-th w-1/4"> 기존 비밀번호 </th>
                    <td class="in-td w-3/4 p-1.5">
                        <form on:submit={passwordChkSubmit}>
                            <div class="flex gap-1">
                                <input
                                    type="password"
                                    placeholder="기존 비밀번호를 입력하세요"
                                    class="input input-bordered input-success w-full input-sm"
                                    bind:value={passwordChk}
                                />
                                <button
                                    class="btn btn-success btn-sm text-white"
                                >
                                    확인
                                </button>
                            </div>
                        </form>
                    </td>
                </tr>
                <tr>
                    <th class="in-th w-1/4"> 새 비밀번호 </th>
                    <td class="in-td w-3/4 p-1.5">
                        <input
                            type="password"
                            placeholder="변경하실 비밀번호를 입력하세요"
                            class="input input-bordered input-success w-full input-sm"
                            bind:value={newPassword}
                            disabled={pwdBool}
                        />
                    </td>
                </tr>
                <tr>
                    <th class="in-th w-1/4"> 이메일 </th>
                    <td class="in-td w-3/4 p-1.5">
                        <div class="flex gap-1">
                            <input
                                type="text"
                                placeholder="이메일 주소를 입력하세요"
                                class="input input-bordered input-success w-full input-sm"
                                bind:value={email}
                            />
                            <!-- <button class="btn btn-success btn-sm text-white">
                                인증번호 발송
                            </button> -->
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="mt-5 text-center">
        <button
            class="btn btn-info text-white w-1/3 text-lg"
            on:click={updateUserInfo}
        >
            변경하기
        </button>
    </div>
</div>
