# AR-archaeology-server

This contains the backend for [Sharing the Past](https://github.com/Humen-debug/XR-archaeology-app/tree/main) and an admin panel that allows Ararat Plain Southeast Archaeological Project (APSAP) team members to manage the app.

## 👀 Overview of Admin Panel

Create and manage content with data validation to share with all app users

![add](https://github.com/user-attachments/assets/0e9483ef-2fa5-475c-aa53-b185daf748b5)


Sort and filter data with the search bar and intuitive table UI

![sort_filter](https://github.com/user-attachments/assets/bdffab2f-879d-4135-8aec-22df87d552f4)


Attach images and 3D models to make the content more attractive

![media](https://github.com/user-attachments/assets/0cf0634f-9de6-4e1b-b845-51f21f67ede8)


Edit table headers for search convenience

![header_customize](https://github.com/user-attachments/assets/5996f5ca-02ab-4895-85c5-fce5a949cf0f)


## 🚀 Run locally

1. Clone this project to your local environment

   ```bash
   git clone "https://github.com/Humen-debug/XR-archaeology-server.git"
   ```

2. Configure the `yarn` setting of `ignore-engines` to be `true`, if the version of yarn is 1.
   
   ```bash
   yarn preinstall
   ```

> [!IMPORTANT]
> Make sure you have [`MongoDB`](https://www.mongodb.com/docs/manual/installation/) and [`mongosh`](https://www.mongodb.com/try/download/shell) installed on your machine

3. Create a MongoDB instance on the local host

   ```bash
   yarn devMongo
   ```

4. Start `mongosh` command

   ```bash
   mongosh
   ```

> [!IMPORTANT]
> If it is your first time to initiate a MongoDB for the server, run
> ```
> rs.initiate()
> ```

5. (Optional) Create an admin

   ```bash
   yarn admin
   ```

6. Start the test servers. By default, the servers for admins and app users will be listening on <http://localhost:3001> and <http://localhost:3002> respectively

   ```bash
   yarn server:start
   ```

7. Start the front-end admin panel. By default, the website will be running on <http://localhost:3000>

   ```bash
   yarn dev
   ```

> [!TIP]
> If you want to expose your servers to the internet such that the application can access your data, run
> ```
> yarn public
> ```
> | Server | URL |
> | --- | ---|
> | Public (app users) server | <https://tests-server.serveo.net/> |
> | Internal (admins) server | <https://admin-tests-server.serveo.net/> |
> | Front-end CMS | <https://apsap-tests-server.serveo.net> |

### 🐳 Docker 

<details>
   <summary>Details</summary>
   
   > Log on using credentials set in `.env` (`ME_CONFIG_BASICAUTH_USERNAME`, `ME_CONFIG_BASICAUTH_PASSWORD`)
   
   #### To initialize the docker container
   
   1. Create the Mongodb container and start running the server
   
   ```bash
   yarn build
   ```
   
   2. Log on to Mongo Express and go to <http://localhost:8081/>
   
   #### To run the docker container
   
   ```bash
   yarn start
   ```
   
   1. Log on to Mongo Express and go to <http://localhost:8081/>

</details>

## Development

#### 📦 File Structures

<details>
   <summary>Details</summary>

   ```
   ├── components: our customized UI components
   ├── config.json: website configuration settings
   ├── contexts: our React contexts/providers
   ├── layouts: wrappers of pages
   ├── pages: the content of different web pages
   ├── plugins: our customized plugins
   ├── public: static assets
   ├── server
   │   ├── api
   │   │   ├── public: APIs for the app users
   │   │   └── services: APIs for the admin users of CMS
   │   ├── db: database schema
   │   ├── feathers: plugins for Feathers.js to automate CRUD operations and query APIs
   │   └── utils
   ├── styles
   └── types: declaration files
   ```
</details>

#### 🧩 Built-with

**Front-end**
- [React](https://react.dev/) - Frontend framework for creating reusable components
- [React-dom](https://www.npmjs.com/package/react-dom) - Package serves as the entry point to the DOM for React
- [React-i18next](https://react.i18next.com/) - Internationalization framework for `React` and `React Native`
- [Next.js](https://nextjs.org/) - React framework for the web
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

**Back-end**
- [Feathers.js](https://feathersjs.com/) - Framework for creating APIs and real-time application
- [Express.js](https://expressjs.com/) - Node.js web application framework for building RESTful APIs
- [MongoDB](https://www.mongodb.com/) - Open-source non-relational database
- [Mongoose](https://mongoosejs.com/) - Library offering built-in type casting, validation, query building to model MongoDB data
- [Multer](https://www.npmjs.com/package/multer)- Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files
- [Sharp](https://www.npmjs.com/package/sharp) - Library for Node.js image processing
- [Bcrypt.js](https://www.npmjs.com/package/bcrypt) - Library for hashing passwords securely
- [Moment.js](https://momentjs.com/) - Parse, validate, manipulate and display dates and times
- [Lodash](https://lodash.com/) - Utility library for improving modularity and performance
- [Webpack](https://webpack.js.org/) - Module bundler to bundle files in a browser
