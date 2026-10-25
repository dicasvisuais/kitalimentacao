<?php
function email($nome, $email, $assunto, $msg){
	/*
	echo $tipo.' - '; 
	echo $nome.' - ';
	echo $email;
	*/
	
	require 'phpmailer/PHPMailerAutoload.php';

	$mail             = new PHPMailer();
	$mail->CharSet = 'UTF-8';

	$body             = $msg;

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

	$mail->SetFrom($email, $nome);

	$mail->AddReplyTo($email, $nome);

	$mail->Subject    = $assunto ;

	//$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test

	$mail->MsgHTML($body);

	$mail->AddAddress('contato@kitalimentacao.com.br', 'Contato - Kit Alimentação');

	if(!$mail->Send()) {
	  echo "Erro: " . $mail->ErrorInfo;
	} else {
	  echo "ok";
	}
}

$nome = $_POST['nome'];
$email = $_POST['email'];
$assunto = $_POST['assunto'];
$telefone = $_POST['telefone'];
$msg = "<strong>Mensagem: </strong>" . $_POST['msg'];

$data = date('d-m-Y H:i:s');

$msg .= "<br><strong>Telefone:</strong> " . $telefone;
$msg .= "<h3>Enviado pela página Contato do site Kit Alimentação</h3>";

$caminho = "../";
$myfile = fopen($caminho."cadastros-faleconosco.txt", "a+") or die("Unable to open file!");
$txt = "$nome, $email, $telefone, $assunto, $data\n"; 

fwrite($myfile, $txt);
fclose($myfile);

email($nome, $email, $assunto, $msg); 

?>