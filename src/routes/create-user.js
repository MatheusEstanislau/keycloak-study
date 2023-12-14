const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/create-user', async (req, res) => { 
  const { username, email, password, type, role } = req.body;

  try {

    const {data} = await axios.post('http://localhost:8080/realms/master/protocol/openid-connect/token', new URLSearchParams({
      'username': 'admin', // Seu usuário admin do Keycloak
      'password': 'admin', // Sua senha admin do Keycloak
      'grant_type': 'password',
      'client_id': 'admin-cli',
      // 'client_secret': 'P28Pqa3tzhMEvA2GhnyQYAVcsBPhdv2u'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });


    await axios.post('http://localhost:8080/admin/realms/master/users', {
      username,
      email,
      enabled: true,
      credentials: [{
        type: 'password',
        value: password,
        temporary: false
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    const users = await axios.get('http://localhost:8080/admin/realms/master/users',{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    const user = users.data.find((user) => user.email === email)

    const groups = await axios.get('http://localhost:8080/admin/realms/master/groups',{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    const group = groups.data.find((group) => group.name === type)

    const activeGroup = await axios.get(`http://localhost:8080/admin/realms/master/groups/${group.id}/children`,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    const userRole = activeGroup.data.find((info) => info.name === role)
    

    await axios.put(`
    http://localhost:8080/admin/realms/master/users/${user.id}/groups/${userRole.id}`,{},{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    res.status(201).send('Usuário criado com sucesso');
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
});

router.post('/auth', async (req, res) => {
  try {

    const { username, password } = req.body;


    const {data} = await axios.post('http://localhost:8080/realms/master/protocol/openid-connect/token', new URLSearchParams({
      'username': username, // Seu usuário admin do Keycloak
      'password': password, // Sua senha admin do Keycloak
      'grant_type': 'password',
      'client_id': 'bcodex-pix',
      'client_secret': 'P28Pqa3tzhMEvA2GhnyQYAVcsBPhdv2u'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });

    res.status(201).send({token: data.access_token});
  } catch (error) {
    res.status(500).json({ message: 'Erro ao autenticar o usuário', error });
  }
})

module.exports = router;