local v = {}

for i, k in ipairs(redis.call('keys', 'session:*')) do
        v[i] = redis.call('get', k)
end

return v