<template>
  <div>
    <el-card class="container">
      <el-row>
        <el-col>
          <div style="padding-left: 10px">
            <div class="handle-box">
              <el-input v-model="query.username" placeholder="搜索" class="handle-input mr10" clearable></el-input>
              <el-select v-model="query.state" placeholder="状态" class="handle-select mr10" clearable>
                <el-option key="1" label="正常" value="NORMAL"></el-option>
                <el-option key="2" label="锁定" value="LOCKED"></el-option>
              </el-select>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button type="primary" :icon="Plus" @click="addVisible = true;Object.assign(form, new User())"
                         v-action:user:create>高级搜索
              </el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
              <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
              <el-table-column prop="category" label="类型" width="60">
                <template #default="scope">
                  <el-tag type="success">
                    <!--TODO 翻译分类-->
                    {{ scope.row.category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="标题" width="720"></el-table-column>
              <el-table-column prop="comments" label="评论" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="时间" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="大小" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="上传" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="下载" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="完成" width="80" sortable></el-table-column>
              <el-table-column prop="comments" label="进度" width="80"></el-table-column>
              <el-table-column prop="comments" label="发布者" width="80"></el-table-column>
              <!--              <el-table-column prop="gender" label="性别">-->
              <!--                <template #default="{ row }">-->
              <!--                  <span>{{ row.gender === 'MALE' ? '男' : '女' }}</span>-->
              <!--                </template>-->
              <!--              </el-table-column>-->
              <!--              <el-table-column label="头像" align="center">-->
              <!--                <template #default="scope">-->
              <!--                  <el-image-->
              <!--                      class="table-td-thumb"-->
              <!--                      :src="scope.row.avatar"-->
              <!--                      :z-index="10"-->
              <!--                      :preview-src-list="[scope.row.avatar]"-->
              <!--                      preview-teleported-->
              <!--                  >-->
              <!--                  </el-image>-->
              <!--                </template>-->
              <!--              </el-table-column>-->
              <el-table-column label="状态" align="center">
                <template #default="scope">
                  <el-tag
                      :type="scope.row.state === 'NORMAL' ? 'success' : scope.row.state === 'LOCKED' ? 'danger' : ''"
                  >
                    {{ scope.row.state === 'NORMAL' ? '正常' : scope.row.state === 'LOCKED' ? '锁定' : '' }}
                  </el-tag>
                </template>
              </el-table-column>

              <!--              <el-table-column prop="createdTime" label="注册时间"></el-table-column>-->
              <el-table-column label="操作" width="94" align="center">
                <template #default="scope">
                  <el-button circle
                             size="small"
                             type="primary"
                             :icon="Download"
                             @click="handleDownload(scope.$index, scope.row)" v-action:torrent:download>
                  </el-button>
                  <el-button circle
                             size="small"
                             type="primary"
                             :icon="Star"
                             @click="handleStar( scope.row)" v-action:torrent:star>
                  </el-button>

                </template>
              </el-table-column>
            </el-table>
            <div class="pagination">
              <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :current-page="query.pageIndex"
                  :page-size="query.pageSize"
                  :total="pageTotal"
                  @current-change="handlePageChange"
              ></el-pagination>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 高级搜索弹出框 -->
    <el-dialog title="高级搜索" v-model="addVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="分类">
          <el-input v-model="query.category"></el-input>
        </el-form-item>
        <el-input v-model="form.avatar" hidden="hidden" v-show="false"></el-input>
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="全名">
          <el-input v-model="form.fullName"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio label="MALE">男</el-radio>
            <el-radio label="FEMALE">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="addVisible = false">取 消</el-button>
					<el-button type="primary" @click="search">确 定</el-button>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="torrent">
import {reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, Star, StarFilled, Plus, Search, Download} from '@element-plus/icons-vue';
import {createUser, deleteUser, updateUser} from "../api/user";
import {
  downloadTorrent,
  favoriteTorrent,
  fetchList
} from "../api/torrent";

interface OrgTreeNode {
  name: string
  id: number
  children?: OrgTreeNode[]
  type: OrgTypeEum
  isLeaf?: boolean
}

enum OrgTypeEum {
  DEPART = 'DEPARTMENT',
  JOB = 'JOB',
}

const query = reactive({
  keyword: '',
  username: '',
  //分类
  category: '',
  //制作组
  team: '',
  //活种
  alive: '',
  //促销
  promotion: '',
  //收藏
  collect: '',
  //分辨率
  resolution: '',
  state: '',
  pageIndex: 1,
  pageSize: 10
});

// 获取表格数据
const reqAll = async () => {
  const res = await fetchList({
    page: query.pageIndex,
    size: query.pageSize,
    state: query.state || undefined,
    keyword: query.keyword
  })
  tableData.value = res.data.data;
  pageTotal.value = res.data.page.total;
}
reqAll();

interface TableItem {
  id: number;
  username: string;
  fullName: string;
  gender: string;
  avatar: string;
  state: string;
}

const tableData = ref([]);
const pageTotal = ref(0);


// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  reqAll();
};
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  reqAll();
};

// 收藏
const handleStar = (row: any) => {

  favoriteTorrent(row.id).then(res => {
      reqAll();
    ElMessage.success('操作成功');
  })
  .catch(() => {
      });
};

//表格新增时
const addVisible = ref(false);

// 表格编辑时弹窗和保存
const editVisible = ref(false);

class User {
  username = '';
  fullName = '';
  gender = 'MALE';
  avatar = '';
  organizationId = 1;
}

let id: number = 0;
let form = reactive(new User());

const search = () => {
  reqAll();
  addVisible.value = false;
};
//Download torrent
const handleDownload = (index: number, row: any) => {
  console.log("开始下载：" + row.id)
  downloadTorrent(row.id)
  .then((res)=>{
    const blob = new Blob([res.data],{type:'application/octet-stream'}); // 创建 blob 对象 type 可以使用 headers 里面的 contentType
    let headers = res.headers
    let fileName = headers["content-disposition"]
    fileName = fileName.split('=')[1]
    const a = document.createElement("a"); 
    a.download = decodeURI(fileName);
    const url = window.URL.createObjectURL(blob); // 创建媒体流 url ，详细了解可自己查 URL.createObjectURL（推荐 MDN ）

    a.href = url;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // 删除创建的媒体流 url 对象
  })
  .catch(()=>{
    console.log('下载失败')
  })

};

</script>

<style scoped>
.container {
  height: 80vh;
  overflow-y: auto;
}
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #F56C6C;
}

.mr10 {
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
