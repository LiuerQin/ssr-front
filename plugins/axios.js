import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
    // timeout: 5000,
    baseURL: '/api'
})

// service.interceptor.request()
Vue.prototype.$http = service

export const http = service