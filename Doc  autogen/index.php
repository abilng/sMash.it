<?php
//*-------------------------------------*
//	CONFIG
//*-------------------------------------* 

$error_reporting = 0;
$GLOBALS["jsonroot"] = "/JSON";
$GLOBALS["TITLE"] = "API Documentation";

//--------------------------------------

error_reporting($error_reporting);

$doc_root = dirname($_SERVER['SCRIPT_FILENAME']).$jsonroot;
if(isset($_SERVER["PATH_INFO"])){
	$request_path = $_SERVER["PATH_INFO"];
} else {
	viewdir($doc_root);
	exit();
}
if(file_exists($doc_root.$request_path)){
	$jsonfile = substr($request_path,1);
	page($jsonfile);
}else{
	error();
}

function page($json)
{
global $jsonroot;
global $TITLE;
$jsonfilename = substr($json,0,strrpos($json,'.'));
echo "
<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en' lang='en'>
<head>
<meta http-equiv='Content-Type' content='text/html' charset='UTF-8'/>
<link rel='hresource-documentation' type='application/json' src='..$jsonroot/$json'/>
<script type='text/javascript' src='../jquery-1.8.1.min.js'></script>
<script type='text/javascript' src='../hresource.js'></script>
<link rel='stylesheet' type='text/css' href='../hresource.css'/>
<title>$TITLE:$jsonfilename </title>
</head>
<body>
<h1>$TITLE</h1>
</body>
</html>";
}

function viewdir($doc_root){
global $TITLE;
echo "
<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en' lang='en'>
<head>
<meta http-equiv='Content-Type' content='text/html' charset='UTF-8'/>
<link rel='stylesheet' type='text/css' href='./hresource.css'/>
<title>$TITLE</title>
</head>
<body>
<h3>$TITLE</h3>";
echo "<ul>";

$dir= opendir($doc_root);
while($file = readdir($dir)) {
		if(substr($file,strrpos($file,'.'))=='.json') {
			$name = substr($file,0,strrpos($file,'.'));
			echo "<li><a href=index.php/$file>$name</a></li>";
		}
}
echo "</ol>";
echo "</body></html>";

}

function error(){

header("404 Not Found",true,404);
echo "
<html lang='en'><head><title>404 Page Not Found</title>
</head><body><div id='container'>
<h1>404 Page Not Found</h1>
<p>The page you requested was not found.</p>
</div></body></html>";
}

?>
