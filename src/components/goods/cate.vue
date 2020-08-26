<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCateItem">添加分类</el-button>
                </el-col>
            </el-row>
            <tree-table :data="catelist" :columns="columns" style="margin-top: 15px">
                <template slot="isValid" slot-scope="scope">
                    <i class="el-icon-success green" v-if="scope.row.cat_deleted === false"></i>
                    <i class="el-icon-error red" v-else></i>
                </template>
                <template slot="sort" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">等级一</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">等级二</el-tag>
                    <el-tag type="warning" v-else>等级三</el-tag>
                </template>
                <template slot="handle">
                    <el-button size="mini" type="primary" icon="el-icon-edit">修改</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <el-pagination @size-change="pageSizeChange" @current-change="pageCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </el-card>
        <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称: " prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类: " >
                        <el-cascader v-model="selectedKeys" :options="parentList" :props="getParentProp" clearable @change="addCateChange"></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateCancel">取 消</el-button>
                <el-button type="primary" @click="addCateConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            catelist: [],
            catelistStr: {},
            queryInfo: {
                type: '',
                pagenum: 1,
                pagesize: 5
            },
            total: 0,
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    type: 'template',
                    template: 'isValid'
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    type: 'template',
                    template: 'sort'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'handle'
                }
            ],
            addCateVisible: false,
            addCateForm: {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            },
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ]
            },
            parentList: [],
            selectedKeys: [],
            getParentProp: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            catnameArray: []
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
            this.catelist = res.data.result
            this.total = res.data.total
        },
        addCateItem: function () {
            this.getParentList()
            this.addCateVisible = true
        },
        getParentList: async function () {
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) {
                this.$message.error('获取商品分类信息失败')
            }
            this.$message.success('获取商品分类信息成功')
            // console.log(res)
            this.parentList = res.data
            console.log(this.parentList)
            this.getCatname()
        },
        pageSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        pageCurrentChange: function (newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        addCateChange: function () {
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        addCateConfirm: function () {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return this.$message.info('您的输入有误!')
                if (this.checkCatname(this.addCateForm.cat_name) === false) return
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加分类失败')
            }
                this.$message.success('添加分类成功')
                this.addCateVisible = false
            this.getCateList()
            })
        },
        addCateCancel: function () {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
            this.addCateVisible = false
        },
        getCatname: function () {
            for (var i = 0; i < this.parentList.length; i++) {
                this.catnameArray.push(this.parentList[i].cat_name)
            }
        },
        checkCatname: function (inputName) {
            for (var i = 0; i < this.catnameArray.length; i++) {
                if (this.catnameArray[i] === inputName.trim()) {
                  this.$message.error('您输入的分类名称已存在!')
                  return false
                }
            }
        }
    }
}
</script>

<style lang="less" scoped>
 .green {
     color: lightgreen;
 }
 .red {
     color: red;
 }
 .el-cascader {
     width: 100%;
 }
</style>
