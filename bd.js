const { Pool } = require('pg');

const config = {
    user: process.env.USERDB, 
    host: process.env.HOST, 
    database: process.env.DATABASE, 
    password: process.env.PASS, 
    port: process.env.PORT, 
}

const pool = new Pool(config);

const insertarUsuario = async (payload) =>
{
    const text = "INSERT INTO usuarios(nombre, balance) VALUES($1, $2) RETURNING *";
    const values = [payload.nombre, payload.balance];

    const queryObject = {
        text : text,
        values : values
    }

    const result = await pool.query(queryObject);
    return result;
}

const buscarUsuarios = async () =>
{
    const text = "SELECT * FROM usuarios";
    const values = [];

    const queryObject = {
        text : text,
        values : values
    }

    const result = await pool.query(queryObject);
    return result;
}

const editarUsuario = async (payload) =>
{
    const text = "UPDATE usuarios SET nombre=$1, balance=$2 WHERE id = $3 RETURNING *";
    const values = [payload.name, payload.balance, payload.id];

    const queryObject = {
        text : text,
        values : values
    }

    const result = await pool.query(queryObject);
    return result;
}

const eliminarUsuario = async (payload) =>
{
    const text = "DELETE FROM usuarios WHERE id = $1";
    const values = [payload.id];

    const queryObject = {
        text : text,
        values : values
    }

    const result = await pool.query(queryObject);
    return result;
}

const buscarUsuario1 = async (payload) =>
{
    const text = "SELECT id FROM usuarios WHERE nombre = $1";
    const values = [payload.emisor];

    const queryObject = {
        text : text,
        values : values,
        rowMode : "json"
    }
    
    const result = await pool.query(queryObject);
    return result;
}

const buscarUsuario2 = async (payload) =>
{
    const text = "SELECT id FROM usuarios WHERE nombre = $1";
    const values = [payload.receptor];

    const queryObject = {
        text : text,
        values : values,
        rowMode : "json"
    }
    
    const result = await pool.query(queryObject);
    return result;

}

const insertarTransferencia = async (payload) =>
{
    const client = await pool.connect();
    
    try 
    {
        await client.query("BEGIN");

        //Descontar
        const descontar = "UPDATE usuarios SET balance = balance - $1 WHERE id= $2";
        const values1 = [payload.monto, payload.idemisor];
        await client.query(descontar, values1);

        //Aumentar
        const aumentar = "UPDATE usuarios SET balance = balance + $1 WHERE id = $2";
        const values2 = [payload.monto, payload.idreceptor];
        await client.query(aumentar, values2);

        //Insertar Transferencia
        const text = "INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING *";
        const values = [payload.idemisor, payload.idreceptor, payload.monto, payload.fecha];
        const result = await pool.query(text, values);
    
        //Terminar Transaccion
        await client.query("COMMIT");
        return result;
    } 
    catch (error) 
    {
        await client.query("ROLLBACK")
        console.error(error)
    }
    finally
    {
        client.release()
        console.log("Termino Transaccion")
    }
}

const mostrarTransferencias = async () =>
{
    const text = "SELECT t.id, (e.nombre) as emisor, (r.nombre) as receptor, t.monto, t.fecha FROM transferencias t INNER JOIN usuarios e ON t.emisor = e.id INNER JOIN usuarios r ON t.receptor = r.id ORDER BY t.fecha";
    const values = [];

    const queryObject = {
        text : text,
        values : values,
        rowMode : "array"
    }

    const result = await pool.query(queryObject);
    return result;
}

module.exports = { insertarUsuario, buscarUsuarios, editarUsuario, eliminarUsuario, buscarUsuario1, buscarUsuario2, insertarTransferencia, mostrarTransferencias };