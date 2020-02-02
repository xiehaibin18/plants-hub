<template>
  <div class="home">
    <el-menu
      default-active="personal_info"
      class="home-menu"
      background-color="#0abab5"
      text-color="#dadada"
      active-text-color="#fff"
      mode="horizontal"
      @select="menuSelect"
      v-loading="isLoading.menu"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-menu-item index="personal_info">
        <i class="el-icon-user"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-menu-item index="plants_info">
        <i class="el-icon-apple"></i>
        <span slot="title">植物管理</span>
      </el-menu-item>
      <el-menu-item index="location_info">
        <i class="el-icon-place"></i>
        <span slot="title">位置管理</span>
      </el-menu-item>
      <el-menu-item index="message_info">
        <i class="el-icon-chat-dot-square"></i>
        <span slot="title">留言管理</span>
      </el-menu-item>
    </el-menu>

    <el-input v-model="search" placeholder="请输入内容" style="display: inline-block;width:200px">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="clickSearchBtn"></i>
    </el-input>
    <el-button
      type="danger"
      round
      class="btn"
      @click="clickDelBtn"
      :disabled="multipleSelection.length == 0 ? true : false"
      :loading="isLoading.del"
    >删除</el-button>
    <el-button class="btn" round @click="clickAddBtn">添加</el-button>

    <el-table
      :data="tableData"
      height="535px"
      :stripe="true"
      @selection-change="handleSelectionChange"
      highlight-current-row
      v-loading="isLoading.table"
    >
      <el-table-column
        v-for="col in colData"
        :key="col.prop"
        :prop="col.prop"
        :width="col.width"
        :label="col.label"
        :class-name="col.className"
        :sortable="col.sortable"
        :type="col.type"
      ></el-table-column>
    </el-table>

    <el-pagination
      :page-size="10"
      layout="total, prev, pager, next, jumper"
      :total="pagesTotal"
      @current-change="currentPageChange"
    ></el-pagination>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      center
      append-to-body="true">
      <el-form v-if="tableName == 'personal_info'">
        <el-form-item label="用户名">
          <el-input v-model="dialogData.personal_info.personal_account"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="dialogData.personal_info.personal_password"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="dialogData.personal_info.personal_nickname"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <ph-uploadimage @submitImage="submitImage"></ph-uploadimage>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="dialogData.personal_info.personal_number"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" round @click="submitData('add')" :loading="isLoading.submit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import api from "../assets/api";
import axios from "axios";

