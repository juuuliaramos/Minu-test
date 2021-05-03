const express = require('express');
const app = express();
app.use(express.json());
const fs = require('fs');

const validador = require('gerador-validador-cpf')

app.listen(3000);


// Verificação se há cpf, nome e email, se não houver retorna erro 400 - Bad Request
function checkRequiredFields(req, res, next) {
  if (!req.body.cpf || !req.body.name || !req.body.email)  {
    return res.status(400).json({ error: 'CPF, name and Email are required' });
  }

  if (!validador.validate(req.body.cpf)){
    return res.status(400).json({ error: 'Invalid CPF' });
  }
  return next();
} 
 
function getUsers() {
  let data = fs.readFileSync('users.json', 'utf8');
  if (data == '') return {users: []};
  return JSON.parse(data);
}


// REQUISIÇÃO GET - rota para listar todos os usuarios
app.get('/api', (req, res) => {
  let users = getUsers()
  return res.json(users);
});


// REQUISIÇÃO GET - rota para listar todos os usuarios
 app.get('/api/:cpf', (req, res) => {
  const { cpf } = req.params
  
  let usersData = getUsers()
  let filtered = usersData.users.filter((user) => cpf == user.cpf);

  if(filtered.length > 0 ) {
    return res.json(filtered)
  }
  return res.json({message: "Cpf não encontrado"});
 })


// REQUISIÇÃO POST - Adiciona novo usuario
app.post('/api', checkRequiredFields, (req, res) => {
  let usersData = getUsers()
  let cpf = req.body.cpf
  let filtered = usersData.users.filter((user) => cpf == user.cpf);
  
  if(filtered.length > 0) {
    return res.json({message: "Usuário já cadastrado"})
  }
  
    usersData.users.push(req.body);
    let json = JSON.stringify(usersData);
    fs.writeFileSync('users.json', json, 'utf8');
    return res.json(usersData);

});


// REQUISIÇÃO PUT - Altera dados do usuário
app.put('/api/:cpf', (req, res) => {
  const { cpf } = req.params;
  const { name, email } = req.body;
  
  let usersData = getUsers()

  for (let i=0; i < usersData.users.length; i++){
    
    if(usersData.users[i].cpf == cpf){ 
      usersData.users[i].name = name;
      usersData.users[i].email = email;

      let json = JSON.stringify(usersData);
      fs.writeFileSync('users.json', json, 'utf8');
      return res.json(usersData);
    }
  }
  });

//REQUISIÇÃO DELETE - Deleta usuário
app.delete('/api/:cpf', (req, res) => {
  let cpf = req.params.cpf;

  let usersData = getUsers();
  usersData = usersData.users.filter((user) => cpf != user.cpf);
  let json = JSON.stringify(usersData);
  fs.writeFileSync('users.json', json, 'utf8');

  return res.json(usersData);
})