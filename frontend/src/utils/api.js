import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getProperties     = ()       => api.get('/properties').then(r => r.data)
export const getProperty       = (id)     => api.get(`/properties/${id}`).then(r => r.data)
export const getStats          = ()       => api.get('/properties/stats').then(r => r.data)
export const getOwnerProps     = (wallet) => api.get(`/properties/owner/${wallet}`).then(r => r.data)
export const getListings       = ()       => api.get('/marketplace').then(r => r.data)
export const getListing        = (id)     => api.get(`/marketplace/${id}`).then(r => r.data)
export const getWalletBalance  = (addr)   => api.get(`/wallet/balance/${addr}`).then(r => r.data)
export const getWalletNFTs     = (addr)   => api.get(`/wallet/nfts/${addr}`).then(r => r.data)
export const getTenantLeases   = (wallet) => api.get(`/rent/tenant/${wallet}`).then(r => r.data)
export const getLandlordLeases = (wallet) => api.get(`/rent/landlord/${wallet}`).then(r => r.data)
export const getBuyerEscrows   = (wallet) => api.get(`/escrow/buyer/${wallet}`).then(r => r.data)

export default api