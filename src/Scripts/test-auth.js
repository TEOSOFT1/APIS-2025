// src/Scripts/test-auth-cliente.js
const axios = require('axios');

// Configuración base para axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAuthCliente() {
  try {
    console.log('🔑 Probando autenticación de clientes...');
    console.log('📌 Asegúrate de que el servidor esté en ejecución en http://localhost:3000');
    
    // 1. Registrar un cliente nuevo
    console.log('\n1. Registrando un cliente nuevo:');
    try {
      const registroResponse = await api.post('/api/auth/clientes/registro', {
        Documento: '1234567890',
        Nombre: 'Cliente',
        Apellido: 'Prueba',
        Correo: 'cliente.prueba@teocat.com',
        Contraseña: 'Cliente2024!',
        Telefono: '3001234567',
        Direccion: 'Calle Cliente #123'
      });
      
      console.log('✅ Registro exitoso:');
      console.log('Status:', registroResponse.status);
      console.log('Token:', registroResponse.data.token ? 
        `${registroResponse.data.token.substring(0, 20)}...` : 'No token');
      console.log('Cliente:', registroResponse.data.cliente);
      
      // Guardar el token para pruebas posteriores
      const token = registroResponse.data.token;
      
      // Probar acceso al perfil
      console.log('\n2. Accediendo al perfil del cliente:');
      try {
        const perfilResponse = await api.get('/api/clientes/perfil', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Acceso al perfil exitoso:');
        console.log('Status:', perfilResponse.status);
        console.log('Datos:', perfilResponse.data);
      } catch (error) {
        console.error('❌ Error al acceder al perfil:');
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor.');
        } else {
          console.error('Error:', error.message);
        }
      }
      
    } catch (registroError) {
      console.log('⚠️ Error en registro (posiblemente el cliente ya existe):');
      if (registroError.response) {
        console.log('Status:', registroError.response.status);
        console.log('Data:', registroError.response.data);
      } else {
        console.log('Error:', registroError.message);
      }
      
      // 2. Intentar login con el cliente existente
      console.log('\n2. Intentando login con cliente existente:');
      try {
        const loginResponse = await api.post('/api/auth/clientes/login', {
          usuario: 'cliente.prueba@teocat.com',
          contraseña: 'Cliente2024!'
        });
        
        console.log('✅ Login exitoso:');
        console.log('Status:', loginResponse.status);
        console.log('Token:', loginResponse.data.token ? 
          `${loginResponse.data.token.substring(0, 20)}...` : 'No token');
        console.log('Cliente:', loginResponse.data.cliente);
        
        // Guardar el token para pruebas posteriores
        const token = loginResponse.data.token;
        
        // Probar acceso al perfil
        console.log('\n3. Accediendo al perfil del cliente:');
        try {
          const perfilResponse = await api.get('/api/clientes/perfil', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('✅ Acceso al perfil exitoso:');
          console.log('Status:', perfilResponse.status);
          console.log('Datos:', perfilResponse.data);
        } catch (error) {
          console.error('❌ Error al acceder al perfil:');
          if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor.');
          } else {
            console.error('Error:', error.message);
          }
        }
        
      } catch (loginError) {
        console.error('❌ Error en login:');
        if (loginError.response) {
          console.error('Status:', loginError.response.status);
          console.error('Data:', loginError.response.data);
        } else {
          console.error('Error:', loginError.message);
        }
      }
    }
    
    // 3. Probar acceso a rutas administrativas con token de cliente
    console.log('\n4. Probando acceso a rutas administrativas con token de cliente:');
    try {
      // Primero obtenemos un token de cliente
      const loginResponse = await api.post('/api/auth/clientes/login', {
        usuario: 'cliente.prueba@teocat.com',
        contraseña: 'Cliente2024!'
      });
      
      const token = loginResponse.data.token;
      
      // Intentamos acceder a una ruta administrativa
      const adminResponse = await api.get('/api/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('⚠️ Acceso a ruta administrativa fue exitoso (esto podría ser un problema de seguridad):');
      console.log('Status:', adminResponse.status);
      console.log('Datos:', adminResponse.data);
    } catch (error) {
      console.log('✅ Acceso a ruta administrativa denegado correctamente:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general en pruebas de autenticación de clientes:', error.message);
  }
}

testAuthCliente();