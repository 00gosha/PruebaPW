const express = require("express");
const path = require("path");

const aplicacion = express();
const PUERTO = process.env.PORT || 3000;

aplicacion.use(express.static(path.join(__dirname, "public")));

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
})