CREATE TABLE IF NOT EXISTS `channels` (
  `channel_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `desc` varchar(256) NOT NULL,
  `url` varchar(32) NOT NULL,
  `owner` int(11) NOT NULL,
  `playlist` int(11) NOT NULL,
  `whitelist` text NOT NULL,
  `blacklist` text NOT NULL,
  `mods` text NOT NULL,
  `private` tinyint(1) NOT NULL,
  PRIMARY KEY (`channel_id`),
  UNIQUE KEY `url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `fish_id` varchar(64) NOT NULL,
  `username` varchar(32) NOT NULL,
  `email` varchar(254) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `fish_id` (`fish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
