<template>
  <div class="pf-uploadimage">
    <el-upload
      class="upload-image"
      accept="image/jpeg, image/png"
      action
      :file-list="fileList"
      list-type="picture-card"
      :on-change="handleOnChange"
      :auto-upload="false"
    >
      <i slot="default" class="el-icon-plus"></i>
      <div slot="file" slot-scope="{file}">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
            <i class="el-icon-zoom-in"></i>
          </span>
          <span class="el-upload-list__item-delete" @click="handleRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
    </el-upload>
    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      dialogVisible: false,
      dialogImageUrl: ""
    };
  },
  methods: {
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleRemove(file) {
      this.fileList = this.fileList.filter(foo => {
        return foo.uid != file.uid;
      });
    },
    handleOnChange(file) {
      let self = this;
      new Promise((resolve) => {
        let reader = new FileReader();
        reader.readAsDataURL(file.raw);
        reader.onload = function() {
          file.base64 = this.result;
          resolve();
        };
      })
        .then(() => {
          self.fileList.push(file);
        })
        .catch(err => {
          self.$message({
            message: err,
            type: "warning"
          });
        });
    },
    submitUpload() {
      let self = this;
      self.$axios({
        url: 'http://127.0.0.1:3000/api/testimages',
        method: 'post',
        data: {
          'image':self.fileList
        }
      })
    }
  }
};
</script>

<style>
</style>