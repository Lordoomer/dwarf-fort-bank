window.onload = function WindowLoad(event) {
	document.getElementById("Test_Play1").addEventListener("click", function(){
		if(document.getElementById('LibaryContainerB').style.display == 'block'){
			document.getElementById('LibaryContainerB').style.display = 'none';
		}else{
			document.getElementById('LibaryContainerB').style.display = 'block';			
		}
	});	
}

var socket = io.connect();
function Register(){
	document.getElementById("New_Game").removeEventListener('click', Register);
	if(document.getElementById("Password1").value == document.getElementById("Password2").value){
		var NewPlayer = document.getElementById('New_Account_Name').value;
		var NewPassword = document.getElementById("Password1").value;
		var RegisterArray = [NewPlayer, NewPassword];
		socket.emit('Register', RegisterArray);		
	}else{
		document.getElementById("RegisterAdvice").style.color = "red";
		document.getElementById("RegisterAdvice").innerHTML = "Your two passwords do not match newb!";
	}
}
socket.on('RegisterFeedback', function(ServerReply, NewName){
//	console.log('Player ' + NewName + ' created an account!');
	if(ServerReply == "Success"){
		loadedMap = 'Castle_' + NewName;
		ThePlayerName = NewName;
		document.getElementById("RegisterAdvice").style.color = "green";
		document.getElementById("RegisterAdvice").innerHTML = "Account created! Starting game...";
		NewGame();
	}else{
		document.getElementById("RegisterAdvice").style.color = "red";
		document.getElementById("RegisterAdvice").innerHTML = "Account name already exist!!! Choose another account name or perish...";
		document.getElementById("New_Game").addEventListener('click', Register);		
	}
});

socket.on('GetMyFortsPath', function (MyImagesDir){
	console.log('Getting Forts ' + MyImagesDir);
//	var preload =setInterval(function(){
		
		if (document.getElementById("ImagesLibraryB") ){
	    	var  ImagePathPower = "";	
		   	for (var i = 0; i < MyImagesDir.length; i++) {
				TotalForts =+ 1;
				if(MyImagesDir[i]){
					ImagePathPower += ("</br><p> <input type='radio' id='" + MyImagesDir + "'  name='dwarf' class='RadioButtons' />" + 
									   "<a href='dwarf/fortbank/" + MyImagesDir[i] + "'  title='Download and Claim Region for up to 7 days'>" 
										+ MyImagesDir[i] + "</a></p></br>");
				}
			}
	   		document.getElementById("ImagesLibraryB").innerHTML += ImagePathPower;  		
		//	clearInterval(preload);
		}
//	},100);	
});
var TotalForts = 0;
socket.on('GetMyFortPath', function (MyImagesDir){//Pour les images uploadées
		////console.log(MyImagesDir);
		TotalForts += 1;
		document.getElementById("ImagesLibraryB").innerHTML += "</br><p><input type='radio' id='" + MyImagesDir + "'  name='dwarf' class='RadioButtons' value='" + MyImagesDir + 
		"' /><a href='dwarf/fortbank/" + MyImagesDir + 
		"'  title='Download and Claim Region for up to 7 days'>" + MyImagesDir + "</a></p></br>";
});
function validate_fileuploadB(fileName){	
	console.log('Uploading file!');
	if(TotalForts <= 30){
		var size = document.getElementById('MyFileB').files[0].size;
		if (size > 1500000000000)
		{
			alert('Please choose a compressed dwarf fortress current folder and region folder compressed into a rar or zip file smaller than 150 MB.');
			return false; 
		}
	    var allowed_extensions = new Array('zip','rar',);
	    var file_extension = fileName.split('.').pop();
	    for(var i = 0; i < allowed_extensions.length; i++)
	    {
		        if(allowed_extensions[i]==file_extension)
		        {
		        	var fullPath = document.getElementById('MyFileB').value;
						if (fullPath) {
							var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
							var filename = fullPath.substring(startIndex);
							if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
								filename = filename.substring(1);
							}
						}
						var form = document.getElementById('myFormB');
						fetch(form.action,{method:'post', body: new FormData(form)});
		        	//document.getElementById('myForm').submit();		
		            return true; // valid file extension
		        }
		}
		    alert('Invalid file format. File extension must be zip or rar.');
		    return false;
	}else{
	alert('Dwarf Fortress Region Bank is currently full, please claim a region or come back later!');	
	}
}
socket.on("prototypeB", function (Myprogress){
  		var ToStringVar =  Myprogress.toString();
  		document.getElementById("progresslabelB").innerHTML = ToStringVar + "%"; 
		document.getElementById("MyUploadProgressBarB").style.width = (Myprogress * 4 ) + "px";
		document.getElementById("MyUploadProgressBarB").style.height = "15px";
});




