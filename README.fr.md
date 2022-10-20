# Nutritiv-be

*Read this in other languages : 
[English](README.md) 
![GB-flag.](/public/images/GB@2x.png "This is the GB flag.") 
[French](README.fr.md) 
![FR-flag.](/public/images/FR@2x.png "This is the french flag.")*
## Introduction

>Ce dépôt github contient la partie back-end (be) du projet **Nutritiv**.
Nutritiv est un projet de site **e-commerce** de **compléments alimentaires** déstiné à la santé des sportifs.
Nutritiv a été conçu afin de couvrir les fonctionnalités de base utilisées sur la plupart des sites web, et n'a pas pour vocation d'être en production.

>Ce site web est conçu sur la **MERN** stack utilisant le système d'**API REST**.
Nous avons choisit MERN car cette technologie est facilement réutilisable et rapide à mettre en place, de plus, nous apprécions particulièrement le langage **Javascript**.
## Initialiser le projet

Nous utilisons **npm**, le gestionnaire de packages par défaut pour l'environnement d'exécution **Javascript Node.js** *(npm init -y)*.
## API

> Afin d'effectuer des appels API pendant la phase de développement et de tests, nous avons utilisé **Postman**, cliquez sur le lien ci-dessous pour accéder à notre documentation API.
 
 
 ## [**Documentation API Postman**](https://documenter.getpostman.com/view/15856568/UVkpMv2U#78474388-f20b-460c-9300-705113cadee4) 
![postman logo.](/public/images/postman_logo.png "This is the postman logo.")
### Créer un nouvelle endpoint de l'API

1. Créer un nouveau fichier route
2. Ajouter le fichier route au routeur basé sur l'url dans app.js, *ex : authRoute = require("./routes/auth");*
3. Créer le contenu de l'endpoint, *ex : router.post("/login"... async(req, res, next){content...});*
4. Utiliser la méthode *try{...}.catch(err){...}*
5. Ajouter des fonctions controller au endpoint pour gérer le cors etc...

## Base de données

Nous utilisons **MongoDB** avec le module mongoose, une solution basée sur un schéma pour nos données.
### Connection à la BDD

1. Créer un cluster sur MongoDB
2. Gérer le Réseau et l'accès à la BDD sur MongoDB
3. Copier l'url de connexion au cluster
4. Connecter la BDD au serveur avec mongoose en utilisant cet url
## Middlewares

>Nous avons séléctionné des middlewares en suivant certains critères, l'utilisabilité, la maintenabilité, les fonctionnalités...
Grâce aux middlewares, les fonctionnalités de nos applications gèrent les cas de figures suivants :
- La politique CORS, l'intégration d'une liste blanche *(cors).*
- Le spam de requêtes *(express-rate-limit).*
- Les cookies *(cookieParser).*
- Les clés secrètes *(dotenv).*
- Les fichiers statiques *(path, fs, multer, sharp, nanoid).*
- Le stockage de fichier sur un service web *(aws-sdk).*
- La création et le stockage récurrent d'un fichier backup de la BDD *(cron, aws-sdk, child_process, mongodump & mongorestore).*
- L'inscription, connexion... *(passport, passport-local, passport-jwt, jsonwebtoken).*
- L'authentication à double facteur *(speakeasy, qrcode).*
- L'authentication via Google, Facebook et Github *(passport-facebook, passport-google-oauth20, passport-github2).*
- L'envoi de mails *(sgMail, mailer, email_validator).*
- Les procédures de paiement *(stripe).*
- L'envoi de requêtes API via back-end *(node-fetch).*
- Tests *(Jest, Supertest).*
- Sécurité *(helmet).*

Pour installer un nouveau middleware, il faut entrer dans le terminal : 
```bash
npm i "newMiddleware"
```

## Lancer l'app

>Il est impossible de lancer l'application sans le fichier .env.
Notre application est sur le fichier app.js, le serveur back-end démarre à la commande :
```bash
npm run start-dev 
```

## Déploiement de l'application

> [**API Back-end**](https://api.nutritiv.app/) déployé avec AWS EC2
- Connecté via SSH à un serveur sur Amazon Linux 2 avec PuTTy
- Configuration de Nginx et du HTTPS avec un certificat SSL Let's Encrypt
- Configuration DNS à un sous-domaine

> [**App Front-end**](https://www.nutritiv.app/) déployé avec AWS Amplify
- Configuration DNS géré avec AWS Route 53

### Informations supplémentaires

Notre équipe utilise Trello afin d'organiser nos tâches et nos projets.
___
- Développeur Back-end : [Yoann Destras](https://github.com/yoanndestras)
  - [**Dépôt Github Back-end**](https://github.com/yoanndestras/nutritiv-be)
- Développeur Front-end : [Hugo Bonpain](https://github.com/Monstarrrr)
  - [**Dépôt Github Front-end**](https://github.com/Monstarrrr/nutritiv-fe)


