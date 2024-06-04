const express = require("express");
const moment = require("moment");
const app = express();
const now = new Date()

const { insertarUsuario, buscarUsuarios, editarUsuario, eliminarUsuario, buscarUsuario1, buscarUsuario2, insertarTransferencia, mostrarTransferencias } = require('./bd');

app.listen(3000, () =>
{
    console.log("Conectado al puerto 3000");
});

app.use(express.json());

app.get("/", async (req, res) =>
{
    res.sendFile(__dirname + "/index.html");
})
    
app.post("/usuario", async (req, res) =>
{
    const payload = req.body;

    try 
    {
        const response = await insertarUsuario(payload);
        res.json(response.rows);
    } 
    catch (error) 
    {
        res.statusCode = 500
        res.json({error: 'No fue posible guardar el Nuevo Usuario'})
    }
    console.log(payload);
});

app.get("/usuarios", async (req, res) =>
{
    try 
    {
        const response = await buscarUsuarios();
        res.send(response.rows);
    } 
    catch (error) 
    {
        res.statusCode = 500
        res.json({error: 'No fue posible Cargar los datos de los usuarios'})
    }
});

app.put("/usuario", async (req, res) =>
{
    const payload = req.body;
    const { id } = req.query;
    payload.id = id;
    
    try 
    {
        const response = await editarUsuario(payload);
        res.send(response.rows);
    } 
    catch (error) 
    {
        res.statusCode = 500
        res.json({error: 'No fue posible Editar el usuario'})
    }
});

app.delete("/usuario", async (req, res) =>
{
    const payload = req.query;

    try 
    {
        const response = await eliminarUsuario(payload);
        res.send(response.rows);
    } 
    catch (error) 
    {
        res.statusCode = 500
        res.json({error: 'No fue posible Editar el usuario'})
    }
});


app.post("/transferencia", async (req, res) =>
{
    const payload = req.body;
    const response1  = await buscarUsuario2(payload);
    const response2  = await buscarUsuario1(payload);
    const idreceptor  = response1.rows[0];
    const idemisor = response2.rows[0];
    payload.idemisor = idemisor.id;
    payload.idreceptor = idreceptor.id;
    const fecha = now;
    payload.fecha = fecha;

    try 
    {
        if(payload.idemisor != payload.idreceptor)
        {
            const response = await insertarTransferencia(payload);
            res.send(response.rows);
        }
        else
        {
            console.log("No se puede transferir a la misma cuenta");
        }
        
    } 
    catch (error) 
    {
        res.statusCode = 500;
        res.json({error: 'No fue Posible Ingresar la Transferencia.'});
    }
})

app.get("/transferencias", async (req, res) =>
{
    try 
    {
        const response = await mostrarTransferencias();
        res.json(response.rows);
        console.log(response.rows);
    } 
    catch (error) 
    {
        res.statusCode = 500
        res.json({error: 'No fue posible Cargar los datos de las transferencias'})
    }
})