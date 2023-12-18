const express = require('express');
const axios = require('axios');
const app = express();
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const createUser = require('./routes/create-user')

let memoryStore = new session.MemoryStore();

let keycloak = new Keycloak({ store: memoryStore });

app.use(session({
  secret: 'algum segredo',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware());

app.use(express.json());

app.use(createUser)

app.post('/criar-cobranca', keycloak.enforcer('writecob'), keycloak.enforcer('readcob'), function(req, res) {
  res.send("Área protegida pelo Keycloak");
});

app.get('/listar-cobranca', keycloak.enforcer('readcob'), function(req, res) {
  res.send("Listagem de cobranças");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});