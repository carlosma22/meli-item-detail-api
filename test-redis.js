// Script simple para probar conexión a Redis
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  process.exit(1);
});

client.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
  
  // Probar escribir y leer
  client.set('test-key', 'test-value', (err) => {
    if (err) {
      console.error('❌ Error writing to Redis:', err);
      process.exit(1);
    }
    
    console.log('✅ Write test successful');
    
    client.get('test-key', (err, value) => {
      if (err) {
        console.error('❌ Error reading from Redis:', err);
        process.exit(1);
      }
      
      console.log('✅ Read test successful, value:', value);
      
      // Limpiar
      client.del('test-key', () => {
        console.log('✅ Redis is working correctly!');
        
        // Ver estadísticas
        client.dbsize((err, size) => {
          console.log(`📊 Total keys in Redis: ${size}`);
          
          client.keys('item:*', (err, keys) => {
            console.log(`📦 Item keys: ${keys ? keys.length : 0}`);
            client.quit();
          });
        });
      });
    });
  });
});
