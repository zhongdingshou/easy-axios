import easyAxiosInstance from 'easyAxiosInstance.js'

// 管理员相关接口
const login        = (params)     => easyAxiosInstance.POST('/login', params)
const adminList    = (params)     => easyAxiosInstance.GET('/admin', params)
const addAdmin     = (params)     => easyAxiosInstance.POST('/admin', params)
const updateAdmin  = (id, params) => easyAxiosInstance.PUT(`/admin/${id}`, params)
const deleteAdmin  = (id)         => easyAxiosInstance.DELETE(`/admin/${id}`)
const deletesAdmin = (list)       => easyAxiosInstance.DELETE(`/admin/`, list)
const uploadFile   = (params)     => easyAxiosInstance.FORMDATA(`/admin/`, params)

export { 
    login,
    adminList,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    deletesAdmin,
    uploadFile
}