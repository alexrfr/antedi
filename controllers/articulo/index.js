var express = require('express')
  , fs = require('fs')
  , app = module.exports = express()
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash')
  , AWS = require('aws-sdk'); 

require('./../config/passport')(passport); // pass passport for configuration

app.set('views', __dirname + '/views');
app.use(express.cookieParser()); // read cookies (needed for auth)
// required for passport
app.use(express.session({ secret: 'ilovealexalexalexalexalexalex' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

AWS.config.update({region: 'us-east-1'});
//AWS.config.loadFromPath('./controllers/config/s3.json');
var s3 = new AWS.S3();
var S3_BUCKET = 'antedi';

// mueve las fotos a la carpeta /public/photos
// =====================================
// Mover Imagen ========================
// =====================================
function moverImagen(element, index, array){
    var file = element,
        name = file.name.replace(/\s/g,''),
        type = file.type,
        size = file.size,
        tmp_path = file.path,
        target_path = __dirname + "/../../public/photos/" + name;
  
    var format = type.split("/");

    if(format[1] === "jpg" || format[1] === "jpeg" || format[1] === "dng"
      || format[1] === "png" || format[1] === "gif"){

// =====================================
    uploadFile(file, S3_BUCKET);
// =====================================

      // fs.rename(tmp_path, target_path, function(err){
      //   if(err) response.send("Ocurrio un error al intentar subir la imagen" + name + " ERROR: "+ err);
      // });
    }else if(format[1] === "octet-stream"){ // Al actualizar se carga una imagen que no lo es
      fs.unlink(tmp_path);
    }else{
      fs.unlink(tmp_path);
      response.send("El formato debe ser jpg, png o gif. La foto " + name + " es incorrecta.");
    } 
  };

// =====================================
// NEW ARTICULO=========================
// =====================================
// Muestra el formulario de creacion de articulos
app.get('/admin/articulo/new', isLoggedIn, function(request, response) {
  response.render('new');
});

// procesa la cracion del articulo, guardar en bbdd y subida de fotos
app.post('/admin/articulo', isLoggedIn, function(request, response) {
 
  var imagenes = request.files.image[0];

  var arrayImagenes = new Array();
  if(imagenes.length > 0){
    imagenes.forEach(moverImagen);
    for( var i=0; i<imagenes.length; i++){
      arrayImagenes.push(imagenes[i].name.replace(/\s/g,''));
    }
  } else {
    if (imagenes.name !== ''){
      moverImagen(imagenes);
      arrayImagenes.push(imagenes.name.replace(/\s/g,''));
    }
  }

  var u = request.body; 
  var newArticulo = new db.Articulo({
    titulo : u.titulo,
    descripcion : u.descripcion,
    // categorias: u.categorias.split(" "),
    precio: u.precio,
    //videos: u.videos,
    fotos: arrayImagenes
  });

  newArticulo.save(function(error, articulo) {
    if (error) response.json(error);
    response.redirect('/admin/articulo');
  });
});

// =====================================
// LISTA ARTICULOS =====================
// =====================================
// Muestra la lista de articulos editables
app.get('/admin/articulo', isLoggedIn, function(request, response) {
  db.Articulo.find().sort( { titulo: 1 } ).exec(function (error, articulos) {
    if (error) return response.json(error);
    return response.render('index', {
      articulos: articulos
    });
  });
});

// =====================================
// EDITAR ARTICULO =====================
// =====================================
// muestra los campos del articulo indicado para editar
app.get('/admin/articulo/edit/:id', isLoggedIn, function(request,response){
  var articuloId = request.params.id;

  db.Articulo.findById(articuloId, function(error, articulo){
    if (error) response.json(error);

    response.render('edit', articulo);
  });
});

//  procesa la edicion del articulo, guardar en bbdd y subida de fotos 
app.put('/admin/articulo/:id', isLoggedIn, function(request, response){

  var articulo = request.body,  
      articuloId = request.params.id,
      arrayImagenes = articulo.arrayfotos.split(" "),
      imagenes = request.files.image[0];

  if(imagenes.length > 0){
    imagenes.forEach(moverImagen);
    for( var i=0; i<imagenes.length; i++){
      arrayImagenes.push(imagenes[i].name.replace(/\s/g,'') );
    }
  } else {
    if (imagenes.name !== ''){
      moverImagen(imagenes);
      arrayImagenes.push(imagenes.name.replace(/\s/g,'') );
    }else{ // Al actualizar se carga una imagen que no lo es
      moverImagen(imagenes);
    }
  }

  // articulo.categorias= articulo.categorias.split(" ");
  articulo.fotos = arrayImagenes;

  delete articulo.id;
  delete articulo._id;

  db.Articulo.findByIdAndUpdate(articuloId, articulo, function(error, articulos){
    if(error) return response.json(error);

    response.redirect('/admin/articulo/edit/'+articuloId);
  });
});

// =====================================
// BORRAR ARTICULO =====================
// =====================================
// busca y elimina el articulo indicado
app.get('/admin/articulo/delete/:id', isLoggedIn, function(request, response){
  var articuloId = request.params.id,
      foto = "",
      foto_path = __dirname + "/../../public/photos/"; 

  db.Articulo.findById(articuloId, function(error, articulo){
    if (error) response.json(error);

    if (articulo.fotos){
      for( var i=0; i<articulo.fotos.length; i++){
        foto = articulo.fotos[i]
        fs.unlink(foto_path + foto);
        console.log('successfully deleted photo: ' + foto);
      }
    }
  });

  db.Articulo.findByIdAndRemove(articuloId, function(error, articulo){
    if (error) return response.json(error);

    response.redirect('/admin/articulo');
  });
});

// =====================================
// BORRAR CATEGORIA=====================
// =====================================
// elimina la categoria indicada del articulo indicado 
app.get('/admin/articulo/delete/categoria/:id-:categoria', isLoggedIn, function(request, response){
  var articuloId = request.params.id,
      categoria = request.params.categoria;

  db.Articulo.update(
    { _id: articuloId },
    { 
        $pullAll: { categorias : [categoria] }
    }, function(error, articulo){
      if (error) return response.json(error);

      response.redirect('/admin/articulo');
    }
  );
});

// =====================================
// BORRAR FOTO =========================
// =====================================
// elimina la foto indicada del articulo indicado 
app.get('/admin/articulo/delete/foto/:id-:foto', isLoggedIn, function(request, response){
  var articuloId = request.params.id,
      foto = request.params.foto,
      photo_path = __dirname + "/../../public/photos/" + foto;

  deleteFile(foto, S3_BUCKET);

  db.Articulo.update(
    { _id: articuloId },
    { 
        $pullAll: { fotos : [foto] }
    }, function(error, articulo){
      if (error) return response.json(error);
      console.log('successfully deleted' + photo_path);
      response.redirect('/admin/articulo/edit/'+articuloId);
    }
  );

});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/admin', function(request, response) {
  response.render('login');
});

// process the login form
  app.post('/admin/login', passport.authenticate('local-login', {
    successRedirect : '/admin/articulo', // redirect to the secure profile section
    failureRedirect : '/admin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
app.get('/admin/signup', function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup', { message: req.flash('signupMessage') });
});

// process the signup form
app.post('/admin/signup', passport.authenticate('local-signup', {
  successRedirect : '/admin', // redirect to the secure profile section
  failureRedirect : '/admin/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

// =====================================
// LOGOUT ==============================
// =====================================
app.get('/admin/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

// =====================================
// S3 - CREATEBUCKET ===================
// =====================================
// Crea una carpeta en S3
function createBucket(bucketName) {
  s3.createBucket({Bucket: bucketName}, function() {
    console.log('created the bucket[' + bucketName + ']');
    console.log(arguments);
  });
} 

// =====================================
// S3 - UPLOADFILE =====================
// =====================================
// Sube un elemento a la carpeta indicada en S3
function uploadFile(element, bucketName) {
  console.log('S3 UPLOADER : file[' + filename + ']');

  var file = element,
    filename = file.name.replace(/\s/g,''),
    tmp_path = file.path;

  var stream = fs.createReadStream(tmp_path);

  //Antes estaba así:  s3.client.putObject() pero fallaba
  s3.putObject({Bucket: bucketName, Key: filename, Body: stream, ACL: 'public-read'}).
    on('complete', function() { 
      console.log('S3 UPLOADER : Uploaded file[' + filename + ']'); 
      console.log(arguments); 
      fs.unlink(tmp_path);
    }).send();
}

// =====================================
// S3 - DELETEFILE =====================
// =====================================
// Elimina un elemento de la carpeta indicada en S3

function deleteFile(key, bucketName) {
  var params = {Bucket: bucketName, Key: key};

  s3.deleteObject(params, function(err){
    if (!!err) {
        console.log('S3 DELETER : Error deleting file[' + key + ']');
    }
    console.log('S3 DELETER : Deleted file[' + key + ']');
  });
}
