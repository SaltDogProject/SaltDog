<template>
    <div>
        <!-- sd -->
        <div class="fake-title-bar">
            SaltDog - {{ version }}
            <div class="handle-bar" v-if="os === 'win32'">
                <i class="el-icon-minus" @click="minimizeWindow"></i>
                <i class="el-icon-close" @click="closeWindow"></i>
            </div>
        </div>
        <div id="nav">
            <router-link to="/">Home</router-link>
            |
            <router-link to="/about">About</router-link>
        </div>
        <el-row type="flex" align="middle" justify="center">
            <el-col :span="8">
                <el-button type="success">按钮</el-button>
            </el-col>
        </el-row>
        <router-view />
    </div>
</template>
<script lang="ts">
    import { Options, Vue } from 'vue-class-component';
    @Options({
        data: () => {
            return {
                version: '0.0.1',
                os: 'win32',
            };
        },
        methods: {
            minimizeWindow: function () {
                console.log('close');
            },
            closeWindow: function () {
                return 0;
            },
        },
    })
    export default class App extends Vue {}
</script>
<style lang="less">
    .fake-title-bar {
        -webkit-app-region: drag;
    }
    .handle-bar {
        -webkit-app-region: no-drag;
    }

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    #nav {
        padding: 30px;

        a {
            font-weight: bold;
            color: #2c3e50;

            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }
</style>
