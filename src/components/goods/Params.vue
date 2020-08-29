<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-alert type="warning" show-icon :closable="false">注意：只允许为第三季分类添加相关参数</el-alert>
            <el-row class="cascaderPart">
                <el-col>
                    <span>请选择分类：</span>
                    <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="catelist" :props="getParentProp" @change="getCateChanged"></el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabChange">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled" size="mini" @click="addParamsVisible = true">添加参数</el-button>
                    <el-table :data="manyParamsData" stripe style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small" style="width: 100px;"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="版式"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="getEditParamsData(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled" size="mini" @click="addParamsVisible = true">添加参数</el-button>
                    <el-table :data="onlyParamsData" stripe style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable>{{item}}</el-tag>
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small" style="width: 100px;"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="getEditParamsData(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    <!-- 参数添加 -->
        <el-dialog :title="'添加' + nameText" :visible.sync="addParamsVisible" width="50%" @close="addParamsClosed">
            <el-form :model="addParamForm" :rules="addParamFormRules" ref="addParamFormRef" label-width="100px">
                <el-form-item :label="nameText" prop="attr_name">
                    <el-input v-model="addParamForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParamsConfirm">确 定</el-button>
            </span>
        </el-dialog>
    <!-- 参数修改 -->
        <el-dialog :title="'修改' + nameText" :visible.sync="editParamsVisible" width="50%" @close="editParamsClosed">
            <el-form :model="editParamForm" :rules="addParamFormRules" ref="editParamFormRef" label-width="100px">
                <el-form-item :label="nameText" prop="attr_name">
                    <el-input v-model="editParamForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editParamsVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParamsConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            catelist: [],
            queryInfo: {
                type: '3'
            },
            getParentProp: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            selectedKeys: [],
            activeName: 'only',
            manyParamsData: [],
            onlyParamsData: [],
            addParamForm: {
                attr_name: ''
            },
            addParamFormRules: {
                attr_name: [
                    { required: true, message: '请输入内容', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ]
            },
            addParamsVisible: false,
            editParamsVisible: false,
            editParamForm: {}
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        getCateList: async function () {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                this.$message.error('获取商品分类信息失败')
            }
            // console.log(res)
            this.catelist = res.data
            // console.log(this.catelist)
        },
        getCateChanged: function () {
            this.getParamsData()
        },
        handleTabChange: function () {
             this.getParamsData()
        },
        getParamsData: async function () {
            if (this.selectedKeys.length !== 3) {
                    this.selectedKeys = []
                    this.manyParamsData = []
                    this.onlyParamsData = []
                    return
                }
            // console.log(this.selectedKeys)
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            // 这里的循环是为了将对象中的attr_vals字符串变成数组，这样就可以进行for循环。因为字符串是不能进行for循环的。
            res.data.forEach(item => {
                // 这里的三目运算符是为了防止这种情况：如果attr_vals属性中没有值，则会是一个空字符串，空字符串调用参数为空格的split方法，会返回一个空数组，这样的话即使这个属性中没有值，也会出现一个空白标签
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 在渲染attr_vals属性中的值时，如果在data中定义了下面两个属性，那么所有attr_vals属性中的值用的都是这个两个属性，这样是不行的，因为每个不同的item项都有自己的标签。为了解决这个问题，这里为每个item都分配了自己的两个属性
                item.inputVisible = false
                item.inputValue = ''
            })
            console.log(res.data)
            if (this.activeName === 'many') {
                this.manyParamsData = res.data
            } else {
                this.onlyParamsData = res.data
            }
        },
        addParamsConfirm: function () {
            this.$refs.addParamFormRef.validate(async valid => {
                if (!valid) return this.$message.error('参数有问题，请重新填写')
                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addParamForm.attr_name, attr_sel: this.activeName })
                if (res.meta.status !== 201) {
                    this.$message.error('添加参数失败')
                }
                this.getParamsData()
                this.addParamsVisible = false
            })
        },
        addParamsClosed: function () {
            // 注意，这个函数是绑定再dialog插件上的，但是可以引用form表单中的addParamFormRef属性，所以可以用这个实现input输入框的初始化
            this.$refs.addParamFormRef.resetFields()
        },
        getEditParamsData: async function (attrId) {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) {
                this.$message.error('请求参数失败')
            }
            console.log(res)
            this.editParamForm = res.data
            this.editParamsVisible = true
        },
        editParamsConfirm: async function () {
           this.$refs.editParamFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamForm.attr_id}`, { attr_name: this.editParamForm.attr_name, attr_sel: this.editParamForm.attr_sel })
                if (res.meta.status !== 200) {
                this.$message.error('修改参数失败')
                }
                this.$message.success('修改数据成功')
                this.editParamsVisible = false
                this.getParamsData()
           })
        },
        editParamsClosed: function () {
            // 注意，这个函数是绑定再dialog插件上的，但是可以引用form表单中的addParamFormRef属性，所以可以用这个实现input输入框的初始化
            this.$refs.editParamFormRef.resetFields()
        },
        deleteParam: async function (id) {
           const confirmResult = await this.$confirm('请输入邮箱', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                this.$message.info('删除操作已取消')
            }
           const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
           if (res.meta.status !== 200) {
               this.$message.error('删除操作失败！')
           }
           this.getParamsData()
        },
        handleInputConfirm: async function (row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            this.saveAttrVals(row)
            row.inputVisible = false
        },
        showInput: function (row) {
            row.inputVisible = true // $nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码.另外注意，这行的注释不能隔行，而且//之前要加一个空格
            this.$nextTick(_ => {
                // 这里的input是原生的inputdom对象，所以能调用js的对象方法：focus（）这行代码放在里面是为了在页面渲染完毕之后，再执行这个操作。因为如果input标签，或者相关属性，比如用来判断是否展示input输入框的布尔值等，没有加载完毕就执行，那样的话就会报错。注意，这里的注释又没问题，好奇怪！！！
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        handleClose: function (i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        },
        saveAttrVals: async function (row) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
            if (res.meta.status !== 200) {
                this.$message.error('修改参数失败')
            }
        }
    },
    computed: {
        isBtnDisabled: function () {
            if (this.selectedKeys.length !== 3) {
                return true
            }
            return false
        },
        cateId: function () {
            if (this.selectedKeys.length === 3) {
                return this.selectedKeys[2]
            }
            return null
        },
        nameText: function () {
            if (this.activeName === 'many') {
                return '动态参数'
            } else {
                return '属性名称'
            }
        }
    }
}
</script>

<style lang="less" scoped>
 .cascaderPart {
     margin: 10px 0;
 }
 .el-tag {
     margin-right: 10px;
 }
</style>
