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
                    <el-input clearable placeholder="请输入内容" class="input-with-select" width="60%" v-model="queryInfo.query" @clear="clearSearch">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addUsersForm">添加用户</el-button>
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
                    <template slot-scope="scope">
                        <el-button type="warning" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
                        <el-button type="danger" size="mini" @click="deleteUser(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="pageSizeChange" @current-change="pagenumChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
    <!-- 添加用户 -->
        <el-dialog title="添加用户" :visible.sync="userAddVisible" width="50%">
            <el-form :model="addUserDialog" :rules="addUserDialogRules" ref="addUserDialogRef" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserDialog.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserDialog.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserDialog.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addUserDialog.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAddUser">取 消</el-button>
                <el-button type="primary" @click="addUserConfirm">确 定</el-button>
            </span>
        </el-dialog>
    <!-- 这里是修改用户功能 -->
        <el-dialog title="修改用户" :visible.sync="userEditVisible" width="50%">
            <el-form :model="userEdit" :rules="addUserDialogRules" ref="userEditRef" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userEdit.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userEdit.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="userEdit.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="userEditVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        var checkEmail = (rule, value, cb) => {
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
        }
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                return cb()
            }
            cb(new Error('请输入合法的手机号'))
        }
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
            userAddVisible: false,
            userEditVisible: false,
            userEdit: {},
            addUserDialog: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            addUserDialogRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度应在 3 到 6 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度应在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getUserList()
    },
    methods: {
        getUserList: async function () {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            // console.log(res)
            if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
            // this.$message.success('获取用户列表成功！')
            console.log('获取用户列表成功！')
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
        },
        pageSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        pagenumChange: function (newpage) {
            this.queryInfo.pagenum = newpage
            this.getUserList()
        },
        clearSearch: function () {
            this.getUserList()
        },
        addUsersForm: function () {
            this.userAddVisible = true
        },
        cancelAddUser: function () {
            this.$refs.addUserDialogRef.resetFields()
            this.userAddVisible = false
        },
        addUserConfirm: function () {
            this.userAddVisible = false
            this.$refs.addUserDialogRef.validate(async valid => {
                if (!valid) return this.$message.error('添加用户失败')
                const { data: res } = await this.$http.post('users', this.addUserDialog)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加用户失败')
                }
                this.$message.success('添加用户成功')
                this.getUserList()
                this.$refs.addUserDialogRef.resetFields()
            })
        },
        showEditDialog: async function (id) {
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('编辑时获取用户信息失败')
            }
            this.userEdit = res.data
            this.$message.success('编辑时获取用户信息成功')
            this.userEditVisible = true
        },
        confirmEdit: function () {
            this.userEditVisible = false
            this.$refs.userEditRef.validate(async valid => {
                if (!valid) return this.$message.error('修改用户失败')
                const { data: res } = await this.$http.put('users/' + this.userEdit.id, { email: this.userEdit.email, mobile: this.userEdit.mobile })
                if (res.meta.status !== 200) {
                    return this.$message.error('修改用户失败')
                }
                this.$message.success('修改用户成功')
                this.getUserList()
            })
        },
        deleteUser: async function (id) {
            const confirmResult = await this.$confirm(
                '此操作将永久删除该用户, 是否继续?',
                '提示',
                {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }
            ).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除用户失败！')
            }
            this.$message.success('删除用户成功！')
            this.getUserList()
        }
    }
}
</script>

<style lang="less" scoped>
 .table {
     margin-top: 15px;
     font-size: 12px;
 }
 .el-pagination {
     margin-top: 10px;
 }
</style>
