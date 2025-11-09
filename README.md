# 🧠 TaskMind

[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)  
[![Expo](https://img.shields.io/badge/Expo-Go-blue)](https://expo.dev/)  
[![MySQL](https://img.shields.io/badge/MySQL-Workbench-orange)](https://www.mysql.com/products/workbench/)  

---

## 🛠️ Requisitos

Antes de começar, verifique se você possui:

- [x] **Git** ([Download](https://git-scm.com/))  
- [x] **Node.js** ([Download](https://nodejs.org/))  
- [x] **XAMPP** ([Download](https://www.apachefriends.org/index.html)) → **Apache e MySQL ativos**  
- [x] **MySQL Workbench** ([Download](https://www.mysql.com/products/workbench/))  
- [x] **App para rodar o projeto**:
  - **Android Studio** ou  
  - **Expo Go** ([Android/iOS](https://play.google.com/store/apps/details?id=host.exp.exponent))

> ⚠️ **Importante:** Certifique-se de que o Apache e o MySQL estão ativos no XAMPP.

---

## 🔄 Clonar o Repositório

No terminal (VS Code → Git Bash):

```bash
git clone https://github.com/Melopjl/taskmind.git

```
📦 Instalação das Dependências

## 🖥️ Frontend -

1 - Entre na pasta frontend:
cd frontend

2- Instale as dependências:
npm install 

3- Inicie o app:
npm start

Um QR Code será exibido:

Se tiver o Expo Go, escaneie o código.

Se usar Android Studio, mantenha-o aberto e clique em Open Android.

## ⚡ Backend -

1- Entre na pasta backend:
cd backend

2- Instale as dependências:
npm install

3- Inicie o Servidor:
node server.js
```
⚠️ Não feche este terminal enquanto o backend estiver em execução.

```

## ⚙️ Configurações

## 🖌️ Frontend - 

Edite o arquivo frontend/src/services/api.js para usar o IP da sua máquina:

## // Substitua pelo IP da sua máquina
## const API_URL = 'http://SEU_IP:3000/api';

## 🗄️ Backend - 

Na pasta backend, crie um arquivo .env:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nome_do_banco
JWT_SECRET=seu_jwt_secret_aqui
PORT=3000
## ⚠️ Nota: O arquivo .env não está no repositório, então é necessário criar manualmente.
```

# 🎯 Dicas

Mantenha sempre o XAMPP rodando com Apache e MySQL ativos.

Se algo não funcionar no Expo Go, abra pelo Android Studio.

Verifique se o IP no api.js está correto para evitar problemas de conexão.

Não feche os terminais do frontend ou backend enquanto estiver testando o projeto.


# 🚀 Contribuindo

Fork o projeto

Crie uma branch para a feature (git checkout -b feature/nova-feature)

Faça commit das alterações (git commit -m 'Adiciona nova feature')

Push para a branch (git push origin feature/nova-feature)

Abra um Pull Request


## ✨ TaskMind está pronto para rodar no seu computador!
Siga os passos acima e aproveite o projeto.




