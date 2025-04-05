// src/Scripts/test-cliente-perfil.js
const axios = require('axios');

// Reemplaza esto con tu token actual
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sIjoyLCJjb3JyZW8iOiJjbGllbnRlLmFkbWluQHRlb2NhdC5jb20iLCJpZENsaWVudGUiOjEwLCJpYXQiOjE3NDM1NTgyNTksImV4cCI6MTc0MzY0NDY1OX0.jzWXmzj7vcbWYseux6KH11SblukjB_v9VQDScW3GLfg';

async function testClientePerfil() {
  try {
    console.log('Probando acceso al perfil del cliente...');
    
    const response = await axios.get('http://localhost:3000/api/clientes/perfil', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Acceso exitoso al perfil:');
    console.log('Status:', response.status);
    console.log('Datos:', response.data);
    
  } catch (error) {
    console.error('❌ Error al acceder al perfil:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testClientePerfil();