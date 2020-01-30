<template>
  <div class="home">
    <el-menu
      default-active="1"
      class="home-menu"
      background-color="#078a86"
      text-color="#fff"
      active-text-color="#ebe50c"
      mode="horizontal"
    >
      <el-menu-item index="1">
        <i class="el-icon-user"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-menu-item index="2">
        <i class="el-icon-apple"></i>
        <span slot="title">植物管理</span>
      </el-menu-item>
      <el-menu-item index="3">
        <i class="el-icon-place"></i>
        <span slot="title">位置管理</span>
      </el-menu-item>
      <el-menu-item index="4">
        <i class="el-icon-chat-dot-square"></i>
        <span slot="title">留言管理</span>
      </el-menu-item>
    </el-menu>

    <el-input v-model="search" placeholder="请输入内容" style="display: inline-block;width:200px">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="clickSearchBtn"></i>
    </el-input>
    <!-- <el-button icon="el-icon-search" circle></el-button> -->
    <el-button type="danger" round class="btn" disabled>删除</el-button>

    <el-table
      :data="tableData"
      height="535px"
      :stripe="true"
      @selection-change="handleSelectionChange"
      highlight-current-row
    >
      <el-table-column
        v-for="(col,index) in colData"
        :key="index"
        :prop="col.prop"
        :width="col.width"
        :label="col.label"
        :class-name="col.className"
        :sortable="col.sortable"
        :type="col.type"
      ></el-table-column>
    </el-table>

    <el-pagination :page-size="10" layout="total, prev, pager, next, jumper" :total="pagesTotal" @current-change="currentPageChange"></el-pagination>
  </div>
</template>

<script>
import api from "../assets/api";
import axios from "axios";

export default {
  data() {
    return {
      tableData: [], // 表格数据
      colData: [
        { label: "#", type: "index", width: "55" },
        { prop: "personal_uid", label: "UID", sortable: true },
        { prop: "personal_status", label: "状态" },
        { prop: "personal_nickname", label: "昵称" },
        { type: "selection", width: "55" }
      ], // 表格设置
      multipleSelection: [], // 选择项
      search: "", // 搜索内容
      pagesTotal: 0, // 条目总数
      currentPage: 1, // 当前页数
    };
  },
  methods: {
    // 表格checkbox选择项改变
    handleSelectionChange(val) {
      this.multipleSelection = val;
      // console.log(this.multipleSelection);
    },
    // 点击搜索按钮
    clickSearchBtn() {
      let self = this;
      self.getTableDate();
    },
    // 分页页数变化
    currentPageChange(val) {
      let self = this;
      self.currentPage = val
      self.getTableDate();
    },
    // 获取表格数据
    getTableDate() {
      let self = this;
      axios({
        url: api.getTable,
        method: "post",
        data: {
          page: self.currentPage,
          search: self.search
        }
      }).then(res => {
        if (res.data) {
          res.data.list.forEach(foo => {
            if (foo.personal_status == 0) {
              foo.personal_status = '正常'
            } else if (foo.personal_status == 1) {
              foo.personal_status = '封禁中'
            } else {
              foo.personal_status = '异常'
            }
          });
          self.tableData = res.data.list;
          self.pagesTotal = res.data.count;
        }
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
}
</style>