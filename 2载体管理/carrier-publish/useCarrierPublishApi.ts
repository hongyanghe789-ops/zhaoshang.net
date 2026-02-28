/** 载体发布 - API 组合函数 */
import type {
  CarrierFeedbackResponse,
  CarrierPublishListResponse,
  CarrierPublishQuery,
} from './types'

// 实际项目中替换为真实的 axios 实例
// import axios from '@/plugins/axios'

/** 模拟数据，开发阶段使用 */
const mockFeedback = () => ({
  pv: Math.floor(Math.random() * 5000),
  uv: Math.floor(Math.random() * 2000),
  imCount: Math.floor(Math.random() * 50),
  callCount: Math.floor(Math.random() * 30),
  favoriteCount: Math.floor(Math.random() * 100),
  clickCount: Math.floor(Math.random() * 3000),
  conversionRate: +(Math.random() * 10).toFixed(1),
  lastUpdateTime: '2026-02-24 14:30',
})

export function useCarrierPublishApi() {
  /** 获取载体发布列表 */
  async function fetchList(query: CarrierPublishQuery): Promise<CarrierPublishListResponse> {
    // TODO: 替换为真实API
    // const { data } = await axios.get('/api/carrier/publish/list', { params: query })
    // return data

    // 模拟数据
    const items = Array.from({ length: query.pageSize }, (_, i) => {
      const index = (query.page - 1) * query.pageSize + i
      const statuses = ['published', 'reviewing', 'rejected', 'unpublished'] as const

      return {
        id: 1000 + index,
        name: `${1000 + index}`,
        image: '',
        building: '新城市中心E座',
        buildingAddress: '天津市西青区',
        contactName: '张三',
        contactPhone: '18812341234',
        rentPrice: index % 2 === 0 ? '500元/㎡·天' : undefined,
        salePrice: index % 2 === 1 ? '2000元/㎡' : undefined,
        auditStatus: statuses[index % 4],
        rejectReason: statuses[index % 4] === 'rejected' ? '原因说明原因原因说明原因说明原因说明原因说...' : undefined,
        isUpdated: index % 3 === 0,
        publishTime: '0000-00-00',
        feedback: mockFeedback(),
      }
    })

    return { items, total: 60 }
  }

  /** 获取单个载体反馈数据（从招商网络平台实时回传） */
  async function fetchFeedback(carrierId: string | number): Promise<CarrierFeedbackResponse> {
    // TODO: 替换为真实API
    // const { data } = await axios.get('/api/carrier/feedback', {
    //   params: { carrierId, metrics: ['pv', 'uv', 'im', 'call', 'favorite', 'click'] },
    // })
    // return data

    return {
      code: 200,
      data: {
        summary: mockFeedback(),
        trend: [],
        lastUpdateTime: '2026-02-24 14:30:00',
      },
    }
  }

  /** 手动刷新反馈数据 */
  async function refreshFeedback(carrierId: string | number) {
    // TODO: 替换为真实API
    // return axios.post(`/api/carrier/feedback/refresh`, { carrierId })
    return { code: 200, message: '数据已更新' }
  }

  /** 删除载体发布 */
  async function removeCarrier(carrierId: string | number) {
    // TODO: 替换为真实API
    // return axios.delete(`/api/carrier/publish/${carrierId}`)
    return { code: 200 }
  }

  /** 下架载体 */
  async function unpublishCarrier(carrierId: string | number) {
    // TODO: 替换为真实API
    // return axios.post(`/api/carrier/publish/${carrierId}/unpublish`)
    return { code: 200 }
  }

  return {
    fetchList,
    fetchFeedback,
    refreshFeedback,
    removeCarrier,
    unpublishCarrier,
  }
}
