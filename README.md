# 🧠 TaskMind - Instalação

Ter o Git instalado 

e no terminal do vscode o "Git Bash" 

dar um " git clone https://github.com/Melopjl/taskmind.git "

Duas opções: Ter o Android Studio instalado

Ou usar o aplicativo Expo Go (Tem na play store)

Tem que ter o Xampp instalado

O MYSQL WorkBench

## 📦 Instalação das Dependências

### Frontend

terminal vs code cmd tambem (dar esses comandos)

cd frotend

npm install

Iniciar no Terminal cmd do VS CODE (npm start)

ai vai carregar e vai aparecer um QR CODE(caso voce tenha o app no celular Expo Go,só escanear)
caso nao tenha deixe o android studio aberto e aperte a opção "open android"


### Backend

terminal vs code cmd tambem (dar esses comandos)

cd backend

npm install

Iniciar no Terminal cmd do VS CODE (node server.js)

OBS: NAO FECHE O TERMINAL 


### OBS:
na pasta do frontend dentro de src vai ter uma pasta services e la vai ter um arquivo chamado "api.js" e voce irá apenas em:



// MUDE PARA SEU IP: http://SEU_IP:3000/api

const API_URL = ' http://808.166.222.30/api';

aqui voce coloca o ip da sua maquina


###OBS:
nao vai ter o .env 

na pasta do backend 

crie um arquivo chamado " .env "


modelo 

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=

DB_NAME= nome do banco

JWT_SECRET=seu_jwt_secret_aqui

PORT=3000







