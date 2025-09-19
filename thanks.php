<?php
$name = isset($_GET['name'])? $_GET['name']: '';
$phone = isset($_GET['phone'])? $_GET['phone']: '';
?>
<!doctype html>
<html lang="ru">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="stylesheet" href="sps-files/bootstrap-only-grid-12.css">
	<link rel="stylesheet" href="sps-files/styles.css">
	<title>Спасибо! Ваша заявка в обработке</title>
	<link rel="shortcut icon" type="image/png" href="favicon.png">
	<script>
	WebFontConfig = {
		google: { families: [ 'Roboto:400,700' ] }
	};
	(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'true';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
	})();
	</script>

<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '167368835144980');
  fbq('track', 'PageView');
  fbq('track', 'Lead');

</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=167368835144980&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->

</head>
<body>

<header>
<style>
header h2 {font-size: 26px;}
header .check {text-align: center;margin-top: 20px;margin-bottom: 10px;}
header .user-data {display: flex;justify-content: center;}
header .item {display: flex;margin-bottom: 10px;}
header .item .name {width: 90px;}
</style>
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-12 align-items-center justify-content-center mt-h">
				<div><h2>Спасибо! Ваш заказ принят!</h2></div>
				<p class="check">Пожалуйста, проверьте правильность введенной Вами информации!</p>
				<div class="user-data">
					<div>
						<div class="item">
							<div class="name">Имя:</div>
							<div class="value"><?= $name; ?></div>
						</div>
						<div class="item">
							<div class="name">Телефон:</div>
							<div class="value"><?= $phone; ?></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</header>
<section class="upsales">
	<div class="container">
		<div class="row">
			<div class="col-12 ta-c">
				
			
		</div>
	</div>
</section>

<input type="hidden" name="name" value="<?= $name; ?>">
<input type="hidden" name="phone" value="<?= $phone; ?>">
<script src="js/jquery-3.3.1.min.js"></script>
<script src="sps-files/scripts.js"></script>

</body>
</html>