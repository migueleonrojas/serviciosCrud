var mongoose = require('mongoose');
var schema = mongoose.Schema;  


var transaccionschema = new schema(
    {
        Referencia: String,
        Remitente: String,
        Destinatario: String,
        Monto: Number,
        Create_at: { type: Date, require:true, default: Date.now },     
        IdUsuario: { type: schema.ObjectId, ref:"Usuario" }
    }
);

module.exports = mongoose.model('Transaccion', transaccionschema);