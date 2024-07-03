# appMuniles
## Description du portail
Le portail comprend différentes branches.
  1 - Formulaire Mazout ( Pour rentrer les informations d'une facture d'une livraison de Mazout)
  2 - Formulaire Propane ( Pour rentrer les informations d'une facture d'une livraison de Propane)
  3 - Administration ( Accèder aux donnée du chauffage du CGMR)

### Connexion au portail
L'accès au portail se fait par votre adresse courriel de Muniles. Si vous avez un mot de passe, 
c'est vos initiales et votre poste téléphonique. 
De la sorte MDP :'ip163'
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/0290177a-4cae-4cbc-99d5-54689d14aee9)


### Connexion à la base de données Firbase
https://console.firebase.google.com/project/appmuniles

C'est dans l'onglet ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/73fb98c1-c9e7-453e-8f37-9e4fa84ecd29) que vous allez pouvoir ajouter des comptes usagers.

La base de données en temp réel se trouve sur l'onglet suivant : ![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/4e9709fc-058d-4afd-965c-4898212474e0)

### Connexion au serveur
https://www.pythonanywhere.com/user/Iohann/
Avec les informations de connexion suivantes : 
Username : iohann
MDP : ioio1212

#### Control du serveur
ici : [https://www.pythonanywhere.com/user/Iohann/consoles/34548177/](https://www.pythonanywhere.com/user/Iohann/files/home/Iohann/CollectData.py?edit)


## Description de la section : Administration
La page administration du site https://appmuniles.web.app/ comprend seulement l'affichage des données. C'est un serveur python, qui est en charge d'aller chercher les données des thermostats au CGMR et des autres sites, si possible.

1. Vous pouvez choisir les différentes zones possibles et l'affichage s'ajustera automatiquement
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/f8bc5a8d-d6a6-471a-a93f-7ac861834e12)

2. Vous pouvez également choisir la journée dont vous souhaitez analyser les données
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/ebff97e6-acfa-4f1e-ba71-b9b0bfb6d635)

3.Grâce au bouton de téléchargement un fichier CSV est générer
![image](https://github.com/ipaquetteMuniles/appMuniles/assets/169171284/611f2ae3-bb52-4be3-8b48-c65df48616de)

