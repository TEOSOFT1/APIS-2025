// src/Scripts/test-admin-clientes.js
const axios = require('axios');

// Configuración base para axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAdminClientes() {
  try {
    console.log('🔑 Probando rutas de clientes como administrador...');
    console.log('📌 Asegúrate de que el servidor esté en ejecución en http://localhost:3000');
    
    // 1. Login como administrador
    console.log('\n1. Login como administrador:');
    let token;
    try {
      const loginResponse = await api.post('/api/auth/usuarios/login', {
        usuario: 'admin@teocat.com',
        contraseña: 'Admin2024!'
      });
      
      console.log('✅ Login exitoso:');
      console.log('Status:', loginResponse.status);
      token = loginResponse.data.token;
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      // 2. Obtener todos los clientes
      console.log('\n2. Obteniendo todos los clientes:');
      try {
        const clientesResponse = await api.get('/api/clientes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Obtención de clientes exitosa:');
        console.log('Status:', clientesResponse.status);
        console.log('Cantidad de clientes:', clientesResponse.data.data.length);
        
        // 3. Crear un cliente
        console.log('\n3. Creando un cliente:');
        try {
          const createResponse = await api.post('/api/clientes', {
            Documento: '9876543210',
            Nombre: 'Cliente',
            Apellido: 'Admin',
            Correo: 'cliente.admin@teocat.com',
            Telefono: '3001234567',
            Direccion: 'Calle Cliente #123'
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('✅ Creación de cliente exitosa:');
          console.log('Status:', createResponse.status);
          console.log('Cliente creado:', createResponse.data);
          
          // Guardar el ID del cliente creado
          const clienteId = createResponse.data.data.IdCliente;
          
          // 4. Obtener cliente por ID
          console.log(`\n4. Obteniendo cliente con ID ${clienteId}:`);
          try {
            const getClienteResponse = await api.get(`/api/clientes/${clienteId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('✅ Obtención de cliente por ID exitosa:');
            console.log('Status:', getClienteResponse.status);
            console.log('Cliente:', getClienteResponse.data);
            
            // 5. Actualizar cliente
            console.log(`\n5. Actualizando cliente con ID ${clienteId}:`);
            try {
              const updateResponse = await api.put(`/api/clientes/${clienteId}`, {
                Nombre: 'Cliente Actualizado',
                Apellido: 'Admin Actualizado',
                Telefono: '3009876543',
                Direccion: 'Nueva Dirección #456'
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              console.log('✅ Actualización de cliente exitosa:');
              console.log('Status:', updateResponse.status);
              console.log('Cliente actualizado:', updateResponse.data);
              
              // 6. Eliminar cliente
              console.log(`\n6. Eliminando cliente con ID ${clienteId}:`);
              try {
                const deleteResponse = await api.delete(`/api/clientes/${clienteId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                console.log('✅ Eliminación de cliente exitosa:');
                console.log('Status:', deleteResponse.status);
                console.log('Respuesta:', deleteResponse.data);
                
              } catch (deleteError) {
                console.error('❌ Error al eliminar cliente:');
                if (deleteError.response) {
                  console.error('Status:', deleteError.response.status);
                  console.error('Data:', deleteError.response.data);
                } else {
                  console.error('Error:', deleteError.message);
                }
              }
              
            } catch (updateError) {
              console.error('❌ Error al actualizar cliente:');
              if (updateError.response) {
                console.error('Status:', updateError.response.status);
                console.error('Data:', updateError.response.data);
              } else {
                console.error('Error:', updateError.message);
              }
            }
            
          } catch (getClienteError) {
            console.error('❌ Error al obtener cliente por ID:');
            if (getClienteError.response) {
              console.error('Status:', getClienteError.response.status);
              console.error('Data:', getClienteError.response.data);
            } else {
              console.error('Error:', getClienteError.message);
            }
          }
          
        } catch (createError) {
          console.error('❌ Error al crear cliente:');
          if (createError.response) {
            console.error('Status:', createError.response.status);
            console.error('Data:', createError.response.data);
          } else {
            console.error('Error:', createError.message);
          }
        }
        
      } catch (clientesError) {
        console.error('❌ Error al obtener clientes:');
        if (clientesError.response) {
          console.error('Status:', clientesError.response.status);
          console.error('Data:', clientesError.response.data);
        } else {
          console.error('Error:', clientesError.message);
        }
      }
      
    } catch (loginError) {
      console.error('❌ Error en login como administrador:');
      if (loginError.response) {
        console.error('Status:', loginError.response.status);
        console.error('Data:', loginError.response.data);
      } else {
        console.error('Error:', loginError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general en pruebas de rutas de clientes:', error.message);
  }
}

testAdminClientes();