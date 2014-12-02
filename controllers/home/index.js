var express = require('express');
var app = module.exports = express();
var nodemailer = require('nodemailer');

app.set('views', __dirname + '/views');

app.get('/lista', function(request, response) {
  db.Articulo.find().exec(function (error, articulos) {
    if (error) return response.json(error);
    return response.render('lista', {
      articulos: articulos
    });
  });
});

app.get('/articulo/:id', function(request,response){
  var articuloId = request.params.id;

  db.Articulo.findById(articuloId, function(error, articulo){
    if (error) response.json(error);

    response.render('articulo', articulo);
  });
});

app.get('/categoria/:categoria', function(request,response){
  var categoria = request.params.categoria;

  db.Articulo.find(
    {categorias: categoria},
    function(error, articulos){
      if (error) response.json(error);

      return response.render('lista', {
        articulos: articulos
      });
    }
  );
});

app.get('/', function(request, response) {
  response.render('somos');
});

app.get('/dedicamos', function(request, response) {
  response.render('dedicamos');
});

app.get('/clientes', function(request, response) {
  response.render('clientes');
});

app.get('/contacto', function(request, response) {
  response.render('contacto');
});

app.post('/contacto', function (req, res) {
  var mailOptions, smtpTransport;
  //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
  smtpTransport = nodemailer.createTransport('SMTP', {
      service: 'Gmail',
      auth: {
          user: "antedi@antedi.com",
          pass: "nxwoxcjipmihpsvu" 
          //pass: "687rivera" 
      }
  });
  //Mail options
  mailOptions = {
      from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      to: 'antedi@antedi.com',
      subject: 'Contacto desde antedi.com',
      text: req.body.mensaje
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
      // Email not sent
      if (error) {
          console.log(error);
          res.render('contacto', { title: 'Raging Flame Laboratory - Contact', msg: 'Error occured, message not sent.', err: true, page: 'contact' })
      }
      // Email sent
      else {
          console.log("Message sent: " + response.message);
          res.render('contacto', { title: 'Raging Flame Laboratory - Contact', msg: 'Message sent! Thank you.', err: false, page: 'contact' })
      }
  });
});