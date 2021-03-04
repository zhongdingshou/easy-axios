import easyAxiosInstance from 'easyAxiosInstance.js'

// 示例，管理员相关接口
const login        = (param)     => easyAxiosInstance.POST('/login', param)
const adminList    = (param)     => easyAxiosInstance.GET('/admin', param)
const deleteAdmin  = (id)        => easyAxiosInstance.DELETE(`/admin/${id}`)
const uploadFile   = (param)     => easyAxiosInstance.FORMDATA(`/admin/`, param)

export { 
    login,
    adminList,
    deleteAdmin,
    uploadFile
}