export default {
  data() {
    return {
      tableData: [
        // {
        //   personal_uid: 1234456,
        //   personal_status: 0,
        //   personal_nickname: "xiehaibin"
        // },
        // {
        //   personal_uid: 1234457,
        //   personal_status: 0,
        //   personal_nickname: "xiehaibin"
        // },
        // {
        //   personal_uid: 1234458,
        //   personal_status: 0,
        //   personal_nickname: "xiehaibin"
        // }
      ], // 表格数据
      colData: [
        { label: "#", type: "index", width: "55" },
        { prop: "personal_uid", label: "UID", sortable: true },
        { prop: "personal_status", label: "状态" },
        { prop: "personal_nickname", label: "昵称" },
        { type: "selection", width: "55" }
      ], // 表格设置
      isLoading: { table: false, del: false, menu: false, submit: false }, // 加载状态
      tableName: "personal_info", // 表名
      search: "", // 搜索内容
      multipleSelection: [], // 选择项
      pagesTotal: 0, // 条目总数
      currentPage: 1, // 当前页数
      dialogVisible: false, // 遮罩卡片 显示状态
      dialogTitle: "关闭重试", // 遮罩卡片 标题
      dialogData: {
        personal_info: {
          tableName: "personal_info",
          personal_account: "",
          personal_password: "",
          personal_nickname: "",
          personal_avatar: "",
          personal_number: ""
        },
      }, // 遮罩卡片 数据
    };
  },
  methods: {
    // 菜单选择
    menuSelect(val) {
      let self = this;
      self.tableName = val;
      switch (self.tableName) {
        case "personal_info":
          self.colData = [
            { label: "#", type: "index", width: "55" },
            { prop: "personal_uid", label: "UID", sortable: true },
            { prop: "personal_status", label: "状态" },
            { prop: "personal_nickname", label: "昵称" },
            { type: "selection", width: "55" }
          ];
          break;
        case "plants_info":
          self.colData = [
            { label: "#", type: "index", width: "55" },
            { prop: "plants_uid", label: "UID", sortable: true },
            { prop: "plants_name", label: "名称" },
            { prop: "plants_introduction", label: "介绍" },
            { prop: "plants_distributions_uid", label: "分布" },
            { type: "selection", width: "55" }
          ];
          break;
        case "location_info":
          self.colData = [
            { label: "#", type: "index", width: "55" },
            { prop: "location_uid", label: "UID", sortable: true },
            { prop: "location_name", label: "名称" },
            { prop: "location_introduction", label: "介绍" },
            { prop: "location_plants_uid", label: "分布" },
            { type: "selection", width: "55" }
          ];
          break;
        case "message_info":
          self.colData = [
            { label: "#", type: "index", width: "55" },
            { prop: "message_uid", label: "UID", sortable: true },
            { prop: "message_sender_uid", label: "留言账户" },
            { prop: "message_receiver_uid", label: "接受账户" },
            { prop: "message_plants_uid", label: "留言所处植物" },
            { prop: "message_content", label: "留言内容" },
            { prop: "message_date", label: "留言日期" },
            { prop: "message_like", label: "点赞数", sortable: true },
            { prop: "message_isshow", label: "是否显示" },
            { type: "selection", width: "55" }
          ];
          break;
      }
      self.getTableDate();
    },
    // 点击 搜索按钮
    clickSearchBtn() {
      let self = this;
      self.getTableDate();
    },
    // 点击 添加按钮
    clickAddBtn() {
      let self = this
      self.getTableDate()
      self.dialogVisible = true
      self.dialogTitle = self.tableName
      switch (self.tableName) {
        case 'personal_info':
          self.dialogTitle = '添加用户'
          break;
        case 'plants_info':
          self.dialogTitle = '添加植物'
          break;
        case 'location_info':
          self.dialogTitle = '添加位置'
          break;
        case 'message_info':
          self.dialogTitle = '添加留言'
          break;
      }
    },
    // 获取子组件提交的图片数据
    submitImage(val) {
      let self = this
      self.dialogData.personal_info.personal_avatar = val
    },
    // 提交数据
    submitData(val) {
      let self = this
      self.isLoading.submit = true
      if (val == 'add') {
        axios({
          url: api.adminAddData,
          method: "post",
          data: self.dialogData.personal_info
        }).then(res => {
          self.isLoading.submit = false
          self.dialogVisible = false
          self.getTableDate();
          if (res.data.code == 0) {
            self.$message({
              type: "success",
              message: "添加成功!"
            });
          }
          if (res.data.code == 1) {
            self.$message({
              type: "warning",
              message: res.data.err
            });
          }
        }).catch(() => {
          self.isLoading.submit = false
          self.dialogVisible = false
          self.getTableDate();
          self.$message({
            message: `服务器出错,添加数据失败,请刷新页面重试`,
            type: "warning"
          });
        })
      }
    },
    // 点击 删除按钮
    clickDelBtn() {
      let self = this;
      self.getTableDate()
      let delUIDIndex = self.tableName.slice(0, -4) + "uid";
      let delUID = [];
      self.multipleSelection.forEach(foo => {
        delUID.push(foo[delUIDIndex]);
      });
      self
        .$confirm(`是否删除这${self.multipleSelection.length}条数据?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        })
        .then(() => {
          self.isLoading.del = true;
          self.isLoading.menu = true;
          axios({
            url: api.adminDelData,
            data: {
              tableName: self.tableName,
              delUID
            },
            method: "post"
          })
            .then(() => {
              self.isLoading.menu = false;
              self.getTableDate();
              self.$message({
                type: "success",
                message: "删除成功!"
              });
            })
            .catch(err => {
              self.getTableDate();
              self.$message({
                message: `${err},删除数据失败,请刷新页面重试`,
                type: "warning"
              });
            });
        })
        .catch(() => {
          self.isLoading.menu = false;
          self.isLoading.del = false;
          self.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 表格checkbox选择项改变
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 分页页数变化
    currentPageChange(val) {
      let self = this;
      self.currentPage = val;
      self.getTableDate();
    },
    // 获取表格数据
    getTableDate() {
      let self = this;
      self.isLoading.table = true;
      axios({
        url: api.getTableData,
        method: "post",
        data: {
          tableName: self.tableName,
          page: self.currentPage,
          search: self.search
        }
      })
        .then(res => {
          if (res.data.code == 200) {
            res.data.data.list.forEach(foo => {
              if (foo.personal_status == 0) {
                foo.personal_status = "正常";
              } else if (foo.personal_status == 1) {
                foo.personal_status = "封禁中";
              } else {
                foo.personal_status = "异常";
              }
            });
            self.tableData = res.data.data.list;
            self.pagesTotal = res.data.data.count;
          } else if (res.data.code == 300){
            self.$router.replace({ path: "/" });
          }
          self.isLoading.table = false;
          self.isLoading.del = false;
        })
        .catch(err => {
          self.isLoading.table = false;
          // self.tableData = [];
          self.$message({
            message: `${err},获取表单数据失败`,
            type: "warning"
          });
        });
    }
  },
  mounted() {
    let self = this;
    self.getTableDate();
  },
  beforeRouteEnter(to, from, next) {
    axios({
      url: api.checkLogin,
      method: "post"
    }).then(res => {
      if (res.data.message) {
        next();
      } else {
        next({ path: "/" });
      }
    });
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
.el-input__suffix {
  cursor: pointer;
}
.el-icon-user {
  color: #dadada !important;
}
.is-active > .el-icon-user {
  color: #fff !important;
}
.el-icon-apple {
  color: #dadada !important;
}
.is-active > .el-icon-apple {
  color: #fff !important;
}
.el-icon-place {
  color: #dadada !important;
}
.is-active > .el-icon-place {
  color: #fff !important;
}
.el-icon-chat-dot-square {
  color: #dadada !important;
}
.is-active > .el-icon-chat-dot-square {
  color: #fff !important;
}
.el-button.btn.el-button--default.is-round {
  background-color: #0abab5;
  color: #fff;
}
.el-button.btn.el-button--default.is-round:hover {
  opacity: 0.8;
}
.el-button.btn.el-button--default.is-round:active {
  background-color: #09a29d;
}
</style>
<style scoped>
.home {
  position: fixed;
  top: 0;
  right: 10px;
  bottom: 0;
  left: 10px;
  overflow: auto;
}
.home-menu {
  position: relative;
  margin: 0 auto;
  width: 540px;
  height: 70px;
  border-radius: 0 0 10px 10px;
  opacity: 0.9;
}
.home-menu:hover {
  opacity: 1;
}
.el-menu-item {
  margin: 5px;
}
.btn {
  float: right;
  margin-left: 5px;
}
</style>