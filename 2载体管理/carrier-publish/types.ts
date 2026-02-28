/** 载体发布 - 类型定义 */

/** 审核状态枚举 */
export type AuditStatus = 'published' | 'reviewing' | 'rejected' | 'unpublished'

/** 审核状态配置 */
export const auditStatusMap: Record<AuditStatus, { label: string; color: string }> = {
  published: { label: '已上架', color: 'success' },
  reviewing: { label: '审核中', color: 'warning' },
  rejected: { label: '已拒绝', color: 'error' },
  unpublished: { label: '已下架', color: 'secondary' },
}

/** 租售方向 */
export interface RentSaleDirection {
  rent?: string // 租金
  sale?: string // 售价
}

/** 反馈数据 */
export interface CarrierFeedback {
  pv: number // 浏览量（PV）
  uv: number // 访客数（UV）
  imCount: number // IM咨询数
  callCount: number // 电话拨打数
  favoriteCount: number // 收藏量
  clickCount: number // 点击量
  conversionRate: number // 转化率（%）
  lastUpdateTime: string // 最后更新时间
}

/** 载体发布列表项 */
export interface CarrierPublishItem {
  id: string | number
  name: string // 房源名称
  image: string // 房源图片
  building: string // 所属建筑
  buildingAddress: string // 地址
  contactName: string // 联系人
  contactPhone: string // 联系电话
  rentPrice?: string // 租金
  salePrice?: string // 售价
  auditStatus: AuditStatus // 审核状态
  rejectReason?: string // 拒绝原因
  isUpdated: boolean // 是否更新
  publishTime: string // 发布时间
  // --- 新增反馈数据字段 ---
  feedback: CarrierFeedback | null
}

/** 列表查询参数 */
export interface CarrierPublishQuery {
  keyword?: string
  region?: string
  auditStatus?: AuditStatus | ''
  publishTimeRange?: [string, string]
  pvRange?: string // 浏览量范围
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** 列表响应 */
export interface CarrierPublishListResponse {
  items: CarrierPublishItem[]
  total: number
}

/** 反馈数据API响应 */
export interface CarrierFeedbackResponse {
  code: number
  data: {
    summary: CarrierFeedback
    trend: Array<{
      date: string
      pv: number
      uv: number
      imCount: number
      callCount: number
      favoriteCount: number
      clickCount: number
    }>
    lastUpdateTime: string
  }
}
