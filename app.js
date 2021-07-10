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

app.set('port', process.env.PORT || 3000);

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



mongoose.connect('mongodb+srv://migueleonrojas:Bolivariano.2@cluster0.4ea1g.mongodb.net/test', {
    useUnifiedTopology: true,
    useNewUrlParser: true
} , (err, res) => {

    //si hay err se sale con una excepcion
    if(err) throw err;

    console.log('Conexion con el servidor de manera exitosa');

});



app.listen(app.get('port'), () =>  {

    console.log(`El servidor esta en el puerto ${app.get('port')}`);

});

router.get('/usuario', (req, res) => {  

    console.log('El famoso hola mundo');
    res.send( { mensaje: "operacion en el portal de pago get exitosa" } );
});



router.post('/creandoUsuario', (req, res) => {  

    
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

    if(req.body.Clave != req.body.ClaveVerificar){
        res.send( {error:{ repuesta : "las contraseñas no son iguales" } } );
    }
    else{

        miUsuarioPorCrear.save( (err, respuesta) => { 

            if(err){

                res.send(err);

            }

            else{
                res.send(  { error :{ codigo: 0, respuesta: 'Usuario creado con exito' }, usuario: respuesta } )
            }
            
        }); 
    }
     
    
});




router.post('/consultarUsuario', (req, res) => {  


    //{ $or: [ { "edad": {$gte: 60}}, { "edad": {$lte:10}} ]}
    
    let query = { $or: [ { Usuario: { $eq : req.body.Usuario} }, { Correo: { $eq: req.body.Correo  } } ]  };


    UsuarioModel.findOne(query, (err, retorno) => {

        if(err) res.send( { estado :{ codigo: 0, respuesta: err.message } });

        res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de consulta por user y mail exitosa' }, usuario: retorno } );

    });
});


router.post('/consultarUltimoUsuario', (req, res) => {  

    UsuarioModel.findOne((err, retorno) => {

        if(err) res.send( { estado :{ codigo: 0, respuesta: err.message } });

        res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de consulta por id es exitosa' }, usuario: retorno } );

    }).sort({$natural:-1}).limit(1);
});






router.put('/actualizarUsuario', (req, res) => {  

    let query = { Usuario: req.body.Usuario };
    
    UsuarioModel.findOne(query, (err, retorno) => {

        
        retorno.Registrado = false;
        retorno.Estatus = "I";
    
        
        //res.send(retorno);

        retorno.save( (err, respuesta) => { 
            if(err) res.send( { estado :{ codigo: 0, respuesta: err.message } });

            res.send(  { estado :{ codigo: 0, respuesta: 'Operacion de actualizacion es exitosa' }, persona: respuesta } );
        });
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


    let codigoAleatorio = crypto.randomBytes(20).toString('hex');

    let info = transporter.sendMail({
        from: `"Miguel Leon " <migueleonrojas@gmail.com>`, // sender address
        to: `${req.body.correo}`, // list of receivers
        subject: "Codigo de validacion de correo", // Subject line
        text: `Su codigo de validacion es: ${codigoAleatorio}`, // plain text body
        html: `<p>Su codigo de validacion es: <b>${codigoAleatorio}</b></p>`, // html body
    }

    );

    res.send( { 
        mensaje: "email enviado con exito", 
        codigoVerificacion: `${codigoAleatorio}`,
        fechaDeVencimiento: `${new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
        )}`
    });

    

});






app.use(router);