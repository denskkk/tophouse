<?
//***************** Страница с завершением заказа ******************
session_start();
 
// формируем массив с товарами в заказе (если товар один - оставляйте только первый элемент массива)
$products_list = array(
    0 => array(
            'product_id' => '23',    //код товара (из каталога CRM)
            'price'      => '850', //цена товара 1
            'count'      => '1',                     //количество товара 1
            // если есть смежные товары, тогда количество общего товара игнорируется

    ),

);
$products = urlencode(serialize($products_list));
$sender = urlencode(serialize($_SERVER));
$order_id = number_format(round(microtime(true)*10),0,'.','');
$_SESSION['order_id'] = $order_id;
// параметры запроса
$data = array(
    'key'             => '066201da188bd65158607f6616a51a94', //Ваш секретный api токен
    'order_id'        => $order_id, //идентификатор (код) заказа (*автоматически*)
    'country'         => 'UA',                         // Географическое направление заказа
    'office'          => '16',                         // Офис (id в CRM)
    'products'        => $products,                    // массив с товарами в заказе
    'bayer_name'      => $_REQUEST['name'],            // покупатель (Ф.И.О)
    'phone'           => $_REQUEST['phone'],           // телефон
    'email'           => $_REQUEST['email'],           // электронка
    'comment'         => $_REQUEST['product_name'],    // комментарий
    'delivery'        => $_REQUEST['delivery'],        // способ доставки (id в CRM)
    'delivery_adress' => $_REQUEST['delivery_adress'], // адрес доставки
    'payment'         => '',                           // вариант оплаты (id в CRM)
    'sender'          => $sender,                        
    'utm_source'      => $_SESSION['utms']['utm_source'],  // utm_source
    'utm_medium'      => $_SESSION['utms']['utm_medium'],  // utm_medium
    'utm_term'        => $_SESSION['utms']['utm_term'],    // utm_term
    'utm_content'     => $_SESSION['utms']['utm_content'], // utm_content
    'utm_campaign'    => $_SESSION['utms']['utm_campaign'],// utm_campaign
    'additional_1'    => '',                               // Дополнительное поле 1
    'additional_2'    => '',                               // Дополнительное поле 2
    'additional_3'    => '',                               // Дополнительное поле 3
    'additional_4'    => ''                                // Дополнительное поле 4
);
 
// запрос
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'http://abstergo.lp-crm.biz/api/addNewOrder.html');///урл адрес срм, с https:// и до .biz или .top включительно
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
$out = curl_exec($curl);
curl_close($curl);
//$out – ответ сервера в формате JSON


$chat_id = '-370568131';
$token = '1522109488:AAEpOuCgbxIMOt8w0lmn3SP1XOogoQruXSg';

$nameFieldset = "Имя: ";
$phoneFieldset = "Телефон: ";
$productFieldset = "Оффер: ";
$priceFieldset = "Цена: ";

$name = $_REQUEST['name'];
$phone = $_REQUEST['phone'];

$arr = array(
    'Новый заказ!' => '',
    $nameFieldset => $_REQUEST['name'],
    $phoneFieldset => $_REQUEST['phone'],
    $productFieldset => 'Набор ножей Benson 10 предметов   ',
    $priceFieldset => '850грн',
    'Сайт: ' => $website,
);


foreach ($arr as $key => $value) {
    $txt .= "<b>" . $key . "</b> " . $value . "\n";
};
$txt = urlencode($txt);
$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}&disable_web_page_preview=true", "r");
if ($sendToTelegram) {
    header("Location: thanks.php?name=$name&phone=$phone");
    echo '<p class="success">Спасибо за отправку вашего сообщения!</p>';
    return true;
} else {
    echo '<p class="fail"><b>Ошибка. Сообщение не отправлено!</b></p>';
}
