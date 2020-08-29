<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <!-- 这里的提示信息放在title里面，不要在标签中间写，这样的话图标会显得很丑 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <el-steps :active="active - 0" align-center>
                <el-step title="基本信息" ></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :tab-position="'left'" v-model="active" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_name">
                            <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="catelist" :props="getParentProp" @change="addGoodsChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="(item) in manyTableList" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="(item) in onlyTableList" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 这里有几点要注意：首先，action属性中必须填写完整的路径。如果按照以往的类似a链接情况，是可以直接填写路由地址的，但是这里的话，如果直接在action属性中填写路由地址，那完整的路径就等于是在当前路由路径下再加一个图片调转到的路径。但是
                        图片是要上传到服务器的，服务器的地址是4个8，而当前路由地址是8080端口
                        其次，list-type属性规定图片在客户端的渲染方式，比如渲染图片缩略图和文件名，或者只渲染文件名
                        然后，点击图片上传按钮之后，图片并没有上传到服务器，因为在编程开始时，我们在登录时设置了一个token值，在每次使用axios进行服务器端请求数据时，都要进行token验证，但是el-upload已经内置了请求操作，所以在图片上传之后，再查看F12键查看network之后会发现，传回来的是无效token，因为该插件没有使用我们自己定义的axios进行上传操作-->
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="finalConfirm" @click="addGoodsConfirm">添加商品</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="完成" name="5">完成</el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" alt="图片预览失败" style="width: 100%;">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data () {
        return {
            active: 0,
            // 这里的addForm是添加商品提交的数据，不要和服务器端返回的响应数据混淆在一起
            addForm: {
                goods_name: 'ade',
                goods_price: '11',
                goods_weight: '11',
                goods_number: '11',
                goods_cat: [],
                pics: [],
                goods_introduce: 'sdfsfdfsd',
                attrs: []
            },
            addFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' },
                    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' },
                    { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' },
                    { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                    { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' }
                ]
            },
            selectedKeys: [],
            catelist: [],
            list: [],
            getParentProp: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            manyTableList: [],
            onlyTableList: [],
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewPath: '',
            previewVisible: false
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        getCateList: async function () {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                this.$message.error('获取商品分类信息失败')
            }
            // console.log(res)
            this.catelist = res.data
            // console.log(this.catelist)
        },
        addGoodsChange: function () {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
        },
        beforeTabLeave: function (activeName, oldActiveName) {
            // console.log(activeName, oldActiveName)
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        tabClicked: async function () {
            if (this.active === '1') {
                // 如果这里的代码调试时有问题，可以先换到别的路由上，先写完代码，再进来这个路由，可能就不会报错
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) {
                    this.$message.error('请求参数失败')
                }
                // console.log(res.data)
                this.manyTableList = res.data
                this.manyTableList.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                })
            } else if (this.active === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) {
                    this.$message.error('请求参数失败')
                }
                // console.log(res.data)
                this.onlyTableList = res.data
            }
        },
        handlePreview: function (file) {
            // console.log(file)
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        handleRemove: function (file) {
            // console.log(file)
            const filePath = file.response.data.tmp_path
            const i = this.addForm.pics.findIndex(x => x.pic === filePath)
            this.addForm.pics.splice(i, 1)
            console.log(this.addForm)
        },
        // 这个函数有3个参数：第一个代表服务器返回的数据，第二个代表文件信息，第三个是当前上传文件的文件列表
        handleSuccess: function (response) {
            // console.log(response)
            const picsInfo = { pic: response.data.tmp_path }
            this.addForm.pics.push(picsInfo)
            // console.log(this.addForm)
        },
        addGoodsConfirm: function () {
            // console.log(this.addForm)
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请输入表单必填项！')
                }
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                console.log('这是深拷贝之后的数据：', form)
                this.manyTableList.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
                    this.addForm.attrs.push(newInfo)
                })
                this.onlyTableList.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
                    this.addForm.attrs.push(newInfo)
                })
                const { data: res } = await this.$http.post('goods', form)
                if (res.meta.status !== 201) {
                    this.$message.error99('添加商品失败')
                }
                this.$message.success('添加商品成功')
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        cateId: function () {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
 .el-alert__icon.is-big {
    font-size: 16px;
 }
 .el-steps {
     margin-top: 10px;
 }
 .el-tabs {
     margin-top: 10px;
 }
 .finalConfirm {
     margin-top: 10px;
 }
</style>
