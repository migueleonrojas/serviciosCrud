const express = require('express');
const bodyparser = require('body-parser');
const methodoverride = require('method-override');
const { Router } = require('express');
const mongoose = require('mongoose');
const UsuarioModel = require('./UsuarioModel');
const TransaccionModel = require('./TransaccionModel');//incluyendo el modelo Publicacion
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');


const app = express();


const router = express.Router();

app.use(express.urlencoded({ extended:false }));
app.use(express.json());

app.use(methodoverride());

app.use(express.json( { limit: '50mb' } ));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


const uriant = `mongodb+srv://migueleonrojas:Bolivariano.2@cluster0.4ea1g.mongodb.net/test`;

//

mongoose.connect(uriant, {
    useUnifiedTopology: true,
    useNewUrlParser: true
} , (err, res) => {

    //si hay err se sale con una excepcion
    if(err) throw err;

    console.log('Conexion con el servidor de manera exitosa');

});





app.listen(3000, () =>  {

    console.log(`El servidor esta en el puerto 3000`);

});

router.get('/usuario', (req, res) => {  

    console.log('El famoso hola mundo');
    res.send( { mensaje: "operacion en el portal de pago get exitosa" } );
});

let fechaDeValidacion;
let codigoValidacion;
let codigoToken;
let fechaRestablecerIntentos;
let fechaTemporizador;

router.post('/creandoUsuario', (req, res) => {  

    let fechaDeVencimiento = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        new Date().getHours(),
        new Date().getMinutes() + 0,
        new Date().getSeconds() + 5,
        new Date().getMilliseconds()
    );

    var miUsuarioPorCrear = new UsuarioModel();

    miUsuarioPorCrear.Nombre = req.body.Nombre;
    miUsuarioPorCrear.Usuario = req.body.Usuario;
    miUsuarioPorCrear.Correo = req.body.Correo;
    miUsuarioPorCrear.Clave = req.body.Clave;
    miUsuarioPorCrear.FechaDeNacimiento = req.body.FechaDeNacimiento;
    miUsuarioPorCrear.Registrado = req.body.Registrado;
    miUsuarioPorCrear.Estatus = req.body.Estatus;
    miUsuarioPorCrear.Saldo = req.body.Saldo;
    miUsuarioPorCrear.Rol = req.body.Rol;
    miUsuarioPorCrear.Intentos = req.body.Intentos;
    
    

    if( req.body.cod == undefined || req.body.cod != codigoValidacion){
        res.send( {mensaje:{codigo:2, repuesta : "El codigo de validacion es invalido", fecha:req.body.tVal } } );
    }

    else if( fechaDeValidacion == undefined || req.body.tVal > fechaDeValidacion.getTime()){
        res.send( {mensaje:{codigo:3, repuesta : "El codigo de validacion esta expirado"} } );
    }

    else{

        miUsuarioPorCrear.save( (err, respuesta) => { 

            if(err){

                res.send(err);

            }

            else{
                res.send(  { mensaje :{ codigo: 1, respuesta: 'Usuario creado con exito' }, usuario: respuesta } )
            }
            
        }); 
    }
     
    
});




router.post('/consultarUsuario', (req, res) => {  


    //{ $or: [ { "edad": {$gte: 60}}, { "edad": {$lte:10}} ]}
    
    let query = { $or: [ { Usuario: { $eq : req.body.Usuario} }, { Correo: { $eq: req.body.Correo  } } ]  };


    UsuarioModel.findOne(query, (err, retorno) => {

        if(err){

            res.send( { estado :{ codigo: 0, respuesta: err.message } });

        } 

        else{

            res.send(  { estado :{ codigo: 1, respuesta: 'Operacion de consulta por user y mail exitosa' }, usuario: retorno } );

        }

    });
});

router.post('/consultaPorNombreDeUsuario', (req, res) =>{

    let query = { Usuario: { $eq : req.body.Usuario} };

    UsuarioModel.findOne(query, (err, retorno) => {

        if(err){

            res.send({ mensaje :{ codigo: 0, respuesta: err.message } });

        }

        else{

            res.send(  { mensaje :{ codigo: 1, respuesta: 'Operacion de consulta por user exitosa' }, usuario: retorno } );

        }

    })

});


router.post('/loguearUsuario', (req, res) => {  


    //{ $or: [ { "edad": {$gte: 60}}, { "edad": {$lte:10}} ]}
    
    let query = { $and: [ { Usuario: { $eq : req.body.Usuario} }, { Clave: { $eq: req.body.Clave  } } ]  };


    UsuarioModel.findOne(query, (err, retorno) => {

        if(err) {
            res.send( { mensaje :{ codigo: 0, respuesta: err.message } });
        }
        else{

            res.send(  { mensaje :{ codigo: 1, respuesta: 'Operacion de consulta por user y password exitosa' }, usuario: retorno } );
        }

        

    });
});


