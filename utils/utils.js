// 判断类型
export const toRawType = (o) => Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1].toLocaleLowerCase();

// 立即执行函数，给 toRawType 函数对象添加属性
// 调用 toRawType.isObject({}) 
(()=> { 
	['Null',
	'Undefined',
	'Object',
	'Array',
	'String',
	'Number',
	'Boolean',
	'Function',
	'RegExp'
	].forEach((t) => {
		toRawType['is' + t] = (o) => toRawType(o) === t.toLocaleLowerCase()
	})
})()


// 合并对象，两个对象相同属性名的值将添加在一起
export const merge = (...objs) =>
  	[...objs].reduce(
		(acc, obj) =>
			Object.keys(obj).reduce((a, k) => {
				acc[k] = acc.hasOwnProperty(k) ? [].concat(acc[k]).concat(obj[k]) : obj[k]
				return acc
			}, {}
		), {}
	)

// 参数转成FormData格式
export const dataToFormData = (data) => {
	const formDataObj = new FormData()
	for (const item in data) formDataObj.append(item, data[item])
	return formDataObj
}