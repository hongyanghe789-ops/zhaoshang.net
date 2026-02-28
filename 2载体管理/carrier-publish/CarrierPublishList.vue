<script setup lang="ts">
/**
 * 载体发布列表页
 * 基于 Figma 设计稿 node-id=3265-381948
 * 新增字段：浏览量(PV/UV)、IM咨询数、电话拨打数、收藏量、点击量
 * 数据通过API从招商网络平台实时回传
 */
import { ref, computed, onMounted } from 'vue'
import type { CarrierPublishItem, CarrierPublishQuery, AuditStatus } from './types'
import { auditStatusMap } from './types'
import { useCarrierPublishApi } from './useCarrierPublishApi'

const api = useCarrierPublishApi()

// ---- 状态 ----
const loading = ref(false)
const items = ref<CarrierPublishItem[]>([])
const total = ref(0)
const activeTab = ref('factory') // 厂房 | 仓库 | 写字楼

const query = ref<CarrierPublishQuery>({
  region: '',
  auditStatus: '',
  publishTimeRange: undefined,
  keyword: '',
  page: 1,
  pageSize: 10,
  sortBy: undefined,
  sortOrder: undefined,
})

// 菜单
const menuVisible = ref<Record<string | number, boolean>>({})

// ---- 表头定义 ----
const headers = computed(() => [
  { title: '房源名称', key: 'name', sortable: false, width: '200px' },
  { title: '所属建筑', key: 'building', sortable: false, width: '140px' },
  { title: '联系人', key: 'contact', sortable: false, width: '100px' },
  { title: '租售朝向', key: 'direction', sortable: false, width: '110px' },
  { title: '审核状态', key: 'auditStatus', sortable: false, width: '110px' },
  { title: '浏览量(PV/UV)', key: 'pvuv', sortable: true, width: '130px' },
  { title: 'IM咨询数', key: 'imCount', sortable: true, width: '100px' },
  { title: '电话拨打数', key: 'callCount', sortable: true, width: '100px' },
  { title: '收藏量', key: 'favoriteCount', sortable: true, width: '80px' },
  { title: '点击量', key: 'clickCount', sortable: true, width: '80px' },
  { title: '是否更新', key: 'isUpdated', sortable: false, width: '80px' },
  { title: '发布时间', key: 'publishTime', sortable: true, width: '120px' },
  { title: '操作', key: 'actions', sortable: false, width: '80px', align: 'center' as const },
])

// ---- Tab 配置 ----
const tabs = [
  { value: 'factory', label: '厂房' },
  { value: 'warehouse', label: '仓库' },
  { value: 'office', label: '写字楼' },
]

// ---- 审核状态选项 ----
const auditStatusOptions = [
  { title: '全部', value: '' },
  { title: '已上架', value: 'published' },
  { title: '审核中', value: 'reviewing' },
  { title: '已拒绝', value: 'rejected' },
  { title: '已下架', value: 'unpublished' },
]

// ---- 方法 ----
async function loadData() {
  loading.value = true
  try {
    const res = await api.fetchList(query.value)
    items.value = res.items
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.page = 1
  loadData()
}

function resetFilters() {
  query.value = {
    region: '',
    auditStatus: '',
    publishTimeRange: undefined,
    keyword: '',
    page: 1,
    pageSize: query.value.pageSize,
  }
  loadData()
}

function handlePageChange(page: number) {
  query.value.page = page
  loadData()
}

function handlePageSizeChange(size: number) {
  query.value.pageSize = size
  query.value.page = 1
  loadData()
}

function handleSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  query.value.sortBy = sortBy
  query.value.sortOrder = sortOrder
  loadData()
}

/** 千分位格式化 */
function formatNumber(num: number | undefined | null): string {
  if (num == null) return '--'
  return num.toLocaleString('zh-CN')
}

/** 获取转化率样式 */
function getConversionClass(item: CarrierPublishItem): string {
  if (!item.feedback) return ''
  const rate = item.feedback.conversionRate
  const pv = item.feedback.pv
  if (rate > 5) return 'text-success'
  if (rate < 1 && pv > 100) return 'text-warning'
  if (pv === 0) return 'text-error'
  return ''
}

/** 去门户查看 */
function viewOnPortal(item: CarrierPublishItem) {
  // TODO: 跳转到招商网络平台门户页面
  window.open(`https://www.zhaoshang.net/carrier/${item.id}`, '_blank')
}