router.post('/consultarUltimoUsuario', (req, res) => {  

    UsuarioModel.findOne((err, retorno) => {

        if(err) {
            res.send( { estado :{ codigo: 0, respuesta: err.message } });
        }

        else{

            res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de consulta por id es exitosa' }, usuario: retorno } );

        }

        

    }).sort({$natural:-1}).limit(1);
});






router.put('/actualizarUsuario', (req, res) => {  

    let query = { Usuario: req.body.usuario };
    
    UsuarioModel.findOne(query, (err, retorno) => {

        if(retorno == null){

            res.send(  { estado :{ codigo: 3, respuesta: 'Operacion de actualizacion no es exitosa' }, persona: retorno } );
        }
        else{

            if(req.body.clave != retorno.Clave){

                if(retorno.Intento == 3){
                    fechaRestablecerIntentos = new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate(),
                        new Date().getHours(),
                        new Date().getMinutes() + 0,
                        new Date().getSeconds() + 30,
                        new Date().getMilliseconds()
                    );
                }

                

                if( retorno.Estatus != "bloqueado" && new Date() > fechaRestablecerIntentos){
                    retorno.Intentos = 3;
                }

                if(retorno.Intento != 3){

                    fechaRestablecerIntentos = new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate(),
                        new Date().getHours(),
                        new Date().getMinutes() + 0,
                        new Date().getSeconds() + 30,
                        new Date().getMilliseconds()
                    );

                }

                
                if(retorno.Intentos > 0){

                    retorno.Intentos--;
                   
                }
                
                

                if(retorno.Intentos == 0){

                    retorno.Estatus = "bloqueado";
                    /* retorno.Estatus = "activo";
                    retorno.Intentos = 3; */
                }

                retorno.save( (err, respuesta) => { 
                    if(err) {
                        res.send( { estado :{ codigo: -1, respuesta: err.message, persona: respuesta } });
                    }
        
                    else{
        
                        res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de actualizacion es exitosa' }, persona: respuesta } );
        
                    }
        
                    
                });
            }

            else{

                if(retorno.Estatus == "activo" && req.body.clave == retorno.Clave){
                    retorno.Intentos = 3;
                    retorno.save();
                }

                res.send(  { estado :{ codigo: 1, respuesta: 'Operacion de consulta sin actualizar es exitosa' }, persona: retorno } );

            }

        }
        
    });
});


router.delete('/eliminarUltimoUsuario', (req, res) => {  

    //let query = { Usuario: req.body.Usuario };
    
    UsuarioModel.findOne((err, retorno) => {
        
        if(retorno == null){
            res.send({estado:{codigo:0, respuesta:"El elemento que desea eliminar no existe"}})
        }
        else{
            retorno.remove( (err, respuesta) => { 
                if(err) {
                    res.send( { estado :{ codigo: 0, respuesta: err.message } });
                }
                else{
                    res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de eliminar el ultimo usuario es exitoso' }, persona: respuesta } );
                }
                
            });
        }
        

    }).sort({$natural:-1}).limit(1);
    
});




router.delete('/eliminarUsuario', (req, res) => {  

    let query = { Usuario: req.body.Usuario };
    
    UsuarioModel.findOne(query, (err, retorno) => {

        

        if(retorno == null){
            res.send({estado:{codigo:0, respuesta:"El elemento que desea eliminar no existe"}})
        }
        else{
            retorno.remove( (err, respuesta) => { 
                if(err) {
                    res.send( { estado :{ codigo: 0, respuesta: err.message } });
                }
                else{
                    res.send(  { estado :{ codigo: 0, respuesta: 'Operacion eliminar es exitosa' }, persona: respuesta } );
                }
                
            });
        }

    });
    
});

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "migueleonrojas@gmail.com", // generated ethereal user
      pass: "wdrphxkayblvcvgw", // generated ethereal password
    },
});



router.post('/enviarMail',  (req, res) => {

    codigoValidacion = crypto.randomBytes(20).toString('hex');

    let info = transporter.sendMail({
        from: `"Miguel Leon " <migueleonrojas@gmail.com>`, // sender address
        to: `${req.body.correo}`, // list of receivers
        subject: "Codigo de validacion de correo", // Subject line
        text: `Su codigo de validacion es: ${codigoValidacion}`, // plain text body
        html: `<p>Su codigo de validacion es: <b>${codigoValidacion}</b></p>`, // html body
    });

    fechaDeValidacion = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        new Date().getHours(),
        new Date().getMinutes() + 0,
        new Date().getSeconds() + 30,
        new Date().getMilliseconds()
    );

    res.send( { 
        mensaje: "email enviado con exito", 
        codigoVerificacion: `${codigoValidacion}`,
        fechaDeVencimiento: fechaDeValidacion

        
    });

});


