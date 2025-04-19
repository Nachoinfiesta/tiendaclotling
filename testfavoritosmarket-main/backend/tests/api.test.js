const request = require('supertest');
const app = require('../index'); // Asegúrate de que apunte al archivo principal de tu app

describe('API REST Tests', () => {
  it('Debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password',
        nombre: 'Test User',
        foto_perfil: 'http://example.com/foto.jpg'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('Debería iniciar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Debería obtener el perfil del usuario', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('Debería crear una publicación', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });

    const res = await request(app)
      .post('/api/posts/create-post') // Cambiar de '/api/posts/create' a '/api/posts/create-post'
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({
        titulo: 'Publicación de prueba', // Cambiar "título" por "titulo" (sin acento)
        descripcion: 'Descripción de prueba', // Cambiar "descripción" por "descripcion" (sin acento)
        categoria_id: 1, // Cambiar "categoría" por "categoria_id" para coincidir con la impl.
        precio: 100,
        imagen: 'http://example.com/producto.jpg'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});
