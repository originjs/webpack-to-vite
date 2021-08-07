export const routes = [
    {
        path: '/',
        name: "test",
        component: resolve => require(["../components/test.vue"], resolve)
    }
]
