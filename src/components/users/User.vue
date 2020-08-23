<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" class="input-with-select" width="60%">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary">添加用户</el-button>
                </el-col>
            </el-row>
            <el-table :data="userlist" style="width: 100%" class="table" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名" width="180px"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="180px"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色" width="180px"></el-table-column>
                <el-table-column prop="mg_state" label="状态" width="180px">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="address" label="操作" width="180px">
                    <template>
                        <el-button type="warning" size="mini" @click="dialogVisible = true">修改</el-button>
                        <el-button type="danger" size="mini" @click="dialogVisible = true">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="this.total">
            </el-pagination>
        </el-card>
        <!-- <el-dialog title="修改用户" :visible.sync="userEditVisible" width="50%">
            <el-form :model="userEdit" :rules="userEditRules" ref="userEditRef" label-width="100px">
                <el-form-item label="活动名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog> -->
    </div>
</template>

<script>
export default {
    data () {
        return {
            // queryInfo中的第二个属性pagenum，不能随意指定数值，只能为1，这里可能和后台数据有关，后台数据太少，页数只有一页。以后再测试一下是否理解正确
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userlist: [],
            total: 0,
            changeState: true,
            userEditVisible: false
        }
    },
    created () {
        this.getUserList()
    },
    methods: {
        getUserList: async function () {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
            this.$message.success('获取用户列表成功！')
            this.userlist = res.data.users
            this.total = res.data.total
        },
        userStateChange: async function (userinfo) {
            const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新用户状态成功！')
        }
    }
}
</script>

<style lang="less" scoped>
 .card {
     padding: 0 10px;
     background-color: #fff;
     margin-top: 10px;
 }
 .table {
     margin-top: 15px;
     font-size: 12px;
 }
 .el-pagination {
     margin-top: 10px;
 }
</style>