router.post('/enviarUsuarioPorCorreo', (req, res) =>{

    let query = { Correo: req.body.correo };

    UsuarioModel.findOne(query, (err, retorno) => {

        if(retorno == null){

            res.send({codigo:0,mensaje:`El correo ${req.body.correo} no se encuentra registrado`});
        }
        else{

            let usuario = retorno.Usuario;

            let info = transporter.sendMail({
                from: `"Miguel Leon " <migueleonrojas@gmail.com>`, // sender address
                to: `${req.body.correo}`, // list of receivers
                subject: "El nombre de su usuario", // Subject line
                text: `El nombre de su usuario es: ${usuario}`, // plain text body
                html: `<p>El nombre de su usuario es: <b>${usuario}</b></p>`, // html body
            });

            res.send({codigo:1,mensaje:`El nombre del usuario fue enviado a su correo ${req.body.correo}`});

        }

    });

});


router.post('/enviarPassPorCorreo', (req, res) =>{

    let query = { Usuario: req.body.usuario };

    UsuarioModel.findOne(query, (err, retorno) => {

        if(retorno == null){

            res.send({codigo:0,mensaje:`El usuario ${req.body.usuario} no se encuentra registrado`});
        }
        else{

            let clave = retorno.Clave;
            let correo = retorno.Correo

            let info = transporter.sendMail({
                from: `"Miguel Leon " <migueleonrojas@gmail.com>`, // sender address
                to: `${correo}`, // list of receivers
                subject: "Contraseña de su usuario", // Subject line
                text: `La clave del usuario "${req.body.usuario}" es: ${clave}`, // plain text body
                html: `<p>La clave del usuario <b>"${req.body.usuario}"</b> es: <b>${clave}</b></p>`, // html body
            });

            res.send({codigo:1,mensaje:`Su clave se le envio al correo: ${correo}`});

        }

    });

});

router.post('/enviarTokenDesUser', (req, res) =>{

    codigoToken = crypto.randomBytes(40).toString('hex');

    let query = { Usuario: req.body.usuario };

    UsuarioModel.findOne(query, (err, retorno) => {

        if(retorno == null){

            res.send({codigo:0,mensaje:`El usuario ${req.body.usuario} no se encuentra registrado`});
        }

        else if(retorno.Estatus != "bloqueado"){

            res.send({codigo:-1,mensaje:`El usuario ${req.body.usuario} no se encuentra bloqueado`});

        }

        else{
        
            if(fechaTemporizador == undefined){

                let correo = retorno.Correo

                fechaTemporizador = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    new Date().getHours(),
                    new Date().getMinutes() + 0,
                    new Date().getSeconds() + 30,
                    new Date().getMilliseconds()
                );

                let info = transporter.sendMail({
                    from: `"Miguel Leon " <migueleonrojas@gmail.com>`, // sender address
                    to: `${correo}`, // list of receivers
                    subject: "Token para desbloquear el usuario", // Subject line
                    text: `Ingrese al siguiente enlace:  ${codigoValidacion}`, // plain text body
                    html: `<p>Ingrese al siguiente enlace:</p> 
                           <a href="http://localhost:3000/desbloquearConEnlace/${retorno.Usuario}/${codigoToken}/${fechaTemporizador.getTime()}">Desbloquear usuario</a>`, // html body
                });

                
                

                

                res.send({codigo:1,mensaje:`Su clave especial para desbloquear fue enviado al correo: ${correo}`, correo:correo});

            }

            else{

                if(req.body.fecha < fechaTemporizador){
                    res.send({codigo:2,mensaje:`Debe esperar un rato para poder enviar otro token de nuevo`});
                }  
                else{
                    fechaTemporizador = undefined;
                    
                }
                

            }
            

        }

    });

});


router.get('/desbloquearConEnlace/:usuario/:token/:fechaVal', (req, res) => {

    let query = { Usuario: req.params.usuario };
    
    UsuarioModel.findOne(query, (err, retorno) => {

        if(retorno != null){

            if(req.params.token == codigoToken && req.params.fechaVal > new Date().getTime() && retorno.Estatus == 'bloqueado'){

                retorno.Estatus = 'activo';
                retorno.Intentos = 3;

                retorno.save();

                res.send(`<h1>Se ha desbloqueado el usuario ${req.params.usuario}</h1>`)
            }

            else if(retorno.Estatus != 'bloqueado'){

                res.send(`<h1>El usuario ${req.params.usuario} ya se desbloqueo</h1>`)

            }

            else{

                res.send(`<h1>El token es invalido o ya esta expirado</h1>`)
            }   

        }

        else{

            res.send(`<h1>El usuario no existe</h1>`)

        }


    });


});




app.use(router);