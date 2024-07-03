# appMuniles
## Description du portail
Le portail comprend différentes branches.
  1 - Formulaire Mazout ( Pour rentrer les informations d'une facture d'une livraison de Mazout)
  2 - Formulaire Propane ( Pour rentrer les informations d'une facture d'une livraison de Propane)
  3 - Administration ( Accèder aux donnée du chauffage du CGMR)

### Connexion au portail
L'accès au portail se fait par votre adresse courriel de Muniles. Si vous avez un mot de passe, 
c'est vos initiales et votre poste téléphonique.\n
De la sorte MDP :'ip163'
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/0290177a-4cae-4cbc-99d5-54689d14aee9)


### Connexion à la base de données Firbase
https://console.firebase.google.com/project/appmuniles

C'est dans l'onglet ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/73fb98c1-c9e7-453e-8f37-9e4fa84ecd29) que vous allez pouvoir ajouter des comptes usagers.

La base de données en temp réel se trouve sur l'onglet suivant : ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/4e9709fc-058d-4afd-965c-4898212474e0)

### Connexion au serveur
https://www.pythonanywhere.com/user/Iohann/
Avec les informations de connexion suivantes :\n
Username : iohann
MDP : ioio1212

#### Control du serveur
ici : [https://www.pythonanywhere.com/user/Iohann/consoles/34548177/](https://www.pythonanywhere.com/user/Iohann/files/home/Iohann/CollectData.py?edit)
1. Partez le serveur grâce au bouton RUN : ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/853db649-68d7-43f1-b505-fea7d2cdee33)
2. Entrez dans le terminal votre adresse courriel correspondante à votre compte au portail TCC : https://mytotalconnectcomfort.com/portal/
     - Par défaut
       ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/dc3deca6-397e-4fa0-b9fd-91864909bf2b)

3. Choissisez la zone que vous souhaitez partir le serveur
   ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/5220f874-dc20-46a4-801b-c9eff4496a70)

4. Choissisez la recurrence des requêtes (à chaque 1 minute, 5 minutes, 1h ?)
   ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/383348de-fa21-4755-b5af-74469aa139f4)

5. Les données commencent à etre stockées dans la base de données FIREBASE
   ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/36568b1d-7ff6-4ff2-952e-ff98433e8c9a)

6. Entrez stop pour arreter le programme

*Pour partir différent serveur pour différente zone, vous pouvez voir le lien suivant : https://github.com/ipaquetteMuniles/thermoServerMuniles/tree/main


## Description de la section : Administration
La page administration du site https://appmuniles.web.app/ comprend seulement l'affichage des données. C'est un serveur python, qui est en charge d'aller chercher les données des thermostats au CGMR et des autres sites, si possible.

1. Vous pouvez choisir les différentes zones possibles et l'affichage s'ajustera automatiquement
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/f8bc5a8d-d6a6-471a-a93f-7ac861834e12)

2. Vous pouvez également choisir la journée dont vous souhaitez analyser les données
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/ebff97e6-acfa-4f1e-ba71-b9b0bfb6d635)

3.Grâce au bouton de téléchargement un fichier CSV est générer
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/611f2ae3-bb52-4be3-8b48-c65df48616de)

