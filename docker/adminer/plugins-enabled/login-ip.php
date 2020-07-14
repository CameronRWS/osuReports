<?php
require_once('plugins/login-ip.php');

return new AdminerLoginIp(array($_ENV['DOCKER_HOST_IP']));