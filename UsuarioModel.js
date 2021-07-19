
const mongoose = require('mongoose');//importando mongoose
const Schema = mongoose.Schema;  // usando el schema de mongoose
const uniqueValidator = require('mongoose-unique-validator');
const { boolean } = require('yup');
const validator = require('validator');


var fechaMaxima = function(fecha) {
    /*
    let anio_max = Number(new Date().getFullYear()) -13;
    let mes_max = Number(new Date().getMonth());
    let dia_max = Number(new Date().getDate());

    let fecha_max = new Date(anio_max, mes_max, dia_max);

    console.log(fecha_max);
    console.log(fecha);

    */

    /*
    let anio_ingresado = Number(fecha.substring(0,4));
    let mes_ingresado =  Number(fecha.substring(5,7));
    let dia_ingresado =  Number(fecha.substring(8,10));

    let fecha_ingresada = new Date(anio_ingresado, mes_ingresado, dia_ingresado);
    */
    //console.log(new Date());
    //console.log(fecha);
    
    return fecha <= new Date();

 };
 
 var fechaMinima = function(string) {
    // Codigo de validacion2
 };
 
 var fechaActual = function(string) {
    // Codigo de validacion2
 };
 



/**/



//vamos a definir nuestro schema con un JSON
const usuarioschema = new Schema(
    {
        Nombre: {
            type: String, 
            required: [true, 'El nombre no puede estar vacio'],
            minlength: [3, 'El nombre debe contener al menos 3 letras'],
            maxlength: [40, 'El nombre debe cotener como maximo 40 letras'],
            match: [/^[a-zA-z ]+$/i, 'Solo puede ingresar letras']
        },
        Usuario: {
            type: String,
            uniqueValidator: true,
            required: [true, 'El usuario no puede estar vacio'],
            match: [
                /^[a-zA-Z.@_-]+$/i, 
                "No puede incluir espacios en blanco y solo se permiten los siguientes caracteres: ('@', '.', '-' y '_')"
            ]
            
        },    
        Correo: {
            type: String,
            uniqueValidator: true,
            required:[true, 'El correo no puede estar vacio'],
            match:[
                /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
                "Debe colocar un formato de correo valido"
            ],
            maxlength:[50, 'Solo debe contener maximo 50 letras']
        },
        Clave: {
            type: String,
            required:[true, "La clave no puede estar vacia"],
            minlength:[6, 'La contraseña debe contener como minimo 6 letras'],
            maxlength:[20, 'La contraseña debe contener como maximo 20 letras'],
            match:[
                /(?=.*[0-9])(?=.*[.|@|_|-])(?=.*[A-Z])([0-9a-zA-Z.@_-])*?$/i,
                "Debes colocar al menos una letra en mayuscula, al menos un numero y al menos uno de estos caracteres especiales ('.', '@', '_', '-')"
            ]
            
        },
        FechaDeNacimiento: {
            type: String,
            required:[true, "La fecha no puede estar vacia"],
            match:[
                /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))+$/i,
                "El formato que debes ingresar debe ser yyyy-mm-dd"
            ],
            validate: [

                {
                    validator:function(fecha){

                        let fecha_actual = Number(new Date().toISOString().replace(new RegExp("-","g") ,"").substring(0,8));

                        let fecha_ingresada = Number(fecha.replace(new RegExp("-","g") ,""));
                        
                        return fecha_ingresada <= fecha_actual;
                    },
                    message: 'No puedes colocar una fecha mayor a la actual'
                },

                {
                    validator:function(fecha){
                        let anio_max = Number(new Date().getFullYear()) -13;
                        let mes_max = Number(new Date().getMonth());
                        let dia_max = Number(new Date().getDate());

                        let fecha_max = Number(new Date(anio_max, mes_max, dia_max).toISOString().replace(new RegExp("-","g") ,"").substring(0,8));

                        let fecha_ingresada = Number(fecha.replace(new RegExp("-","g") ,""));

                        return fecha_ingresada < fecha_max;
                    },
                    message:'Debes de tener mas de 13 años'
                },

                {
                    validator:function(fecha){
                        let anio_max = Number(new Date().getFullYear()) -120;
                        let mes_max = Number(new Date().getMonth());
                        let dia_max = Number(new Date().getDate());

                        let fecha_max = Number(new Date(anio_max, mes_max, dia_max).toISOString().replace(new RegExp("-","g") ,"").substring(0,8));

                        let fecha_ingresada = Number(fecha.replace(new RegExp("-","g") ,""));

                        return fecha_ingresada > fecha_max;
                    },
                    message:'Fecha de nacimiento no valida'
                }

            ]
        
        },
        Create_at: { 
            type: Date, 
            require:true, 
            default: new Date()
        },
        Registrado: {
            type: Boolean,
            required: [true, "No puede estar vacio el campo registrado"],
            validate: [

                {
                    validator:function(regis){

        
                        return typeof regis !== boolean;


                    },
                    message:'Debe ingresar un valor booleano'
                }

            ]
        },
        Estatus: {
            type:String,
            required:[true, "No puede estar vacio el campo Estatus"],
            match:[
                /(activo|bloqueado|inactivo)+$/i,
                "Debe indicar 'activo','bloqueado' o 'inactivo'"
            ],
            
        },
        Saldo: {

            type:Number,
            required:[true, "No puede estar vacio el campo de Saldo"],
            validate:[

                {
                    validator:function(saldo){

        
                        return saldo == 0;


                    },
                    message:'El saldo del usuario nuevo empieza en 0'
                }

            ]

        },
        Rol:{
            type:String,
            required:[true, "No puede estar vacio el campo de Rol"],
            match:[
                /(usuario|administrador)+$/i,
                "Debe indicar 'usuario' o 'administrador'"
            ],
        },
        Intentos:{
            type:Number,
            required:[true, "No puede estar vacio el campo Intentos"],
            validate: [

                {
                    validator:function(Intent){

        
                        return  Intent >= 0 && Intent <= 3;


                    },
                    message:'Debe ingresar un valor en un rango del 0 al 3'
                }

            ]
        }
    }
);







module.exports = mongoose.model('UsuariosPortalDePago', usuarioschema);