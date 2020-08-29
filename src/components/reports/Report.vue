<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
    data () {
        return {
            options: {
                title: {
                text: '用户来源'
                },
                tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                    backgroundColor: '#E9EEF3'
                    }
                }
                },
                grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
                },
                xAxis: [
                {
                    boundaryGap: false
                }
                ],
                yAxis: [
                {
                    type: 'value'
                }
                ]
            }
        }
    },
    created () {},
    // mounted函数是在dom被创建完成之后才被调用的，说明元素已经被渲染完毕，所以要放在这里，不能放在created函数中
    async mounted () {
        var myChart = echarts.init(document.getElementById('main'))
        const { data: res } = await this.$http.get('reports/type/1')
        if (res.meta.status !== 200) {
            return this.$message.error('获取折线图数据失败')
        }
        console.log(res)
        const result = _.merge(res.data, this.options)
        myChart.setOption(result)
    }
}
</script>

<style lang="less" scoped>

</style>
