const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const SECRET_KEY = 'tu_clave_secreta_super_segura'; // En producción usa variables de entorno

app.use(cors());
app.use(bodyParser.json());

// Base de datos simulada (En un proyecto real usarías MongoDB o PostgreSQL)
const users = [
  {
    username: 'creador',
    email: 'creador@reviewlab.com',
    password: bcrypt.hashSync('password123', 10), // Contraseña encriptada
    bio: 'Gestionando mi portafolio',
    image: 'https://api.realworld.io/images/demo-avatar.png'
  }
];

/**
 * ENDPOINT DE LOGIN
 * Coincide con la ruta esperada por el frontend de Angular: /api/users/login
 */
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body.user; // El frontend envía { user: { email, password } }

  // 1. Buscar el usuario
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(422).json({
      errors: { "email o contraseña": ["son inválidos"] }
    });
  }

  // 2. Verificar contraseña
  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(422).json({
      errors: { "email o contraseña": ["son inválidos"] }
    });
  }

  // 3. Generar Token JWT
  const token = jwt.sign(
    { id: user.email, username: user.username },
    SECRET_KEY,
    { expiresIn: '1d' }
  );

  // 4. Responder con el formato que espera el frontend
  return res.json({
    user: {
      email: user.email,
      token: token,
      username: user.username,
      bio: user.bio,
      image: user.image
    }
  });
});

// Middleware para proteger rutas (opcional para otras funcionalidades)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // El frontend envía "Token <JWT>"
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend de ReviewLab corriendo en http://localhost:${PORT}`);
});