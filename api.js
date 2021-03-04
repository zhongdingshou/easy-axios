import easyAxiosInstance from 'easyAxiosInstance.js'

// 管理员相关接口
const login        = (param)     => easyAxiosInstance.POST('/login', param)
const adminList    = (param)     => easyAxiosInstance.GET('/admin', param)
const addAdmin     = (param)     => easyAxiosInstance.POST('/admin', param)
const updateAdmin  = (id, param) => easyAxiosInstance.PUT(`/admin/${id}`, param)
const deleteAdmin  = (id)        => easyAxiosInstance.DELETE(`/admin/${id}`)
const deletesAdmin = (list)      => easyAxiosInstance.DELETE(`/admin/`, list)
const uploadFile   = (param)     => easyAxiosInstance.FORMDATA(`/admin/`, param)

export { 
    login,
    adminList,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    deletesAdmin,
    uploadFile
}
