<template>
  <div class="home">
    <!-- NavMenu导航栏 -->
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
    <el-button type="danger" class="out-btn" @click="handleSignoutClick">注销</el-button>
    <!-- 搜索框 -->
    <el-input v-model="search" placeholder="请输入内容" style="display: inline-block;width:200px">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="clickSearchBtn"></i>
    </el-input>
    <!-- 删除按钮 -->
    <el-button
      type="danger"
      round
      class="btn"
      @click="clickDelBtn"
      :disabled="multipleSelection.length == 0 ? true : false"
      :loading="isLoading.del"
    >删除</el-button>
    <!-- 添加按钮 -->
    <el-button class="btn" round @click="clickAddBtn">添加</el-button>
    <!-- 识图补全 -->
    <el-button class="btn" round @click="clickUseWebAddBtn(0)" v-show="tableName == 'plants_info'">识图补全</el-button>
    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      height="535px"
      :stripe="true"
      @selection-change="handleSelectionChange"
      highlight-current-row
      @row-dblclick="handleRowClick"
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
    <!-- 分页 -->
    <el-pagination
      :page-size="10"
      layout="total, prev, pager, next, jumper"
      :total="pagesTotal"
      @current-change="currentPageChange"
    ></el-pagination>
    <!-- 弹出框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      center
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <!-- 添加个人信息 -->
      <el-form
        label-position="right"
        label-width="100px"
        :model="dialogData.personal_info"
        ref="personal_info"
        v-if="tableName === 'personal_info' && dialogType === 0"
      >
        <el-form-item
          class="dialog-form-item mgt50"
          prop="personal_account"
          :rules="rules.personal_info.personal_account"
          label="用户名："
        >
          <el-input
            class="dialog-form-item-input"
            clearable
            v-model="dialogData.personal_info.personal_account"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="personal_password"
          :rules="rules.personal_info.personal_password"
          label="密码："
        >
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.personal_info.personal_password"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="personal_nickname"
          :rules="rules.personal_info.personal_nickname"
          label="昵称："
        >
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.personal_info.personal_nickname"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="头像：">
          <ph-uploadimage @getImageDate="getImageDate"></ph-uploadimage>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="personal_number"
          :rules="rules.personal_info.personal_number"
          label="手机号码："
        >
          <el-input
            class="dialog-form-item-input"
            v-model.number="dialogData.personal_info.personal_number"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            class="btn"
            round
            @click="submitData(0,'personal_info')"
            :loading="isLoading.submit"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 查看/修改个人信息详情 -->
      <el-form
        label-position="right"
        label-width="150px"
        :model="dialogData.personal_info_update"
        ref="personal_info_update"
        v-if="tableName === 'personal_info' && dialogType !== 0"
      >
        <el-form-item class="dialog-form-item mgt50" label="(只读)UID：">
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.personal_info_update.personal_uid"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="状态：">
          <el-select
            v-model="dialogData.personal_info_update.personal_status"
            :disabled="dialogType === 1 || dialogData.personal_info_update.personal_status === '异常'"
          >
            <el-option label="正常" value="正常"></el-option>
            <el-option label="封禁" value="封禁"></el-option>
            <el-option label="异常" value="异常" disabled></el-option>
          </el-select>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="(只读)用户名：">
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.personal_info_update.personal_account"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="personal_nickname"
          :rules="rules.personal_info.personal_nickname"
          label="昵称："
        >
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.personal_info_update.personal_nickname"
            :readonly="dialogType === 1"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="头像">
          <div
            v-if="dialogData.pictureUrl"
            style="height:148px;width:148px;display:inline-block;overflow: hidden;margin: 0 0 10px 0;"
          >
            <img :src="dialogData.pictureUrl" style="width:100%;" />
          </div>
          <div v-else style="display:inline-block;overflow: hidden;margin: 0 0 90px 0;">无</div>
          <ph-uploadimage @getImageDate="getImageDate" v-if="dialogType === 2"></ph-uploadimage>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" round @click="submitData(1)" v-show="dialogType === 1">修改</el-button>
          <el-button class="btn" round @click="submitData(3)" v-show="dialogType === 2">取消</el-button>
          <el-button
            class="btn"
            round
            @click="submitData(2, 'personal_info_update')"
            v-show="dialogType === 2"
            :loading="isLoading.update"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加植物信息 -->
      <el-form
        label-position="right"
        label-width="100px"
        :model="dialogData.plants_info"
        ref="plants_info"
        v-if="tableName === 'plants_info' && dialogType === 0"
      >
        <el-form-item
          class="dialog-form-item mgt50"
          prop="plants_name"
          :rules="rules.plants_info.plants_name"
          label="植物名称："
        >
          <el-input
            class="dialog-form-item-input"
            clearable
            v-model="dialogData.plants_info.plants_name"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="plants_introduction"
          :rules="rules.plants_info.plants_introduction"
          label="植物简介："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.plants_info.plants_introduction"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="植物图片：">
          <ph-uploadimage :limit="2" @getImageDate="getImageDate"></ph-uploadimage>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="plants_distributions_uid"
          :rules="rules.plants_info.plants_distributions_uid"
          label="所处地区："
        >
          <el-select v-model="dialogData.plants_info.plants_distributions_uid">
            <el-option
              v-for="item in dialogData.locationOptions"
              :key="item.location_uid"
              :label="item.location_name"
              :value="item.location_uid"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            class="btn"
            round
            @click="submitData(0,'plants_info')"
            :loading="isLoading.submit"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 查看/修改植物信息详情 -->
      <el-form
        label-position="right"
        label-width="150px"
        :model="dialogData.plants_info_update"
        ref="plants_info_update"
        v-if="tableName === 'plants_info' && dialogType !== 0 && dialogType !== 3"
      >
        <el-form-item class="dialog-form-item mgt50" label="(只读)UID：">
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.plants_info_update.plants_uid"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="plants_name"
          :rules="rules.plants_info.plants_name"
          label="名称："
        >
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.plants_info_update.plants_name"
            :readonly="dialogType === 1"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="plants_introduction"
          :rules="rules.plants_info.plants_introduction"
          label="植物简介："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.plants_info_update.plants_introduction"
            :readonly="dialogType === 1"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="图片">
          <div
            v-if="dialogData.pictureUrl"
            style="height:148px;width:148px;display:inline-block;overflow: hidden;margin: 0 0 10px 0;"
          >
            <img :src="dialogData.pictureUrl" style="width:100%;" />
          </div>
          <div v-else style="display:inline-block;overflow: hidden;margin: 0 0 90px 0;">无</div>
          <ph-uploadimage @getImageDate="getImageDate" v-if="dialogType === 2"></ph-uploadimage>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="plants_distributions_uid"
          :rules="rules.plants_info.plants_distributions_uid"
          label="所处地区："
        >
          <el-select v-model="dialogData.plants_info_update.plants_distributions_uid" :disabled="dialogType === 1">
            <el-option
              v-for="item in dialogData.locationOptions"
              :key="item.location_uid"
              :label="item.location_name"
              :value="item.location_uid"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" round @click="submitData(1)" v-show="dialogType === 1">修改</el-button>
          <el-button class="btn" round @click="submitData(3)" v-show="dialogType === 2">取消</el-button>
          <el-button
            class="btn"
            round
            @click="submitData(2, 'plants_info_update')"
            v-show="dialogType === 2"
            :loading="isLoading.update"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加位置信息 -->
      <el-form
        label-position="right"
        label-width="100px"
        :model="dialogData.location_info"
        ref="location_info"
        v-if="tableName === 'location_info' && dialogType === 0"
      >
        <el-form-item
          class="dialog-form-item mgt50"
          prop="location_name"
          :rules="rules.location_info.location_name"
          label="位置名称："
        >
          <el-input
            class="dialog-form-item-input"
            clearable
            v-model="dialogData.location_info.location_name"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="location_introduction"
          :rules="rules.location_info.location_introduction"
          label="位置简介："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.location_info.location_introduction"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="位置图片：">
          <ph-uploadimage :limit="1" @getImageDate="getImageDate"></ph-uploadimage>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="location_parent_uid"
          :rules="rules.location_info.location_parent_uid"
          label="所属省/市："
        >
          <el-select v-model="dialogData.location_info.location_parent_uid">
            <el-option
              v-for="item in dialogData.locationOptions"
              :key="item.location_uid"
              :label="item.location_name"
              :value="item.location_uid"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            class="btn"
            round
            @click="submitData(0,'location_info')"
            :loading="isLoading.submit"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 查看/修改位置信息详情 -->
      <el-form
        label-position="right"
        label-width="150px"
        :model="dialogData.location_info_update"
        ref="location_info_update"
        v-if="tableName === 'location_info' && dialogType !== 0"
      >
        <el-form-item class="dialog-form-item mgt50" label="(只读)UID：">
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.location_info_update.location_uid"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="location_name"
          :rules="rules.location_info.location_name"
          label="名称："
        >
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.location_info_update.location_name"
            :readonly="dialogType === 1"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="location_introduction"
          :rules="rules.location_info.location_introduction"
          label="位置简介："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.location_info_update.location_introduction"
            :readonly="dialogType === 1"
          ></el-input>
        </el-form-item>

        <el-form-item class="dialog-form-item" label="图片">
          <div
            v-if="dialogData.pictureUrl"
            style="height:148px;width:148px;display:inline-block;overflow: hidden;margin: 0 0 10px 0;"
          >
            <img :src="dialogData.pictureUrl" style="width:100%;" />
          </div>
          <div v-else style="display:inline-block;overflow: hidden;margin: 0 0 90px 0;">无</div>
          <ph-uploadimage @getImageDate="getImageDate" v-if="dialogType === 2"></ph-uploadimage>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="location_parent_uid"
          :rules="rules.location_info.location_parent_uid"
          label="所属地区："
        >
          <el-select v-model="dialogData.location_info_update.location_parent_uid" :disabled="dialogType === 1">
            <el-option
              v-for="item in dialogData.locationOptions"
              :key="item.location_uid"
              :label="item.location_name"
              :value="item.location_uid"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" round @click="submitData(1)" v-show="dialogType === 1">修改</el-button>
          <el-button class="btn" round @click="submitData(3)" v-show="dialogType === 2">取消</el-button>
          <el-button
            class="btn"
            round
            @click="submitData(2, 'location_info_update')"
            v-show="dialogType === 2"
            :loading="isLoading.update"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加留言信息 -->
      <el-form
        label-position="right"
        label-width="100px"
        :model="dialogData.message_info"
        ref="message_info"
        v-if="tableName === 'message_info' && dialogType === 0"
      >
        <el-form-item
          class="dialog-form-item mgt50"
          prop="type"
          :rules="rules.message_info.type"
          label="留言类型："
        >
          <el-select @change="getmessageOptions" v-model="dialogData.message_info.type">
            <el-option label="用户" :value="0"></el-option>
            <el-option label="植物" :value="1"></el-option>
            <el-option label="位置" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="dialog-form-item"
          prop="message_object_uid"
          :rules="rules.message_info.message_object_uid"
          label="留言对象："
        >
          <el-select
            v-model="dialogData.message_info.message_object_uid"
            :disabled="dialogData.message_info.type === null"
          >
            <el-option
              v-for="item in dialogData.messageOptions"
              :key="item.uid"
              :label="item.name"
              :value="item.uid"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="message_content"
          :rules="rules.message_info.message_content"
          label="留言内容："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.message_info.message_content"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="message_isshow"
          :rules="rules.message_info.message_isshow"
          label="是否显示："
          v-show="dialogData.message_info.type"
        >
          <el-select v-model="dialogData.message_info.message_isshow">
            <el-option label="是" :value="0"></el-option>
            <el-option label="否" :value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            class="btn"
            round
            @click="submitData(0,'message_info')"
            :loading="isLoading.submit"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 查看/修改留言信息 -->
      <el-form
        label-position="right"
        label-width="100px"
        :model="dialogData.message_info_update"
        ref="message_info_update"
        v-if="tableName === 'message_info' && dialogType !== 0"
      >
        <el-form-item class="dialog-form-item mgt50" label="(只读)UID：">
          <el-input
            class="dialog-form-item-input"
            v-model="dialogData.message_info_update.message_uid"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="message_content"
          :rules="rules.message_info.message_content"
          label="(只读)内容："
        >
          <el-input
            class="dialog-form-item-input"
            type="textarea"
            autosize
            v-model="dialogData.message_info_update.message_content"
          ></el-input>
        </el-form-item>

        <el-form-item
          class="dialog-form-item"
          prop="message_isshow"
          :rules="rules.message_info.message_isshow"
          label="是否显示："
          v-show="!dialogData.message_info_update.message_receiver_uid"
        >
          <el-select v-model="dialogData.message_info_update.message_isshow" :disabled="dialogType === 1">
            <el-option label="是" :value="0"></el-option>
            <el-option label="否" :value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" round @click="submitData(1)" v-show="dialogType === 1">修改</el-button>
          <el-button class="btn" round @click="submitData(3)" v-show="dialogType === 2">取消</el-button>
          <el-button
            class="btn"
            round
            @click="submitData(2, 'message_info_update')"
            v-show="dialogType === 2"
            :loading="isLoading.update"
          >提交</el-button>
        </el-form-item>
      </el-form>

      <!-- 识图补全 -->
      <el-form
        label-position="right"
        label-width="100px"
        v-if="tableName === 'plants_info' && dialogType === 3"
      >
      
        <el-form-item class="dialog-form-item" label="植物图片：">
          <ph-uploadimage :limit="1" @getImageDate="getImageDate"></ph-uploadimage>
        </el-form-item>

        <el-form-item>
          <el-button
            class="btn"
            round
            @click="clickUseWebAddBtn(1)"
            :loading="isLoading.submit"
          >识别</el-button>
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
      // ------表格------
      tableData: [], // 表格数据
      colData: [
        { label: "#", type: "index", width: "55" },
        { prop: "personal_uid", label: "UID", sortable: true },
        { prop: "personal_status", label: "状态" },
        { prop: "personal_nickname", label: "昵称" },
        { type: "selection", width: "55" }
      ], // 表格设置
      isLoading: {
        table: false,
        del: false,
        menu: false,
        submit: false,
        update: false
      }, // 加载状态
      tableName: "personal_info", // 表名
      search: "", // 搜索内容
      multipleSelection: [], // 选择项
      // ------分页------
      pagesTotal: 0, // 条目总数
      currentPage: 1, // 当前页数
      // ------弹出框------
      dialogVisible: false, // 弹出框 显示状态
      dialogType: 0, // 弹出框显示内容类型; 0添加 1查看 2更新 3识图补全
      dialogTitle: "关闭重试", // 弹出框 标题
      dialogData: {
        // 添加个人详情
        personal_info: {
          tableName: "personal_info",
          personal_account: "",
          personal_password: "",
          personal_nickname: "",
          personal_avatar: "",
          personal_number: ""
        },
        personal_info_beforUpdate: {}, // 个人详情修改前备份数据
        personal_info_update: {}, // 个人详情修改后数据
        // 添加植物详情
        plants_info: {
          tableName: "plants_info",
          plants_name: "",
          plants_picture: "",
          plants_distributions_uid: ""
        },
        plants_info_beforUpdate: {}, // 植物详情修改前备份数据
        plants_info_update: {}, // 植物详情修改后数据
        // 添加位置详情
        location_info: {
          tableName: "location_info",
          location_name: "",
          location_picture: "",
          location_parent_uid: ""
        },
        location_info_beforUpdate: {}, // 位置详情修改前备份数据
        location_info_update: {}, // 位置详情修改后数据
        // 添加留言信息
        message_info: {
          tableName: "message_info",
          type: null,
          message_object_uid: "",
          message_content: "",
          message_isshow: 0
        },
        message_info_beforUpdate: {}, // 留言详情修改前备份数据
        message_info_update: {}, // 留言详情修改后数据
        pictureUrl: "", // 原有图片地址
        locationOptions: [], // 省份选项
        messageOptions: [] // 消息选项
      }, // 弹出框 数据
      rules: {
        personal_info: {
          personal_account: [
            {
              required: true,
              message: "请输入账户名，长度在 4 到 12 个数字或者字母",
              trigger: ["blur", "change"]
            },
            {
              min: 4,
              max: 12,
              message: "长度在 4 到 12 个字符以内",
              trigger: ["blur", "change"]
            },
            {
              type: "string",
              pattern: /^[A-Za-z0-9]+$/,
              message: "只能填写数字或者字母"
            }
          ],
          personal_password: [
            {
              required: true,
              message: "请输入密码，长度在 4 到 12 个数字或者字母",
              trigger: ["blur", "change"]
            },
            {
              min: 4,
              max: 12,
              message: "长度在 4 到 12 个字符以内",
              trigger: ["blur", "change"]
            },
            {
              type: "string",
              pattern: /^[A-Za-z0-9]+$/,
              message: "只能填写数字或者字母"
            }
          ],
          personal_nickname: [
            {
              required: true,
              message: "请输入昵称，长度在 2 到 12 的数字、字母或者汉字",
              trigger: ["blur", "change"]
            },
            {
              min: 2,
              max: 12,
              message: "长度在 2 到 12 个字符",
              trigger: ["blur", "change"]
            },
            {
              type: "string",
              pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$|/,
              message: "只能填写数字、字母或者汉字"
            }
          ],
          personal_number: [
            {
              required: true,
              message: "请输入手机号码",
              trigger: ["blur", "change"]
            },
            {
              pattern: /^((13[0-9])|(14[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))\d{8}$/,
              message: "请填写正确的手机号码"
            }
          ]
        },
        plants_info: {
          plants_name: [
            {
              required: true,
              message: "请输入名称，长度在 12 以内的数字、字母或者汉字",
              trigger: ["blur", "change"]
            },
            {
              max: 12,
              message: "长度在 12 个字符以内",
              trigger: ["blur", "change"]
            },
            {
              type: "string",
              pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$|/,
              message: "只能填写数字、字母或者汉字"
            }
          ],
          plants_introduction: [
            {
              required: true,
              message: "请输入简介，长度在 250 以内的字符",
              trigger: ["blur", "change"]
            },
            {
              max: 250,
              message: "长度在 250 个字符以内",
              trigger: ["blur", "change"]
            }
          ],
          plants_distributions_uid: [
            {
              required: true,
              message: "请选择所处地区",
              trigger: "change"
            }
          ]
        },
        location_info: {
          location_name: [
            {
              required: true,
              message: "请输入名称，长度在 20 以内的数字、字母或者汉字",
              trigger: ["blur", "change"]
            },
            {
              max: 20,
              message: "长度在 20 个字符以内",
              trigger: ["blur", "change"]
            },
            {
              type: "string",
              pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$|/,
              message: "只能填写数字、字母或者汉字"
            }
          ],
          location_introduction: [
            {
              required: true,
              message: "请输入简介，长度在 250 以内的字符",
              trigger: ["blur", "change"]
            },
            {
              max: 250,
              message: "长度在 250 个字符以内",
              trigger: ["blur", "change"]
            }
          ],
          location_parent_uid: [
            {
              required: true,
              message: "请选择所属省/市",
              trigger: "change"
            }
          ]
        },
        message_info: {
          type: [
            {
              required: true,
              message: "请选择留言类型",
              trigger: "change"
            }
          ],
          message_object_uid: [
            {
              required: true,
              message: "请选择留言对象",
              trigger: "change"
            }
          ],
          message_content: [
            {
              required: true,
              message: "请输入内容，长度在 150 以内的字符",
              trigger: ["blur", "change"]
            },
            {
              max: 150,
              message: "长度在 250 个字符以内",
              trigger: ["blur", "change"]
            }
          ],
          message_isshow: [
            {
              required: true,
              message: "请选择是否显示",
              trigger: "change"
            }
          ]
        }
      }
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
            { prop: "message_location_uid", label: "留言所处位置" },
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
      let self = this;
      self.getTableDate();
      self.dialogVisible = true;
      self.dialogType = 0;
      switch (self.tableName) {
        case "personal_info":
          self.dialogTitle = "添加用户";
          break;
        case "plants_info":
          self.dialogTitle = "添加植物";
          break;
        case "location_info":
          self.dialogTitle = "添加位置";
          break;
        case "message_info":
          self.dialogTitle = "添加留言";
          break;
      }
      axios({
        url: api.adminGetLocationData,
        method: "post"
      }).then(res => {
        self.dialogData.locationOptions = res.data;
      });
    },
    // 获取子组件提交的图片数据
    getImageDate(val) {
      let self = this;
      if (self.tableName == "personal_info" && self.dialogType === 0) {
        self.dialogData.personal_info.personal_avatar = val;
      } else if (self.tableName == "personal_info" && self.dialogType === 2) {
        self.dialogData.personal_info_update.personal_avatar = val;
      } else if (self.tableName == "plants_info" && self.dialogType === 0) {
        self.dialogData.plants_info.plants_picture = val;
      } else if (self.tableName == "plants_info" && self.dialogType === 2) {
        self.dialogData.plants_info_update.plants_picture = val;
      } else if (self.tableName == "location_info" && self.dialogType === 0) {
        self.dialogData.location_info.location_picture = val;
      } else if (self.tableName == "location_info" && self.dialogType === 2) {
        self.dialogData.location_info_update.location_picture = val;
      } else if (self.tableName == "plants_info" && self.dialogType === 3) {
        self.dialogData.plants_info.plants_picture = val;
      }
    },
    // 提交数据
    submitData(val, formName) {
      let self = this;
      // 提交添加数据
      if (val === 0) {
        self.$refs[formName].validate(valid => {
          if (valid) {
            self.isLoading.submit = true;
            axios({
              url: api.adminAddData,
              method: "post",
              data: self.dialogData[formName]
            })
              .then(res => {
                self.isLoading.submit = false;
                self.dialogVisible = false;
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
              })
              .catch(() => {
                self.isLoading.submit = false;
                self.dialogVisible = false;
                self.getTableDate();
                self.$message({
                  message: `服务器出错,添加数据失败,请刷新页面重试`,
                  type: "warning"
                });
              });
          } else {
            return;
          }
        });
      }
      // 点击修改
      else if (val === 1) {
        self.dialogType = 2;
        self.dialogData.personal_info_beforUpdate = Object.assign(
          {},
          self.dialogData.personal_info_update
        );
        self.dialogData.plants_info_beforUpdate = Object.assign(
          {},
          self.dialogData.plants_info_update
        );
      }
      // 点击取消
      else if (val === 3) {
        self.dialogType = 1;
        self.dialogData.personal_info_update = Object.assign(
          {},
          self.dialogData.personal_info_beforUpdate
        );
        self.dialogData.plants_info_update = Object.assign(
          {},
          self.dialogData.plants_info_beforUpdate
        );
      }
      // 提交修改数据
      else if (val === 2) {
        self.$refs[formName].validate(valid => {
          if (valid) {
            self.isLoading.update = true;
            axios({
              url: api.adminUpdataData,
              method: "post",
              data: {
                tableName: self.tableName,
                data: self.dialogData[`${self.tableName}_update`],
                pictureUrl: self.dialogData.pictureUrl
              }
            })
              .then(res => {
                self.isLoading.update = false;
                self.dialogVisible = false;
                self.getTableDate();
                if (res.data.code == 0) {
                  self.$message({
                    type: "success",
                    message: "修改成功!"
                  });
                }
                if (res.data.code == 1) {
                  self.$message({
                    type: "warning",
                    message: res.data.err
                  });
                }
              })
              .catch(() => {
                self.isLoading.update = false;
                self.dialogVisible = false;
                self.getTableDate();
                self.$message({
                  message: `服务器出错,添加数据失败,请刷新页面重试`,
                  type: "warning"
                });
              });
          } else {
            return;
          }
        });
      }
    },
    // 点击 删除按钮
    clickDelBtn() {
      let self = this;
      self.getTableDate();
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
    // 双击某行
    handleRowClick(val) {
      let self = this;
      self.dialogVisible = true;
      self.dialogType = 1;
      self.getmessageOptions()
      axios({
        url: api.adminGetLocationData,
        method: "post"
      }).then(res => {
        self.dialogData.locationOptions = res.data;
      });
      if (self.tableName == "personal_info") {
        self.dialogTitle = "查看/修改 个人详情";
        self.dialogData.personal_info_update = Object.assign({}, val);
        if (val.personal_avatar) {
          self.dialogData.pictureUrl = api.ip + val.personal_avatar;
        } else {
          self.dialogData.pictureUrl = null;
        }
      } else if (self.tableName == "plants_info") {
        self.dialogTitle = "查看/修改 植物详情";
        self.dialogData.plants_info_update = Object.assign({}, val);
        if (val.plants_picture) {
          self.dialogData.pictureUrl = api.ip + val.plants_picture;
        } else {
          self.dialogData.pictureUrl = null;
        }
      } else if (self.tableName == "location_info") {
        self.dialogTitle = "查看/修改 位置详情";
        self.dialogData.location_info_update = Object.assign({}, val);
        if (val.location_picture) {
          self.dialogData.pictureUrl = api.ip + val.location_picture;
        } else {
          self.dialogData.pictureUrl = null;
        }
      } else if (self.tableName == "message_info") {
        self.dialogTitle = "查看/修改 留言详情";
        self.dialogData.message_info_update = Object.assign({}, val);
      }
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
                foo.personal_status = "封禁";
              } else if (foo.personal_status == 3) {
                foo.personal_status = "异常";
              }
            });
            self.tableData = res.data.data.list;
            self.pagesTotal = res.data.data.count;
          } else if (res.data.code == 300) {
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
    },
    // 获取留言对象选项
    getmessageOptions() {
      let self = this;
      self.dialogData.message_info.message_object_uid = null;
      axios({
        data: { type: self.dialogData.message_info.type },
        url: api.adminGetLocationData,
        method: "post"
      }).then(res => {
        self.dialogData.messageOptions = res.data;
      });
    },
    // 登出
    handleSignoutClick() {
      let self = this;
      self
        .$confirm(`是否退出登录?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        })
        .then(() => {
          axios({
            url: api.adminSignout,
            method: "post"
          })
            .then(() => {
              self.$router.replace({ path: "/" });
              self.$message({
                message: `登出成功`,
                type: "success"
              });
            })
            .catch(err => {
              self.getTableDate();
              self.$message({
                message: `${err},请刷新页面重试`,
                type: "warning"
              });
            });
        })
        .catch(() => {
        });
    },
    // 识图补全
    clickUseWebAddBtn(val) {
      let self = this
      if (val === 0) {
        self.dialogType = 3
        self.dialogVisible = true;
        self.dialogTitle = "识图补全";
      }
      else if (val === 1) {
        if (!self.dialogData.plants_info.plants_picture) {
          self.$message({
            message: `请上传图片`,
            type: "warning"
          });
        } else{
          self.isLoading.submit = true
          axios({
            url: api.pictureRecognition,
            method: "post",
            data: {
              picture: self.dialogData.plants_info.plants_picture,
              roles: "admin"
            }
          })
            .then(res => {
              self.isLoading.submit = false;
              self.dialogVisible = false;
              self.getTableDate();
              if (res.data.code == 0) {
                self.$message({
                  type: "success",
                  message: "识别成功!"
                });
              }
              if (res.data.code == 1) {
                self.$message({
                  type: "warning",
                  message: res.data.err
                });
              }
            })
            .catch(() => {
              self.isLoading.submit = false;
              self.dialogVisible = false;
              self.getTableDate();
              self.$message({
                message: `服务器出错,请刷新页面重试`,
                type: "warning"
              });
            });
        }
      }
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
.el-dialog__header {
  text-align: left;
  font-size: 30px;
}
.el-dialog__title {
  margin-left: 20px;
}
.el-dialog__headerbtn {
  margin: 5px 5px 0 0;
}
.mgt50 {
  margin-top: 50px;
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
.dialog-form-item {
  padding-left: 120px;
}
.dialog-form-item-input {
  width: 350px;
}
.out-btn {
  position: absolute;
  z-index: 999;
  bottom: 10px;
  right: 0px;
}
</style>