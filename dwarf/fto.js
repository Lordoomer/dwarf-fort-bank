var http = require("http"),
url = require("url"),
formidable = require('formidable'),
path = require("path"),
util = require('util'),
fs = require("fs-extra");
port = process.argv[2] || 4444;
var zlib = require('zlib');
var io = require('socket.io')();
var UserTable = [];
var app =  http.createServer(function(request, response) {
			    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);
		if(request.url == '/FortBank1' && request.method.toLowerCase() == 'post'){
			            var MyUploadingFileName, filesizevalidation = "0";
            var form = new formidable.IncomingForm();
            form.parse(request, function(err, fields, files) {
                //console.log(util.inspect(fields.file)); // I found out this fields.file return the value of the field whose name is file
                MyUploadingFileName = util.inspect(fields.filename);
                filesizevalidation = util.inspect({files : files});
                filesizevalidation = filesizevalidation.substring(filesizevalidation.indexOf("size:"), filesizevalidation.length);
                filesizevalidation = filesizevalidation.substring( (filesizevalidation.indexOf(":") + 2), filesizevalidation.indexOf(","));
                console.log("begin uploading file:" + MyUploadingFileName);     
            }); 
            form.on('progress', function(bytesReceived, bytesExpected) {
                var percent_complete = (bytesReceived / bytesExpected) * 100; 
                io.sockets.emit("prototypeB", percent_complete.toFixed(0)); 
                console.log(percent_complete.toFixed(2));                   
            });
            form.on('error', function(err) {
                console.error(err);
            });
            form.on('end', function(fields, files) {  
                /* Temporary location of our uploaded file */
                var temp_path = this.openedFiles[0].path;
                /* The file name of the uploaded file */
                var file_name = this.openedFiles[0].name;
                file_name = file_name.split("");
                for(i = 0; i < file_name.length; i++ )
                {
                  if(file_name[i] == " ")
                  {
                  	file_name.splice(i, 1, "_");
                  }	
                }	
                file_name = file_name.join("");
                /* Location where we want to copy the uploaded file */
                var new_location = 'z:/nodejs/dwarf/fortbank/';
                if (filesizevalidation != "0" )
                {
	                   fs.copy(temp_path, new_location + file_name, function(err) {  
	                    if (err) {
	                        console.error(err);
	                    } else {
                                io.sockets.emit('GetMyFortPath', file_name);
	                    }
	                });             	
                }

            });
			response.end();
		}else{
	        fs.exists(filename, function(exists) {
		        if (fs.statSync(filename).isDirectory()) filename += 'dwarf/html/index.html';
		        fs.readFile(filename, "binary", function(err, file) {
		            if(err) {
		                response.writeHead(500, {"Content-Type": "text/plain"});
		                response.write(err + "\n");
		                response.end();
		                return;
		            }
					var xtn = filename.substring((filename.lastIndexOf(".") + 1), filename.length);  //this will take only the extensions no matter how many dots
					console.log(xtn);
					switch ( xtn ) {
						case 'html':
							xtn = "text/html";
						  break;
						case 'gif':
							xtn = "image/gif";
						  break;
						case 'jpg':
							xtn = "image/jpeg";
						  break;
						case 'swf':
							xtn = "application/x-shockwave-flash";
						  break;	
						 case 'png':
							xtn = "image/png";
						  break;
						case 'css':
							xtn = "text/css";
						  break;
						case 'js':
							xtn = "application/javascript";
						  break;
						case 'mp3':
							xtn = "audio/mpeg";
							break;
						default:
						  console.log("unknown extention: " + xtn);
							xtn = "text/plain";
						  break;
					}
					response.setHeader("Content-Type", xtn);
					//response.setHeader('Cache-Control', 'public, max-age=345600'); // 4 days
					//response.setHeader('Last-Modified', "Mon, 03 Jan 2011 17:45:57 GMT");
					var raw = fs.createReadStream(filename);
					var acceptEncoding = request.headers['accept-encoding'];
					if (!acceptEncoding) {
						acceptEncoding = '';
					}
					if (acceptEncoding.match(/\bdeflate\b/)) {
						response.writeHead(200, { 'content-encoding': 'deflate' });
						raw.pipe(zlib.createDeflate()).pipe(response);
					} else if (acceptEncoding.match(/\bgzip\b/)) {
						response.writeHead(200, { 'content-encoding': 'gzip' });
						raw.pipe(zlib.createGzip()).pipe(response);
					} else {
						response.writeHead(200, {"Content-Type": xtn});
						raw.pipe(response);
					}	
		        });
		    });      	
        }
});
function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
            default:
                return char;
        }
    });
}
var messages = [];
io = io.listen(app);
// When someone connect on the web page
io.sockets.on('connection', function (socket) {
		var mydirectory = "dwarf/fortbank";
		console.log('Sending forts paths');
	   fs.readdir(mydirectory, function( err, files) {
        if ( err ) {
            console.log("Error reading files: ", err);
        } else {
            // keep track of how many we have to go.
            var remaining = files.length;
            var totalBytes = 0;
          /*  if ( remaining == 0 ) {
               		var MyImagesDirB = files;
					socket.emit('GetMyFortsPath', MyImagesDirB);
            }*/
            for ( var i = 0; i < files.length; i++ ) {
                    remaining -= 1;
                    if ( remaining == 0 ) {
                            var MyImagesDirB = files;
							socket.emit('GetMyFortsPath', MyImagesDirB);
                    }
                }
        }
	});
    socket.on('Register', function (FTO_ITEM) {
        var userexist = false;
            for (var i in UserTable) {
                if(UserTable[i].username == FTO_ITEM[0])
                {
                    userexist = true;
					socket.emit('RegisterFeedback', "fail");
                }
            }
			if(userexist == true){

			}else{
				console.log(FTO_ITEM);
				var CastleName = 'Castle_' + FTO_ITEM[0];
                socket.join(CastleName);
                var post  = {username: FTO_ITEM[0], userpassword: FTO_ITEM[1], email: "Not Supported yet!", status: "FreeUser",Landscape: 'Plain', X_Coord: 10, Y_Coord: 10, Map: CastleName};
				UserTable.push(post);  	
                var queryW = connection.query('INSERT INTO users SET ?', post, function(err, result) {
				console.log(err);
                io.to(CastleName).emit('RegisterFeedback', "Success", FTO_ITEM[0]);
                });				
			}

    });
		socket.emit('recupererMessages', messages);
		socket.on('nouveauMessage', function (mess) {
        messages.push(mess);
        socket.broadcast.emit('recupererNouveauMessage', mess);
    });

});
app.listen(parseInt(port, 10));
///////////////////

console.log("Dwarf Fortress Region Bank v0.1 running\n =>  at http://localhost:" + port);