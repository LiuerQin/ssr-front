import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
    // timeout: 5000,
    baseURL: '/api'
})

service.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.common['Authorization'] = `Bearer${token}`
        }
        return config
    }
)

service.interceptors.response.use(
    async (response) => {
        let {data} = response
        return data
    }
)

// service.interceptor.request()
Vue.prototype.$http = service

export const http = service