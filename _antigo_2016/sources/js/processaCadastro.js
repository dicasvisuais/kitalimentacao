$(function() {

    function redirect(url){
        window.location = url;
    }

    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events

        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM

            var nome = $("input#nome").val();
            var email = $("input#email").val();
            var empresa = $("input#empresa").val();
            var cidade = $("input#cidade").val();
            var telefone = $("input#telefone").val();
            var whatsapp = $("input#whatsapp").val();
            var assunto = $("input#assunto").val();
            var msg = $("textarea#msg").val(); 
            var tipo = $("input#tipo").val();

            if(tipo == 'contato'){
                var urlPHP = '../assets/php/processaEmail.php';
            } else {
                var urlPHP = '../assets/php/processaCadastro.php';
            }

            var firstName = nome; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = nome.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: urlPHP,
                type: "POST",
                data: {
                    nome : nome,
                    email : email,
                    empresa : empresa,
                    cidade : cidade,
                    telefone : telefone,
                    whatsapp : whatsapp,
                    assunto : assunto,
                    msg : msg,
                    tipo : tipo
                },
                cache: false,
                beforeSend: function(){
                    //console.log(data);

                    $('.load').show();
                    $('.slideUp').slideUp('fast');
                    $('.cadastro').hide(300);
                },
                success: function(data) {
                    //window.alert("mensagem: "+msg); 

                    console.log(data);
                    if(tipo == 'empresas'){
                        var url = 'http://www.kitalimentacao.com.br/obrigado-empresas/';
                    } else if (tipo == 'revenda') {
                        var url = 'http://www.kitalimentacao.com.br/obrigado-revenda/';
                    } else {
                        var url = 'http://www.kitalimentacao.com.br/obrigado-contato/';
                    }
                    window.setTimeout(function(){
                        redirect(url)}
                    , 3000); 

                },
                error: function(e) {
                    console.log(e);

                    $('.load').hide();
                    $('.slideUp').slideDown('fast');
                    $('.cadastro').fadeIn(300);

                    // Fail message
                    window.alert('Ocorreu um Erro! Tente novamente.');                     
                },
            })
        },
        filter: function() {
            return $(this).is(":visible"); 
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});
