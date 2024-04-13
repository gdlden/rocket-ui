import {defineStore} from 'pinia';
import {fetchUserinfo} from "../api";
import { getPermission } from '../api/resource';
import { error } from 'console';

interface UserStore {
    userinfo: {
        token: string;
        userId: number | null;
        username: string;
        fullName: string;
        avatar: string;
        credential: { identifier: string, identityType: IdentityType };
        permissions: [];
    }
}

enum IdentityType {
    PASSWORD = "PASSWORD"
}

export const useBasicStore = defineStore('basic', {
    state: () => <UserStore>({
        userinfo: {
            token: localStorage.getItem("token"),
            userId: null,
            username: '',
            fullName: '',
            avatar: '',
            credential: {},
            permissions: []
        }
    }),
    actions: {
        setUserinfo(d: any) {
            this.userinfo = d;
            getPermission()
            .then((response: any) => {
                this.userinfo.permissions = response.data.data
            })
            .catch((error: any)=>{
                console.log(error)
            })
        },
        fetchUserinfo(): Promise<any> {
            return new Promise((resolve, reject) => {
                if (this.userinfo.userId) {
                    resolve(this)
                } else {
                    fetchUserinfo()
                        .then((response: any) => {
                            this.setUserinfo(response.data)
                            resolve(response)
                        })
                        .catch((error: any) => {
                            reject(error)
                        })
                }
            })
        }
    }
});
