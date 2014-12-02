module.exports = function(mongoose) {
 
  var Schema = mongoose.Schema;
 
  var ArticuloSchema = new Schema({

    titulo : String,
    descripcion : String,
    categorias: Array,
    precio: Number,
    fotos: Array
  });
  return mongoose.model('Articulo', ArticuloSchema);
}