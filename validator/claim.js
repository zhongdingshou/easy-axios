export const claim = {
  // 格式
  // test: {                     // 必需。test 名称
  //   description: '描述信息',  // 必需。属性的描述
  //   type: 'string',          // 必需。属性值的数据类型
  //   enum: ['a', 'bb'],       // 可选。属性值的选择范围，放在数组内
  //   properties: {},          // 可选。test 对象下的属性
  // },
  easyAxiosConfig: {
    description: 'easyAxios 相关配置信息',
    type: 'object',
    properties: { // easyAxiosConfig 的属性 isOpenTips、maxReconnectionTimes ...
      isOpenTips: {
        description: '是否开启提示',
        type: 'boolean',
      },
      isOpenCancelDuplicateRequest: {
        description: '是否开启取消重复请求',
        type: 'boolean',
      },
      isOpenRequestCache: {
        description: '是否开启请求缓存',
        type: 'boolean',
      },
      cacheEffectiveTime: {
        description: '请求缓存有效时间',
        type: 'number',
      },
      maxReconnectionTimes: {
        description: '网络超时连接失败后重连次数',
        type: 'number',
      },
      statusHandlers: {
        description: '错误码（tttp的或者自定义的）和对应方法',
        type: 'object',
      }
    }
  },
  beforeRequestHook: {
    description: '请求前的处理',
    type: 'function',
  },
  afterResponseHook: {
    description: '响应后的处理',
    type: 'function',
  },
  tipsFunction: {
    description: '提示信息的处理',
    type: 'function',
  },
  startLoading: {
    description: '添加加载动画',
    type: 'function',
  },
  endLoading: {
    description: '去掉加载动画',
    type: 'function',
  },
  getStatusFormResult: {
    description: '获取服务端返回状态码',
    type: 'function',
  },
  getMassageFormResult: {
    description: '获取服务端返回信息',
    type: 'function',
  },
  getDataFormResult: {
    description: '获取服务端返回数据',
    type: 'function',
  },
  validateResultStatus: {
    description: '验证器，验证请求是否成功',
    type: 'function',
  },
}