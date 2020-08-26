<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="card">
            <el-button type="primary">添加角色</el-button>
            <el-table :data="rolesList" border style="width: 100%" class="table">
                <el-table-column  type="expand">
                    <template slot-scope="scope">
                        <!-- 关于展开区域的边框线的说明：一级分类很好理解，因为一级分类和二级分类共享一个上边框，但是这里只能有一个上边框，如果有两个，就重叠了，所以必须要看是不是一级分类，如果是，就有上边框；不是就不能有上边框。下边框每一个一级分类都有，不会有影响二级分类，只需要设置上边框就好，因为一级分类都设置了下边框，一级分类和最后一个二级分类是共享下边框的。这里只需要判断二级分类是不是第一个，如果是第一个就不要加上边框，避免和一级分类的上边框重叠三级分类只是罗列出来而已，不需要边-->
                        <!-- 关于close函数参数的问题：为什么要写两个参数，而且第一个参数是scope.row？首先，路由中规定要用角色id和权限id发送删除请求，所以需要两个其次，这里要理解slot插槽的作用。在这里，对数据进行了循环，但是在每个col中，都有一个scope与之对应，所以在每个级别的分类中，都可以直接使用scope.row，因为每个rol中的scope是不同的，所以不用担心使用的是否是一样的数据，这点非常重要-->
                       <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                </el-col>
                                </el-row>
                            </el-col>
                         </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="getRightsList(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog title="添加权限" :visible.sync="selectChangeVisible" width="50%">
            <el-tree :data="rightslist" :props="rightsProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="treeKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="clearId">取 消</el-button>
                <el-button type="primary" @click="setRightsConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            rolesList: [],
            selectChangeVisible: false,
            rightslist: [],
            rightsProps: {
                children: 'children',
                label: 'authName'
            },
             treeKeys: [],
             roleId: ''
        }
    },
    created () {
        this.getRoleList()
        this.getRightsList()
    },
    methods: {
        getRoleList: async function () {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('读取角色信息失败')
            }
            // console.log(res.data)
            this.rolesList = res.data
        },
        getRightsList: async function (role) {
            this.treeKeys = []
            this.roleId = role.id
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限数据失败')
            }
            this.$message.success('获取权限数据成功')
            this.rightslist = res.data
            this.getDefKeys(role, this.treeKeys)
            this.selectChangeVisible = true
        },
        getDefKeys: function (node, arr) {
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getDefKeys(item, arr)
            })
        },
        clearId: function () {
            // 这里的关闭不能用来清空treekeys数组的数据，因为有时候不一定点取消，我如果点外面的空白区域，也会让弹框消失
            this.selectChangeVisible = false
        },
        removeRightById: async function (role, rightId) {
            const confirmResult = await this.$confirm(
                '此操作将永久删除该权限, 是否继续?',
                '提示',
                {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }
            ).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('删除已取消')
            }
            // 请求参数要注意：当不使用变量时，用字符串，如果使用到了变量，必须使用模板字符串，因为普通字符串不能解析变量
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败')
            }
            this.$message.success('删除权限成功')
            // 为什么使用children的时候，一级分类也能被删除？
            // 因为在一级菜单上面就是整个表格，这整个表格装的所有的一级分类，因此，使用children属性，可以获取对应的一级分类表单对象
            role.children = res.data
        },
        setRightsConfirm: async function () {
            this.selectChangeVisible = false
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) {
                return this.$message.error('添加权限失败')
            }
           this.$message.success('添加权限成功')
            this.getRoleList()
        }
    }
}
</script>

<style lang="less" scoped>
 .table {
     margin-top: 10px;
 }
 .el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