/** 下架 */
async function handleUnpublish(item: CarrierPublishItem) {
  await api.unpublishCarrier(item.id)
  loadData()
}

/** 删除 */
async function handleDelete(item: CarrierPublishItem) {
  await api.removeCarrier(item.id)
  loadData()
}

/** 推广（发送） */
function handlePromote(item: CarrierPublishItem) {
  // TODO: 打开推广弹窗
  console.log('promote', item.id)
}

onMounted(loadData)
</script>

<template>
  <div>
    <!-- 顶部提示条 -->
    <VAlert
      type="warning"
      variant="tonal"
      class="mb-6"
      closable
    >
      此列表用于管理发布至【招商网络平台】的载体信息，可进行载体发布、查看发布状态。剩余可发布载体：30/100。
    </VAlert>

    <!-- Tab 切换：厂房 / 仓库 / 写字楼 -->
    <div class="d-flex align-center gap-2 mb-6">
      <VBtn
        v-for="tab in tabs"
        :key="tab.value"
        :variant="activeTab === tab.value ? 'flat' : 'text'"
        :color="activeTab === tab.value ? 'primary' : 'default'"
        size="small"
        rounded="pill"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </VBtn>
    </div>

    <!-- 筛选区域 -->
    <VCard class="mb-6">
      <VCardText>
        <div class="text-h6 mb-4">
          筛选
        </div>
        <VRow>
          <VCol cols="12" md="3">
            <VSelect
              v-model="query.region"
              label="所在地区"
              :items="[{ title: '全部', value: '' }, { title: '天津市西青区', value: 'xiqing' }]"
              clearable
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="query.auditStatus"
              label="审核状态"
              :items="auditStatusOptions"
              clearable
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="3">
            <!-- 发布时间范围 -->
            <VTextField
              label="发布时间"
              density="compact"
              placeholder="选择时间范围"
              readonly
            />
          </VCol>
          <VCol cols="12" md="3" class="d-flex align-center">
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="ri-filter-line"
              @click="resetFilters"
            >
              全部筛选
            </VBtn>
          </VCol>
        </VRow>

        <!-- 搜索 + 每页条数 + 发布按钮 -->
        <VRow class="mt-2" align="center">
          <VCol cols="12" md="3">
            <VTextField
              v-model="query.keyword"
              placeholder="搜索"
              density="compact"
              prepend-inner-icon="ri-search-line"
              @keyup.enter="handleSearch"
            />
          </VCol>
          <VSpacer />
          <VCol cols="auto" class="d-flex align-center gap-4">
            <VSelect
              v-model="query.pageSize"
              :items="[10, 20, 50]"
              density="compact"
              style="inline-size: 80px;"
              @update:model-value="handlePageSizeChange"
            />
            <VBtn
              color="primary"
              prepend-icon="ri-add-line"
            >
              发布厂房
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 数据表格 -->
    <VCard>
      <VTable
        class="text-no-wrap"
        hover
        :loading="loading"
      >
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              :style="{ width: header.width }"
              class="text-uppercase"
            >
              <span
                class="d-inline-flex align-center gap-1 cursor-pointer"
                @click="header.sortable ? handleSort(header.key, query.sortOrder === 'asc' ? 'desc' : 'asc') : undefined"
              >
                {{ header.title }}
                <VIcon
                  v-if="header.sortable"
                  size="14"
                  :icon="query.sortBy === header.key && query.sortOrder === 'desc' ? 'ri-arrow-down-s-fill' : 'ri-arrow-up-s-fill'"
                  :color="query.sortBy === header.key ? 'primary' : 'secondary'"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <!-- 房源名称 -->
            <td>
              <div class="d-flex align-center gap-3">
                <VAvatar size="38" rounded="lg" variant="tonal">
                  <VImg
                    v-if="item.image"
                    :src="item.image"
                    cover
                  />
                  <VIcon v-else icon="ri-building-line" />
                </VAvatar>
                <span class="font-weight-medium">{{ item.name }}</span>
              </div>
            </td>

            <!-- 所属建筑 -->
            <td>
              <div>{{ item.building }}</div>
              <div class="text-caption text-secondary">
                {{ item.buildingAddress }}
              </div>
            </td>

            <!-- 联系人 -->
            <td>
              <div>{{ item.contactName }}</div>
              <div class="text-caption text-secondary">
                {{ item.contactPhone }}
              </div>
            </td>

            <!-- 租售朝向 -->
            <td>
              <div v-if="item.rentPrice" class="d-flex align-center gap-1">
                <VChip size="x-small" color="warning" variant="flat" label>
                  租
                </VChip>
                {{ item.rentPrice }}
              </div>
              <div v-if="item.salePrice" class="d-flex align-center gap-1">
                <VChip size="x-small" color="info" variant="flat" label>
                  售
                </VChip>
                {{ item.salePrice }}
              </div>
              <span v-if="!item.rentPrice && !item.salePrice">-</span>
            </td>

            <!-- 审核状态 -->
            <td>
              <div>
                <VChip
                  :color="auditStatusMap[item.auditStatus]?.color"
                  size="small"
                  variant="dot"
                >
                  {{ auditStatusMap[item.auditStatus]?.label }}
                </VChip>
              </div>
              <div
                v-if="item.auditStatus === 'rejected' && item.rejectReason"
                class="text-caption text-error mt-1"
                style="max-inline-size: 150px;"
              >
                {{ item.rejectReason }}
              </div>
            </td>

            <!-- ★ 浏览量 (PV/UV) -->
            <td :class="getConversionClass(item)">
              <template v-if="item.feedback">
                <span class="font-weight-medium">{{ formatNumber(item.feedback.pv) }}</span>
                <span class="text-secondary"> / </span>
                <span>{{ formatNumber(item.feedback.uv) }}</span>
              </template>
              <span v-else class="text-disabled">--</span>
            </td>

            <!-- ★ IM咨询数 -->
            <td>
              <template v-if="item.feedback">
                <span class="font-weight-medium">{{ formatNumber(item.feedback.imCount) }}</span>
              </template>
              <span v-else class="text-disabled">--</span>
            </td>

            <!-- ★ 电话拨打数 -->
            <td>
              <template v-if="item.feedback">
                <span class="font-weight-medium">{{ formatNumber(item.feedback.callCount) }}</span>
              </template>
              <span v-else class="text-disabled">--</span>
            </td>

            <!-- ★ 收藏量 -->
            <td>
              <template v-if="item.feedback">
                <span class="font-weight-medium">{{ formatNumber(item.feedback.favoriteCount) }}</span>
              </template>
              <span v-else class="text-disabled">--</span>
            </td>

            <!-- ★ 点击量 -->
            <td>
              <template v-if="item.feedback">
                <span class="font-weight-medium">{{ formatNumber(item.feedback.clickCount) }}</span>
              </template>
              <span v-else class="text-disabled">--</span>
            </td>

            <!-- 是否更新 -->
            <td>
              <VChip
                :color="item.isUpdated ? 'error' : 'secondary'"
                size="small"
                variant="flat"
              >
                {{ item.isUpdated ? '是' : '否' }}
              </VChip>
            </td>

            <!-- 发布时间 -->
            <td class="text-medium-emphasis">
              {{ item.publishTime }}
            </td>

            <!-- 操作 -->
            <td>
              <div class="d-flex align-center gap-1">
                <IconBtn
                  size="small"
                  @click="handlePromote(item)"
                >
                  <VIcon icon="ri-send-plane-line" size="18" />
                  <VTooltip activator="parent">
                    推广
                  </VTooltip>
                </IconBtn>

                <VMenu v-model="menuVisible[item.id]">
                  <template #activator="{ props }">
                    <IconBtn
                      size="small"
                      v-bind="props"
                    >
                      <VIcon icon="ri-more-2-line" size="18" />
                    </IconBtn>
                  </template>
                  <VList density="compact">
                    <VListItem @click="viewOnPortal(item)">
                      <VListItemTitle>去门户查看</VListItemTitle>
                    </VListItem>
                    <VListItem
                      v-if="item.auditStatus === 'published'"
                      @click="handleUnpublish(item)"
                    >
                      <VListItemTitle>下架</VListItemTitle>
                    </VListItem>
                    <VListItem @click="handleDelete(item)">
                      <VListItemTitle class="text-error">
                        删除
                      </VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>

      <VDivider />

      <!-- 分页 -->
      <div class="d-flex align-center justify-space-between flex-wrap gap-4 pa-4">
        <span class="text-disabled text-body-2">
          共{{ total }}条
        </span>
        <VPagination
          v-model="query.page"
          :length="Math.ceil(total / query.pageSize)"
          :total-visible="5"
          rounded="circle"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </div>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
// 表头排序图标交互
th .cursor-pointer {
  cursor: pointer;
  user-select: none;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}

// 反馈数据列 hover 效果
td .font-weight-medium {
  cursor: default;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
