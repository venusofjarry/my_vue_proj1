<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-row>
                <el-col :span="8">
                    <!-- 这里的query属性是指向姓名的，当传过去的query参数被后台接收时，就会返回对应的数据，达到查询的效果，但是后台没有给这里添加query的规定字符串用于返回查询结果，所以这里实现不了查询-->
                    <el-input clearable placeholder="请输入内容" class="input-with-select" width="60%" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="orderList" style="width: 100%; font-size: 12px;" class="table" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格" width="95px"></el-table-column>
                <el-table-column prop="order_pay" label="是否付款" width="100px">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货" width="100px"></el-table-column>
                <el-table-column prop="create_time" label="下单时间" width="190px">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <el-button type="warning" size="mini" @click="addressVisible = true">修改地址</el-button>
                    <el-button type="danger" size="mini" @click="cargoCheck">物流进度</el-button>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="pageSizeChange" @current-change="pageNumChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
        <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressClose">
            <el-form :model="addressForm" :rules="addressFormrules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader v-model="selectedAddress" :options="cityData" :props="cityProp" expand-trigger="hover" @change="addressChange"  style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="物流进度" :visible.sync="cargoVisible" width="50%">
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in cargoInfo" :key="index" :timestamp="activity.time" placement="top">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data () {
        return {
            queryInfo: {
                // 这里的query打印出来就是服务器返回的res中的data数据。另外，这里的query参数没有设置规定字符串，所以不能实现查询功能
                // 这里就不用做查询功能的代码了
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            orderList: [],
            total: 0,
            addressVisible: false,
            addressForm: {
                address1: [],
                address2: ''
            },
            addressFormrules: {
                address1: [
                    { required: true, message: '请输入省市区县', trigger: 'blur' }
                ],
                address2: [
                    { required: true, message: '请输入详细地址', trigger: 'blur' }
                ]
            },
            cityData: cityData,
            cityProp: {
                label: 'label',
                value: 'value',
                children: 'children'
            },
            selectedAddress: [],
            cargoVisible: false,
            cargoInfo: []
        }
    },
    created () {
        this.getOrderList()
    },
    methods: {
        getOrderList: async function () {
           const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
           if (res.meta.status !== 200) {
               this.$message.error('获取订单列表失败')
           }
        //    console.log(res)
           this.orderList = res.data.goods
           this.total = res.data.total
           console.log(this.orderList)
           console.log(this.queryInfo.query)
        },
        pageSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        pageNumChange: function (newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        addressChange: function () {
            // console.log(this.selectedAddress)
        },
        addressClose: function () {
            this.$refs.addressFormRef.resetFields()
            this.selectedAddress = []
        },
        cargoCheck: async function () {
            const { data: res } = await this.$http.get('/kuaidi/1106975712662')
            if (res.meta.status !== 200) {
                this.$message.error('获取物流信息失败')
            }
            // console.log(res)
            this.cargoInfo = res.data
            this.cargoVisible = true
            // console.log(this.cargoInfo)
        }
    }
}
</script>

<style lang="less" scoped>
 .ql-editor {
    min-height: 150px;
}
</style>
