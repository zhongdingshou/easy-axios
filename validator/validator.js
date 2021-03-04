import { toRawType } from '../utils/utils.js'

export const validator =  (options, claim) => {
    if(toRawType(options) !== 'object') return {
        illegal: true,
        errorMsg: '参数 options 数据类型不是 object，请检查'
    }
    
    return checkSome(options, claim)
}

const checkSome = (options, claim) => {
    for (const item in claim) {
        // 验证类型
        if (options.hasOwnProperty(item) && (toRawType(options[item]) !== claim[item].type)) return {
            illegal: true,
            errorMsg: `参数 ${item} 数据类型不是 ${claim[item].type}，请检查`
        }

        // 验证范围
        if (claim[item].hasOwnProperty('enum') && !claim[item].enum.includes(options[item])) return {
            illegal: true,
            errorMsg: `参数 ${item} 的值不是 ${claim[item].enum.join('，')}，请检查`
        }

        // 验证属性值
        if (claim[item].hasOwnProperty('properties')) {
            // 递归
            const res =  checkSome(options[item], claim[item].properties)
            
            if (res.illegal) return res
        } 
    }
    return {
        illegal: false
    }
}