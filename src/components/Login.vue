<template>
    <div class="container">
        <div class="formLogin">
            <div class="logo">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form label-width="0px" class="form-login">
                <el-form-item>
                    <el-input></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary">主要按钮</el-button>
                    <el-button type="info">信息按钮</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="less" scoped>
    .container {
        height: 100%;
        background-color: #2b4b6b;
        .formLogin {
            width: 450px;
            height: 300px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
        }
    }
    .logo {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 1px solid #eee;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        padding: 10px;
            }
    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
        }
    .btns {
        display: flex;
        justify-content: flex-end;
    }
    .form-login {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
    }
</style>
