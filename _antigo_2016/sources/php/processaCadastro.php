<?php
function email($tipo, $nome, $email){
	/*
	echo $tipo.' - ';
	echo $nome.' - ';
	echo $email;
	*/
	
	require 'phpmailer/PHPMailerAutoload.php';

	$mail             = new PHPMailer();

	//CHECA QUAL MENSAGEM ENVIAR
	if($tipo == 'empresas'){
		$body             = file_get_contents('conteudo-empresas.php');
	} else if($tipo == 'revenda'){
		$body             = file_get_contents('conteudo-revenda.php');
	}

	$body             = eregi_replace("[\]",'',$body);
	$mail->CharSet = 'UTF-8';

	$mail->IsSMTP(); // telling the class to use SMTP
	$mail->Host       = "srv124.prodns.com.br"; // SMTP server
	$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
	                                           // 1 = errors and messages
	                                           // 2 = messages only
	$mail->SMTPAuth   = true;                  // enable SMTP authentication
	$mail->Host       = "srv124.prodns.com.br"; // sets the SMTP server
	$mail->Port       = 587;                    // set the SMTP port for the GMAIL server
	$mail->Username   = "contato@kitalimentacao.com.br"; // SMTP account username
	$mail->Password   = "ka789";        // SMTP account password

	$mail->SetFrom('contato@kitalimentacao.com.br', 'Contato Kit Alimentacao');

	$mail->AddReplyTo('contato@kitalimentacao.com.br', 'Contato Kit Alimentacao');

	$mail->Subject    = "Tabela de Preços | Kit Alimentação - Cestas Básicas RJ";

	//$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test

	$mail->MsgHTML($body);

	$name = $nome;
	$address = $email;
	$mail->AddAddress($address, $name);

	if(!$mail->Send()) {
	  echo "Erro: " . $mail->ErrorInfo;
	} else {
	  echo "ok";
	}
}

$nome = $_POST['nome'];
$email = $_POST['email'];
$empresa = $_POST['empresa'];
$cidade = $_POST['cidade'];
$telefone = $_POST['telefone'];
$whatsapp = $_POST['whatsapp'];

$tipo = $_POST['tipo'];
$data = date('d-m-Y H:i:s');

$caminho = "../";

if($tipo == 'empresas'){
	$myfile = fopen($caminho."cadastros-empresas.txt", "a+") or die("Unable to open file!");
	$txt = "$nome, $email, $empresa, $cidade, $telefone, $data\n";
	$url = 'http://wwww.kitalimentacao.com.br/';
} elseif($tipo == 'revenda'){
	$myfile = fopen($caminho."cadastros-revenda.txt", "a+") or die("Unable to open file!");
	$txt = "$nome, $email, $cidade, $telefone, $whatsapp, $data\n"; 
	$url = 'http://wwww.kitalimentacao.com.br/revenda/';
}

fwrite($myfile, $txt);
fclose($myfile);

email($tipo, $nome, $email);

?>