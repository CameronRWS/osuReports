<?php
require_once('plugins/login-servers.php');

return new AdminerLoginServers(
	array(
		"osuReports" => array(
			"driver" => "sqlite",
			"server" => "/data/osuReports.db",
			"db" => "/data/osuReports.db",
		),
	),
);