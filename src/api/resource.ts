import request from '../utils/request';
import {BASE_URI} from "./base";

export function getPermission() {
    return request({
        url: `${BASE_URI}/resources/permission`,
        method: 'get'
    })
}
export function getMenus() {
    return request({
        url: `${BASE_URI}/resources/list`,
        method: 'get',
    });
}

export function getResourceTree() {
    return request({
        url: `${BASE_URI}/resources/tree`,
        method: 'get',
    });
}

export function createResource(data: { name: string, type: string, url?: string, icon?: string, permission: string, pid: number }) {
    return request({
        url: `${BASE_URI}/resources/add`,
        method: 'post',
        data: data
    });
}

export function updateResource(data: { id:number,name: string, type: string, url?: string, icon?: string, permission: string, pid: number }) {
    return request({
        url: `${BASE_URI}/resources/update`,
        method: 'put',
        data: data
    });
}

export function deleteResource(resourceId: number) {
    return request({
        url: `${BASE_URI}/resources/${resourceId}`,
        method: 'delete'
    });
}
