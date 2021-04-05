import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
    // timeout: 5000,
    baseUrl: '/api'
})

// service.request.interceptor()

Vue.prototype.$http = service

export const http = service