import { Agent, interceptors, type RequestInit, cacheStores, fetch as undiciFetch, type Dispatcher, setGlobalDispatcher, type RequestInfo } from 'undici'
import { discovery, customFetch, type CustomFetch } from 'openid-client'

const store = new cacheStores.MemoryCacheStore({
    maxCount: 1_000,
    maxSize: 5 * 1024 * 1024 // 5mb,
})

/**
 * Creates an undici dispatcher that'll cache responses based on their 
 * `Cache-Control` and `Expires` headers.
 */
const agent = new Agent().compose(interceptors.cache({ store, }))

/**
 * Then, you can pass the custom fetch function using the `customFetch` symbol.
 * This way, you can implement caching without modifying the code that relies on the discovery mechanism.
 */
const result = discovery(new URL('https://idp.com/.well-known'), 'my-client-id', undefined, undefined, {
    [customFetch]: customFetchFactory(agent) as CustomFetch
})

/**
 * 
 * This is just a helper to create a custom fetch function that uses an 
 * undici dispatcher.
 * 
 * @param dispatcher 
 * @returns 
 */
function customFetchFactory(dispatcher: Dispatcher) {
    return function (input: RequestInfo, init?: RequestInit) {
        return undiciFetch(input, {
            dispatcher,
            ...init,
        })
    }
}







