<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- 这里的query属性是指向姓名的，当传过去的query参数被后台接收时，就会返回对应的数据，达到查询的效果 -->
                    <el-input clearable placeholder="请输入内容" class="input-with-select" width="60%" v-model="queryInfo.query" @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addGoodsPage">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="goodsList" style="width: 100%; font-size: 12px;" class="table" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格" width="95px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template slot-scope="scope">
                        <el-button type="warning" size="mini">修改</el-button>
                        <el-button type="danger" size="mini" @click="deleteGoods(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="pageSizeChange" @current-change="pageNumChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data () {
        return {
            goodsList: [],
            queryInfo: {
                // 这里的query打印出来就是服务器返回的res中的data数据
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            total: 0
        }
    },
    created () {
        this.getGoodsList()
    },
    methods: {
        getGoodsList: async function () {
           const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
           if (res.meta.status !== 200) {
               this.$message.error('获取数据失败')
           }
           this.goodsList = res.data.goods
           this.total = res.data.total
        //    console.log('这是goods数据：', this.goodsList)
        },
        pageSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        pageNumChange: function (newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        addGoodsPage: function () {
            this.$router.push('goods/add')
        },
        deleteGoods: async function (id) {
            const confirmResult = await this.$confirm('删除操作将永久删除该数据，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('删除操作已取消')
            }
           const { data: res } = await this.$http.delete(`goods/${id}`)
           if (res.meta.status !== 201) {
               this.$message.error('删除数据失败')
           }
           this.$message.success('删除数据成功')
           this.getGoodsList()
        }
    }
}
</script>

<style lang="less" scoped>
 .table {
     margin-top: 10px;
 }
</style>
